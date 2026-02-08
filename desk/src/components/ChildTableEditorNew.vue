<template>
	<div class="child-table-editor">
		<!-- Header -->
		<div class="table-header">
			<div class="table-title">
				<span class="title-text">{{ fieldLabel }}</span>
				<span class="row-count"
					>{{ rows.length }} {{ rows.length === 1 ? "row" : "rows" }}</span
				>
			</div>
			<div class="header-actions">
				<button
					type="button"
					class="btn-icon"
					title="Column Settings"
					@click="openColumnSettings"
				>
					<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
						/>
					</svg>
				</button>
				<button type="button" class="btn-add" @click="addNewRow">
					<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Add Row
				</button>
			</div>
		</div>

		<!-- Table View -->
		<div class="table-wrapper">
			<table class="child-table">
				<thead>
					<tr>
						<th class="col-index">#</th>
						<th v-for="col in displayColumns" :key="col.fieldname" class="col-header">
							{{ col.label || col.fieldname }}
							<span v-if="col.reqd" class="required-mark">*</span>
						</th>
						<th class="col-actions-header">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="(row, index) in rows"
						:key="row.name || row.idx || index"
						:class="{ 'row-selected': selectedRowIndex === index }"
						@click="selectRow(index)"
					>
						<td class="col-index">{{ index + 1 }}</td>
						<td
							v-for="col in displayColumns"
							:key="`${index}-${col.fieldname}`"
							class="col-data"
							@dblclick="startInlineEdit(index, col.fieldname)"
						>
							<!-- Inline editing mode -->
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
							<!-- Display mode -->
							<template v-else>
								<CellDisplay :field="col" :value="row[col.fieldname]" />
							</template>
						</td>
						<td class="col-actions">
							<button
								type="button"
								class="btn-icon btn-sm"
								title="Edit Row"
								@click.stop="openRowModal(index)"
							>
								<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>
							<button
								type="button"
								class="btn-icon btn-sm"
								title="Duplicate"
								@click.stop="duplicateRow(index)"
							>
								<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
							</button>
							<button
								type="button"
								class="btn-icon btn-sm btn-delete"
								title="Delete"
								@click.stop="deleteRow(index)"
							>
								<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</td>
					</tr>
					<tr v-if="rows.length === 0">
						<td :colspan="displayColumns.length + 2" class="empty-state">
							<div class="empty-icon">📋</div>
							<p>No rows added yet</p>
							<button type="button" class="btn-add-first" @click="addNewRow">
								Add First Row
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Bulk Actions -->
		<div v-if="selectedRowIndex !== null" class="bulk-actions">
			<button
				type="button"
				class="btn-sm"
				@click="moveRowUp"
				:disabled="selectedRowIndex === 0"
			>
				↑ Move Up
			</button>
			<button
				type="button"
				class="btn-sm"
				@click="moveRowDown"
				:disabled="selectedRowIndex === rows.length - 1"
			>
				↓ Move Down
			</button>
			<button type="button" class="btn-sm btn-danger" @click="deleteRow(selectedRowIndex)">
				Delete
			</button>
		</div>

		<!-- Row Edit Modal - Full Form Layout -->
		<Teleport to="body">
			<Transition name="modal">
				<div v-if="showRowModal" class="modal-overlay" @click.self="closeRowModal">
					<div class="modal-content modal-large">
						<div class="modal-header">
							<h2>
								{{
									editingRowIndex >= 0
										? `Edit Row ${editingRowIndex + 1}`
										: "New Row"
								}}
							</h2>
							<button type="button" class="btn-close" @click="closeRowModal">
								<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div class="modal-body">
							<!-- Tab-based layout if tabs exist -->
							<div v-if="formLayout.tabs.length > 1" class="form-tabs-container">
								<div class="tabs-header" role="tablist">
									<button
										v-for="(tab, idx) in formLayout.tabs"
										:key="tab.fieldname || idx"
										class="tab-button"
										:class="{ 'tab-button-active': activeTab === idx }"
										role="tab"
										:aria-selected="activeTab === idx"
										@click="activeTab = idx"
									>
										{{ tab.label || `Tab ${idx + 1}` }}
									</button>
								</div>

								<div class="tabs-content">
									<div
										v-for="(tab, tabIdx) in formLayout.tabs"
										v-show="activeTab === tabIdx"
										:key="tab.fieldname || tabIdx"
										class="tab-panel"
										role="tabpanel"
									>
										<!-- Render sections within tab -->
										<template
											v-for="(section, sectionIdx) in tab.sections"
											:key="`section-${tabIdx}-${sectionIdx}`"
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
							</div>

							<!-- Non-tabbed layout -->
							<div v-else class="form-sections-container">
								<template
									v-for="(section, sectionIdx) in formLayout.sections"
									:key="`section-${sectionIdx}`"
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

						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" @click="closeRowModal">
								Cancel
							</button>
							<button type="button" class="btn btn-primary" @click="saveRowModal">
								Save
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
					class="modal-overlay"
					@click.self="closeColumnSettings"
				>
					<div class="modal-content column-settings-modal">
						<div class="modal-header">
							<h2>Column Settings</h2>
							<button type="button" class="btn-close" @click="closeColumnSettings">
								<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div class="modal-body">
							<p class="text-muted">Show or hide columns in the table view</p>
							<div class="columns-list">
								<label
									v-for="field in allTableFields"
									:key="field.fieldname"
									class="column-item"
								>
									<input
										type="checkbox"
										:checked="visibleColumnNames.includes(field.fieldname)"
										@change="toggleColumn(field.fieldname)"
										class="column-checkbox"
									/>
									<span class="column-name">{{
										field.label || field.fieldname
									}}</span>
									<span v-if="field.reqd" class="required-badge">Required</span>
								</label>
							</div>
						</div>

						<div class="modal-footer">
							<button type="button" class="btn btn-secondary" @click="resetColumns">
								Reset
							</button>
							<button
								type="button"
								class="btn btn-primary"
								@click="closeColumnSettings"
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
import { ref, computed, watch } from "vue";
import type { Field, DocTypeMeta } from "../types";
import CellDisplay from "./childtable/CellDisplay.vue";
import InlineCellEditor from "./childtable/InlineCellEditor.vue";
import FormSectionRenderer from "./childtable/FormSectionRenderer.vue";
import { useDialogStore } from "../stores/dialog";

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
	sections: FormSection[]; // For non-tabbed layouts
}

