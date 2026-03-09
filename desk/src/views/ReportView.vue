<template>
	<AppLayout>
		<template #header>
			<div class="flex items-center justify-between gap-4 w-full my-3">
				<div class="flex items-center gap-3">
					<h2 class="text-lg font-semibold text-foreground">
						{{ reportName }}
					</h2>
					<span
						class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded"
					>
						{{ __("Report") }}
					</span>
					<span
						v-if="reportMeta?.report_type"
						class="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded"
					>
						{{ reportMeta.report_type }}
					</span>
				</div>
				<div class="flex items-center gap-2">
					<!-- Export dropdown -->
					<div class="relative" ref="exportDropdownRef">
						<Button
							variant="secondary"
							size="sm"
							@click="showExportMenu = !showExportMenu"
						>
							{{ __("Export") }}
						</Button>
						<div
							v-if="showExportMenu"
							class="absolute right-0 top-full mt-1 w-40 bg-background"
						>
							<button
								v-for="fmt in exportFormats"
								:key="fmt.value"
								class="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary dark:hover:bg-secondary text-foreground"
								@click="handleExport(fmt.value)"
							>
								{{ fmt.label }}
							</button>
						</div>
					</div>

					<Button variant="secondary" size="sm" @click="toggleChart">
						{{ showChart ? __("Hide Chart") : __("Show Chart") }}
					</Button>
					<Button variant="secondary" size="sm" @click="handlePrint">
						{{ __("Print") }}
					</Button>
					<Button variant="primary" size="sm" @click="refreshReport">
						{{ __("Refresh") }}
					</Button>
				</div>
			</div>
		</template>

		<template #content>
			<div class="space-y-4 m-2">
				<!-- Filters Bar -->
				<div v-if="reportFilters.length > 0" class="bg-background">
					<div class="flex flex-wrap items-end gap-3">
						<div
							v-for="filter in reportFilters"
							:key="filter.fieldname"
							class="flex flex-col gap-1"
							:style="{ width: filter.width || '200px' }"
						>
							<label
								class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
							>
								{{ __(filter.label) }}
								<span v-if="filter.reqd" class="text-red-500">*</span>
							</label>

							<!-- Select filter -->
							<select
								v-if="filter.fieldtype === 'Select'"
								v-model="filterValues[filter.fieldname]"
								class="w-full text-sm rounded-md border border-border bg-background"
								@change="onFilterChange(filter)"
							>
								<option value="">{{ __("Select...") }}</option>
								<option
									v-for="opt in getSelectOptions(filter)"
									:key="opt"
									:value="opt"
								>
									{{ opt }}
								</option>
							</select>

							<!-- Check filter -->
							<label
								v-else-if="filter.fieldtype === 'Check'"
								class="flex items-center gap-2 py-1.5"
							>
								<input
									type="checkbox"
									v-model="filterValues[filter.fieldname]"
									class="w-4 h-4 rounded border-border text-blue-600"
									@change="onFilterChange(filter)"
								/>
							</label>

							<!-- Date filter -->
							<input
								v-else-if="filter.fieldtype === 'Date'"
								type="date"
								v-model="filterValues[filter.fieldname]"
								class="w-full text-sm rounded-md border border-border bg-background"
								@change="onFilterChange(filter)"
							/>

							<!-- Default text/link filter -->
							<input
								v-else
								type="text"
								v-model="filterValues[filter.fieldname]"
								:placeholder="__(filter.label)"
								class="w-full text-sm rounded-md border border-border bg-background"
								@change="onFilterChange(filter)"
							/>
						</div>

						<Button variant="primary" size="sm" @click="refreshReport" class="mb-0.5">
							{{ __("Apply") }}
						</Button>
						<Button
							variant="secondary"
							size="sm"
							@click="clearAllFilters"
							class="mb-0.5"
						>
							{{ __("Clear") }}
						</Button>
					</div>
				</div>

				<!-- Report Summary -->
				<div v-if="reportSummary.length > 0" class="flex flex-wrap gap-4">
					<div v-for="item in reportSummary" :key="item.label" class="bg-background">
						<span
							class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
						>
							{{ __(item.label) }}
						</span>
						<span class="text-lg font-bold" :class="getSummaryColor(item.indicator)">
							{{ item.value }}
						</span>
					</div>
				</div>

				<!-- Chart -->
				<div v-if="showChart && chartConfig" class="bg-background">
					<apexchart
						:type="chartConfig.type || 'bar'"
						:options="apexChartOptions"
						:series="apexChartSeries"
						:height="chartConfig.height || 300"
					/>
				</div>

				<!-- Loading State -->
				<div v-if="loading" class="flex items-center justify-center h-64">
					<div class="flex flex-col items-center gap-3">
						<div
							class="w-8 h-8 border-2 border-border border-t-blue-600 rounded-full animate-spin"
						></div>
						<span class="text-sm text-muted-foreground">
							{{ __("Loading report...") }}
						</span>
					</div>
				</div>

				<!-- Error State -->
				<div
					v-else-if="error"
					class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center"
				>
					<div class="text-red-600 dark:text-red-400 text-sm">{{ error }}</div>
					<Button variant="secondary" size="sm" @click="refreshReport" class="mt-3">
						{{ __("Retry") }}
					</Button>
				</div>

				<!-- Report Table (TanStack) -->
				<ReportTable
					v-else-if="reportData.length > 0 || reportColumns.length > 0"
					ref="reportTableRef"
					:columns="reportColumns"
					:data="reportData"
					:totals-row="totalsRow"
					:enable-row-selection="true"
					:enable-global-filter="true"
					:show-row-numbers="true"
					:show-pagination="true"
					:dense="false"
					:default-page-size="100"
					@row-click="handleRowClick"
					@selection-change="handleSelectionChange"
				/>

				<!-- Empty State -->
				<div v-else-if="!loading && !error && hasExecuted" class="bg-background">
					<div class="text-5xl mb-4">📊</div>
					<h3 class="text-lg font-semibold text-foreground">
						{{ __("No data") }}
					</h3>
					<p class="text-sm text-muted-foreground mt-2">
						{{ __("No results found for the current filters.") }}
					</p>
				</div>

				<!-- Initial State (before first run) -->
				<div v-else-if="!loading && !error && !hasExecuted" class="bg-background">
					<div class="text-5xl mb-4">📊</div>
					<h3 class="text-lg font-semibold text-foreground">
						{{ reportName }}
					</h3>
					<p class="text-sm text-muted-foreground mt-2">
						{{ __("Set your filters and click Refresh to generate the report.") }}
					</p>
					<Button variant="primary" size="sm" @click="refreshReport" class="mt-4">
						{{ __("Generate Report") }}
					</Button>
				</div>
			</div>
		</template>
	</AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBreadcrumbStore } from "../stores/breadcrumbs";
