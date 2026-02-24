<template>
	<div class="report-table-container w-full" ref="tableContainerRef">
		<!-- Global Search -->
		<div
			v-if="enableGlobalFilter"
			class="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-800"
		>
			<svg
				class="w-4 h-4 text-slate-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
			<input
				v-model="globalFilter"
				type="text"
				:placeholder="__('Search in report...')"
				class="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400"
				@input="onGlobalFilterChange"
			/>
			<button
				v-if="globalFilter"
				@click="
					globalFilter = '';
					onGlobalFilterChange();
				"
				class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
			>
				<svg
					class="w-3.5 h-3.5 text-slate-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<!-- Table wrapper with horizontal scroll -->
		<div
			class="overflow-x-auto scroll-area"
			:class="{ 'max-h-[70vh] overflow-y-auto': scrollable }"
		>
			<table class="w-full border-collapse" :class="{ 'text-sm': dense }">
				<!-- Header -->
				<thead class="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-sm">
					<tr
						v-for="headerGroup in table.getHeaderGroups()"
						:key="headerGroup.id"
						class="border-b border-slate-200 dark:border-slate-800"
					>
						<!-- Selection checkbox header -->
						<th
							v-if="enableRowSelection"
							class="w-10 px-3 py-2.5 sticky left-0 bg-slate-50 dark:bg-slate-900/80"
						>
							<input
								type="checkbox"
								:checked="table.getIsAllRowsSelected()"
								:indeterminate="table.getIsSomeRowsSelected()"
								@change="table.toggleAllRowsSelected()"
								class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
							/>
						</th>

						<!-- Row number header -->
						<th
							v-if="showRowNumbers"
							class="w-12 px-2 py-2.5 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
						>
							#
						</th>

						<!-- Data column headers -->
						<th
							v-for="header in headerGroup.headers"
							:key="header.id"
							class="px-3 py-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none group transition-colors"
							:class="[
								getHeaderAlignment(header),
								{
									'cursor-pointer hover:text-slate-700 dark:hover:text-slate-200':
										header.column.getCanSort(),
								},
								getPinnedClass(header.column),
							]"
							:style="{
								width: `${header.getSize()}px`,
								minWidth: `${header.column.columnDef.minSize ?? 60}px`,
							}"
							@click="
								header.column.getCanSort()
									? header.column.toggleSorting()
									: undefined
							"
						>
							<div
								class="flex items-center gap-1"
								:class="getHeaderAlignmentFlex(header)"
							>
								<span v-if="!header.isPlaceholder">
									<FlexRender
										:render="header.column.columnDef.header"
										:props="header.getContext()"
									/>
								</span>

								<!-- Sort indicator -->
								<template v-if="header.column.getCanSort()">
									<span
										v-if="header.column.getIsSorted() === 'asc'"
										class="text-blue-500"
									>
										&#9650;
									</span>
									<span
										v-else-if="header.column.getIsSorted() === 'desc'"
										class="text-blue-500"
									>
										&#9660;
									</span>
									<span
										v-else
										class="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
									>
										&#9650;
									</span>
								</template>

								<!-- Column resize handle -->
								<div
									v-if="header.column.getCanResize()"
									class="absolute top-0 right-0 h-full w-1 cursor-col-resize select-none touch-none opacity-0 group-hover:opacity-100 bg-blue-400 transition-opacity"
									:class="{
										'opacity-100 bg-blue-600': header.column.getIsResizing(),
									}"
									@mousedown="header.getResizeHandler()?.($event)"
									@touchstart="header.getResizeHandler()?.($event)"
								/>
							</div>
						</th>
					</tr>
				</thead>

				<!-- Body -->
				<tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
					<tr
						v-for="row in table.getRowModel().rows"
						:key="row.id"
						class="group transition-colors"
						:class="getRowClass(row)"
						@click="onRowClick(row)"
					>
						<!-- Selection checkbox -->
						<td
							v-if="enableRowSelection"
							class="px-3 py-2 sticky left-0 bg-inherit"
							@click.stop
						>
							<input
								type="checkbox"
								:checked="row.getIsSelected()"
								@change="row.toggleSelected()"
								class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
							/>
						</td>

						<!-- Row number -->
						<td
							v-if="showRowNumbers"
							class="px-2 py-2 text-xs text-slate-400 dark:text-slate-500 tabular-nums"
						>
							{{ row.index + 1 + pagination.pageIndex * pagination.pageSize }}
						</td>

						<!-- Data cells -->
						<td
							v-for="cell in row.getVisibleCells()"
							:key="cell.id"
							class="px-3 py-2 text-sm"
							:class="[
								getCellAlignment(cell),
								getPinnedClass(cell.column),
								{
									'font-semibold bg-slate-50/50 dark:bg-slate-800/30':
										row.original.__is_total_row,
									'text-slate-700 dark:text-slate-200':
										!row.original.__is_total_row,
								},
							]"
							:style="{ width: `${cell.column.getSize()}px` }"
						>
							<!-- Link cell -->
							<template v-if="isLinkCell(cell)">
								<a
									:href="getLinkHref(cell)"
									class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
									@click.prevent="handleLinkClick(cell)"
								>
									<FlexRender
										:render="cell.column.columnDef.cell"
										:props="cell.getContext()"
									/>
								</a>
							</template>

							<!-- Check cell -->
							<template v-else-if="getCellFieldtype(cell) === 'Check'">
								<span
									class="inline-flex items-center justify-center w-5 h-5 rounded"
									:class="
										cell.getValue()
											? 'text-green-600 bg-green-50 dark:bg-green-900/20'
											: 'text-slate-300 dark:text-slate-600'
									"
								>
									{{ cell.getValue() ? "✓" : "—" }}
								</span>
							</template>

							<!-- Currency cell -->
							<template v-else-if="getCellFieldtype(cell) === 'Currency'">
								<span class="tabular-nums">
									<FlexRender
										:render="cell.column.columnDef.cell"
										:props="cell.getContext()"
									/>
								</span>
							</template>

							<!-- Default cell -->
							<template v-else>
								<FlexRender
									:render="cell.column.columnDef.cell"
									:props="cell.getContext()"
								/>
							</template>
						</td>
					</tr>

					<!-- Empty state -->
					<tr v-if="table.getRowModel().rows.length === 0">
						<td
							:colspan="totalColumnCount"
							class="px-6 py-16 text-center text-sm text-slate-400 dark:text-slate-500"
						>
							<div class="flex flex-col items-center gap-3">
								<div class="text-4xl">📋</div>
								<div>{{ __("No data to display") }}</div>
								<div v-if="hasActiveFilters" class="text-xs">
									{{ __("Try adjusting your filters") }}
								</div>
							</div>
						</td>
					</tr>
				</tbody>

				<!-- Totals footer -->
				<tfoot
					v-if="totalsRow && table.getRowModel().rows.length > 0"
					class="sticky bottom-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm border-t-2 border-slate-300 dark:border-slate-700"
				>
					<tr>
						<td v-if="enableRowSelection" class="px-3 py-2.5" />
						<td v-if="showRowNumbers" class="px-2 py-2.5" />
						<td
							v-for="(col, idx) in visibleColumns"
							:key="col.fieldname"
							class="px-3 py-2.5 text-sm font-semibold"
							:class="[
								getColumnAlignClass(col),
								{ 'text-slate-800 dark:text-slate-100': idx === 0 },
								{ 'tabular-nums text-slate-700 dark:text-slate-200': idx > 0 },
							]"
						>
							{{ idx === 0 ? __("Totals") : formatTotalValue(col) }}
						</td>
					</tr>
				</tfoot>
			</table>
		</div>

		<!-- Pagination -->
		<div
			v-if="showPagination"
			class="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950"
		>
			<div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
				<span>{{ __("Showing") }}</span>
				<span class="font-medium text-slate-700 dark:text-slate-200">
					{{ paginationInfo.from }}-{{ paginationInfo.to }}
				</span>
				<span>{{ __("of") }}</span>
				<span class="font-medium text-slate-700 dark:text-slate-200">
					{{ paginationInfo.total }}
				</span>

				<!-- Page size selector -->
				<select
					v-model.number="pagination.pageSize"
					@change="onPageSizeChange"
					class="ml-4 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-2 py-1"
				>
					<option v-for="size in pageSizeOptions" :key="size" :value="size">
						{{ size }} {{ __("rows") }}
					</option>
				</select>
			</div>

			<div class="flex items-center gap-1.5">
				<button
					class="px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					:disabled="!table.getCanPreviousPage()"
					@click="table.setPageIndex(0)"
				>
					{{ __("First") }}
				</button>
				<button
					class="px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					:disabled="!table.getCanPreviousPage()"
					@click="table.previousPage()"
				>
					‹ {{ __("Prev") }}
				</button>

				<!-- Page number buttons -->
				<template v-for="page in pageNumbers" :key="page">
					<button
						v-if="page !== '...'"
						class="px-2.5 py-1.5 text-xs rounded border transition-colors"
						:class="
							page === pagination.pageIndex + 1
								? 'bg-blue-600 text-white border-blue-600'
								: 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
						"
						@click="table.setPageIndex(Number(page) - 1)"
					>
						{{ page }}
					</button>
					<span v-else class="px-1 text-slate-400">…</span>
				</template>

				<button
					class="px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					:disabled="!table.getCanNextPage()"
					@click="table.nextPage()"
				>
					{{ __("Next") }} ›
				</button>
				<button
					class="px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
					:disabled="!table.getCanNextPage()"
					@click="table.setPageIndex(table.getPageCount() - 1)"
				>
					{{ __("Last") }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect } from "vue";