const dialogStore = useDialogStore();

const props = defineProps<{
	rows: ChildRow[];
	childMeta: DocTypeMeta | null;
	fieldLabel: string;
	parentDoctype?: string;
	parentName?: string;
}>();

const emit = defineEmits<{
	"update:rows": [rows: ChildRow[]];
}>();

// State
const selectedRowIndex = ref<number | null>(null);
const editingCell = ref<{ rowIndex: number; fieldname: string } | null>(null);
const showRowModal = ref(false);
const showColumnSettings = ref(false);
const editingRowIndex = ref(-1);
const editingRowData = ref<ChildRow>({});
const visibleColumnNames = ref<string[]>([]);
const activeTab = ref(0);

// Computed: Get all fields suitable for table display
const allTableFields = computed<Field[]>(() => {
	if (!props.childMeta?.fields) return [];

	return props.childMeta.fields.filter(
		(f) =>
			!["Section Break", "Column Break", "Tab Break", "HTML", "Button"].includes(
				f.fieldtype,
			) &&
			!f.hidden &&
			f.fieldname !== "name" &&
			f.fieldname !== "parent" &&
			f.fieldname !== "parenttype" &&
			f.fieldname !== "parentfield" &&
			f.fieldname !== "doctype" &&
			f.fieldname !== "idx",
	);
});

// Fields to display in table columns
const displayColumns = computed<Field[]>(() => {
	if (visibleColumnNames.value.length === 0) {
		const listViewFields = allTableFields.value.filter((f) => f.in_list_view);
		if (listViewFields.length > 0) {
			return listViewFields.slice(0, 7);
		}
		return allTableFields.value.slice(0, 5);
	}

	return allTableFields.value.filter((f) => visibleColumnNames.value.includes(f.fieldname));
});

