<template>
  <div class="w-full bg-white dark:bg-gray-950 rounded-lg">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-sm text-slate-500">Loading list...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700 text-sm text-red-700 dark:text-red-300">
      {{ error }}
    </div>

    <!-- List Content -->
    <template v-else>
      <!-- Filters Bar -->
      <div class="flex flex-wrap items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
        <!-- Quick Filters (Left) -->
        <div class="flex flex-1 flex-wrap items-start gap-4">
          <div v-for="filter in filterFields" :key="filter.fieldname" class="min-w-55">
            <FieldRenderer
              :field="getQuickFilterField(filter)"
              :ctx="quickFilterCtx"
              @field-change="applyFilters"
            />
          </div>
        </div>

        <!-- Actions (Right) -->
        <div class="flex items-center gap-2 ml-auto">
          <button
            type="button"
            @click="toggleQueryBuilder"
            ref="queryButtonRef"
            class="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Filters
          </button>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Clear
          </button>
          <slot name="actions" />
        </div>
      </div>

      <Teleport to="body">
        <div v-if="showQueryBuilder" class="fixed inset-0 z-40">
          <div class="absolute inset-0" @click="closeQueryBuilder" />
          <div
            class="absolute z-50 w-96 max-w-screen-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl"
            :style="queryPopoverStyle"
          >
            <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Filters</span>
              <button
                type="button"
                @click="addQueryFilter"
                class="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition-colors"
              >
                + Add Filter
              </button>
            </div>

            <div class="p-4 max-h-[60vh] overflow-y-auto">
              <div v-if="queryFilters.length === 0" class="text-xs text-slate-500">
                No filters applied
              </div>

              <div v-else class="flex flex-col gap-3">
                <div
                  v-for="row in queryFilters"
                  :key="row.id"
                  class="flex flex-wrap items-start gap-2"
                >
                  <select
                    v-model="row.fieldname"
                    class="px-2 py-1.5 text-sm border border-slate-300 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @change="onQueryFieldChange(row)"
                  >
                    <option value="">Select field</option>
                    <option v-for="f in queryFieldOptions" :key="f.fieldname" :value="f.fieldname">
                      {{ f.label || f.fieldname }}
                    </option>
                  </select>

                  <select
                    v-model="row.operator"
                    class="px-2 py-1.5 text-sm border border-slate-300 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option v-for="op in getOperatorsForRow(row)" :key="op" :value="op">
                      {{ op }}
                    </option>
                  </select>

                  <div class="flex-1 min-w-60">
                    <template v-if="row.operator === 'between'">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <FieldRenderer
                          v-if="getQueryField(row, 'from')"
                          :field="getQueryField(row, 'from')!"
                          :ctx="getQueryCtx(row, 'from')"
                          @field-change="applyFilters"
                        />
                        <FieldRenderer
                          v-if="getQueryField(row, 'to')"
                          :field="getQueryField(row, 'to')!"
                          :ctx="getQueryCtx(row, 'to')"
                          @field-change="applyFilters"
                        />
                      </div>
                    </template>
                    <template v-else>
                      <FieldRenderer
                        v-if="getQueryField(row)"
                        :field="getQueryField(row)!"
                        :ctx="getQueryCtx(row)"
                        @field-change="applyFilters"
                      />
                    </template>
                  </div>

                  <button
                    type="button"
                    class="px-2 py-1.5 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded"
                    @click="removeQueryFilter(row.id)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div class="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button
                type="button"
                @click="clearFilters"
                class="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                @click="closeQueryBuilder"
                class="px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <!-- Checkbox column -->
              <th class="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  v-model="selectAll"
                  class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>

              <!-- Data columns -->
              <th
                v-for="col in columns"
                :key="col.fieldname || col.type"
                class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
                :class="{ 'w-64': col.type === 'Subject' }"
                @click="toggleSort(col)"
              >
                <div class="flex items-center gap-1">
                  <span>{{ col.label || col.df?.label || col.type }}</span>
                  <template v-if="sortField === getColumnFieldname(col)">
                    <svg v-if="sortOrder === 'asc'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </template>
                </div>
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr
              v-for="row in rows"
              :key="row.name"
              class="hover:bg-slate-50 dark:hover:bg-[#383838] cursor-pointer transition-colors"
              @click="openDocument(row.name!)"
            >
              <!-- Checkbox -->
              <td class="px-4 py-3" @click.stop>
                <input
                  type="checkbox"
                  :value="row.name"
                  v-model="selectedRows"
                  class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </td>

              <!-- Data cells -->
              <td
                v-for="col in columns"
                :key="col.fieldname || col.type"
                class="px-4 py-3 text-sm"
                :class="getCellClass(col)"
              >
                <!-- Subject (title field + name) -->
                <template v-if="col.type === 'Subject'">
                  <div class="font-medium text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-gray-400">
                    {{ getSubjectValue(row) }}
                  </div>
                  <div v-if="meta?.title_field && meta.title_field !== 'name'" class="text-xs text-slate-500">
                    {{ row.name }}
                  </div>
                </template>

                <!-- Status indicator -->
                <template v-else-if="col.type === 'Status'">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="getStatusClass(row)"
                  >
                    {{ getStatusValue(row) }}
                  </span>
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
            <tr v-if="rows.length === 0">
              <td :colspan="columns.length + 1" class="px-4 py-12 text-center text-sm text-slate-500">
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>No {{ doctype }} found</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
        <div class="text-sm text-slate-600">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalCount }} entries
        </div>

        <div class="flex items-center gap-2">
          <!-- Page size selector -->
          <select
            v-model="pageLength"
            class="px-2 py-1 text-sm border border-slate-300 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="refresh"
          >
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>

          <!-- Pagination buttons -->
          <div class="flex gap-1">
            <button
              @click="prevPage"
              :disabled="currentPage === 0"
              class="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="!hasNextPage"
              class="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { DocTypeMeta, Field, ListColumn, Document } from '../../types'
