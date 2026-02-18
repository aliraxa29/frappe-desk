<template>
	<div class="h-screen flex flex-col overflow-hidden">
		<!-- Top Navbar - Fixed height, no scroll -->
		<Navbar class="shrink-0 z-50" />

		<!-- Main Layout Container -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Left Sidebar: custom slot overrides AppSidebar when customSidebar=true -->
			<template v-if="customSidebar">
				<slot name="sidebar" />
			</template>
			<template v-else-if="!hideSidebar">
				<!-- Expand trigger when collapsed -->
				<button
					v-if="sidebarStore.collapsed"
					@click="sidebarStore.toggleCollapsed()"
					class="shrink-0 flex items-center justify-center w-8 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
					:title="__('Expand sidebar')"
				>
					<svg
						class="h-4 w-4 text-slate-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M13 5l7 7-7 7M5 5l7 7-7 7"
						/>
					</svg>
				</button>
				<AppSidebar v-else />
			</template>

			<!-- Main Content Area -->
			<div class="flex flex-1 flex-col overflow-hidden">
				<!-- Page Header -->
				<div
					class="shrink-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-17"
				>
					<div class="px-6 flex items-center justify-between dark:bg-gray-950">
						<slot name="header" />
					</div>
				</div>

				<!-- Page Content - Only scrollable area -->
				<div
					class="flex-1 overflow-y-auto scroll-area bg-transparent text-slate-900 dark:bg-gray-950 p-3"
				>
					<slot name="content" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import AppSidebar from "./AppSidebar.vue";
import Navbar from "./Navbar.vue";
import { useSidebarStore } from "../stores/sidebar";
import { __ } from "../utils/translate";

const sidebarStore = useSidebarStore();

interface Props {
	hideSidebar?: boolean;
	customSidebar?: boolean;
}

withDefaults(defineProps<Props>(), {
	hideSidebar: false,
	customSidebar: false,
});
</script>
