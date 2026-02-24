<template>
	<div
		class="child-table-enhanced border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900"
	>
		<!-- Header -->
		<div
			class="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700"
		>
			<div class="flex items-center gap-2">
				<span class="text-sm font-semibold text-slate-800 dark:text-slate-200">
					{{ fieldLabel }}
				</span>
				<span v-if="reqd" class="text-red-500 ml-1">*</span>
				<span
					class="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700 px-1.5 py-0.5 rounded-full"
				>
					{{ rows.length }}
				</span>
			</div>
			<div class="flex items-center gap-1.5">
				<!-- Bulk actions when rows selected -->
				<template v-if="selectedIndices.size > 0">
					<span class="text-[11px] font-medium text-blue-600 dark:text-blue-400 mr-1">
						{{ selectedIndices.size }} selected
					</span>
					<button
						type="button"
						class="btn-icon-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
						title="Delete selected"
						@click="deleteSelected"
					>
						<Trash class="w-4 h-4" />
					</button>
					<button
						type="button"
						class="btn-icon-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
						title="Deselect all"
						@click="selectedIndices.clear()"
					>
						<Close class="w-4 h-4" />
					</button>
					<div class="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
				</template>

				<button
					type="button"
					class="btn-icon-sm"
					title="Column Settings"
					@click="showColumnSettings = true"
				>
					<Settings class="w-4 h-4" />
				</button>
				<button type="button" class="add-row-btn" @click="addNewRow">
					<Plus class="w-3.5 h-3.5" />
					{{ __("Add Row") }}
				</button>
			</div>
		</div>

		<!-- Table -->
		<div class="scroll-area overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr
						class="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
					>
						<!-- Select all -->
						<th class="w-8 px-2 py-2">
							<input
								type="checkbox"
								:checked="isAllRowsSelected"
								:indeterminate="isPartialSelect"
								@change="toggleSelectAll"
								class="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
							/>
						</th>
						<!-- Row # -->
						<th
							class="w-10 px-2 py-2 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase"
						>
							#
						</th>
						<!-- Columns -->
						<th
							v-for="col in displayColumns"
							:key="col.fieldname"
							class="px-2.5 py-2 text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
							:class="{ 'text-right': isNumericFieldtype(col.fieldtype) }"
						>
							{{ col.label || col.fieldname }}
							<span v-if="col.reqd" class="text-red-500">*</span>
						</th>
						<!-- Actions -->
						<th
							class="w-20 px-2 py-2 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase"
						>
							{{ __("Actions") }}
						</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="(row, index) in rows"
						:key="row.name || row.idx || index"
						class="border-b border-slate-100 dark:border-slate-800 transition-colors group"
						:class="{
							'bg-blue-50/40 dark:bg-blue-900/10': selectedIndices.has(index),
							'bg-yellow-50/30 dark:bg-yellow-900/10':
								editingCell?.rowIndex === index,
							'hover:bg-slate-50 dark:hover:bg-slate-800/50':
								!selectedIndices.has(index),
						}"
					>
						<!-- Checkbox -->
						<td class="px-2 py-1.5">
							<input
								type="checkbox"
								:checked="selectedIndices.has(index)"
								@change="toggleRowSelect(index)"
								class="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
							/>
						</td>

						<!-- Row # -->
						<td
							class="px-2 py-1.5 text-center text-xs text-slate-400 dark:text-slate-500 tabular-nums"
						>
							{{ index + 1 }}
						</td>

						<!-- Data columns -->
						<td
							v-for="col in displayColumns"
							:key="`${index}-${col.fieldname}`"
							class="px-2.5 py-1.5 cursor-pointer dark:text-gray-300"
							:class="{ 'text-right': isNumericFieldtype(col.fieldtype) }"
							@dblclick="startInlineEdit(index, col.fieldname)"
							@click="selectCellRow(index)"
						>
							<!-- Inline editing -->
							<template
								v-if="
									editingCell?.rowIndex === index &&
									editingCell?.fieldname === col.fieldname
								"
							>
								<InlineCellEditor
									:field="col"
									:value="row[col.fieldname]"
									:meta="childMeta"
									@update="updateCellValue(index, col.fieldname, $event)"
									@blur="saveInlineEdit"
									@cancel="cancelInlineEdit"
								/>
							</template>
							<!-- Display -->
							<template v-else>
								<CellDisplay :field="col" :value="row[col.fieldname]" />
							</template>
						</td>

						<!-- Actions -->
						<td class="px-2 py-1.5">
							<div
								class="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<button
									type="button"
									class="btn-icon-sm"
									title="Edit"
									@click.stop="openRowModal(index)"
								>
									<Edit class="w-3.5 h-3.5" />
								</button>
								<button
									type="button"
									class="btn-icon-sm"
									title="Duplicate"
									@click.stop="duplicateRow(index)"
								>
									<Duplicate class="w-3.5 h-3.5" />
								</button>
								<button
									type="button"
									class="btn-icon-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
									title="Delete"
									@click.stop="deleteRow(index)"
								>
									<Trash class="w-3.5 h-3.5" />
								</button>
								<!-- Move up -->
								<button
									v-if="index > 0"
									type="button"
									class="btn-icon-sm"
									title="Move up"
									@click.stop="moveRow(index, -1)"
								>
									<ChevronUp class="w-3.5 h-3.5" />
								</button>
								<!-- Move down -->
								<button
									v-if="index < rows.length - 1"
									type="button"
									class="btn-icon-sm"
									title="Move down"
									@click.stop="moveRow(index, 1)"
								>
									<ChevronDown class="w-3.5 h-3.5" />
								</button>
							</div>
						</td>
					</tr>

					<!-- Empty state -->
					<tr v-if="rows.length === 0">
						<td :colspan="displayColumns.length + 3" class="py-8 text-center">
							<div
								class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500"
							>
								<svg
									class="w-10 h-10"
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
								<p class="text-xs">No rows added</p>
								<button type="button" class="add-row-btn mt-1" @click="addNewRow">
									<Plus class="w-3.5 h-3.5" />
									{{ __("Add First Row") }}
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Keyboard shortcut hint -->
		<div
			v-if="rows.length > 0"
			class="flex items-center justify-between px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20"
		>
			<span class="text-[10px] text-slate-400 dark:text-slate-500">
				{{ __("Double-click to edit") }} &middot; {{ __("Ctrl+D to duplicate") }} &middot;
				{{ __("Del to delete") }}
			</span>
			<button
				type="button"
				class="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
				@click="addNewRow"
			>
				+ {{ __("Add Row") }}
			</button>
		</div>

		<!-- Row Edit Modal -->
		<Teleport to="body">
			<Transition name="modal">
				<div
					v-if="showRowModal"
					class="fixed inset-0 z-1000 flex items-center justify-center p-4"
					@click.self="closeRowModal"
				>
					<div class="absolute inset-0 bg-black/50" />
					<div
						class="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
					>
						<!-- Modal header -->
						<div
							class="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
						>
							<h3 class="text-sm font-semibold text-slate-900 dark:text-white">
								{{
									editingRowIndex >= 0
										? `Edit Row ${editingRowIndex + 1}`
										: "New Row"
								}}
							</h3>
							<div class="flex items-center gap-2">
								<!-- Navigate rows in modal -->
								<button
									type="button"
									class="btn-icon-sm"
									:disabled="editingRowIndex <= 0"
									@click="navigateRow(-1)"
									title="Previous row"
								>
									<ChevronLeft class="w-4 h-4" />
								</button>
								<span class="text-xs text-slate-500 dark:text-slate-400"
									>{{ editingRowIndex + 1 }} / {{ rows.length }}</span
								>
								<button
									type="button"
									class="btn-icon-sm"
									:disabled="editingRowIndex >= rows.length - 1"
									@click="navigateRow(1)"
									title="Next row"
								>
									<ChevronRight class="w-4 h-4" />
								</button>
								<div class="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
								<button
									type="button"
									class="btn-icon-sm"
									@click="closeRowModal"
									title="Close"
								>
									<Close class="w-4 h-4" />
								</button>
							</div>
						</div>

						<!-- Modal body - full form layout -->
						<div class="flex-1 overflow-y-auto px-5 py-4 scroll-area">
							<!-- Tabs -->
							<div v-if="formLayout.tabs.length > 1" class="mb-4">
								<div
									class="flex gap-0.5 border-b border-slate-200 dark:border-slate-700 -mx-5 px-5 bg-slate-50/50 dark:bg-slate-800/30"
								>
									<button
										v-for="(tab, idx) in formLayout.tabs"
										:key="tab.fieldname || idx"
										type="button"
										class="px-4 py-2.5 text-sm font-medium relative transition-colors"
										:class="
											activeTab === idx
												? 'text-blue-600 dark:text-blue-400'
												: 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
										"
										@click="activeTab = idx"
									>
										{{ tab.label || `Tab ${idx + 1}` }}
										<div
											v-if="activeTab === idx"
											class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t"
										/>
									</button>
								</div>
							</div>

							<!-- Tab content / sections -->
							<div
								v-for="(tab, tabIdx) in formLayout.tabs"
								v-show="activeTab === tabIdx || formLayout.tabs.length <= 1"
								:key="tab.fieldname || tabIdx"
							>
								<template
									v-for="(section, sIdx) in tab.sections"
									:key="`s-${tabIdx}-${sIdx}`"
								>
									<FormSectionRenderer
										:section="section"
										:row-data="editingRowData"
										:child-meta="childMeta"
										@update="updateRowField"
									/>
								</template>
							</div>
						</div>

						<!-- Modal footer -->
						<div
							class="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30"
						>
							<button
								type="button"
								class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
								@click="closeRowModal"
							>
								Cancel
							</button>
							<button
								type="button"
								class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
								@click="saveRowModal"
							>
								Save Row
							</button>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- Column Settings Modal -->
		<Teleport to="body">
			<Transition name="modal">
				<div
					v-if="showColumnSettings"
					class="fixed inset-0 z-1000 flex items-center justify-center p-4"
					@click.self="showColumnSettings = false"
				>
					<div class="absolute inset-0 bg-black/50" />
					<div
						class="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm max-h-[70vh] flex flex-col overflow-hidden"
					>
						<div
							class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700"
						>
							<h3 class="text-sm font-semibold text-slate-900 dark:text-white">
								Column Settings
							</h3>
							<button
								type="button"
								class="btn-icon-sm"
								@click="showColumnSettings = false"
							>
								<Close class="w-4 h-4" />
							</button>
						</div>
						<div class="flex-1 overflow-y-auto p-4 space-y-1 scroll-area">
							<label
								v-for="field in allTableFields"
								:key="field.fieldname"
								class="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
							>
								<input
									type="checkbox"
									:checked="visibleColumnNames.includes(field.fieldname)"
									@change="toggleColumn(field.fieldname)"
									class="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
								/>
								<span class="text-sm text-slate-700 dark:text-slate-300 flex-1">{{
									field.label || field.fieldname
								}}</span>
								<span
									v-if="field.reqd"
									class="text-[10px] px-1.5 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded"
									>Req</span
								>
							</label>
						</div>
						<div
							class="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-700"
						>
							<button
								type="button"
								class="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
								@click="resetColumns"
							>
								Reset
							</button>
							<button
								type="button"
								class="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
								@click="showColumnSettings = false"
							>
								Done
							</button>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, reactive } from "vue";
