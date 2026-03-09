<template>
	<AppLayout>
		<template #header>
			<div class="flex items-center justify-between gap-4">
				<div>
					<h1 class="text-2xl font-bold text-foreground">
						{{ currentConfig ? currentConfig.title : "Dashboards" }}
					</h1>
					<p v-if="currentConfig" class="text-muted-foreground text-sm mt-1">
						{{ currentConfig.description }}
					</p>
					<p v-else class="text-muted-foreground text-sm mt-1">
						Select a dashboard to view
					</p>
				</div>
			</div>
		</template>
		<template #content>
			<!-- Dashboard Container -->
			<div v-if="currentConfig" class="space-y-6">
				<DashboardContainer
					:title="currentConfig.title"
					:description="currentConfig.description"
					:chart-names="currentConfig.chartNames"
					:metrics="currentConfig.metrics"
					:filters="currentConfig.filters"
					:chart-columns="currentConfig.chartColumns"
					:chart-gap="currentConfig.chartGap || 'md'"
					:chart-span-config="currentConfig.chartSpanConfig"
					:show-filters="true"
					:show-chart-metrics="true"
					:show-refresh="true"
					:auto-refresh="autoRefreshInterval"
					@filters-change="handleFilterChange"
					@refresh="handleDashboardRefresh"
					@export="handleExport"
					@settings="handleSettings"
				/>
			</div>

			<!-- Fallback Dashboard Selection -->
			<div v-else class="space-y-6">
				<!-- Dashboard Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<div
						v-for="dashboard in availableDashboards"
						:key="dashboard.name"
						@click="selectDashboard(dashboard.name)"
						class="group cursor-pointer rounded-lg border border-border bg-background"
					>
						<div class="flex items-center gap-4 mb-4">
							<div
								class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors"
							>
								<Icon
									:icon="dashboard.icon"
									class="w-6 h-6 text-blue-600 dark:text-blue-400"
								/>
							</div>
							<div>
								<h3 class="font-semibold text-foreground">
									{{ dashboard.title }}
								</h3>
							</div>
						</div>
						<p class="text-sm text-muted-foreground mb-4">
							{{ dashboard.description }}
						</p>
						<button
							class="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline"
						>
							View Dashboard →
						</button>
					</div>
				</div>
			</div>
		</template>
	</AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBreadcrumbStore } from "../stores/breadcrumbs";
import { useAppInfoStore } from "../stores/appInfo";
import AppLayout from "../layout/AppLayout.vue";
import DashboardContainer from "../components/dashboard/DashboardContainer.vue";
import { getDashboardConfig, availableDashboards } from "../data/dashboardConfigs";

const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();
const appInfoStore = useAppInfoStore();

const appName = computed(() => (route.params.app as string) || "");
const dashboardName = computed(() => decodeURIComponent((route.params.dashboard as string) || ""));
const autoRefreshInterval = ref(0);

const currentConfig = computed(() => {
	if (dashboardName.value) {
		return getDashboardConfig(dashboardName.value);
	}
	return null;
});

// Set breadcrumbs
watch(
	[appName, dashboardName],
	() => {
		const appLabel = appInfoStore.currentAppTitle || formatLabel(appName.value);
		const crumbs: any[] = [{ label: appLabel, route: `/${appName.value}`, type: "app" }];

		if (dashboardName.value) {
			crumbs.push({
				label: formatLabel(dashboardName.value),
				type: "dashboard",
			});
		}

		breadcrumbStore.set(crumbs);
	},
	{ immediate: true },
);

// Format label from slug
function formatLabel(str: string): string {
	if (!str) return "";
	return str.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

// Methods
function selectDashboard(name: string) {
	router.push(`/${appName.value || "desk"}/dashboard/${name}`);
}

function handleFilterChange(filters: Record<string, any>) {
	console.log("Filters changed:", filters);
	// Implement filter logic
}

function handleDashboardRefresh() {
	console.log("Refreshing dashboard...");
	// Implement refresh logic
}

function handleExport() {
	console.log("Exporting dashboard data...");
	// Implement export logic
}

function handleSettings() {
	console.log("Opening dashboard settings...");
	// Implement settings logic
}

onMounted(() => {
	// Set up breadcrumb store
	breadcrumbStore.set([
		{
			label: "Dashboard",
			type: "page",
		},
	]);
});
</script>