import { frappeClient } from '../../api/resource'
import FieldRenderer from '../../fields/FieldRenderer.vue'

// Cell components for different field types
import LinkCell from './cells/LinkCell.vue'
import DateCell from './cells/DateCell.vue'
import CurrencyCell from './cells/CurrencyCell.vue'
import CheckCell from './cells/CheckCell.vue'
import DefaultCell from './cells/DefaultCell.vue'

const props = defineProps<{
  doctype: string
}>()

const emit = defineEmits<{
  (e: 'edit', row: Document): void
  (e: 'delete', row: Document): void
  (e: 'select', rows: string[]): void
}>()

const router = useRouter()
const route = useRoute()

// State
const loading = ref(true)
const error = ref('')
const meta = ref<DocTypeMeta | null>(null)
const rows = ref<Document[]>([])
const totalCount = ref(0)

// Pagination
const currentPage = ref(0)
const pageLength = ref(20)

// Sorting
const sortField = ref('modified')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Filtering
const activeFilters = ref<Record<string, any>>({})
const quickFilterDoc = reactive<Record<string, any>>({})
const queryFilters = ref<Array<{ id: string; fieldname: string; operator: string; value: any }>>([])
const queryRowDocs = reactive<Record<string, Record<string, any>>>({})

// Selection
const selectedRows = ref<string[]>([])
const selectAll = ref(false)
const showQueryBuilder = ref(false)
const queryButtonRef = ref<HTMLElement | null>(null)
const queryPopoverStyle = ref<Record<string, string>>({})

const quickFilterCtx = {
  doc: quickFilterDoc,
  set_value: (fieldname: string, value: any) => {
    quickFilterDoc[fieldname] = value
    activeFilters.value[fieldname] = value
  }
} as any