// Parse form layout from metadata (tabs, sections, columns)
const formLayout = computed<FormLayout>(() => {
	if (!props.childMeta?.fields) {
		return { tabs: [], sections: [] };
	}

	const fields = props.childMeta.fields;
	const tabs: FormTab[] = [];
	const rootSections: FormSection[] = [];

	let currentTab: FormTab | null = null;
	let currentSection: FormSection | null = null;
	let currentColumn: FormColumn | null = null;

	// Helper to create a default section
	const createSection = (
		label?: string,
		description?: string,
		collapsible?: boolean,
		collapsed?: boolean,
	): FormSection => ({
		label,
		description,
		collapsible: collapsible || false,
		collapsed: collapsed || false,
		columns: [],
	});

	// Helper to create a default column
	const createColumn = (): FormColumn => ({ fields: [] });

	// Start with a default section and column
	currentSection = createSection();
	currentColumn = createColumn();
	currentSection.columns.push(currentColumn);

	for (const field of fields) {
		// Skip system fields
		if (
			["name", "parent", "parenttype", "parentfield", "doctype", "idx"].includes(
				field.fieldname,
			)
		) {
			continue;
		}

		if (field.fieldtype === "Tab Break") {
			// Close current section if it has fields
			if (currentSection && currentSection.columns.some((col) => col.fields.length > 0)) {
				if (currentTab) {
					currentTab.sections.push(currentSection);
				} else {
					rootSections.push(currentSection);
				}
			}

			// Close current tab
			if (currentTab && currentTab.sections.length > 0) {
				tabs.push(currentTab);
			}

			// Start new tab
			currentTab = {
				fieldname: field.fieldname,
				label: field.label || "Tab",
				sections: [],
			};

			// Start new section and column for this tab
			currentSection = createSection();
			currentColumn = createColumn();
			currentSection.columns.push(currentColumn);
		} else if (field.fieldtype === "Section Break") {
			// Close current section if it has fields
			if (currentSection && currentSection.columns.some((col) => col.fields.length > 0)) {
				if (currentTab) {
					currentTab.sections.push(currentSection);
				} else {
					rootSections.push(currentSection);
				}
			}

			// Start new section
			currentSection = createSection(
				field.label,
				field.description,
				field.collapsible === 1,
				field.collapsed === 1,
			);
			currentColumn = createColumn();
			currentSection.columns.push(currentColumn);
		} else if (field.fieldtype === "Column Break") {
			// Start new column in current section
			currentColumn = createColumn();
			if (currentSection) {
				currentSection.columns.push(currentColumn);
			}
		} else if (!field.hidden && !["HTML", "Button"].includes(field.fieldtype)) {
			// Add field to current column
			if (currentColumn) {
				currentColumn.fields.push(field);
			}
		}
	}

	// Close final section
	if (currentSection && currentSection.columns.some((col) => col.fields.length > 0)) {
		if (currentTab) {
			currentTab.sections.push(currentSection);
		} else {
			rootSections.push(currentSection);
		}
	}

	// Close final tab
	if (currentTab && currentTab.sections.length > 0) {
		tabs.push(currentTab);
	}

	// If no tabs, create a single default tab with all sections
	if (tabs.length === 0 && rootSections.length > 0) {
		tabs.push({
			fieldname: "default",
			label: "Details",
			sections: rootSections,
		});
	}

	return {
		tabs,
		sections: rootSections,
	};
});

// Initialize visible columns from in_list_view fields
watch(
	() => props.childMeta,
	(meta) => {
		if (meta && visibleColumnNames.value.length === 0) {
			const listViewFields = allTableFields.value.filter((f) => f.in_list_view);
			if (listViewFields.length > 0) {
				visibleColumnNames.value = listViewFields.slice(0, 7).map((f) => f.fieldname);
			} else {
				visibleColumnNames.value = allTableFields.value
					.slice(0, 5)
					.map((f) => f.fieldname);
			}
		}
	},
	{ immediate: true },
);

// Row selection
function selectRow(index: number) {
	selectedRowIndex.value = selectedRowIndex.value === index ? null : index;
}

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
	const newRow: ChildRow = {
		__islocal: 1,
		idx: props.rows.length + 1,
	};

	// Set defaults from field definitions
	for (const field of allTableFields.value) {
		if (field.default !== undefined && field.default !== null) {
			newRow[field.fieldname] = field.default;
		} else if (field.fieldtype === "Check") {
			newRow[field.fieldname] = 0;
		} else if (["Int", "Float", "Currency", "Percent"].includes(field.fieldtype)) {
			newRow[field.fieldname] = 0;
		} else {
			newRow[field.fieldname] = "";
		}
	}

	const updatedRows = [...props.rows, newRow];
	emit("update:rows", updatedRows);

	// Open modal for the new row
	editingRowIndex.value = updatedRows.length - 1;
	editingRowData.value = { ...newRow };
	activeTab.value = 0;
	showRowModal.value = true;
}

function duplicateRow(index: number) {
	const original = props.rows[index];
	const duplicate: ChildRow = {
		...original,
		name: undefined,
		__islocal: 1,
		idx: props.rows.length + 1,
	};

	const updatedRows = [...props.rows, duplicate];
	emit("update:rows", updatedRows);
}

