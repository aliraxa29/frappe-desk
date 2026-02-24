/**
 * reportEngine.ts – TanStack Table–powered report data engine
 *
 * Manages report lifecycle: fetching metadata, executing reports,
 * building TanStack column definitions, handling pagination/sorting/
 * filtering, totals rows, export, and chart integration.
 *
 * This module is pure logic (no Vue dependency) so it can be tested
 * independently and consumed by any renderer.
 */

import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type VisibilityState,
  type ColumnPinningState,
  type RowSelectionState,
  type ColumnFiltersState,
  type GroupingState,
  type ExpandedState,
  type TableOptions,
  type RowModel,
} from "@tanstack/vue-table";

import type {
  ReportMeta,
  ReportColumn,
  ReportRow,
  ReportFilter,
  ReportFilterValues,
  ReportSortState,
  ReportPaginationState,
  ReportSummaryItem,
  ReportChartConfig,
  ReportTableColumn,
  ReportTableOptions,
  ReportTableState,
  ReportDataResponse,
  ReportExportOptions,
  ReportExportFormat,
  ReportAggregation,
} from "../types/report";

import { resource } from "../utils/resource";
import { __ } from "../utils/translate";
import { format } from "../utils/formatters/helpers";

// ── Column Width Defaults ──────────────────────────────────────────

const FIELD_TYPE_WIDTHS: Record<string, number> = {
  Data: 180,
  Link: 180,
  Select: 140,
  Int: 100,
  Float: 120,
  Currency: 140,
  Percent: 100,
  Check: 80,
  Date: 120,
  Datetime: 180,
  Time: 100,
  Duration: 120,
  "Small Text": 200,
  "Text Editor": 250,
  Rating: 120,
  Color: 100,
  Email: 180,
  Phone: 140,
  URL: 200,
};

const DEFAULT_COLUMN_WIDTH = 150;
const MIN_COLUMN_WIDTH = 60;
const MAX_COLUMN_WIDTH = 500;

// ── Column Builder ─────────────────────────────────────────────────

/**
 * Convert backend ReportColumn[] to TanStack ColumnDef[].
 * Each column gets a cell renderer that delegates to `desk.format`
 * or the column's custom formatter.
 */
export function buildColumnDefs(
  columns: ReportColumn[],
  options?: { showRowNumbers?: boolean },
): ColumnDef<ReportRow, any>[] {
  const helper = createColumnHelper<ReportRow>();
  const defs: ColumnDef<ReportRow, any>[] = [];

  // Optional row-number column
  if (options?.showRowNumbers) {
    defs.push(
      helper.display({
        id: "__row_number",
        header: "#",
        cell: (info) => String(info.row.index + 1),
        size: 50,
        minSize: 40,
        maxSize: 60,
        enableSorting: false,
        enableResizing: false,
      }),
    );
  }

  for (const col of columns) {
    if (col.hidden) continue;

    const width =
      col.width ?? FIELD_TYPE_WIDTHS[col.fieldtype] ?? DEFAULT_COLUMN_WIDTH;

    defs.push(
      helper.accessor(col.fieldname, {
        id: col.fieldname,
        header: () => __(col.label),
        cell: (info) => {
          const value = info.getValue();
          const row = info.row.original;

          // Custom formatter takes priority
          if (col.formatter) {
            return col.formatter(
              value,
              row,
              col,
              info.table.getCoreRowModel().rows.map((r) => r.original),
            );
          }

          // Fall back to desk.format
          return formatCellValue(value, col, row);
        },
        size: width,
        minSize: MIN_COLUMN_WIDTH,
        maxSize: MAX_COLUMN_WIDTH,
        enableSorting: col.sortable !== false,
        enableResizing: true,
        enableHiding: true,
        meta: { column: col },
      } as any),
    );
  }

  return defs;
}

/**
 * Format a cell value using the desk formatter system.
 */
export function formatCellValue(
  value: any,
  col: ReportColumn,
  row?: ReportRow,
): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  // Use desk.format for field-type–aware formatting
  try {
    const df = {
      fieldtype: col.fieldtype,
      fieldname: col.fieldname,
      options: col.options,
      precision: col.precision,
    };
    return format(value, df, { inline: true }, row);
  } catch {
    return String(value);
  }
}

// ── Alignment Helper ───────────────────────────────────────────────