// Computed: columns from metadata
const columns = computed<ListColumn[]>(() => {
  if (!meta.value) return []

  const cols: ListColumn[] = []
  const fields = meta.value.fields || []

  // 1. Subject column (title_field or name)
  const titleField = meta.value.title_field
  if (titleField) {
    const df = fields.find(f => f.fieldname === titleField)
    cols.push({
      type: 'Subject',
      df: df || {
        fieldname: titleField,
        label: titleField,
        fieldtype: 'Data',
        reqd: false,
        read_only: false,
        hidden: 0
      },
      label: df?.label || 'ID',
      fieldname: titleField
    })
  } else {
    cols.push({
      type: 'Subject',
      label: 'ID',
      fieldname: 'name'
    })
  }

  // 2. Status column if doctype has status field
  const statusField = fields.find(f => f.fieldname === 'status')
  if (statusField) {
    cols.push({
      type: 'Status',
      df: statusField,
      label: 'Status',
      fieldname: 'status'
    })
  }

  // 3. Fields with in_list_view
  const listViewFields = fields
    .filter(f => 
      f.in_list_view && 
      !f.hidden && 
      f.fieldname !== titleField && 
      f.fieldname !== 'status' &&
      !['Section Break', 'Column Break', 'Tab Break', 'Table', 'HTML'].includes(f.fieldtype)
    )
    .sort((a, b) => (a.idx || 0) - (b.idx || 0))

  listViewFields.forEach(df => {
    cols.push({
      type: 'Field',
      df,
      label: df.label,
      fieldname: df.fieldname
    })
  })

  // Limit to 8 columns max for readability
  return cols.slice(0, 8)
})

// Computed: fields to fetch
const fetchFields = computed(() => {
  const fields = new Set(['name', 'modified', 'creation', 'owner', 'docstatus'])
  
  columns.value.forEach(col => {
    if (col.fieldname) fields.add(col.fieldname)
    if (col.df?.fieldname) fields.add(col.df.fieldname)
  })
  
  // Add fields needed for Link display
  columns.value.forEach(col => {
    if (col.df?.fieldtype === 'Link' && col.df.options) {
      // We'll fetch the linked value too
    }
  })
  
  return Array.from(fields)
})

// Computed: filter fields (in_standard_filter + in_list_view)
const filterFields = computed<Field[]>(() => {
  if (!meta.value) return []

  const fields = meta.value.fields
    .filter(f =>
      (f.in_standard_filter || f.in_filter || f.in_list_view) &&
      !f.hidden &&
      !['Section Break', 'Column Break', 'Tab Break', 'Table', 'HTML', 'Button'].includes(f.fieldtype)
    )
    .sort((a, b) => (a.idx || 0) - (b.idx || 0))

  const unique = new Map<string, Field>()
  fields.forEach(f => {
    if (!unique.has(f.fieldname)) unique.set(f.fieldname, f)
  })

  return Array.from(unique.values()).slice(0, 6)
})

const queryFieldOptions = computed<Field[]>(() => {
  if (!meta.value) return []
  return meta.value.fields
    .filter(f =>
      !f.hidden &&
      !['Section Break', 'Column Break', 'Tab Break', 'Table', 'HTML', 'Button'].includes(f.fieldtype)
    )
    .sort((a, b) => (a.idx || 0) - (b.idx || 0))
})

// Computed: has active filters
const hasActiveFilters = computed(() => {
  const quick = Object.values(activeFilters.value).some(v => v !== undefined && v !== null && v !== '')
  const advanced = queryFilters.value.some(row => {
    if (row.operator === 'between') {
      return row.value?.from || row.value?.to
    }
    return row.value !== undefined && row.value !== null && row.value !== ''
  })
  return quick || advanced
})

// Computed: pagination
const startIndex = computed(() => currentPage.value * pageLength.value)
const endIndex = computed(() => Math.min(startIndex.value + rows.value.length, totalCount.value))
const hasNextPage = computed(() => endIndex.value < totalCount.value)

// Watch for select all
watch(selectAll, (val) => {
  if (val) {
    selectedRows.value = rows.value.map(r => r.name!)
  } else {
    selectedRows.value = []
  }
  emit('select', selectedRows.value)
})

// Watch for doctype change
watch(() => props.doctype, async () => {
  await loadMeta()
  await refresh()
}, { immediate: false })

// Methods
async function loadMeta() {
  try {
    const response = await frappeClient.getDocTypeMeta(props.doctype)
    meta.value = response.docs?.[0] || null
    
    // Set default sort from meta
    if (meta.value?.sort_field) {
      sortField.value = meta.value.sort_field
    }
    if (meta.value?.sort_order) {
      sortOrder.value = meta.value.sort_order as 'asc' | 'desc'
    }

    // Initialize quick filter doc values
    filterFields.value.forEach(f => {
      if (quickFilterDoc[f.fieldname] === undefined) {
        quickFilterDoc[f.fieldname] = activeFilters.value[f.fieldname] ?? ''
      }
    })
  } catch (err: any) {
    console.error('Failed to load doctype meta:', err)
    error.value = err.message || 'Failed to load doctype metadata'
  }
}

