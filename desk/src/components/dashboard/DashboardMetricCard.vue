<template>
	<div
		class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
	>
		<!-- Metric Card Content -->
		<div class="p-6">
			<!-- Header -->
			<div class="flex items-start justify-between mb-4">
				<div>
					<p class="text-sm font-medium text-slate-600 dark:text-slate-400">
						{{ label }}
					</p>
					<h3 class="text-3xl font-bold text-slate-900 dark:text-white mt-2">
						{{ formattedValue }}
					</h3>
				</div>

				<!-- Icon -->
				<div
					v-if="icon"
					class="p-3 rounded-lg"
					:class="[iconBackgroundClass, 'text-base']"
				>
					<Icon :icon="icon" />
				</div>
			</div>

			<!-- Change Indicator -->
			<div v-if="change !== undefined" class="flex items-center gap-2">
				<TrendingUpIcon v-if="change >= 0" class="w-4 h-4 text-green-600" />
				<TrendingDownIcon v-else class="w-4 h-4 text-red-600" />
				<span
					:class="change >= 0 ? 'text-green-600' : 'text-red-600'"
					class="font-medium text-sm"
				>
					{{ change >= 0 ? "+" : "" }}{{ change }}%
				</span>
				<span class="text-slate-500 dark:text-slate-400 text-sm">
					vs {{ compareLabel || "last period" }}
				</span>
			</div>

			<!-- Sparkline Chart (optional mini chart) -->
			<div v-if="sparklineData" class="mt-4 h-12">
				<ApexChart
					type="sparkline"
					:series="[{ data: sparklineData }]"
					:options="sparklineOptions"
					height="48"
				/>
			</div>

			<!-- Footer -->
			<div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
				<p class="text-xs text-slate-500 dark:text-slate-400">
					{{ description }}
				</p>
			</div>
		</div>

		<!-- Click Action -->
		<div
			v-if="clickable"
			class="bg-slate-50 dark:bg-slate-800 px-6 py-3 border-t border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
			@click="navigate"
		>
			<button
				class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
			>
				View Details →
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { formatNumber, formatCurrency } from "../../utils/chartUtils";
import TrendingUpIcon from "../../assets/icons/TrendingUp.vue";
import TrendingDownIcon from "../../assets/icons/TrendingDown.vue";

const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"));

interface Props {
	label: string;
	value: number;
	valueType?: "number" | "currency" | "percent";
	icon?: string;
	iconColor?: "blue" | "green" | "red" | "yellow" | "purple" | "gray";
	change?: number;
	compareLabel?: string;
	description?: string;
	sparklineData?: number[];
	clickable?: boolean;
	clickTarget?: string;
}

const props = withDefaults(defineProps<Props>(), {
	valueType: "number",
	iconColor: "blue",
	description: "No additional information",
});

const router = useRouter();

// Formatted value
const formattedValue = computed(() => {
	switch (props.valueType) {
		case "currency":
			return formatCurrency(props.value);
		case "percent":
			return `${props.value.toFixed(1)}%`;
		default:
			return formatNumber(props.value, 0);
	}
});

// Icon background class
const iconBackgroundClass = computed(() => {
	const colorMap: Record<string, string> = {
		blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200",
		green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200",
		red: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200",
		yellow: "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-200",
		purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-200",
		gray: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200",
	};

	return colorMap[props.iconColor] || colorMap.blue;
});

// Sparkline options
const sparklineOptions = computed(() => ({
	chart: {
		type: "area",
		sparkline: { enabled: true },
		group: "sparklines",
	},
	stroke: {
		curve: "smooth",
		width: 2,
	},
	fill: {
		type: "gradient",
		gradient: {
			shadeIntensity: 0.5,
			opacityFrom: 0.45,
			opacityTo: 0.05,
		},
	},
	colors: [props.change && props.change >= 0 ? "#10b981" : "#ef4444"],
}));

// Methods
function navigate() {
	if (props.clickTarget) {
		router.push(props.clickTarget);
	}
}
</script>
