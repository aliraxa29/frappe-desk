<template>
	<!-- Loading state -->
	<div
		v-if="loading"
		class="flex items-center justify-center min-h-screen text-lg text-[--text-tertiary]"
	>
		{{ __("Loading applications...") }}
	</div>

	<!-- Main container -->
	<div
		v-else
		class="h-screen flex flex-col overflow-hidden dark:bg-gray-950 dark:bg-none bg-[linear-gradient(135deg,var(--bg-primary)_0%,var(--bg-secondary)_50%,var(--bg-tertiary)_100%)]"
	>
		<Navbar class="shrink-0" />

		<!-- Apps section (scrollable) -->
		<div class="flex-1 overflow-y-auto scroll-area px-6 py-8 md:px-6 md:py-8 sm:px-4 sm:py-6">
			<!-- Installed apps -->
			<div class="mb-10">
				<div class="mb-6">
					<h2 class="text-2xl font-bold text-[--text-primary] mb-2 dark:text-white">
						{{ __("Installed Apps") }}
					</h2>
					<p class="text-[--text-secondary] dark:text-white">
						{{ __("Click on any app to view and manage") }}
					</p>
				</div>

				<!-- Empty state -->
				<div
					v-if="installedApps.length === 0"
					class="text-center text-sm text-(--text-secondary)"
				>
					{{ __("No apps installed") }}
				</div>

				<!-- Apps grid -->
				<div
					v-else
					class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
				>
					<AppCard
						v-for="app in installedApps"
						:key="app.name"
						:app="app"
						show-actions
						installed
						@select="selectApp"
						@uninstall="confirmUninstall"
					/>
				</div>
			</div>

			<!-- Available apps (bench) - System Manager only -->
			<div v-if="isSystemUser" class="mb-10">
				<div class="mb-6">
					<h2 class="text-xl font-bold text-[--text-primary] mb-2 dark:text-white">
						{{ __("Available Apps (Not Installed)") }}
					</h2>
					<p class="text-[--text-secondary] dark:text-white">
						{{ __("Apps available on the site can be installed here") }}
					</p>
				</div>

				<div
					v-if="availableApps.length === 0"
					class="text-center text-sm text-(--text-secondary)"
				>
					{{ __("No available apps found") }}
				</div>

				<div
					v-else
					class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
				>
					<AppCard
						v-for="app in availableApps"
						:key="app.name"
						:app="app"
						show-actions
						:installed="false"
						:selectable="false"
						@install="confirmInstall"
					/>
				</div>
			</div>

			<!-- Marketplace apps (READONLY) - System Manager only -->
			<div v-if="isSystemUser">
				<div class="mb-6">
					<div
						class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
					>
						<div>
							<h2
								class="text-xl font-bold text-[--text-primary] mb-2 dark:text-white"
							>
								{{ __("Explore Marketplace") }}
							</h2>
							<p class="text-[--text-secondary] dark:text-white">
								{{ __("Browse and install available apps from the marketplace") }}
							</p>
						</div>
					</div>

					<!-- Filters row -->
					<div class="flex flex-wrap items-center gap-3 mt-4">
						<!-- Search -->
						<div class="relative flex-1 min-w-50 max-w-sm">
							<input
								v-model="marketplaceSearch"
								type="text"
								:placeholder="__('Search apps...')"
								class="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
							/>
							<svg
								class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>

						<!-- Pricing filter -->
						<select
							v-model="marketplacePricingFilter"
							class="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
						>
							<option value="">{{ __("All Pricing") }}</option>
							<option value="Free">{{ __("Free") }}</option>
							<option value="Paid">{{ __("Paid") }}</option>
							<option value="Trial">{{ __("Trial") }}</option>
						</select>

						<!-- Tag filter -->
						<select
							v-if="availableTags.length > 0"
							v-model="marketplaceTagFilter"
							class="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
						>
							<option value="">{{ __("All Categories") }}</option>
							<option v-for="tag in availableTags" :key="tag" :value="tag">
								{{ tag }}
							</option>
						</select>

						<!-- Clear filters -->
						<button
							v-if="
								marketplaceSearch ||
								marketplacePricingFilter ||
								marketplaceTagFilter
							"
							@click="clearMarketplaceFilters"
							class="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
						>
							{{ __("Clear Filters") }}
						</button>

						<!-- Results count -->
						<span
							v-if="
								marketplaceSearch ||
								marketplacePricingFilter ||
								marketplaceTagFilter
							"
							class="text-sm text-slate-500 dark:text-slate-400 ml-auto"
						>
							{{ filteredMarketplaceApps.length }} {{ __("of") }}
							{{ marketplaceApps.length }} {{ __("apps") }}
						</span>
					</div>
				</div>

				<div
					v-if="filteredMarketplaceApps.length === 0 && marketplaceApps.length > 0"
					class="text-center text-sm text-(--text-secondary) py-6"
				>
					{{ __("No apps match your filters") }}
				</div>

				<div
					v-else-if="marketplaceApps.length === 0"
					class="text-center text-sm text-(--text-secondary)"
				>
					{{ __("No marketplace apps found") }}
				</div>

				<div
					v-else
					class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
				>
					<AppCard
						v-for="app in filteredMarketplaceApps"
						:key="app.app_name"
						:app="convertMarketplaceApp(app)"
						:show-actions="true"
						:installed="false"
						:selectable="false"
						:is-marketplace="true"
						:pricing="app.pricing"
						:is-installing="installingApps.has(app.app_name)"
						@marketplace-install="installFreeMarketplaceApp"
						@marketplace-paid="showPaidAppDialog"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { AppInfo } from "../types";