async function refresh() {
  loading.value = true
  error.value = ''
  
  try {
    // Build filters (Frappe listview style)
    const filters: any[] = []

    // Quick filters
    Object.entries(activeFilters.value).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filters.push([key, '=', value])
      }
    })

    // Query builder filters
    queryFilters.value.forEach(row => {
      if (!row.fieldname || !row.operator) return

      if (row.operator === 'between') {
        const from = row.value?.from
        const to = row.value?.to
        if (from || to) {
          filters.push([row.fieldname, 'between', [from, to]])
        }
        return
      }

      if (row.operator === 'in') {
        if (typeof row.value === 'string') {
          const parts = row.value.split(',').map(v => v.trim()).filter(Boolean)
          if (parts.length) {
            filters.push([row.fieldname, 'in', parts])
          }
        } else if (Array.isArray(row.value)) {
          filters.push([row.fieldname, 'in', row.value])
        }
        return
      }

      if (row.value !== undefined && row.value !== null && row.value !== '') {
        const value = row.operator === 'like' && typeof row.value === 'string'
          ? `%${row.value}%`
          : row.value
        filters.push([row.fieldname, row.operator, value])
      }
    })

    const response = await frappeClient.getList(props.doctype, {
      fields: fetchFields.value,
      filters,
      limit_page_length: pageLength.value,
      limit_start: startIndex.value,
      order_by: `${sortField.value} ${sortOrder.value}`
    })

    rows.value = response.data || []
    
    // Get total count for pagination
    await fetchTotalCount(filters)
    
  } catch (err: any) {
    console.error('Failed to load list:', err)
    error.value = err.message || 'Failed to load list'
  } finally {
    loading.value = false
  }
}

defineExpose({
  refresh,
  loadMeta
})

async function fetchTotalCount(filters: any[]) {
  try {
    const response = await frappeClient.callMethod('frappe.client.get_count', {
      doctype: props.doctype,
      filters
    })
    totalCount.value = response || 0
  } catch {
    totalCount.value = rows.value.length
  }
}

function applyFilters() {
  currentPage.value = 0
  refresh()
}

function getQuickFilterField(field: Field): Field {
  return {
    ...field,
    read_only: false,
    reqd: false
  }
}

