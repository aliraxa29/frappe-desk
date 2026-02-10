<template>
	<div
		class="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
		:style="{ minHeight: `${chartHeight}px` }"
	>
		<!-- Header -->
		<div
			class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
		>
			<div>
				<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
					{{ chart?.chart_name || title }}
				</h3>
				<p v-if="subtitle" class="text-sm text-slate-500 dark:text-slate-400 mt-1">
					{{ subtitle }}
				</p>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-2">
				<button
					v-tooltip="'Refresh'"
					@click="refresh"
					:disabled="loading"
					class="p-2 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
				>
					<RefreshCwIcon :class="{ 'animate-spin': loading, 'w-5 h-5': true }" />
				</button>

				<button
					v-tooltip="'Download'"
					@click="downloadChart"
					class="p-2 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
				>
					<DownloadIcon class="w-5 h-5" />
				</button>

				<button
					v-tooltip="'Fullscreen'"
					@click="toggleFullscreen"
					class="p-2 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
				>
					<Minimize2Icon v-if="isFullscreen" class="w-5 h-5" />
					<Maximize2Icon v-else class="w-5 h-5" />
				</button>
			</div>
		</div>

		<!-- Content -->
		<div class="p-6">
			<!-- Loading State -->
			<div v-if="loading" class="flex items-center justify-center h-96">
				<div class="flex flex-col items-center gap-3">
					<div class="animate-spin">
						<LoaderCircleIcon class="w-8 h-8 text-blue-600" />
					</div>
					<p class="text-sm text-slate-500 dark:text-slate-400">Loading chart data...</p>
				</div>
			</div>

			<!-- Error State -->
			<div v-else-if="error" class="flex items-center justify-center h-96">
				<div class="text-center">
					<AlertCircleIcon class="w-12 h-12 text-red-500 mx-auto mb-3" />
					<h4 class="text-sm font-medium text-slate-600 dark:text-slate-400">
						Error Loading Chart
					</h4>
					<p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
					<button @click="refresh">Retry</button>
				</div>
			</div>

			<!-- Chart -->
			<div v-else-if="apexOptions && apexOptions.series">
				<ApexChart
					:type="chartType"
					:options="apexOptions"
					:series="apexOptions.series"
					:height="chartHeight"
				/>
			</div>

			<!-- No Data State -->
			<div v-else class="flex items-center justify-center h-96">
				<div class="text-center">
					<DatabaseIcon
						class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3"
					/>
					<h4 class="text-sm font-medium text-slate-600 dark:text-slate-400">
						No Data Available
					</h4>
					<p class="text-sm text-slate-500 dark:text-slate-500 mt-1">
						No data to display for this chart
					</p>
				</div>
			</div>
		</div>

		<!-- Footer with Metrics -->
		<div
			v-if="showMetrics && metrics"
			class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
		>
			<div class="grid grid-cols-3 gap-4">
				<div>
					<p
						class="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide"
					>
						Total
					</p>
					<p class="text-xl font-bold text-slate-900 dark:text-white mt-1">
						{{ formatNumber(metrics.total) }}
					</p>
				</div>
				<div>
					<p
						class="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide"
					>
						Growth
					</p>
					<div class="flex items-center gap-2 mt-1">
						<TrendingUpIcon
							v-if="metrics.trend === 'up'"
							class="w-5 h-5 text-green-600"
						/>
						<TrendingDownIcon v-else class="w-5 h-5 text-red-600" />
						<p
							:class="metrics.trend === 'up' ? 'text-green-600' : 'text-red-600'"
							class="text-lg font-bold"
						>
							{{ metrics.growth }}%
						</p>
					</div>
				</div>
				<div>
					<p
						class="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide"
					>
						Last Updated
					</p>
					<p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
						{{ formatChartDate(metrics.lastUpdated) }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, defineAsyncComponent } from "vue";
import { mergeChartOptions, formatNumber, formatChartDate } from "../../utils/chartUtils";
import type { DashboardChart, DashboardMetrics, ApexChartOptions } from "../../types/dashboard";
import { useDashboardChart } from "../../composables/useDashboardChart";
import RefreshCwIcon from "../../assets/icons/RefreshCw.vue";
import DownloadIcon from "../../assets/icons/Download.vue";
import Minimize2Icon from "../../assets/icons/Minimize2.vue";
import Maximize2Icon from "../../assets/icons/Maximize2.vue";
import LoaderCircleIcon from "../../assets/icons/LoaderCircle.vue";
import AlertCircleIcon from "../../assets/icons/AlertCircle.vue";
import DatabaseIcon from "../../assets/icons/Database.vue";
import TrendingUpIcon from "../../assets/icons/TrendingUp.vue";
import TrendingDownIcon from "../../assets/icons/TrendingDown.vue";

const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"));

interface Props {
	chartName?: string;
	chart?: DashboardChart;
	title?: string;
	subtitle?: string;
	showMetrics?: boolean;
	metrics?: DashboardMetrics;
	autoRefresh?: number; // in seconds
	onRefresh?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
	showMetrics: true,
	autoRefresh: 0,
});

const emit = defineEmits<{
	(e: "loaded", chart: DashboardChart): void;
	(e: "error", error: string): void;
}>();

// Chart data
const {
	chart: loadedChart,
	data,
	loading,
	error,
	refresh: refetchData,
} = useDashboardChart(props.chartName || "");

const isFullscreen = ref(false);
let autoRefreshInterval: NodeJS.Timeout | null = null;

// Computed properties
const chartType = computed(() => {
	const c = props.chart || loadedChart.value;
	return c?.type || "line";
});

const apexOptions = computed<ApexChartOptions>(() => {
	const customOpts = props.chart?.custom_options ? JSON.parse(props.chart.custom_options) : {};

	return mergeChartOptions(chartType.value, customOpts, data.value);
});

const chartHeight = computed(() => {
	return props.chart?.height || apexOptions.value.chart?.height || 400;
});

// Methods
const refresh = async () => {
	await refetchData();
	props.onRefresh?.();
};

const downloadChart = () => {
	const apexChartInstance = (window as any).__APEX_INSTANCES__?.find(
		(instance: any) => instance && instance.type === chartType.value,
	);

	if (apexChartInstance) {
		apexChartInstance.exportChart({
			type: "png",
			filename: `${props.chart?.chart_name || "chart"}.png`,
		});
	}
};

const toggleFullscreen = () => {
	isFullscreen.value = !isFullscreen.value;
	// Implement fullscreen logic
};

// Watch for prop changes
watch(
	() => props.chartName,
	(newName) => {
		if (newName) {
			refetchData();
		}
	},
);

watch([loadedChart, error], () => {
	if (loadedChart.value) {
		emit("loaded", loadedChart.value);
	}
	if (error.value) {
		emit("error", error.value);
	}
});

// Auto-refresh
watch(
	() => props.autoRefresh,
	(newInterval) => {
		if (autoRefreshInterval) {
			clearInterval(autoRefreshInterval);
		}

		if (newInterval > 0) {
			autoRefreshInterval = setInterval(() => {
				refetchData();
			}, newInterval * 1000);
		}
	},
);

onUnmounted(() => {
	if (autoRefreshInterval) {
		clearInterval(autoRefreshInterval);
	}
});
</script>
