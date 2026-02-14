<template>
	<div class="w-full bg-white dark:bg-gray-950 rounded-lg">
		<!-- Loading State -->
		<div v-if="loading && rows.length === 0" class="flex items-center justify-center h-64">
			<div class="flex flex-col items-center gap-3">
				<div
					class="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin"
				/>
				<span class="text-sm text-slate-500 dark:text-slate-400">Loading...</span>
			</div>
		</div>

		<!-- Error State -->
		<div
			v-else-if="error"
			class="m-4 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
		>
			<div class="flex items-center gap-2">
				<svg
					class="w-5 h-5 text-red-500 shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="text-sm text-red-700 dark:text-red-300">{{ error }}</span>
			</div>
		</div>

		<!-- List Content -->
		<template v-else>
			<!-- Filter Area (pill-based) -->
			<FilterArea
				:filters="queryFilters"
				:field-options="allFilterableFields"
				@add-filter="addFilter"
				@remove-filter="removeFilter"
				@edit-filter="editFilterRow"
				@clear-all="clearFilters"
				@toggle-query-builder="toggleQueryBuilder"
			/>

			<!-- Query Builder Popover -->
			<QueryBuilder
				:show="showQueryBuilder"
				:filters="queryFilters"
				:field-options="allFilterableFields"
				:anchor-rect="queryButtonRect"
				@close="showQueryBuilder = false"
				@add-row="addQueryRow"
				@remove-row="removeFilter"
				@field-change="onQueryFieldChange"
				@apply="applyFilters"
				@clear-all="clearFilters"
			/>

			<!-- Bulk Actions Bar -->
			<BulkActionsBar
				:selected-count="selectedRows.length"
				:can-write="true"
				:can-delete="true"
				@bulk-edit="showBulkEdit = true"
				@bulk-delete="handleBulkDelete"
				@bulk-assign="handleBulkAssign"
				@bulk-add-tags="handleBulkAddTags"
				@bulk-print="handleBulkPrint"
				@deselect-all="deselectAll"
			/>

			<!-- Bulk Edit Dialog -->
			<BulkEditDialog
				:show="showBulkEdit"
				:fields="meta?.fields || []"
				:selected-count="selectedRows.length"
				@close="showBulkEdit = false"
				@apply="handleBulkEditApply"
			/>

			<!-- Table -->
			<div class="overflow-x-auto scroll-area" ref="tableContainerRef">
				<table class="w-full">
					<thead
						class="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800"
					>
						<tr>
							<!-- Checkbox column -->
							<th class="w-10 px-4 py-2.5">
								<input
									type="checkbox"
									:checked="isAllSelected"
									:indeterminate="isPartiallySelected"
									@change="toggleSelectAll"
									class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
								/>
							</th>

							<!-- Like column -->
							<th class="w-8 px-1 py-2.5" />

							<!-- Serial # column -->
							<th
								class="w-12 px-2 py-2.5 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
							>
								No.
							</th>

							<!-- Data columns -->
							<th
								v-for="col in columns"
								:key="col.fieldname || col.type"
								class="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none group hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
								:class="{
									'w-70 min-w-50': col.type === 'Subject',
									'text-right': isNumericField(col),
								}"
								@click="toggleSort(col)"
							>
								<div
									class="flex items-center gap-1"
									:class="{ 'justify-end': isNumericField(col) }"
								>
									<span>{{ col.label || col.df?.label || col.type }}</span>
									<template v-if="sortField === getColumnFieldname(col)">
										<svg
											class="w-3 h-3 text-blue-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												v-if="sortOrder === 'asc'"
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 15l7-7 7 7"
											/>
											<path
												v-else
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</template>
									<svg
										v-else
										class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
										/>
									</svg>
								</div>
							</th>
						</tr>
					</thead>

					<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
						<tr
							v-for="(row, index) in rows"
							:key="row.name"
							class="group transition-colors cursor-pointer"
							:class="[
								selectedRows.includes(row.name!)
									? 'bg-blue-50/60 dark:bg-blue-900/15 hover:bg-blue-50 dark:hover:bg-blue-900/20'
									: 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
							]"
							@click="openDocument(row.name!)"
						>
							<!-- Checkbox -->
							<td class="px-4 py-2.5" @click.stop>
								<input
									type="checkbox"
									:value="row.name"
									v-model="selectedRows"
									class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
								/>
							</td>

							<!-- Like -->
							<td class="px-1 py-2.5" @click.stop>
								<button
									type="button"
									class="p-0.5 rounded transition-colors"
									:class="
										isLiked(row)
											? 'text-red-500'
											: 'text-slate-300 dark:text-slate-600 hover:text-red-400'
									"
									@click="toggleLike(row)"
								>
									<svg
										class="w-4 h-4"
										:fill="isLiked(row) ? 'currentColor' : 'none'"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
										/>
									</svg>
								</button>
							</td>

							<!-- Serial # -->
							<td
								class="px-2 py-2.5 text-xs text-slate-400 dark:text-slate-500 tabular-nums"
							>
								{{ startIndex + index + 1 }}
							</td>

							<!-- Data cells -->
							<td
								v-for="col in columns"
								:key="col.fieldname || col.type"
								class="px-3 py-2.5 text-sm"
								:class="getCellClass(col)"
							>
								<!-- Subject (title field + name + indicator) -->
								<template v-if="col.type === 'Subject'">
									<div class="flex items-center gap-2">
										<div class="min-w-0 flex-1">
											<div
												class="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors"
											>
												{{ getSubjectValue(row) }}
											</div>
											<div
												v-if="
													meta?.title_field &&
													meta.title_field !== 'name'
												"
												class="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5"
											>
												{{ row.name }}
											</div>
										</div>
									</div>
								</template>

								<!-- Status indicator -->
								<template v-else-if="col.type === 'Status'">
									<StatusCell
										:value="row.status || row[col.fieldname || 'status']"
										:row="row"
									/>
								</template>

								<!-- Regular field -->
								<template v-else-if="col.type === 'Field' && col.df">
									<component
										:is="getCellComponent(col.df)"
										:value="row[col.df.fieldname]"
										:field="col.df"
										:row="row"
									/>
								</template>
							</td>
						</tr>

						<!-- Empty state -->
						<tr v-if="rows.length === 0 && !loading">
							<td :colspan="columns.length + 3" class="px-4 py-16 text-center">
								<div class="flex flex-col items-center gap-3">
									<div
										class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
									>
										<svg
											class="w-8 h-8 text-slate-400 dark:text-slate-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1.5"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
									</div>
									<div>
										<p
											class="text-sm font-medium text-slate-600 dark:text-slate-400"
										>
											No {{ doctype }} found
										</p>
										<p
											v-if="hasActiveFilters"
											class="text-xs text-slate-400 dark:text-slate-500 mt-1"
										>
											Try adjusting your filters
										</p>
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Loading overlay for subsequent loads -->
			<div
				v-if="loading && rows.length > 0"
				class="flex items-center justify-center py-2 border-t border-slate-200 dark:border-slate-700"
			>
				<div
					class="w-4 h-4 border-2 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin"
				/>
			</div>

			<!-- Footer: Pagination + Info -->
			<div
				class="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
			>
				<!-- Left: count info -->
				<div class="text-xs text-slate-500 dark:text-slate-400">
					<template v-if="totalCount > 0">
						{{ startIndex + 1 }}&ndash;{{ endIndex }} of
						{{ totalCount.toLocaleString() }}
					</template>
					<template v-else> 0 results </template>
				</div>

				<!-- Center: page numbers -->
				<div class="flex items-center gap-1">
					<button
						@click="goToPage(0)"
						:disabled="currentPage === 0"
						class="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
						title="First page"
					>
						<svg
							class="w-3.5 h-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
							/>
						</svg>
					</button>
					<button
						@click="prevPage"
						:disabled="currentPage === 0"
						class="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						<svg
							class="w-3.5 h-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					<!-- Page numbers -->
					<template v-for="p in pageNumbers" :key="p">
						<button
							v-if="p >= 0"
							@click="goToPage(p)"
							class="w-7 h-7 flex items-center justify-center text-xs rounded transition-colors"
							:class="
								currentPage === p
									? 'bg-blue-600 text-white font-medium shadow-sm'
									: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
							"
						>
							{{ p + 1 }}
						</button>
						<span v-else class="text-xs text-slate-400 px-0.5">&hellip;</span>
					</template>

					<button
						@click="nextPage"
						:disabled="!hasNextPage"
						class="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						<svg
							class="w-3.5 h-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
					<button
						@click="goToPage(totalPages - 1)"
						:disabled="currentPage >= totalPages - 1"
						class="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
						title="Last page"
					>
						<svg
							class="w-3.5 h-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 5l7 7-7 7M5 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>

				<!-- Right: page size -->
				<div class="flex items-center gap-2">
					<span class="text-xs text-slate-500 dark:text-slate-400">Per page</span>
					<select
						v-model="pageLength"
						class="px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
						@change="onPageLengthChange"
					>
						<option :value="20">20</option>
						<option :value="50">50</option>
						<option :value="100">100</option>
						<option :value="200">200</option>
						<option :value="500">500</option>
					</select>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { DocTypeMeta, Field, ListColumn, Document } from "../../types";
