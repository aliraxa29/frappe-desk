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
		<div class="flex-1 overflow-y-auto px-6 py-8 md:px-6 md:py-8 sm:px-4 sm:py-6">
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
					class="text-center text-sm text-[var(--text-secondary)]"
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

			<!-- Available apps (bench) -->
			<div>
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
					class="text-center text-sm text-[var(--text-secondary)]"
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
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { AppInfo } from "../types";
import { desktopAPI } from "../api/desktop";
import { useBreadcrumbStore } from "../stores/breadcrumbs";
import { useDialogStore } from "../stores/dialog";
import { __ } from "../utils/translate";
import { getErrorMessage, formatErrorMessage } from "../utils/errorHandler";
import Navbar from "../layout/Navbar.vue";
import AppCard from "../components/AppCard.vue";

const router = useRouter();
const route = useRoute();
const breadcrumbStore = useBreadcrumbStore();
const dialogStore = useDialogStore();
const loading = ref(true);
const installedApps = ref<AppInfo[]>([]);
const availableApps = ref<AppInfo[]>([]);

const defaultApps: AppInfo[] = [];

onMounted(async () => {
	breadcrumbStore.clear();
	await getApps();
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

async function selectApp(app_name: string) {
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

watch(
	() => route.fullPath,
	async () => {
		await getApps();
	},
);
</script>