import {
	useVueTable,
	FlexRender,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	type ColumnDef,
	type SortingState,
	type PaginationState,
	type VisibilityState,
	type RowSelectionState,
	type Row,
	type Cell,
	type Column,
	type Header,
} from "@tanstack/vue-table";
import {
	buildColumnDefs,
	buildTableOptions,
	getColumnAlignment,
	formatCellValue,
	DEFAULT_PAGE_SIZE,
	DEFAULT_PAGE_SIZE_OPTIONS,
} from "../../utils/reportEngine";
import type { ReportColumn, ReportRow, ReportTableOptions } from "../../types/report";
import { __ } from "../../utils/translate";

// ── Props ──────────────────────────────────────────────────────────

const props = withDefaults(
	defineProps<{
		columns: ReportColumn[];
		data: ReportRow[];
		totalsRow?: ReportRow | null;
		enableRowSelection?: boolean;
		enableGlobalFilter?: boolean;
		showRowNumbers?: boolean;
		showPagination?: boolean;
		scrollable?: boolean;
		dense?: boolean;
		striped?: boolean;
		pageSizeOptions?: number[];
		defaultPageSize?: number;
		tableOptions?: ReportTableOptions;
		onRowClick?: (row: ReportRow) => void;
	}>(),
	{
		totalsRow: null,
		enableRowSelection: true,
		enableGlobalFilter: true,
		showRowNumbers: true,
		showPagination: true,
		scrollable: true,
		dense: false,
		striped: false,
		pageSizeOptions: () => [...DEFAULT_PAGE_SIZE_OPTIONS],
		defaultPageSize: DEFAULT_PAGE_SIZE,
	},
);