import type { MarketplaceApp } from "../api/marketplace";
import { desktopAPI } from "../api/desktop";
import { marketplaceAPI } from "../api/marketplace";
import { useBreadcrumbStore } from "../stores/breadcrumbs";
import { useAppInfoStore } from "../stores/appInfo";
import { useDialogStore } from "../stores/dialog";
import { useUserStore } from "../stores/user";
import { __ } from "../utils/translate";
import { getErrorMessage, formatErrorMessage } from "../utils/errorHandler";
import Navbar from "../layout/Navbar.vue";
import AppCard from "../components/AppCard.vue";

const router = useRouter();
const route = useRoute();
const breadcrumbStore = useBreadcrumbStore();
const appInfoStore = useAppInfoStore();
const dialogStore = useDialogStore();
const userStore = useUserStore();
const isSystemUser = computed(() => userStore.hasRole("System Manager"));
const loading = ref(true);
const installedApps = ref<AppInfo[]>([]);
const availableApps = ref<AppInfo[]>([]);
const marketplaceApps = ref<MarketplaceApp[]>([]);
const installingApps = ref<Set<string>>(new Set());

// Marketplace filters
const marketplaceSearch = ref("");
const marketplacePricingFilter = ref("");
const marketplaceTagFilter = ref("");

// Extract unique tags from marketplace apps
const availableTags = computed(() => {
	const tagSet = new Set<string>();
	for (const app of marketplaceApps.value) {
		if (app.tags) {
			for (const tag of app.tags.split(",")) {
				const trimmed = tag.trim();
				if (trimmed) tagSet.add(trimmed);
			}
		}
	}
	return Array.from(tagSet).sort();
});

// Filtered marketplace apps
const filteredMarketplaceApps = computed(() => {
	let apps = marketplaceApps.value;

	// Text search
	if (marketplaceSearch.value) {
		const q = marketplaceSearch.value.toLowerCase();
		apps = apps.filter(
			(app) =>
				app.title?.toLowerCase().includes(q) ||
				app.app_name?.toLowerCase().includes(q) ||
				app.description?.toLowerCase().includes(q) ||
				app.author_name?.toLowerCase().includes(q) ||
				app.tags?.toLowerCase().includes(q),
		);
	}

	// Pricing filter
	if (marketplacePricingFilter.value) {
		apps = apps.filter((app) => app.pricing === marketplacePricingFilter.value);
	}

	// Tag filter
	if (marketplaceTagFilter.value) {
		const tag = marketplaceTagFilter.value.toLowerCase();
		apps = apps.filter((app) => app.tags?.toLowerCase().includes(tag));
	}

	return apps;
});

function clearMarketplaceFilters() {
	marketplaceSearch.value = "";
	marketplacePricingFilter.value = "";
	marketplaceTagFilter.value = "";
}

const defaultApps: AppInfo[] = [];

onMounted(async () => {
	breadcrumbStore.clear();
	await getApps();
	await getMarketplaceApps();
});

async function getApps() {
	try {
		loading.value = true;
		const [apiApps, benchApps] = await Promise.all([
			desktopAPI.getInstalledApps(),
			desktopAPI.getAvailableApps(),
		]);

		installedApps.value = apiApps && apiApps.length > 0 ? apiApps : defaultApps;
		availableApps.value = benchApps || [];
		loading.value = false;
	} catch (error) {
		console.error("Failed to load apps:", error);
		installedApps.value = defaultApps;
		availableApps.value = [];
		loading.value = false;
	}
}

async function getMarketplaceApps() {
	try {
		marketplaceApps.value = await marketplaceAPI.getMarketplaceApps();
	} catch (error) {
		console.error("Failed to load marketplace apps:", error);
	}
}

function convertMarketplaceApp(app: MarketplaceApp): AppInfo {
	return {
		name: app.app_name,
		title: app.title,
		description: app.description,
		icon: app.icon,
		image: app.image,
	};
}