import type { Field, DocTypeMeta } from "../types";
import CellDisplay from "./childtable/CellDisplay.vue";
import InlineCellEditor from "./childtable/InlineCellEditor.vue";
import FormSectionRenderer from "./childtable/FormSectionRenderer.vue";
import { useDialogStore } from "../stores/dialog";
import Trash from "../icons/Trash.vue";
import Close from "../icons/Close.vue";
import Settings from "../icons/Settings.vue";
import Plus from "../icons/Plus.vue";
import Edit from "../icons/Edit.vue";
import Duplicate from "../icons/Duplicate.vue";
import ChevronUp from "../icons/ChevronUp.vue";
import ChevronDown from "../icons/ChevronDown.vue";
import ChevronLeft from "../icons/ChevronLeft.vue";
import ChevronRight from "../icons/ChevronRight.vue";
import { __ } from "@/utils/translate";

export interface ChildRow {
	[key: string]: any;
	name?: string;
	idx?: number;
	__islocal?: number;
}

interface FormSection {
	label?: string;
	description?: string;
	collapsible?: boolean;
	collapsed?: boolean;
	columns: FormColumn[];
}

interface FormColumn {
	fields: Field[];
}

interface FormTab {
	fieldname?: string;
	label?: string;
	sections: FormSection[];
}