// ── Emits ──────────────────────────────────────────────────────────

const emit = defineEmits<{
	"row-click": [row: ReportRow];
	"selection-change": [rows: ReportRow[]];
	"sort-change": [sorting: SortingState];
	"page-change": [pagination: PaginationState];
}>();

// ── State ──────────────────────────────────────────────────────────

const tableContainerRef = ref<HTMLElement | null>(null);
const globalFilter = ref("");
const sorting = ref<SortingState>([]);
const pagination = ref<PaginationState>({
	pageIndex: 0,
	pageSize: props.defaultPageSize,
});
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref<RowSelectionState>({});

// ── Column Definitions ─────────────────────────────────────────────

const columnDefs = computed<ColumnDef<ReportRow, any>[]>(() =>
	buildColumnDefs(props.columns, { showRowNumbers: false }),
);

const visibleColumns = computed(() => props.columns.filter((c) => !c.hidden));

const hasActiveFilters = computed(() => !!globalFilter.value);

const table = useVueTable({
	get data() {
		return props.data;
	},
	get columns() {
		return columnDefs.value;
	},
	state: {
		get sorting() {
			return sorting.value;
		},
		get pagination() {
			return pagination.value;
		},
		get columnVisibility() {
			return columnVisibility.value;
		},
		get rowSelection() {
			return rowSelection.value;
		},
		get globalFilter() {
			return globalFilter.value;
		},
	},
	onSortingChange: (updater) => {
		sorting.value = typeof updater === "function" ? updater(sorting.value) : updater;
		emit("sort-change", sorting.value);
	},
	onPaginationChange: (updater) => {
		pagination.value = typeof updater === "function" ? updater(pagination.value) : updater;
		emit("page-change", pagination.value);
	},
	onColumnVisibilityChange: (updater) => {
		columnVisibility.value =
			typeof updater === "function" ? updater(columnVisibility.value) : updater;
	},
	onRowSelectionChange: (updater) => {
		rowSelection.value = typeof updater === "function" ? updater(rowSelection.value) : updater;
		emitSelectionChange();
	},
	onGlobalFilterChange: (updater) => {
		globalFilter.value = typeof updater === "function" ? updater(globalFilter.value) : updater;
	},
	...buildTableOptions({
		data: props.data,
		columns: columnDefs.value,
		tableOptions: props.tableOptions,
	}),
	getCoreRowModel: getCoreRowModel(),
	getSortedRowModel: getSortedRowModel(),
	getFilteredRowModel: getFilteredRowModel(),
	getPaginationRowModel: getPaginationRowModel(),
	enableRowSelection: props.enableRowSelection,
	enableMultiSort: true,
	enableSorting: true,
	enableFilters: true,
	enableColumnResizing: true,
	columnResizeMode: "onChange",
});

