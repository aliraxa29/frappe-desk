<template>
  <div class="child-table-editor">
    <!-- Header -->
    <div class="table-header">
      <h3>{{ fieldLabel }}</h3>
      <div class="header-actions">
        <button class="btn-icon" title="Column Settings" @click="openColumnSettings">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
        <button class="btn-primary btn-sm" @click="addNewRow">+ Add Row</button>
      </div>
    </div>

    <!-- Table View -->
    <div class="table-wrapper">
      <table class="child-table">
        <thead>
          <tr>
            <th class="col-index">#</th>
            <th v-for="col in visibleColumns" :key="col" class="col-header">
              {{ getColumnLabel(col) }}
            </th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index" :class="{ 'row-editing': editingIndex === index }">
            <td class="col-index">{{ index + 1 }}</td>
            <td
              v-for="col in visibleColumns"
              :key="`${index}-${col}`"
              class="col-data"
              @click="startInlineEdit(index, col)"
            >
              <div v-if="editingIndex !== index || editingField !== col" class="cell-view">
                {{ formatCellValue(row[col]) }}
              </div>
              <input
                v-else
                v-model="row[col]"
                type="text"
                class="cell-input"
                @blur="saveInlineEdit"
                @keydown.enter="saveInlineEdit"
                @keydown.esc="cancelInlineEdit"
                autofocus
              />
            </td>
            <td class="col-actions">
              <button class="btn-icon btn-sm" title="Edit" @click="openFormEdit(index)">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button class="btn-icon btn-sm btn-delete" title="Delete" @click="deleteRow(index)">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td :colspan="visibleColumns.length + 2" class="empty-state">
              No rows added yet. Click "+ Add Row" to get started.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Edit Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showFormModal" class="modal-overlay" @click="closeFormEdit">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h2>{{ editingIndex >= 0 ? `Edit Row ${editingIndex + 1}` : 'New Row' }}</h2>
              <button class="btn-close" @click="closeFormEdit">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div v-for="col in allColumns" :key="col" class="form-group">
                <label class="form-label">{{ getColumnLabel(col) }}</label>
                <input v-model="editingRow[col]" type="text" class="form-input" />
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeFormEdit">Cancel</button>
              <button class="btn btn-primary" @click="saveFormEdit">Save</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Column Settings Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showColumnSettings" class="modal-overlay" @click="closeColumnSettings">
          <div class="modal-content column-settings-modal" @click.stop>
            <div class="modal-header">
              <h2>Column Settings</h2>
              <button class="btn-close" @click="closeColumnSettings">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <p class="text-muted">Show/hide and arrange columns</p>
              <div class="columns-list">
                <div
                  v-for="(col, index) in allColumns"
                  :key="col"
                  class="column-item"
                  draggable="true"
                  @dragstart="dragStart($event, index)"
                  @dragover="dragOver"
                  @drop="dragDrop($event, index)"
                  @dragend="dragEnd"
                >
                  <input
                    type="checkbox"
                    :checked="visibleColumns.includes(col)"
                    @change="toggleColumn(col)"
                    class="column-checkbox"
                  />
                  <span class="column-name">{{ getColumnLabel(col) }}</span>
                  <span class="drag-handle">⋮⋮</span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeColumnSettings">Close</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface ChildRow {
  [key: string]: any
}

const props = defineProps<{
  rows: ChildRow[]
  fields: any[]
  fieldLabel: string
}>()

const emit = defineEmits<{
  'update:rows': [rows: ChildRow[]]
}>()

// State
const editingIndex = ref(-1)
const editingField = ref('')
const editingRow = ref<ChildRow>({})
const showFormModal = ref(false)
const showColumnSettings = ref(false)
const visibleColumns = ref<string[]>([])
const draggedIndex = ref(-1)

// Computed
const allColumns = computed(() => {
  return props.fields.map((f) => f.fieldname)
})

// Initialize visible columns from props
watch(
  () => props.fields,
  (newFields) => {
    if (visibleColumns.value.length === 0) {
      visibleColumns.value = newFields.slice(0, 5).map((f) => f.fieldname)
    }
  },
  { immediate: true }
)

// Methods
function getColumnLabel(fieldname: string): string {
  const field = props.fields.find((f) => f.fieldname === fieldname)
  return field?.label || fieldname
}