import { frappeClient } from "../../api/resource";
import { toast } from "../../stores/toast";
import { dialog } from "../../stores/dialog";

// Sub-components
import FilterArea from "./FilterArea.vue";
import QueryBuilder from "./QueryBuilder.vue";
import BulkActionsBar from "./BulkActionsBar.vue";
import BulkEditDialog from "./BulkEditDialog.vue";
import StatusCell from "./cells/StatusCell.vue";
import LinkCell from "./cells/LinkCell.vue";
import DateCell from "./cells/DateCell.vue";
import CurrencyCell from "./cells/CurrencyCell.vue";
import CheckCell from "./cells/CheckCell.vue";
import DefaultCell from "./cells/DefaultCell.vue";

const props = defineProps<{
	doctype: string;
}>();

const emit = defineEmits<{
	(e: "edit", row: Document): void;
	(e: "delete", row: Document): void;
	(e: "select", rows: string[]): void;
}>();

const router = useRouter();
const route = useRoute();

// State
const loading = ref(true);
const error = ref("");
const meta = ref<DocTypeMeta | null>(null);
const rows = ref<Document[]>([]);
const totalCount = ref(0);
const likedDocs = ref<Set<string>>(new Set());

// Pagination
const currentPage = ref(0);
const pageLength = ref(20);

