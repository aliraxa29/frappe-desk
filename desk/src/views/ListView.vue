<template>
	<AppLayout>
		<template #header>
			<div class="flex items-center justify-between gap-4 w-full my-3">
				<div class="flex items-center gap-3">
					<h2 class="text-lg font-semibold text-slate-800 dark:text-white">
						{{ doctypeLabel }}
					</h2>
				</div>
				<div class="flex items-center gap-2">
					<Button @click="handleNewDocument" variant="primary" size="sm">
						+ New {{ doctypeLabel }}
					</Button>
				</div>
			</div>
		</template>

		<template #content>
			<!-- List Component -->
			<div
				class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 overflow-hidden m-2"
			>
				<ListView ref="listViewRef" :doctype="doctype" @select="handleSelect" />
			</div>
		</template>
	</AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { DocTypeMeta } from "../types";
import { frappeClient } from "../api/resource";
import { useBreadcrumbStore } from "../stores/breadcrumbs";
import AppLayout from "../layout/AppLayout.vue";
import ListView from "../components/list/ListView.vue";
import Button from "../components/Button.vue";
import { realtime } from "../utils/socketio/client";
import { useToastStore } from "../stores/toast";

const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();
const toast = useToastStore();

const doctype = computed(() => (route.params.doctype as string) || "");
const app = computed(() => (route.params.app as string) || "");

const listViewRef = ref<InstanceType<typeof ListView> | null>(null);
const meta = ref<DocTypeMeta | null>(null);
const selectedRows = ref<string[]>([]);

// Realtime subscription tracking
const unsubscribeList = ref<(() => void) | null>(null);

// Get display label for doctype
const doctypeLabel = computed(() => {
	return meta.value?.label || doctype.value;
});

// Update breadcrumbs when meta loads or route changes
watch(
	[doctypeLabel, app],
	() => {
		breadcrumbStore.setForList(app.value, doctype.value, doctypeLabel.value);
	},
	{ immediate: true },
);

/**
 * Setup realtime subscriptions for list updates
 */
function setupRealtimeSubscriptions() {
	if (!doctype.value) return;

	const handleListUpdate = (data: any) => {
		if (data.doctype === doctype.value) {
			console.log("[Realtime] List update for", doctype.value);

			// Refresh the list view
			if (listViewRef.value?.refresh) {
				listViewRef.value.refresh();
				toast.show(`List updated in realtime`, "info");
			}
		}
	};

	const handleDocUpdate = (data: any) => {
		if (data.doctype === doctype.value) {
			console.log("[Realtime] Doc update for list", doctype.value);

			if (listViewRef.value?.refresh) {
				listViewRef.value.refresh();
				toast.show(`List updated in realtime`, "info");
			}
		}
	};

	// Register global event listener
	realtime.on("list_update", handleListUpdate);
	realtime.on("doc_update", handleDocUpdate);

	// Subscribe to doctype list updates
	realtime.doctypeSubscribe(doctype.value, handleListUpdate);

	// Store cleanup function
	unsubscribeList.value = () => {
		realtime.off("list_update", handleListUpdate);
		realtime.off("doc_update", handleDocUpdate);
		realtime.doctypeUnsubscribe(doctype.value, handleListUpdate);
	};
}

/**
 * Cleanup realtime subscriptions
 */
function cleanupRealtimeSubscriptions() {
	if (unsubscribeList.value) {
		unsubscribeList.value();
		unsubscribeList.value = null;
	}
}

onMounted(async () => {
	try {
		const response = await frappeClient.getDocTypeMeta(doctype.value);
		meta.value = response.docs?.[0] || null;

		// Update breadcrumbs with proper label
		breadcrumbStore.setForList(app.value, doctype.value, meta.value?.label || doctype.value);

		// Setup realtime subscriptions
		setupRealtimeSubscriptions();
	} catch (err) {
		console.error("Failed to load doctype meta:", err);
	}
});

// Cleanup on route change
watch(doctype, (newDoctype, oldDoctype) => {
	if (oldDoctype) {
		cleanupRealtimeSubscriptions();
	}
	if (newDoctype) {
		setupRealtimeSubscriptions();
	}
});

// Cleanup on component unmount
onUnmounted(() => {
	cleanupRealtimeSubscriptions();
});

function handleNewDocument() {
	router.push({
		name: "NewForm",
		params: {
			doctype: doctype.value,
			app: app.value,
			name: "new",
		},
	});
}

function handleSelect(rows: string[]) {
	selectedRows.value = rows;
}
</script>

<style scoped></style>
