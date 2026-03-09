<template>
	<div class="flex flex-col h-full">
		<!-- Loading -->
		<div v-if="loading" class="flex items-center justify-center py-12 text-muted-foreground">
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
			class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground select-none"
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
					class="absolute left-3.75 top-8 bottom-0 w-px bg-muted"
				/>

				<!-- Avatar -->
				<button
					@click="navigateToUser(entry.by)"
					:title="entry.by"
					:class="[
						'relative z-10 h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ring-2 ring-white  transition-opacity hover:opacity-80 cursor-pointer',
						entry.type === 'created'
							? 'bg-linear-to-br from-green-400 to-emerald-600'
							: entry.type === 'comment'
							  ? 'bg-linear-to-br from-blue-400 to-blue-600'
							  : entry.type === 'assigned'
							    ? 'bg-linear-to-br from-amber-400 to-orange-500'
							    : 'bg-linear-to-br from-slate-400 to-slate-500',
					]"
				>
					{{ getInitials(entry.by) }}
				</button>

				<!-- Content bubble -->
				<div class="flex-1 min-w-0">
					<!-- Header -->
					<div class="flex items-baseline gap-1.5 flex-wrap mb-1">
						<span class="text-xs font-semibold text-foreground leading-tight">{{
							shortName(entry.by)
						}}</span>
						<span
							class="text-[10px] text-muted-foreground"
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
						class="text-xs text-foreground bg-background"
					>
						{{ entry.content }}
					</div>

					<!-- Assignment badge -->
					<div v-else-if="entry.type === 'assigned'" class="flex flex-col gap-1">
						<div
							class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium rounded-full border border-amber-200 dark:border-amber-800"
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
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							{{ __("Assigned") }}
						</div>
						<p
							v-if="entry.content"
							class="text-[11px] text-muted-foreground line-clamp-2"
						>
							{{ entry.content }}
						</p>
					</div>

					<!-- Version changes -->
					<div
						v-else-if="entry.changes && entry.changes.length > 0"
						class="space-y-1 mt-0.5"
					>
						<div
							v-for="change in entry.changes"
							:key="change.field"
							class="flex items-start gap-1.5 text-[11px] text-muted-foreground"
						>
							<span
								class="shrink-0 font-semibold text-foreground max-w-20 truncate"
								:title="change.field"
								>{{ change.field }}</span
							>
							<span class="shrink-0 text-muted-foreground mt-px">→</span>
							<span
								class="text-muted-foreground truncate"
								:title="String(change.new_value ?? '')"
								>{{ truncate(change.new_value) || __("(empty)") }}</span
							>
						</div>
					</div>

					<!-- Fallback -->
					<div v-else class="text-[11px] text-muted-foreground italic">
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
import { resource } from "../../utils/resource";
import { useRouter } from "vue-router";
import { __ } from "../../utils/translate";

interface Change {
	field: string;
	old_value: any;
	new_value: any;
}

interface TimelineEntry {
	id: string;
	type: "created" | "version" | "comment" | "assigned";
	by: string;
	creation: string;
	content?: string;
	changes?: Change[];
}

interface Props {
	doc: Document | null;
	doctype: string;
	docinfo?: Record<string, any> | null;
	frm?: any;
}

const props = defineProps<Props>();
const router = useRouter();
const loading = ref(false);
const timeline = ref<TimelineEntry[]>([]);
const fieldLabelMap = ref<Record<string, string>>({});

