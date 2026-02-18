<template>
	<div class="flex flex-col h-full">
		<!-- Loading -->
		<div
			v-if="loading"
			class="flex items-center justify-center py-12 text-slate-300 dark:text-slate-600"
		>
			<svg
				class="animate-spin h-5 w-5"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				/>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
			</svg>
		</div>

		<!-- Empty state -->
		<div
			v-else-if="timeline.length === 0"
			class="flex flex-col items-center justify-center py-12 gap-3 text-slate-300 dark:text-slate-600 select-none"
		>
			<svg
				class="h-10 w-10"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="1.2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<p class="text-xs font-medium">{{ __("No history yet") }}</p>
		</div>

		<!-- Feed -->
		<div v-else class="px-3 pt-3 pb-8">
			<div v-for="(entry, idx) in timeline" :key="entry.id" class="relative flex gap-3 pb-5">
				<!-- Connecting line -->
				<div
					v-if="idx < timeline.length - 1"
					class="absolute left-3.75 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-700"
				/>

				<!-- Avatar -->
				<button
					@click="navigateToUser(entry.by)"
					:title="entry.by"
					:class="[
						'relative z-10 h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ring-2 ring-white dark:ring-slate-900 transition-opacity hover:opacity-80 cursor-pointer',
						entry.type === 'created'
							? 'bg-linear-to-br from-green-400 to-emerald-600'
							: entry.type === 'comment'
							  ? 'bg-linear-to-br from-blue-400 to-blue-600'
							  : 'bg-linear-to-br from-slate-400 to-slate-500',
					]"
				>
					{{ getInitials(entry.by) }}
				</button>

				<!-- Content bubble -->
				<div class="flex-1 min-w-0">
					<!-- Header -->
					<div class="flex items-baseline gap-1.5 flex-wrap mb-1">
						<span
							class="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight"
							>{{ shortName(entry.by) }}</span
						>
						<span
							class="text-[10px] text-slate-400"
							:title="formatFullDate(entry.creation)"
							>{{ formatRelativeTime(entry.creation) }}</span
						>
					</div>

					<!-- Created badge -->
					<div
						v-if="entry.type === 'created'"
						class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[11px] font-medium rounded-full border border-green-200 dark:border-green-800"
					>
						<svg
							class="h-3 w-3"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						{{ __("Created") }}
					</div>

					<!-- Comment bubble -->
					<div
						v-else-if="entry.type === 'comment'"
						class="text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-xl rounded-tl-none px-3 py-2 border border-slate-200 dark:border-slate-700 shadow-sm whitespace-pre-wrap wrap-break-word"
					>
						{{ entry.content }}
					</div>

					<!-- Version changes -->
					<div
						v-else-if="entry.changes && entry.changes.length > 0"
						class="space-y-1 mt-0.5"
					>
						<div
							v-for="change in entry.changes"
							:key="change.field"
							class="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400"
						>
							<span
								class="shrink-0 font-semibold text-slate-700 dark:text-slate-300 max-w-20 truncate"
								:title="change.field"
								>{{ change.field }}</span
							>
							<span class="shrink-0 text-slate-300 dark:text-slate-600 mt-px"
								>→</span
							>
							<span
								class="text-slate-500 dark:text-slate-400 truncate"
								:title="String(change.new_value ?? '')"
								>{{ truncate(change.new_value) || __("(empty)") }}</span
							>
						</div>
					</div>

					<!-- Fallback -->
					<div v-else class="text-[11px] text-slate-400 italic">
						{{ __("Document updated") }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Document } from "../../types";
import { desk } from "../../utils/desk";
import { useRouter } from "vue-router";
import { __ } from "../../utils/translate";

interface Change {
	field: string;
	old_value: any;
	new_value: any;
}

interface TimelineEntry {
	id: string;
	type: "created" | "version" | "comment";
	by: string;
	creation: string;
	content?: string;
	changes?: Change[];
}

interface Props {
	doc: Document | null;
	doctype: string;
}

const props = defineProps<Props>();
const router = useRouter();
const loading = ref(false);
const timeline = ref<TimelineEntry[]>([]);
const fieldLabelMap = ref<Record<string, string>>({});