// ── Pagination Info ────────────────────────────────────────────────

const totalColumnCount = computed(() => {
	let count = visibleColumns.value.length;
	if (props.enableRowSelection) count++;
	if (props.showRowNumbers) count++;
	return count;
});

const paginationInfo = computed(() => {
	const total = props.data.length;
	const from = total === 0 ? 0 : pagination.value.pageIndex * pagination.value.pageSize + 1;
	const to = Math.min((pagination.value.pageIndex + 1) * pagination.value.pageSize, total);
	return { from, to, total };
});

const pageNumbers = computed(() => {
	const totalPages = table.getPageCount();
	const current = pagination.value.pageIndex + 1;
	const pages: (number | string)[] = [];

	if (totalPages <= 7) {
		for (let i = 1; i <= totalPages; i++) pages.push(i);
	} else {
		pages.push(1);
		if (current > 3) pages.push("...");
		for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
			pages.push(i);
		}
		if (current < totalPages - 2) pages.push("...");
		pages.push(totalPages);
	}

	return pages;
});

// ── Event Handlers ─────────────────────────────────────────────────

function onGlobalFilterChange() {
	table.setGlobalFilter(globalFilter.value);
}

function onPageSizeChange() {
	table.setPageSize(pagination.value.pageSize);
	table.setPageIndex(0);
}

function onRowClick(row: Row<ReportRow>) {
	if (row.original.__is_total_row) return;
	emit("row-click", row.original);
	props.onRowClick?.(row.original);
}

function emitSelectionChange() {
	const selected = table.getSelectedRowModel().rows.map((r) => r.original);
	emit("selection-change", selected);
}

// ── Helpers ────────────────────────────────────────────────────────

function getColumnMeta(column: Column<ReportRow, any>): ReportColumn | undefined {
	return (column.columnDef.meta as any)?.column;
}

function getCellFieldtype(cell: Cell<ReportRow, any>): string {
	return getColumnMeta(cell.column)?.fieldtype ?? "Data";
}

function isLinkCell(cell: Cell<ReportRow, any>): boolean {
	const col = getColumnMeta(cell.column);
	return col?.fieldtype === "Link" && !!col.options;
}

function getLinkHref(cell: Cell<ReportRow, any>): string {
	const col = getColumnMeta(cell.column);
	if (!col?.options) return "#";
	const value = cell.getValue();
	return `/app/${encodeURIComponent(col.options)}/${encodeURIComponent(value)}`;
}

