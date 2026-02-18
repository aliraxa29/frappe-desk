<template>
	<div class="p-4 space-y-3">
		<p
			class="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500"
		>
			{{ __("Assigned To") }}
		</p>

		<!-- Assignees -->
		<div class="space-y-1.5">
			<div
				v-for="a in assignments"
				:key="a.user"
				class="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 group"
			>
				<div class="flex items-center gap-2 min-w-0">
					<div
						class="h-7 w-7 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0"
					>
						{{ getInitials(a.full_name || a.user) }}
					</div>
					<div class="min-w-0">
						<p class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
							{{ a.full_name || a.user }}
						</p>
						<p class="text-[10px] text-slate-400 truncate">{{ a.user }}</p>
					</div>
				</div>
				<button
					@click="removeAssignment(a.user)"
					class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-600 transition-all"
					:aria-label="__('Remove')"
				>
					<X class="h-3.5 w-3.5" />
				</button>
			</div>
			<p
				v-if="assignments.length === 0 && !loading"
				class="text-xs text-slate-400 italic px-2"
			>
				{{ __("Not assigned to anyone") }}
			</p>
		</div>

		<!-- Add Assignment -->
		<div>
			<button
				v-if="!showAddDialog"
				@click="openAdd"
				class="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
			>
				<Plus class="h-3.5 w-3.5" />
				{{ __("Add") }}
			</button>

			<div v-else class="space-y-1.5">
				<input
					ref="searchInput"
					v-model="searchQuery"
					@input="searchUsers"
					type="text"
					:placeholder="__('Search users...')"
					class="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
				<div
					v-if="filteredUsers.length > 0"
					class="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden max-h-36 overflow-y-auto"
				>
					<button
						v-for="u in filteredUsers"
						:key="u.name"
						@click="addAssignment(u.name)"
						class="w-full flex items-center gap-2 px-2.5 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
					>
						<div
							class="h-6 w-6 rounded-full bg-linear-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
						>
							{{ getInitials(u.full_name || u.name) }}
						</div>
						<div class="text-left min-w-0">
							<p class="font-medium text-slate-700 dark:text-slate-200 truncate">
								{{ u.full_name }}
							</p>
							<p class="text-[10px] text-slate-400 truncate">{{ u.name }}</p>
						</div>
					</button>
				</div>
				<div
					v-else-if="searchQuery && !loadingUsers"
					class="text-xs text-slate-400 text-center py-2"
				>
					{{ __("No users found") }}
				</div>
				<button
					@click="
						showAddDialog = false;
						searchQuery = '';
					"
					class="w-full py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
				>
					{{ __("Cancel") }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue";
import type { Document } from "../../types";
import { desk } from "../../utils/desk";
import { useToastStore } from "../../stores/toast";
import X from "../../icons/X.vue";
import Plus from "../../icons/Plus.vue";
import { __ } from "../../utils/translate";

interface UserOption {
	name: string;
	full_name: string;
}

interface Props {
	doc: Document | null;
	doctype: string;
}

const props = defineProps<Props>();
const toast = useToastStore();
const loading = ref(false);
const loadingUsers = ref(false);
const showAddDialog = ref(false);
const searchQuery = ref("");
const filteredUsers = ref<UserOption[]>([]);
const assignments = ref<Array<{ user: string; full_name: string }>>([]);
const searchInput = ref<HTMLInputElement | null>(null);

function getInitials(name: string): string {
	if (!name) return "?";
	return name
		.trim()
		.split(/\s+|@/)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase() || "")
		.join("");
}

async function loadAssignments() {
	if (!props.doc?.name) {
		assignments.value = [];
		return;
	}
	loading.value = true;
	try {
		const res = await desk.call({
			method: "frappe.desk.form.assign_to.get",
			args: { doctype: props.doctype, name: props.doc.name },
		});
		// Returns [{owner: "user@email", name: "todo-xxx"}]
		const items = res.message || [];
		// Fetch full names in parallel
		const enriched = await Promise.all(
			items.map(async (item: any) => {
				try {
					const userRes = await desk.call({
						method: "frappe.client.get_value",
						args: {
							doctype: "User",
							fieldname: "full_name",
							filters: { name: item.owner },
						},
					});
					return {
						user: item.owner,
						full_name: userRes.message?.full_name || item.owner,
					};
				} catch {
					return { user: item.owner, full_name: item.owner };
				}
			}),
		);
		assignments.value = enriched;
	} catch (err) {
		console.error("Failed to load assignments:", err);
	} finally {
		loading.value = false;
	}
}

async function openAdd() {
	showAddDialog.value = true;
	await nextTick();
	searchInput.value?.focus();
	await searchUsers();
}

async function searchUsers() {
	loadingUsers.value = true;
	try {
		const res = await desk.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "User",
				fields: ["name", "full_name"],
				filters: [
					["enabled", "=", 1],
					["user_type", "=", "System User"],
					...(searchQuery.value
						? [["full_name", "like", `%${searchQuery.value}%`]]
						: []),
				],
				limit_page_length: 10,
			},
		});
		// Exclude already assigned
		const assignedUsers = new Set(assignments.value.map((a) => a.user));
		filteredUsers.value = (res.message || []).filter((u: any) => !assignedUsers.has(u.name));
	} catch (err) {
		console.error("Failed to search users:", err);
	} finally {
		loadingUsers.value = false;
	}
}

async function addAssignment(user: string) {
	if (!props.doc?.name) return;
	try {
		await desk.call({
			method: "frappe.desk.form.assign_to.add",
			args: {
				doctype: props.doctype,
				name: props.doc.name,
				assign_to: JSON.stringify([user]), // Frappe expects a JSON-parseable list
				description: "",
				date: null,
				notify: 0,
			},
		});
		showAddDialog.value = false;
		searchQuery.value = "";
		filteredUsers.value = [];
		await loadAssignments();
	} catch (err: any) {
		toast.error(__("Error"), err?.message || __("Could not assign"));
	}
}

async function removeAssignment(user: string) {
	if (!props.doc?.name) return;
	try {
		await desk.call({
			method: "frappe.desk.form.assign_to.remove",
			args: { doctype: props.doctype, name: props.doc.name, assign_to: user },
		});
		assignments.value = assignments.value.filter((a) => a.user !== user);
	} catch (err: any) {
		toast.error(__("Error"), err?.message || __("Could not remove assignment"));
	}
}

watch(() => props.doc?.name, loadAssignments, { immediate: true });
</script>