import { useAppInfoStore } from "../stores/appInfo";
import AppLayout from "../layout/AppLayout.vue";
import Button from "../components/Button.vue";
import ReportTable from "../components/report/ReportTable.vue";
import { __ } from "../utils/translate";
import {
	fetchReportMeta,
	executeReport,
	buildTotalsRow,
	exportReportData,
} from "../utils/reportEngine";
import type {
	ReportMeta,
	ReportColumn,
	ReportRow,
	ReportFilter,
	ReportFilterValues,
	ReportSummaryItem,
	ReportChartConfig,
	ReportExportFormat,
} from "../types/report";

const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();
const appInfoStore = useAppInfoStore();

// ── Reactive State ─────────────────────────────────────────────────

const loading = ref(false);
const error = ref("");
const hasExecuted = ref(false);

const reportMeta = ref<ReportMeta | null>(null);
const reportColumns = ref<ReportColumn[]>([]);
const reportData = ref<ReportRow[]>([]);
const reportSummary = ref<ReportSummaryItem[]>([]);
const chartConfig = ref<ReportChartConfig | null>(null);
const showChart = ref(true);
const showExportMenu = ref(false);
const exportDropdownRef = ref<HTMLElement | null>(null);

const reportFilters = ref<ReportFilter[]>([]);
const filterValues = ref<ReportFilterValues>({});
const selectedRows = ref<ReportRow[]>([]);