interface FormLayout {
	tabs: FormTab[];
	sections: FormSection[];
}

const dialogStore = useDialogStore();

const props = defineProps<{
	rows: ChildRow[];
	reqd?: number;
	childMeta: DocTypeMeta | null;
	fieldLabel: string;
	parentDoctype?: string;
	parentName?: string;
}>();

const emit = defineEmits<{
	"update:rows": [rows: ChildRow[]];
}>();

// State
const selectedIndices = reactive(new Set<number>());
const editingCell = ref<{ rowIndex: number; fieldname: string } | null>(null);
const showRowModal = ref(false);
const showColumnSettings = ref(false);
const editingRowIndex = ref(-1);
const editingRowData = ref<ChildRow>({});
const visibleColumnNames = ref<string[]>([]);
const activeTab = ref(0);

// Computed: all fields suitable for table
const allTableFields = computed<Field[]>(() => {
	if (!props.childMeta?.fields) return [];
	return props.childMeta.fields.filter(
		(f) =>
			!["Section Break", "Column Break", "Tab Break", "HTML", "Button"].includes(
				f.fieldtype,
			) &&
			!f.hidden &&
			!["name", "parent", "parenttype", "parentfield", "doctype", "idx"].includes(
				f.fieldname,
			),
	);
});

const displayColumns = computed<Field[]>(() => {
	if (visibleColumnNames.value.length === 0) {
		const listViewFields = allTableFields.value.filter((f) => f.in_list_view);
		return listViewFields.length > 0
			? listViewFields.slice(0, 7)
			: allTableFields.value.slice(0, 5);
	}
	return allTableFields.value.filter((f) => visibleColumnNames.value.includes(f.fieldname));
});