// Sorting
const sortField = ref("modified");
const sortOrder = ref<"asc" | "desc">("desc");

// Filtering
const queryFilters = ref<Array<{ id: string; fieldname: string; operator: string; value: any }>>(
	[],
);
const showQueryBuilder = ref(false);
const queryButtonRect = ref<DOMRect | null>(null);

// Selection
const selectedRows = ref<string[]>([]);
const showBulkEdit = ref(false);

// Computed: total pages
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageLength.value)));

// Computed: pagination
const startIndex = computed(() => currentPage.value * pageLength.value);
const endIndex = computed(() => Math.min(startIndex.value + rows.value.length, totalCount.value));
const hasNextPage = computed(() => endIndex.value < totalCount.value);

// Select all logic
const isAllSelected = computed(
	() => rows.value.length > 0 && selectedRows.value.length === rows.value.length,
);
const isPartiallySelected = computed(
	() => selectedRows.value.length > 0 && selectedRows.value.length < rows.value.length,
);

// Page numbers for pagination
const pageNumbers = computed(() => {
	const total = totalPages.value;
	const current = currentPage.value;
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => i);
	}
	const pages: number[] = [];
	pages.push(0);
	if (current > 2) pages.push(-1); // ellipsis
	for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
		pages.push(i);
	}
	if (current < total - 3) pages.push(-1); // ellipsis
	pages.push(total - 1);
	return pages;
});

// Has active filters
const hasActiveFilters = computed(() => {
	return queryFilters.value.some((f) => {
		if (f.operator === "between") return f.value?.from || f.value?.to;
		return f.value !== undefined && f.value !== null && f.value !== "";
	});
});

// All filterable fields
const allFilterableFields = computed<Field[]>(() => {
	if (!meta.value) return [];
	return meta.value.fields
		.filter(
			(f) =>
				!f.hidden &&
				![
					"Section Break",
					"Column Break",
					"Tab Break",
					"Table",
					"HTML",
					"Button",
					"Table MultiSelect",
				].includes(f.fieldtype),
		)
		.sort((a, b) => (a.label || a.fieldname).localeCompare(b.label || b.fieldname));
});