const reportTableRef = ref<InstanceType<typeof ReportTable> | null>(null);

// ── Computed ───────────────────────────────────────────────────────

const appName = computed(() => (route.params.app as string) || "");
const reportName = computed(() => decodeURIComponent((route.params.report as string) || ""));

const totalsRow = computed(() => {
	if (!reportMeta.value?.add_total_row) return null;
	if (reportData.value.length === 0) return null;
	return buildTotalsRow(reportData.value, reportColumns.value);
});

const exportFormats = [
	{ label: "CSV", value: "csv" as ReportExportFormat },
	{ label: "JSON", value: "json" as ReportExportFormat },
	{ label: "Excel (CSV)", value: "xlsx" as ReportExportFormat },
	{ label: "Print / PDF", value: "pdf" as ReportExportFormat },
];

const apexChartOptions = computed(() => {
	if (!chartConfig.value?.data) return {};
	return {
		chart: {
			type: chartConfig.value.type || "bar",
			toolbar: { show: true },
			fontFamily: "inherit",
		},
		xaxis: {
			categories: chartConfig.value.data.labels || [],
		},
		colors: chartConfig.value.colors || [
			"#3b82f6",
			"#ef4444",
			"#10b981",
			"#f59e0b",
			"#8b5cf6",
		],
		dataLabels: { enabled: false },
		stroke: { curve: "smooth" as const, width: 2 },
		grid: {
			borderColor: "#e2e8f0",
			strokeDashArray: 4,
		},
		tooltip: { theme: "dark" },
		...(chartConfig.value.options || {}),
	};
});

const apexChartSeries = computed(() => {
	if (!chartConfig.value?.data?.datasets) return [];

	const type = chartConfig.value.type;
	if (type === "pie" || type === "donut") {
		const dataset = chartConfig.value.data.datasets[0];
		return dataset?.values || [];
	}

	return chartConfig.value.data.datasets.map((ds) => ({
		name: ds.name,
		data: ds.values,
		type: ds.chartType || chartConfig.value!.type,
	}));
});

// ── Helpers ────────────────────────────────────────────────────────