// Form layout parsing
const formLayout = computed<FormLayout>(() => {
	if (!props.childMeta?.fields) return { tabs: [], sections: [] };

	const fields = props.childMeta.fields;
	const tabs: FormTab[] = [];
	const rootSections: FormSection[] = [];
	let currentTab: FormTab | null = null;
	let currentSection: FormSection | null = null;
	let currentColumn: FormColumn | null = null;

	const createSection = (
		label?: string,
		desc?: string,
		collapsible?: boolean,
		collapsed?: boolean,
	): FormSection => ({
		label,
		description: desc,
		collapsible: collapsible || false,
		collapsed: collapsed || false,
		columns: [],
	});
	const createColumn = (): FormColumn => ({ fields: [] });

	currentSection = createSection();
	currentColumn = createColumn();
	currentSection.columns.push(currentColumn);

	for (const field of fields) {
		if (
			["name", "parent", "parenttype", "parentfield", "doctype", "idx"].includes(
				field.fieldname,
			)
		)
			continue;

		if (field.fieldtype === "Tab Break") {
			if (currentSection && currentSection.columns.some((col) => col.fields.length > 0)) {
				if (currentTab) currentTab.sections.push(currentSection);
				else rootSections.push(currentSection);
			}
			if (currentTab && currentTab.sections.length > 0) tabs.push(currentTab);
			currentTab = { fieldname: field.fieldname, label: field.label || "Tab", sections: [] };
			currentSection = createSection();
			currentColumn = createColumn();
			currentSection.columns.push(currentColumn);
		} else if (field.fieldtype === "Section Break") {
			if (currentSection && currentSection.columns.some((col) => col.fields.length > 0)) {
				if (currentTab) currentTab.sections.push(currentSection);
				else rootSections.push(currentSection);
			}
			currentSection = createSection(
				field.label,
				field.description,
				field.collapsible === 1,
				field.collapsed === 1,
			);
			currentColumn = createColumn();
			currentSection.columns.push(currentColumn);
		} else if (field.fieldtype === "Column Break") {
			currentColumn = createColumn();
			if (currentSection) currentSection.columns.push(currentColumn);
		} else if (!field.hidden && !["HTML", "Button"].includes(field.fieldtype)) {
			if (currentColumn) currentColumn.fields.push(field);
		}
	}

	if (currentSection && currentSection.columns.some((col) => col.fields.length > 0)) {
		if (currentTab) currentTab.sections.push(currentSection);
		else rootSections.push(currentSection);
	}
	if (currentTab && currentTab.sections.length > 0) tabs.push(currentTab);

	if (tabs.length === 0 && rootSections.length > 0) {
		tabs.push({ fieldname: "default", label: "Details", sections: rootSections });
	}

	return { tabs, sections: rootSections };
});