function handleLinkClick(cell: Cell<ReportRow, any>) {
	const col = getColumnMeta(cell.column);
	if (!col?.options) return;
	const value = cell.getValue();
	if (value) {
		window.open(
			`/app/${encodeURIComponent(col.options)}/${encodeURIComponent(value)}`,
			"_blank",
		);
	}
}

function getHeaderAlignment(header: Header<ReportRow, any>): string {
	const col = getColumnMeta(header.column);
	if (!col) return "text-left";
	const align = getColumnAlignment(col);
	return align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
}

function getHeaderAlignmentFlex(header: Header<ReportRow, any>): string {
	const col = getColumnMeta(header.column);
	if (!col) return "";
	const align = getColumnAlignment(col);
	return align === "right" ? "justify-end" : align === "center" ? "justify-center" : "";
}

function getCellAlignment(cell: Cell<ReportRow, any>): string {
	const col = getColumnMeta(cell.column);
	if (!col) return "text-left";
	const align = getColumnAlignment(col);
	return align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
}

function getColumnAlignClass(col: ReportColumn): string {
	const align = getColumnAlignment(col);
	return align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
}

function getPinnedClass(column: Column<ReportRow, any>): string {
	const pinned = column.getIsPinned();
	if (pinned === "left") return "sticky left-0 bg-white dark:bg-gray-950 z-[5]";
	if (pinned === "right") return "sticky right-0 bg-white dark:bg-gray-950 z-[5]";
	return "";
}

function getRowClass(row: Row<ReportRow>): string {
	const classes: string[] = [];
	if (row.original.__is_total_row) {
		classes.push("bg-slate-50 dark:bg-slate-800/40 font-semibold");
	} else if (row.getIsSelected()) {
		classes.push(
			"bg-blue-50/60 dark:bg-blue-900/15 hover:bg-blue-50 dark:hover:bg-blue-900/20",
		);
	} else {
		classes.push("hover:bg-slate-50 dark:hover:bg-slate-800/50");
		if (props.striped && row.index % 2 === 1) {
			classes.push("bg-slate-25 dark:bg-slate-900/30");
		}
	}
	if (props.onRowClick && !row.original.__is_total_row) {
		classes.push("cursor-pointer");
	}
	return classes.join(" ");
}

function formatTotalValue(col: ReportColumn): string {
	if (!props.totalsRow) return "";
	const val = props.totalsRow[col.fieldname];
	if (val === null || val === undefined || val === "") return "";
	return formatCellValue(val, col);
}

// ── Watch for data changes → reset page ────────────────────────────

watch(
	() => props.data.length,
	() => {
		if (pagination.value.pageIndex > 0) {
			pagination.value.pageIndex = 0;
		}
	},
);

// ── Expose table instance for parent access ────────────────────────

defineExpose({
	table,
	getSelectedRows: () => table.getSelectedRowModel().rows.map((r) => r.original),
	selectAll: () => table.toggleAllRowsSelected(true),
	deselectAll: () => table.toggleAllRowsSelected(false),
	setSorting: (s: SortingState) => {
		sorting.value = s;
	},
	setGlobalFilter: (f: string) => {
		globalFilter.value = f;
		table.setGlobalFilter(f);
	},
	resetPagination: () => {
		pagination.value.pageIndex = 0;
	},
});
</script>

<style scoped>
.report-table-container {
	border-radius: 0.5rem;
	border: 1px solid #e2e8f0;
	background-color: #fff;
	overflow: hidden;
}
:is(.dark) .report-table-container {
	border-color: #1e293b;
	background-color: #030712;
}

.scroll-area::-webkit-scrollbar {
	height: 6px;
	width: 6px;
}
.scroll-area::-webkit-scrollbar-thumb {
	background-color: #cbd5e1;
	border-radius: 9999px;
}
:is(.dark) .scroll-area::-webkit-scrollbar-thumb {
	background-color: #475569;
}
.scroll-area::-webkit-scrollbar-track {
	background-color: transparent;
}
</style>
