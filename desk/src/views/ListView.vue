<template>
  <div v-if="loading" class="loading">Loading...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else class="list-container">
    <div class="list-header">
      <h2>{{ doctype }}</h2>
      <button class="btn btn-primary" @click="handleNewDocument">+ New</button>
    </div>

    <div class="list-filters">
      <input v-model="searchText" type="text" placeholder="Search..." class="search-input" />
    </div>

    <div class="table-container">
      <table class="list-table">
        <thead>
          <tr>
            <th v-for="field in columns" :key="field" class="table-header">
              {{ field }}
            </th>
            <th class="table-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredData" :key="row.name" class="table-row">
            <td v-for="field in columns" :key="`${row.name}-${field}`" class="table-cell">
              {{ row[field] }}
            </td>
            <td class="table-actions">
              <button class="btn-edit" @click="handleEdit(row.name)">Edit</button>
              <button class="btn-delete" @click="handleDelete(row.name)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Document } from '../types'
import { frappeClient } from '../api/resource'
import { loadDoctypeScriptsFromMetadata } from '../runtime/scriptLoader'

const route = useRoute()
const router = useRouter()
const doctype = (route.params.doctype as string) || ''

const loading = ref(true)
const error = ref('')
const data = ref<Document[]>([])
const searchText = ref('')
const columns = ref<string[]>(['name'])

const filteredData = computed(() => {
  if (!searchText.value) return data.value
  return data.value.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchText.value.toLowerCase())
    )
  )
})

onMounted(async () => {
  try {
    // Load doctype scripts
    await loadDoctypeScriptsFromMetadata(doctype, 'list')

    // Fetch list data
    const response = await frappeClient.getList(doctype, {
      limit_page_length: 100
    })

    data.value = response.data
    if (response.data.length > 0) {
      columns.value = Object.keys(response.data[0]).filter(
        (k) => k !== 'idx' && k !== 'parent'
      )
    }

    loading.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to load list'
    loading.value = false
  }
})

function handleNewDocument() {
  router.push(`/form/${doctype}/new`)
}

function handleEdit(name: string) {
  router.push(`/form/${doctype}/${name}`)
}

async function handleDelete(name: string) {
  if (!confirm('Are you sure you want to delete this document?')) return

  try {
    await frappeClient.deleteDocument(doctype, name)
    data.value = data.value.filter((d) => d.name !== name)
  } catch (err: any) {
    error.value = err.message || 'Failed to delete document'
  }
}
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.1rem;
  color: #666;
}

.error {
  padding: 1rem;
  background-color: #ffe6e6;
  color: #dc3545;
  border-radius: 4px;
  margin: 1rem;
}

.list-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.list-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #0066cc;
  color: white;
}

.btn-primary:hover {
  background-color: #0052a3;
}

.list-filters {
  margin-bottom: 1.5rem;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  width: 300px;
  max-width: 100%;
}

.search-input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.table-container {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.table-header {
  background-color: #f5f5f5;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
  border-right: 1px solid #ddd;
}

.table-header:last-child {
  border-right: none;
}

.table-row {
  border-bottom: 1px solid #eee;
}

.table-row:hover {
  background-color: #fafafa;
}

.table-cell {
  padding: 1rem;
  border-right: 1px solid #eee;
}

.table-cell:last-child {
  border-right: none;
}

.table-actions {
  padding: 1rem;
  text-align: center;
  background-color: #f9f9f9;
  border-right: none;
}

.btn-edit,
.btn-delete {
  padding: 0.4rem 0.8rem;
  margin: 0 0.25rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-edit {
  background-color: #0066cc;
  color: white;
}

.btn-edit:hover {
  background-color: #0052a3;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  background-color: #c82333;
}
</style>