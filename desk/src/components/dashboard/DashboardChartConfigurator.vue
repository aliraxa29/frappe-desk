/** * Dashboard Chart Type Configurator * Helps users create and configure different chart types */

<template>
	<div class="space-y-6">
		<!-- Chart Type Selection -->
		<div class="space-y-3">
			<label class="text-sm font-semibold text-slate-900 dark:text-white">Chart Type</label>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
				<button
					v-for="type in chartTypes"
					:key="type.value"
					@click="selectedType = type.value"
					:class="[
						'p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2',
						selectedType === type.value
							? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
							: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600',
					]"
				>
					<Icon :icon="type.icon" class="w-6 h-6" />
					<span class="text-xs font-medium text-center">{{ type.label }}</span>
				</button>
			</div>
		</div>

		<!-- Chart Configuration Preview -->
		<div v-if="selectedType" class="space-y-3">
			<label class="text-sm font-semibold text-slate-900 dark:text-white">Preview</label>
			<div
				class="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 p-6 min-h-96"
			>
				<apexchart
					:type="selectedType as any"
					:options="previewOptions"
					:series="previewData"
					height="400"
				/>
			</div>
		</div>

		<!-- Configuration Options -->
		<div class="space-y-4">
			<h4 class="text-sm font-semibold text-slate-900 dark:text-white">Configuration</h4>

			<!-- Title -->
			<div class="space-y-2">
				<label class="text-sm font-medium text-slate-700 dark:text-slate-300"
					>Chart Title</label
				>
				<input
					v-model="config.title"
					type="text"
					placeholder="Enter chart title"
					class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Data Source -->
			<div class="space-y-2">
				<label class="text-sm font-medium text-slate-700 dark:text-slate-300"
					>Data Source (DocType)</label
				>
				<input
					v-model="config.source"
					type="text"
					placeholder="e.g., Invoice, Sales Order"
					class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Show Values -->
			<div class="flex items-center gap-3">
				<input
					v-model="config.showValues"
					type="checkbox"
					id="showValues"
					class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
				/>
				<label
					for="showValues"
					class="text-sm font-medium text-slate-700 dark:text-slate-300"
				>
					Show values on chart
				</label>
			</div>

			<!-- Time Series -->
			<div v-if="isTimeSeriesChart" class="flex items-center gap-3">
				<input
					v-model="config.timeseries"
					type="checkbox"
					id="timeseries"
					class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
				/>
				<label
					for="timeseries"
					class="text-sm font-medium text-slate-700 dark:text-slate-300"
				>
					Time series data
				</label>
			</div>

			<!-- Colors -->
			<div class="space-y-2">
				<label class="text-sm font-medium text-slate-700 dark:text-slate-300"
					>Colors (comma separated hex)</label
				>
				<input
					v-model="config.colors"
					type="text"
					placeholder="#3b82f6,#ef4444,#10b981"
					class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Height -->
			<div class="space-y-2">
				<label class="text-sm font-medium text-slate-700 dark:text-slate-300"
					>Chart Height (px)</label
				>
				<input
					v-model.number="config.height"
					type="number"
					min="200"
					max="1000"
					class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
		</div>

		<!-- Generated JSON -->
		<div class="space-y-3">
			<label class="text-sm font-semibold text-slate-900 dark:text-white"
				>Generated Configuration</label
			>
			<div class="bg-slate-900 dark:bg-slate-950 rounded-lg p-4">
				<pre class="text-xs text-slate-100 overflow-x-auto">{{
					JSON.stringify(generatedConfig, null, 2)
				}}</pre>
			</div>
			<button
				@click="copyToClipboard"
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
			>
				Copy Configuration
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { Icon } from "@iconify/vue";
import VueApexCharts from "vue3-apexcharts";
import { getChartTemplate } from "../../utils/chartUtils";

const chartTypes = [
	{ value: "line", label: "Line", icon: "lucide:trending-up" },
	{ value: "area", label: "Area", icon: "lucide:area-chart" },
	{ value: "bar", label: "Bar", icon: "lucide:bar-chart" },
	{ value: "pie", label: "Pie", icon: "lucide:pie-chart" },
	{ value: "donut", label: "Donut", icon: "lucide:donut" },
	{ value: "radar", label: "Radar", icon: "lucide:radar" },
	{ value: "scatter", label: "Scatter", icon: "lucide:scatter-chart" },
	{ value: "bubble", label: "Bubble", icon: "lucide:bubble-chart" },
	{ value: "heatmap", label: "Heatmap", icon: "lucide:heat-map" },
	{ value: "candlestick", label: "Candlestick", icon: "lucide:candlestick" },
	{ value: "radialBar", label: "Radial", icon: "lucide:radial-chart" },
	{ value: "timeline", label: "Timeline", icon: "lucide:timeline" },
];

const selectedType = ref<string>("bar");
const config = reactive({
	title: "My Chart",
	source: "Invoice",
	showValues: true,
	timeseries: false,
	colors: "#3b82f6,#ef4444,#10b981",
	height: 400,
});

// Computed
const isTimeSeriesChart = computed(() => {
	return ["line", "area", "candlestick"].includes(selectedType.value);
});

const previewData = computed(() => {
	const data = [
		{
			name: "Series 1",
			data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
		},
		{
			name: "Series 2",
			data: [23, 12, 54, 61, 27, 38, 48, 51, 69],
		},
	];

	if (["pie", "donut", "radar", "radialBar"].includes(selectedType.value)) {
		return [
			{
				name: "Series A",
				data: [44, 55, 41, 37, 22],
			},
		];
	}

	if (["scatter", "bubble"].includes(selectedType.value)) {
		return [
			{
				name: "Bubble",
				data: [
					[10, 40],
					[40, 60],
					[30, 50],
					[70, 80],
					[50, 70],
				],
			},
		];
	}

	if (selectedType.value === "heatmap") {
		return [
			{
				name: "Category A",
				data: [
					{ x: "Jan", y: 45 },
					{ x: "Feb", y: 52 },
					{ x: "Mar", y: 38 },
				],
			},
		];
	}

	return data;
});

const previewOptions = computed(() => {
	const template = getChartTemplate(selectedType.value as any);
	const colors = config.colors.split(",").map((c) => c.trim());

	return {
		...template,
		title: {
			text: config.title,
			align: "center" as const,
		},
		colors,
		dataLabels: {
			enabled: config.showValues,
		},
		chart: {
			...template.chart,
			height: 400,
		},
	};
});

const generatedConfig = computed(() => ({
	chart_type: "Custom",
	type: selectedType.value,
	chart_name: config.title,
	source: config.source,
	timeseries: config.timeseries,
	show_values_over_chart: config.showValues,
	custom_options: JSON.stringify({
		colors: config.colors.split(",").map((c) => c.trim()),
	}),
	height: config.height,
}));

// Methods
function copyToClipboard() {
	const text = JSON.stringify(generatedConfig.value, null, 2);
	navigator.clipboard.writeText(text).then(() => {
		// Show success message
		alert("Configuration copied to clipboard!");
	});
}
</script>