const NUMERIC_TYPES = new Set([
  "Int",
  "Float",
  "Currency",
  "Percent",
  "Duration",
]);

export function getColumnAlignment(
  col: ReportColumn,
): "left" | "center" | "right" {
  if (col.align) return col.align;
  if (NUMERIC_TYPES.has(col.fieldtype)) return "right";
  if (col.fieldtype === "Check") return "center";
  return "left";
}

// ── Aggregation ────────────────────────────────────────────────────

export function aggregateColumn(
  rows: ReportRow[],
  fieldname: string,
  fn: ReportAggregation,
): number | string {
  const values = rows
    .map((r) => r[fieldname])
    .filter((v) => v !== null && v !== undefined && v !== "");

  const nums = values.map(Number).filter((n) => !isNaN(n));

  switch (fn) {
    case "sum":
      return nums.reduce((a, b) => a + b, 0);
    case "avg":
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    case "count":
      return values.length;
    case "min":
      return nums.length ? Math.min(...nums) : 0;
    case "max":
      return nums.length ? Math.max(...nums) : 0;
    case "first":
      return values[0] ?? "";
    case "last":
      return values[values.length - 1] ?? "";
    default:
      return 0;
  }
}

/**
 * Build a totals row by summing numeric columns.
 */
export function buildTotalsRow(
  rows: ReportRow[],
  columns: ReportColumn[],
): ReportRow {
  const totals: ReportRow = { __is_total_row: true };

  for (const col of columns) {
    if (NUMERIC_TYPES.has(col.fieldtype)) {
      totals[col.fieldname] = aggregateColumn(rows, col.fieldname, "sum");
    } else if (columns.indexOf(col) === 0) {
      totals[col.fieldname] = __("Totals");
    } else {
      totals[col.fieldname] = "";
    }
  }

  return totals;
}

// ── Report Data Fetcher ────────────────────────────────────────────

/**
 * Fetch report metadata from the backend.
 */
export async function fetchReportMeta(
  reportName: string,
): Promise<ReportMeta | null> {
  try {
    const response = await resource.call({
      method: "frappe.client.get",
      args: { doctype: "Report", name: reportName },
    });
    return (response?.message as ReportMeta) ?? null;
  } catch (err) {
    console.error(
      `[ReportEngine] Failed to fetch report meta: ${reportName}`,
      err,
    );
    return null;
  }
}

/**
 * Execute a report and return columns + data.
 */
export async function executeReport(
  reportName: string,
  filters: ReportFilterValues = {},
): Promise<ReportDataResponse> {
  try {
    const response = await resource.call({
      method: "frappe.desk.query_report.run",
      args: {
        report_name: reportName,
        filters,
      },
    });

    const msg = response?.message ?? {};

    // Normalize columns – backend may return string shorthand
    const rawColumns: any[] = msg.columns || [];
    const columns: ReportColumn[] = rawColumns.map(normalizeColumn);

    const result: ReportRow[] = normalizeRows(msg.result || [], columns);

    return {
      columns,
      result,
      report_summary: msg.report_summary || [],
      chart: msg.chart || null,
      message: msg.message,
      skip_total_row: msg.skip_total_row,
    };
  } catch (err) {
    console.error(
      `[ReportEngine] Failed to execute report: ${reportName}`,
      err,
    );
    return { columns: [], result: [], report_summary: [] };
  }
}

/**
 * Normalize a column from the backend's various formats.
 */
function normalizeColumn(raw: any): ReportColumn {
  // String shorthand: "fieldname:fieldtype:label:width"
  if (typeof raw === "string") {
    const parts = raw.split(":");
    return {
      fieldname: parts[0] || "",
      fieldtype: (parts[1] as ReportColumn["fieldtype"]) || "Data",
      label: parts[2] || parts[0] || "",
      width: parts[3] ? parseInt(parts[3], 10) : undefined,
    };
  }

  return {
    fieldname: raw.fieldname || raw.id || "",
    label: raw.label || raw.name || raw.fieldname || "",
    fieldtype: raw.fieldtype || "Data",
    options: raw.options,
    width: raw.width ? parseInt(String(raw.width), 10) : undefined,
    hidden: raw.hidden,
    sortable: raw.sortable,
    filterable: raw.filterable,
    align: raw.align,
    formatter: raw.formatter,
    precision: raw.precision,
    currency_field: raw.currency_field,
    pinned: raw.pinned,
  };
}