/** Build a map of fieldname → label from DocType meta */
async function buildFieldLabelMap() {
	// Prefer frm.meta if available (already loaded)
	if (props.frm?.meta?.fields) {
		const map: Record<string, string> = {};
		for (const f of props.frm.meta.fields) {
			if (f.fieldname && f.label) {
				map[f.fieldname] = f.label;
			}
		}
		fieldLabelMap.value = map;
		return;
	}

	try {
		const res = await resource.call({
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

function stripHtml(html: string): string {
	try {
		const tmp = document.createElement("div");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || html;
	} catch {
		return html.replace(/<[^>]*>/g, "");
	}
}

function resolveUserInfo(uid: string): { fullname: string; image?: string | null } {
	// Check docinfo.user_info first (comes fresh from server with this doc)
	const docinfoUser = props.docinfo?.user_info?.[uid];
	if (docinfoUser?.fullname) return docinfoUser;

	// Fall back to dash.boot.user_info (populated by model.sync_docinfo)
	const bootUser = (window as any).dash?.boot?.user_info?.[uid];
	if (bootUser?.fullname) return bootUser;

	return { fullname: uid };
}

/** Load timeline from docinfo (no extra API calls needed) */
async function loadFromDocinfo(docinfo: Record<string, any>) {
	await buildFieldLabelMap();

	const entries: TimelineEntry[] = [];

	// --- Versions ---
	for (const v of docinfo.versions || []) {
		if (!v.data) continue;
		try {
			const data = JSON.parse(v.data);

			// A version that is a comment
			if (data.comment) {
				entries.push({
					id: `v-${v.name}`,
					type: "comment",
					by: v.owner,
					creation: v.creation,
					content: data.comment,
				});
				continue;
			}

			// A "created" version
			if (data.created_by) {
				entries.push({
					id: `v-${v.name}-created`,
					type: "created",
					by: v.owner,
					creation: v.creation,
				});
				continue;
			}

			// Extract changed fields (skip docstatus)
			const changes: Change[] = [];
			if (Array.isArray(data.changed)) {
				for (const [field, old_value, new_value] of data.changed) {
					if (field === "docstatus") continue;
					changes.push({
						field: getFieldLabel(field),
						old_value,
						new_value,
					});
				}
			}

			// Also extract row_changed into changes summary
			if (Array.isArray(data.row_changed)) {
				for (const row of data.row_changed) {
					const tableField = getFieldLabel(row[0]);
					for (const [field, old_value, new_value] of row[3] || []) {
						changes.push({
							field: `${getFieldLabel(field)} (${tableField} #${row[1] + 1})`,
							old_value,
							new_value,
						});
					}
				}
			}

			if (changes.length > 0) {
				entries.push({
					id: `v-${v.name}`,
					type: "version",
					by: v.owner,
					creation: v.creation,
					changes,
				});
			}
		} catch {
			/* ignore malformed data */
		}
	}

	// --- Comments from docinfo ---
	for (const c of docinfo.comments || []) {
		const commentType: string = c.comment_type || "Comment";
		const owner = c.comment_by || c.owner || c.comment_email || "System";

		if (commentType === "Created") {
			entries.push({
				id: `c-${c.name}`,
				type: "created",
				by: owner,
				creation: c.creation,
			});
		} else if (commentType === "Comment" || commentType === "Email") {
			entries.push({
				id: `c-${c.name}`,
				type: "comment",
				by: owner,
				creation: c.creation,
				content: stripHtml(c.content || ""),
			});
		}
	}

	// --- Assignment logs ---
	for (const a of docinfo.assignment_logs || []) {
		entries.push({
			id: `a-${a.name}`,
			type: "assigned",
			by: a.owner || "System",
			creation: a.creation,
			content: stripHtml(a.content || ""),
		});
	}

	entries.sort((a, b) => new Date(b.creation).getTime() - new Date(a.creation).getTime());
	timeline.value = entries;
}

/** Load timeline via separate API calls (fallback when docinfo not provided) */
async function loadFromApi() {
	await buildFieldLabelMap();

	const [versionsRes, commentsRes] = await Promise.all([
		resource.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Version",
				filters: [
					["ref_doctype", "=", props.doctype],
					["docname", "=", props.doc!.name],
				],
				fields: ["name", "owner", "creation", "data"],
				order_by: "creation desc",
				limit_page_length: 100,
			},
		}),
		resource.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Comment",
				filters: [
					["reference_doctype", "=", props.doctype],
					["reference_name", "=", props.doc!.name],
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
				if (Array.isArray(data.changed)) {
					changes = data.changed
						.filter(([field]: any) => field !== "docstatus")
						.map(([field, old_value, new_value]: [string, any, any]) => ({
							field: getFieldLabel(field),
							old_value,
							new_value,
						}));
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
}

async function loadTimeline() {
	if (!props.doc?.name) {
		timeline.value = [];
		return;
	}
	loading.value = true;
	try {
		if (props.docinfo) {
			await loadFromDocinfo(props.docinfo);
		} else {
			await loadFromApi();
		}
	} catch (err) {
		console.error("Failed to load timeline:", err);
	} finally {
		loading.value = false;
	}
}

function getInitials(uid: string): string {
	const fullname = resolveUserInfo(uid).fullname;
	if (!fullname) return "?";
	return fullname
		.trim()
		.split(/\s+|@/)
		.slice(0, 2)
		.map((p: string) => p[0]?.toUpperCase() || "")
		.join("");
}

function shortName(uid: string): string {
	const fullname = resolveUserInfo(uid).fullname;
	if (!fullname) return "Unknown";
	// If it looks like an email, show the part before @
	if (fullname.includes("@")) return fullname.split("@")[0] ?? fullname;
	// Otherwise first two words
	return fullname.trim().split(/\s+/).slice(0, 2).join(" ");
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

function navigateToUser(uid: string) {
	if (!uid) return;
	// Prefer email from user_info, else use uid directly (may already be email)
	const userInfo = resolveUserInfo(uid);
	const email = (userInfo as any).email || uid;
	router.push({ path: `/User/${encodeURIComponent(email)}` });
}

watch(() => [props.doc?.name, props.doctype, props.docinfo], loadTimeline, { immediate: true });
</script>
