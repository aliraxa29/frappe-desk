/** * Dashboard Gallery Component * Showcases all available chart types with examples */

<template>
	<div class="space-y-8">
		<!-- Header -->
		<div class="border-b border-slate-200 dark:border-slate-800 pb-6">
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Chart Gallery</h2>
			<p class="text-slate-600 dark:text-slate-400">
				Explore different chart types available in ApexCharts
			</p>
		</div>

		<!-- Charts Grid -->
		<div class="space-y-12">
			<!-- Line Chart -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Icon icon="lucide:trending-up" class="w-6 h-6 text-blue-600" />
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
						Line Chart
					</h3>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Perfect for showing trends over time
				</p>
				<div
					class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
				>
					<apexchart
						type="line"
						:options="lineChartOptions"
						:series="lineChartData"
						height="350"
					/>
				</div>
			</div>

			<!-- Area Chart -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Icon icon="lucide:area-chart" class="w-6 h-6 text-green-600" />
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
						Area Chart
					</h3>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Shows cumulative distribution and trends
				</p>
				<div
					class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
				>
					<apexchart
						type="area"
						:options="areaChartOptions"
						:series="areaChartData"
						height="350"
					/>
				</div>
			</div>

			<!-- Bar Chart -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Icon icon="lucide:bar-chart" class="w-6 h-6 text-purple-600" />
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white">Bar Chart</h3>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Compare categories side by side
				</p>
				<div
					class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
				>
					<apexchart
						type="bar"
						:options="barChartOptions"
						:series="barChartData"
						height="350"
					/>
				</div>
			</div>

			<!-- Pie Chart -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Icon icon="lucide:pie-chart" class="w-6 h-6 text-orange-600" />
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white">Pie Chart</h3>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Shows composition and proportions
				</p>
				<div
					class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
				>
					<apexchart
						type="pie"
						:options="pieChartOptions"
						:series="pieChartData"
						height="350"
					/>
				</div>
			</div>

			<!-- Donut Chart -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Icon icon="lucide:donut" class="w-6 h-6 text-red-600" />
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
						Donut Chart
					</h3>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Like pie chart with space in center
				</p>
				<div
					class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
				>
					<apexchart
						type="donut"
						:options="donutChartOptions"
						:series="donutChartData"
						height="350"
					/>
				</div>
			</div>

			<!-- Radar Chart -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Icon icon="lucide:radar" class="w-6 h-6 text-indigo-600" />
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
						Radar Chart
					</h3>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Compare multiple variables across entities
				</p>
				<div
					class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
				>
					<apexchart
						type="radar"
						:options="radarChartOptions"
						:series="radarChartData"
						height="350"
					/>
				</div>
			</div>

			<!-- Scatter Chart -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Icon icon="lucide:scatter-chart" class="w-6 h-6 text-cyan-600" />
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
						Scatter Chart
					</h3>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Shows correlation between two variables
				</p>
				<div
					class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
				>
					<apexchart
						type="scatter"
						:options="scatterChartOptions"
						:series="scatterChartData"
						height="350"
					/>
				</div>
			</div>

			<!-- Bubble Chart -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Icon icon="lucide:bubble-chart" class="w-6 h-6 text-pink-600" />
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
						Bubble Chart
					</h3>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Scatter chart with bubble size as third variable
				</p>
				<div
					class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
				>
					<apexchart
						type="bubble"
						:options="bubbleChartOptions"
						:series="bubbleChartData"
						height="350"
					/>
				</div>
			</div>

			<!-- Heatmap Chart -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Icon icon="lucide:heat-map" class="w-6 h-6 text-amber-600" />
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
						Heatmap Chart
					</h3>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Shows intensity variation in data
				</p>
				<div
					class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
				>
					<apexchart
						type="heatmap"
						:options="heatmapChartOptions"
						:series="heatmapChartData"
						height="350"
					/>
				</div>
			</div>

			<!-- Radial Bar Chart -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<Icon icon="lucide:radial-chart" class="w-6 h-6 text-lime-600" />
					<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
						Radial Bar Chart
					</h3>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					Circular bar chart for metrics
				</p>
				<div
					class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
				>
					<apexchart
						type="radialBar"
						:options="radialBarChartOptions"
						:series="radialBarChartData"
						height="400"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import VueApexCharts from "vue3-apexcharts";
import { chartColorPalettes } from "../../utils/chartUtils";

// Line Chart
const lineChartData = [
	{
		name: "Series 1",
		data: [10, 40, 35, 50, 49, 60, 70, 91, 125, 110, 100, 95],
	},
	{
		name: "Series 2",
		data: [20, 30, 40, 48, 32, 45, 60, 70, 80, 95, 110, 120],
	},
];