/**
 * Backend may return result as arrays (positional) or dicts (keyed).
 * Normalize to array of objects keyed by fieldname.
 */
function normalizeRows(rawRows: any[], columns: ReportColumn[]): ReportRow[] {
  if (!rawRows.length) return [];

  // If first row is an array, convert positional → named
  if (Array.isArray(rawRows[0])) {
    return rawRows.map((arr: any[]) => {
      const row: ReportRow = {};
      columns.forEach((col, i) => {
        row[col.fieldname] = arr[i] ?? null;
      });
      return row;
    });
  }

  // Already objects
  return rawRows as ReportRow[];
}

// ── Export Helpers ──────────────────────────────────────────────────

/**
 * Export report data to various formats.
 */
export function exportReportData(
  columns: ReportColumn[],
  rows: ReportRow[],
  options: ReportExportOptions,
): void {
  const visibleColumns = options.visibleOnly
    ? columns.filter((c) => !c.hidden)
    : columns;

  const filename =
    options.filename ?? `report_${new Date().toISOString().slice(0, 10)}`;

  switch (options.format) {
    case "csv":
      exportCSV(visibleColumns, rows, filename);
      break;
    case "json":
      exportJSON(visibleColumns, rows, filename);
      break;
    case "xlsx":
      exportXLSX(visibleColumns, rows, filename);
      break;
    case "pdf":
      exportPDF();
      break;
  }
}

function exportCSV(
  columns: ReportColumn[],
  rows: ReportRow[],
  filename: string,
): void {
  const header = columns
    .map((c) => `"${c.label.replace(/"/g, '""')}"`)
    .join(",");
  const body = rows.map((row) =>
    columns
      .map((col) => {
        const val = row[col.fieldname];
        if (val === null || val === undefined) return "";
        const str = String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(","),
  );

  const csv = [header, ...body].join("\n");
  downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

function exportJSON(
  columns: ReportColumn[],
  rows: ReportRow[],
  filename: string,
): void {
  const fieldnames = columns.map((c) => c.fieldname);
  const filtered = rows.map((row) => {
    const obj: Record<string, any> = {};
    for (const fn of fieldnames) {
      obj[fn] = row[fn] ?? null;
    }
    return obj;
  });
  const json = JSON.stringify(filtered, null, 2);
  downloadBlob(json, `${filename}.json`, "application/json");
}

function exportXLSX(
  _columns: ReportColumn[],
  _rows: ReportRow[],
  _filename: string,
): void {
  // XLSX export requires a library like sheetjs; fall back to CSV with .xlsx extension
  console.warn(
    "[ReportEngine] XLSX export not implemented, falling back to CSV.",
  );
  exportCSV(_columns, _rows, _filename);
}

function exportPDF(): void {
  window.print();
}

function downloadBlob(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// ── Default Table Options Builder ──────────────────────────────────

/**
 * Build TanStack `TableOptions<ReportRow>` from report state.
 * This should be called in a Vue composable with reactive refs.
 */
export function buildTableOptions(config: {
  data: ReportRow[];
  columns: ColumnDef<ReportRow, any>[];
  sorting?: SortingState;
  pagination?: PaginationState;
  columnVisibility?: VisibilityState;
  columnPinning?: ColumnPinningState;
  rowSelection?: RowSelectionState;
  columnFilters?: ColumnFiltersState;
  grouping?: GroupingState;
  expanded?: ExpandedState;
  tableOptions?: ReportTableOptions;
}): Partial<TableOptions<ReportRow>> {
  const opts: Partial<TableOptions<ReportRow>> = {
    data: config.data,
    columns: config.columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: config.tableOptions?.enableRowSelection ?? true,
    enableMultiSort: config.tableOptions?.enableMultiSort ?? true,
    enableColumnResizing: config.tableOptions?.enableColumnResizing ?? true,
    enableSorting: true,
    enableFilters: true,
    columnResizeMode: "onChange" as const,
  };

  if (config.tableOptions?.enableGrouping) {
    opts.getGroupedRowModel = getGroupedRowModel();
    opts.getExpandedRowModel = getExpandedRowModel();
  }

  if (config.tableOptions?.enableExpanding) {
    opts.getExpandedRowModel = getExpandedRowModel();
  }

  return opts;
}

// ── Defaults ───────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500] as const;
export const DEFAULT_PAGE_SIZE = 100;