// Selection
const isAllRowsSelected = computed(
	() => props.rows.length > 0 && selectedIndices.size === props.rows.length,
);
const isPartialSelect = computed(
	() => selectedIndices.size > 0 && selectedIndices.size < props.rows.length,
);

function toggleSelectAll() {
	if (isAllRowsSelected.value) {
		selectedIndices.clear();
	} else {
		props.rows.forEach((_, i) => selectedIndices.add(i));
	}
}

function toggleRowSelect(index: number) {
	if (selectedIndices.has(index)) {
		selectedIndices.delete(index);
	} else {
		selectedIndices.add(index);
	}
}

function selectCellRow(_index: number) {
	// Single click selects a row context (for keyboard nav)
}

// Init visible columns
watch(
	() => props.childMeta,
	(meta) => {
		if (meta && visibleColumnNames.value.length === 0) {
			const listViewFields = allTableFields.value.filter((f) => f.in_list_view);
			visibleColumnNames.value = (
				listViewFields.length > 0
					? listViewFields.slice(0, 7)
					: allTableFields.value.slice(0, 5)
			).map((f) => f.fieldname);
		}
	},
	{ immediate: true },
);

// Inline editing
function startInlineEdit(rowIndex: number, fieldname: string) {
	editingCell.value = { rowIndex, fieldname };
}

function updateCellValue(rowIndex: number, fieldname: string, value: any) {
	const updatedRows = [...props.rows];
	updatedRows[rowIndex] = { ...updatedRows[rowIndex], [fieldname]: value };
	emit("update:rows", updatedRows);
}

function saveInlineEdit() {
	editingCell.value = null;
}

function cancelInlineEdit() {
	editingCell.value = null;
}

// Row operations
function addNewRow() {
	const newRow: ChildRow = { __islocal: 1, idx: props.rows.length + 1 };
	for (const field of allTableFields.value) {
		if (field.default !== undefined && field.default !== null)
			newRow[field.fieldname] = field.default;
		else if (field.fieldtype === "Check") newRow[field.fieldname] = 0;
		else if (["Int", "Float", "Currency", "Percent"].includes(field.fieldtype))
			newRow[field.fieldname] = 0;
		else newRow[field.fieldname] = "";
	}

	const updatedRows = [...props.rows, newRow];
	emit("update:rows", updatedRows);

	editingRowIndex.value = updatedRows.length - 1;
	editingRowData.value = { ...newRow };
	activeTab.value = 0;
	showRowModal.value = true;
}

function duplicateRow(index: number) {
	const duplicate: ChildRow = {
		...props.rows[index],
		name: undefined,
		__islocal: 1,
		idx: props.rows.length + 1,
	};
	emit("update:rows", [...props.rows, duplicate]);
}

async function deleteRow(index: number) {
	const confirmed = await dialogStore.confirm("Delete Row", `Delete row ${index + 1}?`);
	if (!confirmed) return;
	const updatedRows = props.rows.filter((_, i) => i !== index);
	updatedRows.forEach((row, i) => {
		row.idx = i + 1;
	});
	emit("update:rows", updatedRows);
	selectedIndices.delete(index);
}