// Computed: columns from metadata
const columns = computed<ListColumn[]>(() => {
	if (!meta.value) return [];

	const cols: ListColumn[] = [];
	const fields = meta.value.fields || [];

	// 1. Subject column (title_field or name)
	const titleField = meta.value.title_field;
	if (titleField) {
		const df = fields.find((f) => f.fieldname === titleField);
		cols.push({
			type: "Subject",
			df: df || {
				fieldname: titleField,
				label: titleField,
				fieldtype: "Data",
				reqd: false,
				read_only: false,
				hidden: 0,
			},
			label: df?.label || "ID",
			fieldname: titleField,
		});
	} else {
		cols.push({ type: "Subject", label: "Name", fieldname: "name" });
	}

	// 2. Status column if doctype has status field
	const statusField = fields.find((f) => f.fieldname === "status");
	if (statusField) {
		cols.push({ type: "Status", df: statusField, label: "Status", fieldname: "status" });
	}

	// 3. Fields with in_list_view
	const listViewFields = fields
		.filter(
			(f) =>
				f.in_list_view &&
				!f.hidden &&
				f.fieldname !== titleField &&
				f.fieldname !== "status" &&
				!["Section Break", "Column Break", "Tab Break", "Table", "HTML"].includes(
					f.fieldtype,
				),
		)
		.sort((a, b) => (a.idx || 0) - (b.idx || 0));

	listViewFields.forEach((df) => {
		cols.push({ type: "Field", df, label: df.label, fieldname: df.fieldname });
	});

	return cols.slice(0, 8);
});

// Computed: fields to fetch
const fetchFields = computed(() => {
	const fields = new Set(["name", "modified", "creation", "owner", "docstatus", "_liked_by"]);

	columns.value.forEach((col) => {
		if (col.fieldname) fields.add(col.fieldname);
		if (col.df?.fieldname) fields.add(col.df.fieldname);
	});

	return Array.from(fields);
});

// Watch selection
watch(selectedRows, (val) => {
	emit("select", val);
});

// Watch doctype change
watch(
	() => props.doctype,
	async () => {
		selectedRows.value = [];
		currentPage.value = 0;
		queryFilters.value = [];
		await loadMeta();
		await refresh();
	},
	{ immediate: false },
);

// Methods
async function loadMeta() {
	try {
		const response = await frappeClient.getDocTypeMeta(props.doctype);
		meta.value = response.docs?.[0] || null;

		if (meta.value?.sort_field) sortField.value = meta.value.sort_field;
		if (meta.value?.sort_order) sortOrder.value = meta.value.sort_order as "asc" | "desc";
	} catch (err: any) {
		console.error("Failed to load doctype meta:", err);
		error.value = err.message || "Failed to load doctype metadata";
	}
}

async function refresh() {
	loading.value = true;
	error.value = "";

	try {
		const filters = buildFilters();

		const response = await frappeClient.getList(props.doctype, {
			fields: fetchFields.value,
			filters,
			limit_page_length: pageLength.value,
			limit_start: startIndex.value,
			order_by: `${sortField.value} ${sortOrder.value}`,
		});

		rows.value = response.data || [];

		// Parse _liked_by for each row
		rows.value.forEach((row) => {
			if (row._liked_by) {
				try {
					const likers = JSON.parse(row._liked_by);
					if (Array.isArray(likers) && likers.includes(currentUser())) {
						likedDocs.value.add(row.name!);
					}
				} catch {
					/* ignore */
				}
			}
		});

		await fetchTotalCount(filters);
	} catch (err: any) {
		console.error("Failed to load list:", err);
		error.value = err.message || "Failed to load list";
	} finally {
		loading.value = false;
	}
}