async function selectApp(app_name: string) {
	// Find the app info from installed apps
	const appInfo = installedApps.value.find((app) => app.name === app_name);

	// Store the app info in the app info store
	if (appInfo) {
		appInfoStore.setCurrentApp(appInfo);
	}

	router.push({
		name: "App",
		params: { app: app_name },
	});
}

async function confirmInstall(app_name: string) {
	const app = availableApps.value.find((item) => item.name === app_name);
	const label = app?.title || app_name;

	const confirmed = await dialogStore.confirm(
		__("Install App"),
		__("Are you sure you want to install {0}?", { 0: label }),
	);

	if (!confirmed) {
		return;
	}

	try {
		const response = await desktopAPI.installApp(app_name);

		if (response && response.message) {
			await dialogStore.alert(__("Installation Successful"), response.message);
		} else {
			await dialogStore.alert(
				__("Installation Successful"),
				__("App {0} has been installed successfully.", { 0: label }),
			);
		}

		// Hard refresh to reload all metadata and boot data from server
		window.location.href = window.location.href;
	} catch (error: any) {
		// Extract error from response data if available (Frappe API error response)
		const frappeError = error?.response?.data || error;
		const rawErrorMessage = getErrorMessage(frappeError);
		const errorMessage = formatErrorMessage(rawErrorMessage);
		await dialogStore.error(__("Installation Failed"), errorMessage);
	}
}

async function confirmUninstall(app_name: string) {
	const app = installedApps.value.find((item) => item.name === app_name);
	const label = app?.title || app_name;

	const confirmed = await dialogStore.warning(
		__("Uninstall App"),
		__("Are you sure you want to uninstall {0}? This action cannot be undone.", { 0: label }),
	);

	if (!confirmed) {
		return;
	}

	try {
		const response = await desktopAPI.uninstallApp(app_name);

		if (response && response.message) {
			await dialogStore.alert(__("Uninstallation Successful"), response.message);
		} else {
			await dialogStore.alert(
				__("Uninstallation Successful"),
				__("App {0} has been uninstalled successfully.", { 0: label }),
			);
		}

		// Hard refresh to reload all metadata and boot data from server
		window.location.href = window.location.href;
	} catch (error: any) {
		// Extract error from response data if available (Frappe API error response)
		const frappeError = error?.response?.data || error;
		const rawErrorMessage = getErrorMessage(frappeError);
		const errorMessage = formatErrorMessage(rawErrorMessage);
		await dialogStore.error(__("Uninstallation Failed"), errorMessage);
	}
}

async function installFreeMarketplaceApp(app_name: string) {
	const app = marketplaceApps.value.find((item) => item.app_name === app_name);
	if (!app) return;

	const label = app.title || app_name;

	// Verify it's a free app
	if (app.pricing !== "Free") {
		await dialogStore.error(
			__("Cannot Install"),
			__("Only free apps can be installed directly. Please purchase this app first."),
		);
		return;
	}
	const confirmed = await dialogStore.confirm(
		__("Install Marketplace App"),
		__("This will clone the repository from {0} and install '{1}' on your site. Continue?", {
			0: app.repo_url,
			1: label,
		}),
	);

	if (!confirmed) {
		return;
	}

	try {
		installingApps.value.add(app_name);

		const response = await marketplaceAPI.installMarketplaceApp(app.repo_url, app_name);

		if (response && response.message) {
			await dialogStore.alert(__("Installation Successful"), response.message);
		} else {
			await dialogStore.alert(
				__("Installation Successful"),
				__("App {0} has been installed successfully from marketplace.", { 0: label }),
			);
		}

		// Hard refresh to reload all metadata and boot data from server
		window.location.href = window.location.href;
	} catch (error: any) {
		installingApps.value.delete(app_name);

		// Extract error from response data if available (Frappe API error response)
		const frappeError = error?.response?.data || error;
		const rawErrorMessage = getErrorMessage(frappeError);
		const errorMessage = formatErrorMessage(rawErrorMessage);
		await dialogStore.error(__("Installation Failed"), errorMessage);
	}
}

async function showPaidAppDialog(app_name: string) {
	const app = marketplaceApps.value.find((item) => item.app_name === app_name);
	if (!app) return;

	const label = app.title || app_name;
	const author = app.author_name ? ` by ${app.author_name}` : "";

	await dialogStore.alert(
		__("Paid App"),
		__(
			"{0}{1} is a paid application. You can purchase this app from the marketplace or contact the app developer at <a href='mailto:{2}'>{2}</a> for more information.",
			{
				0: label,
				1: author,
				2: app.author_email || "N/A",
			},
		),
		{
			isHtml: true,
		},
	);
}

watch(
	() => route.fullPath,
	async () => {
		await getApps();
		await getMarketplaceApps();
	},
);
</script>