async function deleteSelected() {
	const count = selectedIndices.size;
	const confirmed = await dialogStore.confirm(
		"Delete Rows",
		`Delete ${count} selected ${count === 1 ? "row" : "rows"}?`,
	);
	if (!confirmed) return;
	const toDelete = new Set(selectedIndices);
	const updatedRows = props.rows.filter((_, i) => !toDelete.has(i));
	updatedRows.forEach((row, i) => {
		row.idx = i + 1;
	});
	emit("update:rows", updatedRows);
	selectedIndices.clear();
}

function moveRow(index: number, direction: number) {
	const newIndex = index + direction;
	if (newIndex < 0 || newIndex >= props.rows.length) return;
	const updatedRows = [...props.rows];
	const temp = updatedRows[index]!;
	updatedRows[index] = updatedRows[newIndex]!;
	updatedRows[newIndex] = temp;
	updatedRows.forEach((row, i) => {
		row.idx = i + 1;
	});
	emit("update:rows", updatedRows);
}

// Row Modal
function openRowModal(index: number) {
	editingRowIndex.value = index;
	editingRowData.value = { ...props.rows[index] };
	activeTab.value = 0;
	showRowModal.value = true;
}

function closeRowModal() {
	showRowModal.value = false;
	editingRowIndex.value = -1;
	editingRowData.value = {};
}

function saveRowModal() {
	const updatedRows = [...props.rows];
	updatedRows[editingRowIndex.value] = { ...editingRowData.value };
	emit("update:rows", updatedRows);
	closeRowModal();
}

function navigateRow(direction: number) {
	// Save current before navigating
	const updatedRows = [...props.rows];
	updatedRows[editingRowIndex.value] = { ...editingRowData.value };
	emit("update:rows", updatedRows);

	const newIndex = editingRowIndex.value + direction;
	if (newIndex < 0 || newIndex >= props.rows.length) return;
	editingRowIndex.value = newIndex;
	editingRowData.value = { ...props.rows[newIndex] };
}

function updateRowField(fieldname: string, value: any) {
	editingRowData.value[fieldname] = value;
}

// Column settings
function toggleColumn(fieldname: string) {
	const idx = visibleColumnNames.value.indexOf(fieldname);
	if (idx >= 0) visibleColumnNames.value.splice(idx, 1);
	else visibleColumnNames.value.push(fieldname);
	visibleColumnNames.value = [...visibleColumnNames.value];
}

function resetColumns() {
	const listViewFields = allTableFields.value.filter((f) => f.in_list_view);
	visibleColumnNames.value = (
		listViewFields.length > 0 ? listViewFields.slice(0, 7) : allTableFields.value.slice(0, 5)
	).map((f) => f.fieldname);
}

function isNumericFieldtype(fieldtype: string): boolean {
	return ["Int", "Float", "Currency", "Percent"].includes(fieldtype);
}

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
	if (!showRowModal.value && editingCell.value === null) {
		if (e.key === "Delete" && selectedIndices.size > 0) {
			e.preventDefault();
			deleteSelected();
		}
	}
}

onMounted(() => {
	document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
	document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.btn-icon-sm {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.25rem;
	border-radius: 0.25rem;
	color: #64748b;
	background: transparent;
	border: none;
	cursor: pointer;
	transition: all 0.15s;
}

.btn-icon-sm:hover {
	background: #f1f5f9;
	color: #334155;
}

.btn-icon-sm:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

:global(html.dark) .btn-icon-sm:hover {
	background: #334155;
	color: #e2e8f0;
}

.add-row-btn {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.375rem 0.75rem;
	background: #3b82f6;
	color: #fff;
	border: none;
	border-radius: 0.375rem;
	font-size: 0.75rem;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s;
}

.add-row-btn:hover {
	background: #2563eb;
}

.modal-enter-active,
.modal-leave-active {
	transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}
</style>