function buildFilters(): any[] {
	const filters: any[] = [];

	queryFilters.value.forEach((row) => {
		if (!row.fieldname || !row.operator) return;

		if (row.operator === "between") {
			const from = row.value?.from;
			const to = row.value?.to;
			if (from || to) {
				filters.push([row.fieldname, "between", [from, to]]);
			}
			return;
		}

		if (row.operator === "in" || row.operator === "not in") {
			if (typeof row.value === "string") {
				const parts = row.value
					.split(",")
					.map((v: string) => v.trim())
					.filter(Boolean);
				if (parts.length) filters.push([row.fieldname, row.operator, parts]);
			} else if (Array.isArray(row.value)) {
				filters.push([row.fieldname, row.operator, row.value]);
			}
			return;
		}

		if (row.operator === "is") {
			if (row.value === "set") filters.push([row.fieldname, "is", "set"]);
			else if (row.value === "not set") filters.push([row.fieldname, "is", "not set"]);
			return;
		}

		if (row.value !== undefined && row.value !== null && row.value !== "") {
			const value =
				row.operator === "like" && typeof row.value === "string"
					? `%${row.value}%`
					: row.value;
			filters.push([row.fieldname, row.operator, value]);
		}
	});

	return filters;
}

defineExpose({ refresh, loadMeta });

async function fetchTotalCount(filters: any[]) {
	try {
		const response = await frappeClient.callMethod("frappe.client.get_count", {
			doctype: props.doctype,
			filters,
		});
		totalCount.value = response || 0;
	} catch {
		totalCount.value = rows.value.length;
	}
}

function applyFilters() {
	currentPage.value = 0;
	refresh();
}

// Filter management
function addFilter(filter: { id: string; fieldname: string; operator: string; value: any }) {
	queryFilters.value.push(filter);
	// Open query builder to let user fill in value
	showQueryBuilder.value = true;
}

function removeFilter(id: string) {
	queryFilters.value = queryFilters.value.filter((f) => f.id !== id);
	applyFilters();
}

function editFilterRow(_filter: { id: string; fieldname: string; operator: string; value: any }) {
	showQueryBuilder.value = true;
}

function clearFilters() {
	queryFilters.value = [];
	showQueryBuilder.value = false;
	applyFilters();
}