const lineChartOptions = {
	chart: { type: "line", toolbar: { show: true } },
	stroke: { curve: "smooth", width: 2 },
	markers: { size: 4 },
	colors: chartColorPalettes.default.slice(0, 2),
	xaxis: {
		categories: [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		],
	},
};

// Area Chart
const areaChartData = [
	{
		name: "Sales",
		data: [30, 40, 45, 50, 60, 65, 70, 85, 90, 100, 110, 120],
	},
];

const areaChartOptions = {
	chart: { type: "area", toolbar: { show: true } },
	stroke: { curve: "smooth", width: 2 },
	fill: {
		type: "gradient",
		gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 },
	},
	colors: ["#3b82f6"],
	xaxis: {
		categories: [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		],
	},
};

// Bar Chart
const barChartData = [
	{
		name: "Q1",
		data: [44, 55, 41, 37, 22],
	},
	{
		name: "Q2",
		data: [53, 32, 33, 52, 13],
	},
];

const barChartOptions = {
	chart: { type: "bar", toolbar: { show: true } },
	colors: chartColorPalettes.default.slice(0, 2),
	xaxis: {
		categories: ["North", "South", "East", "West", "Central"],
	},
};

// Pie Chart
const pieChartData = [44, 55, 41, 37, 22];

const pieChartOptions = {
	chart: { type: "pie", toolbar: { show: true } },
	colors: chartColorPalettes.default,
	labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
	dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` },
};

// Donut Chart
const donutChartData = [44, 55, 41, 37, 22];

const donutChartOptions = {
	chart: { type: "donut", toolbar: { show: true } },
	colors: chartColorPalettes.default,
	labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
	plotOptions: {
		pie: {
			donut: {
				size: "65%",
				labels: {
					show: true,
					value: { fontSize: "18px", fontWeight: 600 },
				},
			},
		},
	},
};

// Radar Chart
const radarChartData = [
	{
		name: "Team A",
		data: [80, 90, 85, 92, 88, 95],
	},
	{
		name: "Team B",
		data: [70, 75, 80, 85, 90, 88],
	},
];

const radarChartOptions = {
	chart: { type: "radar" },
	colors: chartColorPalettes.default.slice(0, 2),
	xaxis: {
		categories: [
			"Sales",
			"Marketing",
			"Development",
			"Support",
			"Quality",
			"Customer Satisfaction",
		],
	},
};

// Scatter Chart
const scatterChartData = [
	{
		name: "Data",
		data: [
			[10, 40],
			[40, 60],
			[30, 50],
			[70, 80],
			[50, 70],
			[20, 30],
			[60, 90],
			[80, 100],
		],
	},
];

const scatterChartOptions = {
	chart: { type: "scatter", toolbar: { show: true } },
	colors: ["#3b82f6"],
	xaxis: { tickAmount: 5 },
	yaxis: { tickAmount: 5 },
};

// Bubble Chart
const bubbleChartData = [
	{
		name: "Bubble",
		data: [
			[10, 40, 10],
			[40, 60, 20],
			[30, 50, 15],
			[70, 80, 30],
			[50, 70, 25],
		],
	},
];

const bubbleChartOptions = {
	chart: { type: "bubble", toolbar: { show: true } },
	colors: ["#ef4444"],
	xaxis: { tickAmount: 5 },
	yaxis: { tickAmount: 5 },
};

// Heatmap Chart
const heatmapChartData = [
	{
		name: "Jan",
		data: [
			{ x: "Product A", y: 45 },
			{ x: "Product B", y: 70 },
			{ x: "Product C", y: 90 },
		],
	},
	{
		name: "Feb",
		data: [
			{ x: "Product A", y: 50 },
			{ x: "Product B", y: 75 },
			{ x: "Product C", y: 95 },
		],
	},
	{
		name: "Mar",
		data: [
			{ x: "Product A", y: 55 },
			{ x: "Product B", y: 80 },
			{ x: "Product C", y: 100 },
		],
	},
];

const heatmapChartOptions = {
	chart: { type: "heatmap" },
	colors: ["#FF7A45"],
};

// Radial Bar Chart
const radialBarChartData = [85, 72, 91, 78, 88];

const radialBarChartOptions = {
	chart: { type: "radialBar", toolbar: { show: true } },
	colors: chartColorPalettes.vibrant.slice(0, 5),
	plotOptions: {
		radialBar: {
			hollow: {
				size: "70%",
				labels: {
					value: { fontSize: "16px", fontWeight: 600 },
				},
			},
		},
	},
	labels: ["Sales", "Marketing", "Operations", "Support", "Quality"],
};
</script>