function formatCellValue(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function startInlineEdit(index: number, field: string) {
  editingIndex.value = index
  editingField.value = field
}

function saveInlineEdit() {
  editingIndex.value = -1
  editingField.value = ''
}

function cancelInlineEdit() {
  editingIndex.value = -1
  editingField.value = ''
}

function addNewRow() {
  const newRow: ChildRow = {}
  allColumns.value.forEach((col) => {
    newRow[col] = ''
  })
  const updatedRows = [...props.rows, newRow]
  emit('update:rows', updatedRows)
}

function deleteRow(index: number) {
  if (!confirm('Are you sure you want to delete this row?')) return
  const updatedRows = props.rows.filter((_, i) => i !== index)
  emit('update:rows', updatedRows)
}

function openFormEdit(index: number) {
  editingIndex.value = index
  editingRow.value = { ...props.rows[index] }
  showFormModal.value = true
}

function closeFormEdit() {
  showFormModal.value = false
  editingIndex.value = -1
  editingRow.value = {}
}

function saveFormEdit() {
  const updatedRows = [...props.rows]
  updatedRows[editingIndex.value] = { ...editingRow.value }
  emit('update:rows', updatedRows)
  closeFormEdit()
}

function openColumnSettings() {
  showColumnSettings.value = true
}

function closeColumnSettings() {
  showColumnSettings.value = false
}

function toggleColumn(col: string) {
  const index = visibleColumns.value.indexOf(col)
  if (index >= 0) {
    visibleColumns.value.splice(index, 1)
  } else {
    visibleColumns.value.push(col)
  }
  visibleColumns.value = [...visibleColumns.value]
}

function dragStart(event: DragEvent, index: number) {
  draggedIndex.value = index
  event.dataTransfer!.effectAllowed = 'move'
}

function dragOver(event: DragEvent) {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
}

function dragDrop(event: DragEvent, index: number) {
  event.preventDefault()
  if (draggedIndex.value === -1 || draggedIndex.value === index) return

  const newColumns = [...allColumns.value]
  const draggedCol = newColumns[draggedIndex.value]
  newColumns.splice(draggedIndex.value, 1)
  newColumns.splice(index, 0, draggedCol)

  // Update visible columns order
  const newVisibleColumns = newColumns.filter((col) => visibleColumns.value.includes(col))
  visibleColumns.value = newVisibleColumns
}

function dragEnd() {
  draggedIndex.value = -1
}
</script>

<style scoped>
.child-table-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.table-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #e0e0e0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-icon {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: rgba(100, 150, 255, 0.1);
  color: #7dd3fc;
}

.btn-icon svg {
  width: 20px;
  height: 20px;
}

.btn-primary.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid rgba(100, 100, 150, 0.2);
  border-radius: 8px;
  background: rgba(20, 20, 40, 0.5);
}

.child-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.child-table thead {
  background: rgba(30, 30, 60, 0.8);
  border-bottom: 2px solid rgba(100, 100, 150, 0.3);
}

.child-table th {
  padding: 0.75rem;
  text-align: left;
  color: #b0bec5;
  font-weight: 600;
  white-space: nowrap;
}

.col-index {
  width: 50px;
  text-align: center;
}

.col-actions {
  width: 100px;
  text-align: center;
}

.child-table tbody tr {
  border-bottom: 1px solid rgba(100, 100, 150, 0.1);
  transition: background 0.2s;
}

.child-table tbody tr:hover {
  background: rgba(100, 150, 255, 0.05);
}

.child-table tbody tr.row-editing {
  background: rgba(100, 150, 255, 0.1);
}

.child-table td {
  padding: 0.75rem;
  color: #e0e0e0;
}

.col-index {
  text-align: center;
  color: #9ca3af;
  font-size: 0.8rem;
}

.col-data {
  cursor: pointer;
  position: relative;
}

.cell-view {
  min-height: 20px;
  word-break: break-word;
}

.cell-input {
  width: 100%;
  padding: 0.4rem;
  background: rgba(30, 30, 60, 0.8);
  border: 1px solid rgba(100, 150, 255, 0.5);
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.875rem;
}

.cell-input:focus {
  outline: none;
  border-color: #7dd3fc;
  box-shadow: 0 0 0 3px rgba(100, 150, 255, 0.1);
}

.col-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-icon.btn-sm {
  padding: 0.4rem;
}

.btn-icon.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 2rem !important;
  color: #6b7280;
  font-style: italic;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(100, 150, 255, 0.2);
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.3);
}

.modal-content.column-settings-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(100, 100, 150, 0.2);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #fff;
}

.btn-close {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close svg {
  width: 24px;
  height: 24px;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #b0bec5;
}

.form-input {
  padding: 0.6rem 0.8rem;
  background: rgba(30, 30, 60, 0.8);
  border: 1px solid rgba(100, 100, 150, 0.3);
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #7dd3fc;
  box-shadow: 0 0 0 3px rgba(100, 150, 255, 0.1);
}

.columns-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.column-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(30, 30, 60, 0.5);
  border: 1px solid rgba(100, 100, 150, 0.2);
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s;
}

.column-item:hover {
  background: rgba(100, 150, 255, 0.1);
  border-color: rgba(100, 150, 255, 0.3);
}

.column-checkbox {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.column-name {
  flex: 1;
  color: #e0e0e0;
  font-size: 0.875rem;
}

.drag-handle {
  color: #6b7280;
  font-size: 0.75rem;
  cursor: grab;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(100, 100, 150, 0.2);
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #64b5f6 0%, #7dd3fc 100%);
  color: #0a0a14;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.btn-secondary {
  background: rgba(100, 100, 150, 0.2);
  color: #e0e0e0;
  border: 1px solid rgba(100, 100, 150, 0.3);
}

.btn-secondary:hover {
  background: rgba(100, 100, 150, 0.3);
}

.text-muted {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