function formatLabel(str: string): string {
	if (!str) return "";
	return str.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSelectOptions(filter: ReportFilter): string[] {
	if (!filter.options) return [];
	if (typeof filter.options === "string") {
		return filter.options.split("\n").filter(Boolean);
	}
	return [];
}

function getSummaryColor(indicator?: string): string {
	const colors: Record<string, string> = {
		green: "text-green-600 dark:text-green-400",
		blue: "text-blue-600 dark:text-blue-400",
		red: "text-red-600 dark:text-red-400",
		orange: "text-orange-600 dark:text-orange-400",
		yellow: "text-yellow-600 dark:text-yellow-400",
	};
	return colors[indicator || ""] || "text-foreground";
}

// ── Report Lifecycle ───────────────────────────────────────────────

async function initializeReport() {
	loading.value = true;
	error.value = "";

	try {
		reportMeta.value = await fetchReportMeta(reportName.value);

		if (!reportMeta.value) {
			error.value = __("Report not found: {0}", { 0: reportName.value });
			loading.value = false;
			return;
		}

		// Setup filters from report meta
		setupFilters();

		// Auto-execute if no required filters are empty
		const hasRequiredEmpty = reportFilters.value.some(
			(f) => f.reqd && !filterValues.value[f.fieldname],
		);
		if (!hasRequiredEmpty) {
			await refreshReport();
		} else {
			loading.value = false;
		}
	} catch (err: any) {
		console.error("[ReportView] Init failed:", err);
		error.value = err.message || __("Failed to initialize report");
		loading.value = false;
	}
}

function setupFilters() {
	if (reportMeta.value?.filters) {
		try {
			const parsed = JSON.parse(reportMeta.value.filters);
			reportFilters.value = Array.isArray(parsed) ? parsed : [];
		} catch {
			reportFilters.value = [];
		}
	}

	// Set default values
	for (const filter of reportFilters.value) {
		if (filter.default !== undefined && filterValues.value[filter.fieldname] === undefined) {
			filterValues.value[filter.fieldname] = filter.default;
		}
	}
}

async function refreshReport() {
	loading.value = true;
	error.value = "";

	try {
		const response = await executeReport(reportName.value, filterValues.value);

		reportColumns.value = response.columns;
		reportData.value = response.result;
		reportSummary.value = response.report_summary || [];
		chartConfig.value = response.chart || null;
		hasExecuted.value = true;
	} catch (err: any) {
		console.error("[ReportView] Refresh failed:", err);
		error.value = err.message || __("Failed to load report data");
	} finally {
		loading.value = false;
	}
}

function onFilterChange(_filter: ReportFilter) {
	// Filters changed — user can click Apply to re-run
}

function clearAllFilters() {
	filterValues.value = {};
	for (const filter of reportFilters.value) {
		if (filter.default !== undefined) {
			filterValues.value[filter.fieldname] = filter.default;
		}
	}
}

function handleExport(format: ReportExportFormat) {
	showExportMenu.value = false;
	exportReportData(reportColumns.value, reportData.value, {
		format,
		filename: reportName.value.replace(/\s+/g, "_"),
		visibleOnly: true,
	});
}

function handlePrint() {
	window.print();
}

function toggleChart() {
	showChart.value = !showChart.value;
}

function handleRowClick(row: ReportRow) {
	// Navigate to form if there's a name + ref_doctype
	if (row.name && reportMeta.value?.ref_doctype) {
		router.push({
			name: "EditForm",
			params: {
				app: appName.value,
				doctype: reportMeta.value.ref_doctype,
				name: row.name,
			},
		});
	}
}

function handleSelectionChange(rows: ReportRow[]) {
	selectedRows.value = rows;
}

// ── Close export dropdown on outside click ─────────────────────────

function handleOutsideClick(e: MouseEvent) {
	if (exportDropdownRef.value && !exportDropdownRef.value.contains(e.target as Node)) {
		showExportMenu.value = false;
	}
}

// ── Breadcrumbs ────────────────────────────────────────────────────

watch(
	[appName, reportName],
	() => {
		const appLabel = appInfoStore.currentAppTitle || formatLabel(appName.value);
		breadcrumbStore.set([
			{ label: appLabel, route: `/${appName.value}`, type: "app" },
			{ label: reportName.value, type: "report" },
		]);
	},
	{ immediate: true },
);

// ── Watch for route changes ────────────────────────────────────────

watch(
	() => route.params.report,
	async (newReport, oldReport) => {
		if (newReport !== oldReport) {
			hasExecuted.value = false;
			reportColumns.value = [];
			reportData.value = [];
			reportSummary.value = [];
			chartConfig.value = null;
			filterValues.value = {};
			reportFilters.value = [];
			await initializeReport();
		}
	},
);

// ── Lifecycle ──────────────────────────────────────────────────────

onMounted(async () => {
	document.addEventListener("click", handleOutsideClick);
	await initializeReport();
});

onUnmounted(() => {
	document.removeEventListener("click", handleOutsideClick);
});
</script>

<style scoped>
@media print {
	.no-print {
		display: none !important;
	}
}
</style>