function addQueryRow() {
	const id = `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
	const defaultField = allFilterableFields.value[0];
	queryFilters.value.push({
		id,
		fieldname: defaultField?.fieldname || "",
		operator: "=",
		value: "",
	});
}

function onQueryFieldChange(row: any) {
	const idx = queryFilters.value.findIndex((f) => f.id === row.id);
	if (idx >= 0) {
		queryFilters.value[idx] = { ...row };
	}
}

function toggleQueryBuilder() {
	showQueryBuilder.value = !showQueryBuilder.value;
}

// Sorting
function toggleSort(col: ListColumn) {
	const fieldname = getColumnFieldname(col);
	if (!fieldname) return;

	if (sortField.value === fieldname) {
		sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
	} else {
		sortField.value = fieldname;
		sortOrder.value = "asc";
	}
	currentPage.value = 0;
	refresh();
}

function getColumnFieldname(col: ListColumn): string {
	return col.fieldname || col.df?.fieldname || "";
}

// Selection
function toggleSelectAll() {
	if (isAllSelected.value) {
		selectedRows.value = [];
	} else {
		selectedRows.value = rows.value.map((r) => r.name!);
	}
}

function deselectAll() {
	selectedRows.value = [];
}

// Pagination
function prevPage() {
	if (currentPage.value > 0) {
		currentPage.value--;
		refresh();
	}
}

function nextPage() {
	if (hasNextPage.value) {
		currentPage.value++;
		refresh();
	}
}

function goToPage(page: number) {
	if (page < 0) page = 0;
	if (page >= totalPages.value) page = totalPages.value - 1;
	currentPage.value = page;
	refresh();
}

function onPageLengthChange() {
	currentPage.value = 0;
	refresh();
}

// Navigation
function openDocument(name: string) {
	router.push({
		name: "EditForm",
		params: { app: route.params.app, doctype: props.doctype, name },
	});
}

// Like
function currentUser(): string {
	// Try to get from cookie or session
	try {
		const value = `; ${document.cookie}`;
		const parts = value.split("; user_id=");
		if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
	} catch {
		/* */
	}
	return "";
}

function isLiked(row: Document): boolean {
	return likedDocs.value.has(row.name!);
}

async function toggleLike(row: Document) {
	const name = row.name!;
	const wasLiked = likedDocs.value.has(name);
	try {
		await frappeClient.callMethod("frappe.desk.like.toggle_like", {
			doctype: props.doctype,
			name,
			add: wasLiked ? "No" : "Yes",
		});
		if (wasLiked) {
			likedDocs.value.delete(name);
		} else {
			likedDocs.value.add(name);
		}
	} catch (err) {
		console.error("Failed to toggle like:", err);
	}
}

// Bulk operations
async function handleBulkDelete() {
	const count = selectedRows.value.length;
	const confirmed = await dialog.confirm(
		"Delete Records",
		`Are you sure you want to delete ${count} ${
			count === 1 ? "record" : "records"
		}? This action cannot be undone.`,
	);
	if (!confirmed) return;

	try {
		for (const name of selectedRows.value) {
			await frappeClient.deleteDocument(props.doctype, name);
		}
		toast.success(`Deleted ${count} records`);
		selectedRows.value = [];
		await refresh();
	} catch (err: any) {
		toast.error("Delete failed", err.message);
	}
}

async function handleBulkEditApply(fieldname: string, value: any) {
	try {
		for (const name of selectedRows.value) {
			await frappeClient.callMethod("frappe.client.set_value", {
				doctype: props.doctype,
				name,
				fieldname: { [fieldname]: value },
			});
		}
		toast.success(`Updated ${selectedRows.value.length} records`);
		showBulkEdit.value = false;
		selectedRows.value = [];
		await refresh();
	} catch (err: any) {
		toast.error("Bulk edit failed", err.message);
	}
}

async function handleBulkAssign() {
	const assignTo = await dialog.prompt("Assign To", {
		label: "User Email",
		placeholder: "user@example.com",
		required: true,
	});
	if (!assignTo) return;

	try {
		for (const name of selectedRows.value) {
			await frappeClient.callMethod("frappe.desk.form.assign_to.add", {
				doctype: props.doctype,
				name,
				assign_to: [assignTo],
			});
		}
		toast.success(`Assigned ${selectedRows.value.length} records to ${assignTo}`);
		selectedRows.value = [];
	} catch (err: any) {
		toast.error("Assign failed", err.message);
	}
}

async function handleBulkAddTags() {
	const tag = await dialog.prompt("Add Tag", {
		label: "Tag",
		placeholder: "Enter tag name",
		required: true,
	});
	if (!tag) return;

	try {
		for (const name of selectedRows.value) {
			await frappeClient.callMethod("frappe.desk.doctype.tag.tag.add_tag", {
				tag,
				dt: props.doctype,
				dn: name,
			});
		}
		toast.success(`Added tag "${tag}" to ${selectedRows.value.length} records`);
		selectedRows.value = [];
	} catch (err: any) {
		toast.error("Add tag failed", err.message);
	}
}

function handleBulkPrint() {
	const names = selectedRows.value.join(",");
	window.open(
		`/api/method/frappe.utils.print_format.download_multi_pdf?doctype=${props.doctype}&name=${names}`,
		"_blank",
	);
}

// Cell formatting
function getSubjectValue(row: Document): string {
	if (meta.value?.title_field) {
		return row[meta.value.title_field] || row.name || "";
	}
	return row.name || "";
}

function isNumericField(col: ListColumn): boolean {
	if (!col.df) return false;
	return ["Currency", "Float", "Int", "Percent"].includes(col.df.fieldtype);
}

function getCellClass(col: ListColumn): string {
	if (isNumericField(col)) return "text-right font-mono tabular-nums";
	if (col.df?.fieldtype === "Check") return "text-center";
	return "text-slate-700 dark:text-slate-200";
}

function getCellComponent(df: Field) {
	const componentMap: Record<string, any> = {
		Link: LinkCell,
		Date: DateCell,
		DateTime: DateCell,
		Currency: CurrencyCell,
		Float: CurrencyCell,
		Int: CurrencyCell,
		Percent: CurrencyCell,
		Check: CheckCell,
	};
	return componentMap[df.fieldtype] || DefaultCell;
}

// Initialize
onMounted(async () => {
	await loadMeta();
	await refresh();
});
</script>