async function deleteRow(index: number) {
	const confirmed = await dialogStore.confirm(
		"Delete Row",
		`Are you sure you want to delete row ${index + 1}?`,
	);

	if (!confirmed) return;

	const updatedRows = props.rows.filter((_, i) => i !== index);
	updatedRows.forEach((row, i) => {
		row.idx = i + 1;
	});
	emit("update:rows", updatedRows);
	selectedRowIndex.value = null;
}

function moveRowUp() {
	if (selectedRowIndex.value === null || selectedRowIndex.value === 0) return;

	const updatedRows = [...props.rows] as ChildRow[];
	const idx = selectedRowIndex.value;
	const temp = updatedRows[idx]!;
	updatedRows[idx] = updatedRows[idx - 1]!;
	updatedRows[idx - 1] = temp;

	updatedRows.forEach((row, i) => {
		row.idx = i + 1;
	});

	emit("update:rows", updatedRows);
	selectedRowIndex.value = idx - 1;
}

function moveRowDown() {
	if (selectedRowIndex.value === null || selectedRowIndex.value === props.rows.length - 1)
		return;

	const updatedRows = [...props.rows] as ChildRow[];
	const idx = selectedRowIndex.value;
	const temp = updatedRows[idx]!;
	updatedRows[idx] = updatedRows[idx + 1]!;
	updatedRows[idx + 1] = temp;

	updatedRows.forEach((row, i) => {
		row.idx = i + 1;
	});

	emit("update:rows", updatedRows);
	selectedRowIndex.value = idx + 1;
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

function updateRowField(fieldname: string, value: any) {
	editingRowData.value[fieldname] = value;
}

// Column settings
function openColumnSettings() {
	showColumnSettings.value = true;
}

function closeColumnSettings() {
	showColumnSettings.value = false;
}

function toggleColumn(fieldname: string) {
	const idx = visibleColumnNames.value.indexOf(fieldname);
	if (idx >= 0) {
		visibleColumnNames.value.splice(idx, 1);
	} else {
		visibleColumnNames.value.push(fieldname);
	}
	visibleColumnNames.value = [...visibleColumnNames.value];
}

function resetColumns() {
	const listViewFields = allTableFields.value.filter((f) => f.in_list_view);
	if (listViewFields.length > 0) {
		visibleColumnNames.value = listViewFields.slice(0, 7).map((f) => f.fieldname);
	} else {
		visibleColumnNames.value = allTableFields.value.slice(0, 5).map((f) => f.fieldname);
	}
}
</script>

<style scoped>
.child-table-editor {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	border: 1px solid var(--border-color, #e2e8f0);
	border-radius: 0.5rem;
	background: var(--bg-primary, #fff);
	overflow: hidden;
}

.table-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 1rem;
	background: var(--bg-secondary, #f8fafc);
	border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.table-title {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.title-text {
	font-weight: 600;
	font-size: 0.875rem;
	color: var(--text-primary, #1e293b);
}

.row-count {
	font-size: 0.75rem;
	color: var(--text-secondary, #64748b);
	background: var(--bg-tertiary, #e2e8f0);
	padding: 0.125rem 0.5rem;
	border-radius: 9999px;
}

.header-actions {
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

.btn-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.5rem;
	background: transparent;
	border: none;
	color: var(--text-secondary, #64748b);
	border-radius: 0.375rem;
	cursor: pointer;
	transition: all 0.15s;
}

.btn-icon:hover {
	background: var(--bg-tertiary, #e2e8f0);
	color: var(--text-primary, #334155);
}

.btn-icon svg {
	width: 1.125rem;
	height: 1.125rem;
}

.btn-add {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.5rem 0.875rem;
	background: var(--primary, #3b82f6);
	color: #fff;
	border: none;
	border-radius: 0.375rem;
	font-size: 0.8125rem;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s;
}

.btn-add:hover {
	background: var(--primary-dark, #2563eb);
}

.btn-add svg {
	width: 1rem;
	height: 1rem;
}

.table-wrapper {
	overflow-x: auto;
}

.child-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 0.8125rem;
}

.child-table thead {
	background: var(--bg-secondary, #f1f5f9);
}

.child-table th {
	padding: 0.625rem 0.75rem;
	text-align: left;
	font-weight: 600;
	color: var(--text-secondary, #475569);
	white-space: nowrap;
	border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.col-index {
	width: 40px;
	text-align: center !important;
	color: var(--text-muted, #94a3b8);
}

.col-actions-header {
	width: 100px;
	text-align: center !important;
}

.required-mark {
	color: #ef4444;
	margin-left: 0.125rem;
}

.child-table tbody tr {
	border-bottom: 1px solid var(--border-light, #f1f5f9);
	transition: background 0.15s;
}

.child-table tbody tr:hover {
	background: var(--bg-secondary, #f8fafc);
}

.child-table tbody tr.row-selected {
	background: var(--primary-light, #eff6ff);
}

.child-table td {
	padding: 0.5rem 0.75rem;
	color: var(--text-primary, #334155);
	vertical-align: middle;
}

.col-data {
	cursor: pointer;
	min-width: 100px;
}

.col-actions {
	display: flex;
	gap: 0.25rem;
	justify-content: center;
	padding: 0.375rem !important;
}

.btn-icon.btn-sm {
	padding: 0.375rem;
}

.btn-icon.btn-sm svg {
	width: 0.875rem;
	height: 0.875rem;
}

.btn-icon.btn-delete:hover {
	background: #fef2f2;
	color: #dc2626;
}

.empty-state {
	text-align: center;
	padding: 2rem !important;
	color: var(--text-secondary, #64748b);
}

.empty-icon {
	font-size: 2rem;
	margin-bottom: 0.5rem;
}

.empty-state p {
	margin: 0 0 1rem 0;
}

.btn-add-first {
	padding: 0.5rem 1rem;
	background: var(--primary, #3b82f6);
	color: #fff;
	border: none;
	border-radius: 0.375rem;
	font-size: 0.8125rem;
	cursor: pointer;
}

.bulk-actions {
	display: flex;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background: var(--bg-secondary, #f8fafc);
	border-top: 1px solid var(--border-color, #e2e8f0);
}

.btn-sm {
	padding: 0.375rem 0.75rem;
	font-size: 0.75rem;
	border: 1px solid var(--border-color, #e2e8f0);
	background: var(--bg-primary, #fff);
	color: var(--text-primary, #334155);
	border-radius: 0.25rem;
	cursor: pointer;
}

.btn-sm:hover:not(:disabled) {
	background: var(--bg-secondary, #f1f5f9);
}

.btn-sm:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.btn-sm.btn-danger {
	color: #dc2626;
	border-color: #fecaca;
}

.btn-sm.btn-danger:hover {
	background: #fef2f2;
}

/* Modal Styles */
.modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 1rem;
}

.modal-content {
	background: var(--bg-primary, #fff);
	border-radius: 0.5rem;
	width: 100%;
	max-width: 32rem;
	max-height: calc(100vh - 2rem);
	display: flex;
	flex-direction: column;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-content.modal-large {
	max-width: 56rem;
}

.modal-content.column-settings-modal {
	max-width: 24rem;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 1.25rem;
	border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.modal-header h2 {
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: var(--text-primary, #1e293b);
}

.btn-close {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.375rem;
	background: transparent;
	border: none;
	color: var(--text-secondary, #64748b);
	border-radius: 0.25rem;
	cursor: pointer;
}

.btn-close:hover {
	background: var(--bg-secondary, #f1f5f9);
	color: var(--text-primary, #334155);
}

.btn-close svg {
	width: 1.25rem;
	height: 1.25rem;
}

.modal-body {
	padding: 1.25rem;
	overflow-y: auto;
	flex: 1;
}

/* Tabs in modal */
.form-tabs-container {
	display: flex;
	flex-direction: column;
}

.tabs-header {
	display: flex;
	gap: 0.25rem;
	border-bottom: 1px solid var(--border-color, #e2e8f0);
	padding: 0 0.5rem;
	margin: -1.25rem -1.25rem 1.25rem -1.25rem;
	padding: 0 1.25rem;
	background: var(--bg-secondary, #f8fafc);
	overflow-x: auto;
	scrollbar-width: none;
}

.tabs-header::-webkit-scrollbar {
	display: none;
}

.tab-button {
	padding: 0.75rem 1.25rem;
	border: none;
	background: transparent;
	color: var(--text-secondary, #64748b);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	white-space: nowrap;
	position: relative;
	transition: color 0.2s ease;
}

.tab-button:hover {
	color: var(--text-primary, #334155);
}

.tab-button-active {
	color: var(--primary, #3b82f6);
}

.tab-button-active::after {
	content: "";
	position: absolute;
	bottom: -1px;
	left: 0;
	right: 0;
	height: 2px;
	background: var(--primary, #3b82f6);
	border-radius: 2px 2px 0 0;
}

.tabs-content {
	padding-top: 0.5rem;
}

.tab-panel {
	animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-4px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.form-sections-container {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.columns-list {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
	margin-top: 0.75rem;
}

.column-item {
	display: flex;
	align-items: center;
	gap: 0.625rem;
	padding: 0.625rem 0.75rem;
	background: var(--bg-secondary, #f8fafc);
	border: 1px solid var(--border-color, #e2e8f0);
	border-radius: 0.375rem;
	cursor: pointer;
	transition: background 0.15s;
}

.column-item:hover {
	background: var(--bg-tertiary, #f1f5f9);
}

.column-checkbox {
	width: 1rem;
	height: 1rem;
	cursor: pointer;
}

.column-name {
	flex: 1;
	font-size: 0.8125rem;
	color: var(--text-primary, #334155);
}

.required-badge {
	font-size: 0.625rem;
	padding: 0.125rem 0.375rem;
	background: #fef2f2;
	color: #dc2626;
	border-radius: 9999px;
}

.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
	padding: 1rem 1.25rem;
	border-top: 1px solid var(--border-color, #e2e8f0);
}

.btn {
	padding: 0.5rem 1rem;
	font-size: 0.8125rem;
	font-weight: 500;
	border: none;
	border-radius: 0.375rem;
	cursor: pointer;
	transition: all 0.15s;
}

.btn-primary {
	background: var(--primary, #3b82f6);
	color: #fff;
}

.btn-primary:hover {
	background: var(--primary-dark, #2563eb);
}

.btn-secondary {
	background: var(--bg-secondary, #f1f5f9);
	color: var(--text-secondary, #475569);
}

.btn-secondary:hover {
	background: var(--bg-tertiary, #e2e8f0);
}

.text-muted {
	color: var(--text-secondary, #64748b);
	font-size: 0.8125rem;
	margin: 0;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
	transition: opacity 0.15s;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}

/* Dark mode */
:global(html.dark) .child-table-editor {
	background: var(--bg-primary, #0f172a);
	border-color: var(--border-color, #334155);
}

:global(html.dark) .table-header {
	background: var(--bg-secondary, #1e293b);
	border-color: var(--border-color, #334155);
}

:global(html.dark) .title-text {
	color: var(--text-primary, #e2e8f0);
}

:global(html.dark) .row-count {
	background: var(--bg-tertiary, #334155);
	color: var(--text-secondary, #94a3b8);
}

:global(html.dark) .child-table thead {
	background: var(--bg-secondary, #1e293b);
}

:global(html.dark) .child-table th {
	color: var(--text-secondary, #94a3b8);
	border-color: var(--border-color, #334155);
}

:global(html.dark) .child-table tbody tr {
	border-color: var(--border-color, #1e293b);
}

:global(html.dark) .child-table tbody tr:hover {
	background: var(--bg-secondary, #1e293b);
}

:global(html.dark) .child-table tbody tr.row-selected {
	background: var(--primary-dark, #1e3a5f);
}

:global(html.dark) .child-table td {
	color: var(--text-primary, #e2e8f0);
}

:global(html.dark) .modal-content {
	background: var(--bg-primary, #0f172a);
}

:global(html.dark) .modal-header {
	border-color: var(--border-color, #334155);
}

:global(html.dark) .modal-header h2 {
	color: var(--text-primary, #e2e8f0);
}

:global(html.dark) .modal-footer {
	border-color: var(--border-color, #334155);
}

:global(html.dark) .tabs-header {
	background: var(--bg-secondary, #1e293b);
	border-color: var(--border-color, #334155);
}

:global(html.dark) .tab-button {
	color: var(--text-secondary, #94a3b8);
}

:global(html.dark) .tab-button:hover {
	color: var(--text-primary, #e2e8f0);
}

:global(html.dark) .tab-button-active {
	color: var(--primary, #60a5fa);
}

:global(html.dark) .tab-button-active::after {
	background: var(--primary, #60a5fa);
}

:global(html.dark) .bulk-actions {
	background: var(--bg-secondary, #1e293b);
	border-color: var(--border-color, #334155);
}

:global(html.dark) .btn-sm {
	background: var(--bg-primary, #0f172a);
	border-color: var(--border-color, #334155);
	color: var(--text-primary, #e2e8f0);
}

:global(html.dark) .column-item {
	background: var(--bg-secondary, #1e293b);
	border-color: var(--border-color, #334155);
}

:global(html.dark) .column-name {
	color: var(--text-primary, #e2e8f0);
}
</style>
