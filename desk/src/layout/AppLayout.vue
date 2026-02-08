<template>
	<div class="h-screen flex flex-col overflow-hidden">
		<!-- Top Navbar - Fixed height, no scroll -->
		<Navbar class="shrink-0 z-50" />

		<!-- Sidebar (Fixed) - conditionally shown -->
		<AppSidebar v-if="!hideSidebar" />

		<!-- Main Layout with margin for sidebar -->
		<div
			class="flex flex-1 flex-col overflow-hidden transition-all duration-300"
			:class="hideSidebar ? 'ml-0' : 'ml-64'"
		>
			<!-- Main Content -->
			<main class="flex-1 flex flex-col overflow-hidden">
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
					class="flex-1 overflow-y-auto bg-transparent text-slate-900 dark:bg-gray-950 p-3"
				>
					<slot name="content" />
				</div>
			</main>
		</div>
	</div>
</template>

<script setup lang="ts">
import AppSidebar from "./AppSidebar.vue";
import Navbar from "./Navbar.vue";

interface Props {
	hideSidebar?: boolean;
}

withDefaults(defineProps<Props>(), {
	hideSidebar: false,
});
</script>