function addQueryFilter() {
  const id = `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const defaultField = queryFieldOptions.value[0]
  const defaultOp = defaultField ? (getOperatorsForType(defaultField.fieldtype)[0] || '=') : '='
  queryFilters.value.push({
    id,
    fieldname: defaultField?.fieldname || '',
    operator: defaultOp,
    value: ''
  })
}

function removeQueryFilter(id: string) {
  queryFilters.value = queryFilters.value.filter(row => row.id !== id)
  delete queryRowDocs[id]
}

function onQueryFieldChange(row: { id: string; fieldname: string; operator: string; value: any }) {
  const field = queryFieldOptions.value.find(f => f.fieldname === row.fieldname)
  const ops = field ? getOperatorsForType(field.fieldtype) : ['=']
  row.operator = ops[0] || '='
  row.value = ''
  delete queryRowDocs[row.id]
}

function getOperatorsForType(fieldtype: string): string[] {
  if (['Int', 'Float', 'Currency'].includes(fieldtype)) {
    return ['=', '!=', '>', '>=', '<', '<=', 'between', 'in']
  }
  if (['Date', 'DateTime'].includes(fieldtype)) {
    return ['=', '!=', '>', '>=', '<', '<=', 'between']
  }
  if (['Check'].includes(fieldtype)) {
    return ['=']
  }
  return ['=', '!=', 'like', 'in']
}

function getOperatorsForRow(row: { fieldname: string }): string[] {
  const field = queryFieldOptions.value.find(f => f.fieldname === row.fieldname)
  return field ? getOperatorsForType(field.fieldtype) : ['=']
}

function getQueryField(row: { id: string; fieldname: string }, part?: 'from' | 'to'): Field | null {
  const base = queryFieldOptions.value.find(f => f.fieldname === row.fieldname)
  if (!base) return null
  const suffix = part ? `_${part}` : ''
  return {
    ...base,
    fieldname: `__qb_${row.id}${suffix}`,
    label: part ? (part === 'from' ? 'From' : 'To') : (base.label || base.fieldname),
    reqd: false,
    read_only: false
  }
}

function getQueryCtx(row: { id: string; operator: string; value: any }, part?: 'from' | 'to') {
  if (!queryRowDocs[row.id]) queryRowDocs[row.id] = {}
  const doc = queryRowDocs[row.id]!
  return {
    doc,
    set_value: (fieldname: string, value: any) => {
      doc[fieldname] = value
      if (row.operator === 'between') {
        const next = { ...(row.value || {}) }
        next[part || 'value'] = value
        row.value = next
      } else {
        row.value = value
      }
    }
  } as any
}

function clearFilters() {
  activeFilters.value = {}
  Object.keys(quickFilterDoc).forEach(key => delete quickFilterDoc[key])
  queryFilters.value = []
  Object.keys(queryRowDocs).forEach(key => delete queryRowDocs[key])
  currentPage.value = 0
  refresh()
}

function updateQueryPopoverPosition() {
  if (!showQueryBuilder.value || !queryButtonRef.value) return
  const rect = queryButtonRef.value.getBoundingClientRect()
  const top = rect.bottom + 8
  const left = Math.max(8, rect.right - 384)
  queryPopoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }
}

function toggleQueryBuilder() {
  showQueryBuilder.value = !showQueryBuilder.value
  if (showQueryBuilder.value) {
    updateQueryPopoverPosition()
  }
}

function closeQueryBuilder() {
  showQueryBuilder.value = false
}

function toggleSort(col: ListColumn) {
  const fieldname = getColumnFieldname(col)
  if (!fieldname) return
  
  if (sortField.value === fieldname) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = fieldname
    sortOrder.value = 'asc'
  }
  
  refresh()
}

function getColumnFieldname(col: ListColumn): string {
  return col.fieldname || col.df?.fieldname || ''
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
    refresh()
  }
}

function nextPage() {
  if (hasNextPage.value) {
    currentPage.value++
    refresh()
  }
}

function openDocument(name: string) {
  router.push({
    name: 'EditForm',
    params: {
      app: route.params.app,
      doctype: props.doctype,
      name
    }
  })
}

// Cell formatting
function getSubjectValue(row: Document): string {
  if (meta.value?.title_field) {
    return row[meta.value.title_field] || row.name || ''
  }
  return row.name || ''
}

function getStatusValue(row: Document): string {
  return row.status || (row.docstatus === 1 ? 'Submitted' : row.docstatus === 2 ? 'Cancelled' : 'Draft')
}

function getStatusClass(row: Document): string {
  const status = getStatusValue(row).toLowerCase()
  const statusClasses: Record<string, string> = {
    'draft': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    'open': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200',
    'pending': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200',
    'submitted': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
    'completed': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
    'closed': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    'cancelled': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
    'overdue': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
    'active': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
    'inactive': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    'enabled': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
    'disabled': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
  }
  return statusClasses[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
}

function getCellClass(col: ListColumn): string {
  if (col.df?.fieldtype === 'Currency' || col.df?.fieldtype === 'Float' || col.df?.fieldtype === 'Int') {
    return 'text-right font-mono'
  }
  if (col.df?.fieldtype === 'Check') {
    return 'text-center'
  }
  return 'text-slate-700 dark:text-slate-200'
}

function getCellComponent(df: Field) {
  const componentMap: Record<string, any> = {
    'Link': LinkCell,
    'Date': DateCell,
    'DateTime': DateCell,
    'Currency': CurrencyCell,
    'Float': CurrencyCell,
    'Check': CheckCell
  }
  return componentMap[df.fieldtype] || DefaultCell
}

// Initialize
onMounted(async () => {
  await loadMeta()
  await refresh()
  window.addEventListener('resize', updateQueryPopoverPosition)
  window.addEventListener('scroll', updateQueryPopoverPosition, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateQueryPopoverPosition)
  window.removeEventListener('scroll', updateQueryPopoverPosition, true)
})
</script>

