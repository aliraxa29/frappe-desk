<template>
	<AppLayout>
		<template #header>
			<div class="flex items-center justify-between gap-4 w-full my-3">
				<div class="flex items-center gap-3">
					<h2 class="text-lg font-semibold text-foreground">
						{{ doctypeLabel }}
					</h2>
					<span
						v-if="selectedRows.length > 0"
						class="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full"
					>
						{{ selectedRows.length }} {{ __("selected") }}
					</span>
				</div>
				<div class="flex items-center gap-2">
					<Button @click="handleExport" variant="secondary" size="sm">
						{{ __("Export") }}
					</Button>
					<Button @click="handleRefresh" variant="secondary" size="sm">
						{{ __("Refresh") }}
					</Button>
					<Button @click="handleNewDocument" variant="primary" size="sm">
						+ {{ __("New") }} {{ doctypeLabel }}
					</Button>
				</div>
			</div>
		</template>

		<template #content>
			<div class="rounded-xl border border-border bg-background">
				<ListView ref="listViewRef" :doctype="doctype" @select="handleSelect" />
			</div>
		</template>
	</AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { DocTypeMeta } from "../types";
import { useBreadcrumbStore } from "../stores/breadcrumbs";
import AppLayout from "../layout/AppLayout.vue";
import ListView from "../components/list/ListView.vue";
import Button from "../components/Button.vue";
import { realtime } from "../utils/socketio/client";
import { openQuickEntry } from "../composables/useQuickEntry";
import { getMeta } from "../metadata";
import { __ } from "@/utils/translate";

const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();

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
			}
		}
	};

	const handleDocUpdate = (data: any) => {
		if (data.doctype === doctype.value) {
			console.log("[Realtime] Doc update for list", doctype.value);

			if (listViewRef.value?.refresh) {
				listViewRef.value.refresh();
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
		meta.value = await getMeta(doctype.value);

		// If issingle, redirect to form view for the single doc
		if (meta.value?.issingle) {
			router.push({
				name: "EditForm",
				params: {
					app: app.value,
					doctype: doctype.value,
					name: doctype.value,
				},
			});
			return;
		}

		breadcrumbStore.setForList(app.value, doctype.value, meta.value?.label || doctype.value);
		setupRealtimeSubscriptions();
	} catch (err) {
		console.error("Failed to load doctype meta:", err);
	}
});

watch(doctype, (newDoctype, oldDoctype) => {
	if (oldDoctype) {
		cleanupRealtimeSubscriptions();
	}
	if (newDoctype) {
		setupRealtimeSubscriptions();
	}
});

onUnmounted(() => {
	cleanupRealtimeSubscriptions();
});

async function handleNewDocument() {
	if (meta.value?.quick_entry) {
		await openQuickEntry({
			doctype: doctype.value,
			fields: (meta.value?.fields || []).filter(
				(f) => !f.hidden && (f.reqd || f.allow_in_quick_entry) && !f.read_only,
			),
			autoname: meta.value?.autoname,
			onSuccess: (doc) => {
				router.push({
					name: "EditForm",
					params: {
						doctype: doctype.value,
						app: app.value,
						name: doc.name,
					},
				});
			},
			onError: (error) => {
				console.error("Quick Entry error:", error);
				return;
			},
		});
	} else {
		router.push({
			name: "NewForm",
			params: {
				doctype: doctype.value,
				app: app.value,
				name: "new",
			},
		});
	}
}

function handleRefresh() {
	if (listViewRef.value?.refresh) {
		listViewRef.value.refresh();
	}
}

function handleExport() {
	window.open(
		`/api/method/frappe.client.get_list?doctype=${doctype.value}&fields=["*"]&limit_page_length=0&as_dict=1`,
		"_blank",
	);
}

function handleSelect(rows: string[]) {
	selectedRows.value = rows;
}
</script>

<style scoped></style>
