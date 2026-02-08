<template>
	<AppLayout>
		<template #header>
			<div class="flex items-center justify-between gap-4 w-full my-4">
				<div class="flex items-center gap-3">
					<h2 class="text-lg font-semibold text-slate-800 dark:text-white">
						{{ pageName }}
					</h2>
				</div>
			</div>
		</template>

		<template #content>
			<div class="space-y-6">
				<!-- Loading State -->
				<div v-if="loading" class="flex items-center justify-center h-64">
					<div class="text-sm text-slate-500">Loading page...</div>
				</div>

				<!-- Page Content -->
				<div
					v-else
					class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
				>
					<div class="flex flex-col items-center justify-center h-64 text-center">
						<div class="text-5xl mb-4">📄</div>
						<h3 class="text-lg font-semibold text-slate-700 dark:text-slate-100">
							{{ pageName }}
						</h3>
						<p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
							Page view coming soon
						</p>
					</div>
				</div>
			</div>
		</template>
	</AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useBreadcrumbStore } from "../stores/breadcrumbs";
import AppLayout from "../layout/AppLayout.vue";

const route = useRoute();
const breadcrumbStore = useBreadcrumbStore();
const loading = ref(false);

const appName = computed(() => (route.params.app as string) || "");
const pageName = computed(() => decodeURIComponent((route.params.page as string) || ""));

// Set breadcrumbs
watch(
	[appName, pageName],
	() => {
		breadcrumbStore.setForPage(appName.value, pageName.value);
	},
	{ immediate: true },
);

onMounted(() => {
	// Load page data if needed
});
</script>