/** Build a map of fieldname → label from DocType meta */
async function buildFieldLabelMap() {
	try {
		const res = await desk.call({
			method: "frappe.client.get",
			args: { doctype: "DocType", name: props.doctype },
		});
		const meta = res.message;
		if (meta?.fields) {
			const map: Record<string, string> = {};
			for (const f of meta.fields) {
				if (f.fieldname && f.label) {
					map[f.fieldname] = f.label;
				}
			}
			fieldLabelMap.value = map;
		}
	} catch {
		// If meta fetch fails, labels will just show fieldnames
	}
}

/** Resolve a fieldname to its label, with fallback */
function getFieldLabel(fieldname: string): string {
	return fieldLabelMap.value[fieldname] || fieldname;
}

async function loadTimeline() {
	if (!props.doc?.name) {
		timeline.value = [];
		return;
	}
	loading.value = true;
	try {
		// Build field label map for this doctype
		await buildFieldLabelMap();

		const [versionsRes, commentsRes] = await Promise.all([
			desk.call({
				method: "frappe.client.get_list",
				args: {
					doctype: "Version",
					filters: [
						["ref_doctype", "=", props.doctype],
						["docname", "=", props.doc.name],
					],
					fields: ["name", "owner", "creation", "data"],
					order_by: "creation desc",
					limit_page_length: 100,
				},
			}),
			desk.call({
				method: "frappe.client.get_list",
				args: {
					doctype: "Comment",
					filters: [
						["reference_doctype", "=", props.doctype],
						["reference_name", "=", props.doc.name],
					],
					fields: [
						"name",
						"comment_by",
						"comment_email",
						"comment_type",
						"content",
						"creation",
					],
					order_by: "creation desc",
					limit_page_length: 100,
				},
			}),
		]);

		const entries: TimelineEntry[] = [];

		for (const c of commentsRes.message || []) {
			const type: string = c.comment_type || "Comment";
			if (type === "Created") {
				entries.push({
					id: `c-${c.name}`,
					type: "created",
					by: c.comment_by || c.comment_email || "System",
					creation: c.creation,
				});
			} else if (type === "Comment" || type === "Email") {
				entries.push({
					id: `c-${c.name}`,
					type: "comment",
					by: c.comment_by || c.comment_email || "System",
					creation: c.creation,
					content: c.content,
				});
			}
		}

		for (const v of versionsRes.message || []) {
			let changes: Change[] = [];
			if (v.data) {
				try {
					const data = JSON.parse(v.data);
					// Frappe format: { changed: [["fieldname", "old", "new"]], ... }
					if (Array.isArray(data.changed)) {
						changes = data.changed.map(
							([field, old_value, new_value]: [string, any, any]) => ({
								field: getFieldLabel(field),
								old_value,
								new_value,
							}),
						);
					}
				} catch {
					/* ignore */
				}
			}
			entries.push({
				id: `v-${v.name}`,
				type: "version",
				by: v.owner,
				creation: v.creation,
				changes,
			});
		}

		entries.sort((a, b) => new Date(b.creation).getTime() - new Date(a.creation).getTime());
		timeline.value = entries;
	} catch (err) {
		console.error("Failed to load timeline:", err);
	} finally {
		loading.value = false;
	}
}

function getInitials(name: string): string {
	if (!name) return "?";
	return name
		.trim()
		.split(/\s+|@/)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase() || "")
		.join("");
}

function shortName(name: string): string {
	if (!name) return "Unknown";
	// If it looks like an email, show the part before @
	if (name.includes("@")) return name.split("@")[0] ?? name;
	// Otherwise first two words
	return name.trim().split(/\s+/).slice(0, 2).join(" ");
}

function formatRelativeTime(creation: string): string {
	const diff = Date.now() - new Date(creation).getTime();
	const mins = Math.floor(diff / 60000);
	const hrs = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);
	if (mins < 1) return __("just now");
	if (mins < 60) return `${mins}m ago`;
	if (hrs < 24) return `${hrs}h ago`;
	if (days < 7) return `${days}d ago`;
	return new Date(creation).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatFullDate(creation: string): string {
	return new Date(creation).toLocaleString();
}

function truncate(val: any, max = 32): string {
	const s = String(val ?? "");
	return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function navigateToUser(userEmail: string) {
	if (!userEmail) return;
	router.push({ path: `/User/${encodeURIComponent(userEmail)}` });
}

watch(() => [props.doc?.name, props.doctype], loadTimeline, { immediate: true });
</script>
