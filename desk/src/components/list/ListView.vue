<template>
  <div class="w-full bg-white rounded-lg">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-sm text-slate-500">Loading list...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
      {{ error }}
    </div>

    <!-- List Content -->
    <template v-else>
      <!-- Filters Bar -->
      <div class="flex items-center gap-3 p-4 border-b border-slate-200">
        <!-- Search -->
        <div class="flex-1 max-w-sm">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Standard Filters -->
        <div v-for="filter in standardFilters" :key="filter.fieldname" class="relative">
          <select
            v-if="filter.fieldtype === 'Select'"
            v-model="activeFilters[filter.fieldname]"
            class="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          >
            <option value="">{{ filter.label }}</option>
            <option v-for="opt in getSelectOptions(filter)" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <input
            v-else-if="filter.fieldtype === 'Link'"
            v-model="activeFilters[filter.fieldname]"
            type="text"
            :placeholder="filter.label"
            class="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          />
        </div>

        <!-- Clear Filters -->
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Clear
        </button>

        <!-- Refresh -->
        <button
          @click="refresh"
          class="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
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
                class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none"
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

          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="row in rows"
              :key="row.name"
              class="hover:bg-slate-50 cursor-pointer transition-colors"
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
                  <div class="font-medium text-slate-900 hover:text-blue-600">
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
      <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200">
        <div class="text-sm text-slate-600">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalCount }} entries
        </div>

        <div class="flex items-center gap-2">
          <!-- Page size selector -->
          <select
            v-model="pageLength"
            class="px-2 py-1 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              class="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="!hasNextPage"
              class="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { DocTypeMeta, Field, ListColumn, Document } from '../../types'
import { frappeClient } from '../../api/resource'

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
const searchQuery = ref('')
const activeFilters = ref<Record<string, any>>({})

// Selection
const selectedRows = ref<string[]>([])
const selectAll = ref(false)

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
      df: df || { fieldname: titleField, label: titleField, fieldtype: 'Data', reqd: false, read_only: false },
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

// Computed: standard filters (fields with in_standard_filter or in_filter)
const standardFilters = computed<Field[]>(() => {
  if (!meta.value) return []
  
  return meta.value.fields
    .filter(f => 
      (f.in_standard_filter || f.in_filter) && 
      !f.hidden &&
      ['Select', 'Link', 'Data'].includes(f.fieldtype)
    )
    .slice(0, 4) // Limit to 4 filters in toolbar
})

// Computed: has active filters
const hasActiveFilters = computed(() => {
  return searchQuery.value || Object.values(activeFilters.value).some(v => v)
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
  } catch (err: any) {
    console.error('Failed to load doctype meta:', err)
    error.value = err.message || 'Failed to load doctype metadata'
  }
}

async function refresh() {
  loading.value = true
  error.value = ''
  
  try {
    // Build filters
    const filters: Record<string, any> = {}
    
    // Add search query as name LIKE filter
    if (searchQuery.value) {
      filters['name'] = ['like', `%${searchQuery.value}%`]
    }
    
    // Add active filters
    Object.entries(activeFilters.value).forEach(([key, value]) => {
      if (value) {
        filters[key] = value
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

async function fetchTotalCount(filters: Record<string, any>) {
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

function clearFilters() {
  searchQuery.value = ''
  activeFilters.value = {}
  currentPage.value = 0
  refresh()
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
    'draft': 'bg-slate-100 text-slate-700',
    'open': 'bg-blue-100 text-blue-700',
    'pending': 'bg-yellow-100 text-yellow-700',
    'submitted': 'bg-green-100 text-green-700',
    'completed': 'bg-green-100 text-green-700',
    'closed': 'bg-slate-100 text-slate-700',
    'cancelled': 'bg-red-100 text-red-700',
    'overdue': 'bg-red-100 text-red-700',
    'active': 'bg-green-100 text-green-700',
    'inactive': 'bg-slate-100 text-slate-700',
    'enabled': 'bg-green-100 text-green-700',
    'disabled': 'bg-slate-100 text-slate-700'
  }
  return statusClasses[status] || 'bg-slate-100 text-slate-700'
}

function getCellClass(col: ListColumn): string {
  if (col.df?.fieldtype === 'Currency' || col.df?.fieldtype === 'Float' || col.df?.fieldtype === 'Int') {
    return 'text-right font-mono'
  }
  if (col.df?.fieldtype === 'Check') {
    return 'text-center'
  }
  return 'text-slate-700'
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

function getSelectOptions(field: Field): string[] {
  if (!field.options) return []
  return field.options.split('\n').filter(opt => opt.trim())
}

// Initialize
onMounted(async () => {
  await loadMeta()
  await refresh()
})
</script>

