/**
 * Report Types and Interfaces
 *
 * Type-safe definitions for the TanStack-powered reporting engine.
 * These types cover report metadata, columns, filters, and data.
 */

import type { FieldType } from "./index";

export interface ReportMeta {
  name: string;
  report_name: string;
  ref_doctype: string;
  report_type: "Report Builder" | "Script Report" | "Query Report" | "Custom";
  module: string;
  is_standard: "Yes" | "No";
  disabled: number;
  add_total_row?: number;
  filters?: string;
  query?: string;
  javascript?: string;
  columns?: string;
  prepared_report?: number;
  letter_head?: string;
  roles?: Array<{ role: string }>;
}

export interface ReportDataResponse {
  columns: ReportColumn[];
  result: ReportRow[];
  report_summary?: ReportSummaryItem[];
  chart?: ReportChartConfig | null;
  message?: string;
  skip_total_row?: boolean;
}

export interface ReportColumn {
  fieldname: string;
  label: string;
  fieldtype: FieldType | string;
  options?: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  pinned?: "left" | "right" | false;
  align?: "left" | "center" | "right";
  formatter?: (
    value: any,
    row: ReportRow,
    column: ReportColumn,
    data: ReportRow[],
  ) => string;
  precision?: number;
  currency_field?: string;
}

/** Internal column definition used by the TanStack table adapter */
export interface ReportTableColumn extends ReportColumn {
  /** TanStack accessor key */
  accessorKey: string;
  /** Computed size in pixels */
  size: number;
  /** Minimum size */
  minSize: number;
  /** Maximum size */
  maxSize: number;
  /** Enable column resizing */
  enableResizing: boolean;
  /** Enable sorting */
  enableSorting: boolean;
  /** Enable column hiding */
  enableHiding: boolean;
}

export type ReportRow = Record<string, any>;

export interface ReportCellValue {
  value: any;
  formatted: string;
  raw: any;
  column: ReportColumn;
  row: ReportRow;
  rowIndex: number;
}

export interface ReportFilter {
  fieldname: string;
  label: string;
  fieldtype: FieldType | string;
  options?: string;
  default?: any;
  reqd?: number;
  depends_on?: string;
  hidden?: number;
  width?: string;
  on_change?: (value: any) => void | Promise<void>;
  get_query?: () => { filters: Record<string, any> } | Record<string, any>;
}

export type ReportFilterValues = Record<string, any>;

export interface ReportSortState {
  field: string;
  order: "asc" | "desc";
}

export interface ReportPaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface ReportSummaryItem {
  label: string;
  value: number | string;
  indicator?: string;
  datatype?: string;
  fieldtype?: FieldType | string;
}

export interface ReportChartConfig {
  type: "line" | "bar" | "pie" | "donut" | "percentage" | "heatmap";
  data: {
    labels: string[];
    datasets: Array<{
      name: string;
      values: number[];
      chartType?: string;
    }>;
  };
  colors?: string[];
  height?: number;
  options?: Record<string, any>;
}

export interface ReportGroupConfig {
  fieldname: string;
  order?: "asc" | "desc";
  aggregations?: Record<string, ReportAggregation>;
}

export type ReportAggregation =
  | "sum"
  | "avg"
  | "count"
  | "min"
  | "max"
  | "first"
  | "last";

export type ReportExportFormat = "csv" | "xlsx" | "json" | "pdf";

export interface ReportExportOptions {
  format: ReportExportFormat;
  filename?: string;
  visibleOnly?: boolean;
  selectedOnly?: boolean;
  includeTotals?: boolean;
}

export interface ReportTableState {
  sorting: ReportSortState[];
  pagination: ReportPaginationState;
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  columnPinning: { left: string[]; right: string[] };
  rowSelection: Record<string, boolean>;
  globalFilter: string;
  columnFilters: Array<{ id: string; value: any }>;
  grouping: string[];
  expanded: Record<string, boolean>;
}

export interface ReportTableOptions {
  enableRowSelection?: boolean;
  enableMultiSort?: boolean;
  enableColumnResizing?: boolean;
  enableColumnOrdering?: boolean;
  enableGlobalFilter?: boolean;
  enableGrouping?: boolean;
  enableExpanding?: boolean;
  enableColumnPinning?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  striped?: boolean;
  dense?: boolean;
  showRowNumbers?: boolean;
}
