<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="command-modal-overlay" @click="close">
        <div class="command-modal" @click.stop>
          <!-- Search Input -->
          <div class="command-header">
            <svg class="command-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="searchQuery" type="text" :placeholder="__('Search or type command...')"
              class="command-input" @input="handleSearch" @keydown.down="selectNext" @keydown.up="selectPrev"
              @keydown.enter="selectCurrent" @keydown.esc="close" ref="inputRef" autofocus />
            <button @click="close" class="close-button" :title="__('Close (ESC)')">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Results -->
          <div class="command-results">
            <!-- No results -->
            <div v-if="!loading && searchQuery && totalResults === 0" class="no-results">
              <p>{{ __('No results found for "{0}"', [searchQuery]) }}</p>
            </div>

            <!-- Empty state (no search query) -->
            <div v-else-if="!searchQuery && !loading" class="empty-state">
              <p class="empty-hint">{{ __('Start typing to search for doctypes, modules, and more...') }}</p>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>{{ __('Searching...') }}</p>
            </div>

            <!-- Results groups -->
            <div v-else-if="totalResults > 0" class="results-container">
              <!-- DocTypes Group -->
              <div v-if="groupedResults.doctype.length > 0" class="result-group">
                <div class="result-group-label">{{ __('DocTypes') }}</div>
                <button v-for="(item, index) in groupedResults.doctype" :key="`dt-${item.name}`"
                  :class="['result-item', { 'result-item-selected': selectedIndex === groupStartIndices.doctype + index }]"
                  @click="selectItem(item)" @mouseover="selectedIndex = groupStartIndices.doctype + index">
                  <div class="result-item-icon">{{ getItemIcon(item) }}</div>
                  <div class="result-item-content">
                    <div class="result-item-title" v-html="item.markedLabel || item.label"></div>
                    <div class="result-item-description" v-if="item.module">{{ item.module }}</div>
                  </div>
                  <div class="result-item-score" v-if="searchQuery">{{ Math.round(item.score) }}</div>
                </button>
              </div>

              <!-- Modules Group -->
              <div v-if="groupedResults.module.length > 0" class="result-group">
                <div class="result-group-label">{{ __('Apps/Modules') }}</div>
                <button v-for="(item, index) in groupedResults.module" :key="`mod-${item.name}`"
                  :class="['result-item', { 'result-item-selected': selectedIndex === groupStartIndices.module + index }]"
                  @click="selectItem(item)" @mouseover="selectedIndex = groupStartIndices.module + index">
                  <div class="result-item-icon" :style="{ backgroundColor: getModuleColor(item.name) }">
                    {{ item.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="result-item-content">
                    <div class="result-item-title" v-html="item.markedLabel || item.label"></div>
                    <div class="result-item-description" v-if="item.description">{{ item.description }}</div>
                  </div>
                  <div class="result-item-score" v-if="searchQuery">{{ Math.round(item.score) }}</div>
                </button>
              </div>

              <!-- Workspaces Group -->
              <div v-if="groupedResults.workspace.length > 0" class="result-group">
                <div class="result-group-label">{{ __('Workspaces') }}</div>
                <button v-for="(item, index) in groupedResults.workspace" :key="`ws-${item.name}`"
                  :class="['result-item', { 'result-item-selected': selectedIndex === groupStartIndices.workspace + index }]"
                  @click="selectItem(item)" @mouseover="selectedIndex = groupStartIndices.workspace + index">
                  <div class="result-item-icon">{{ getItemIcon(item) }}</div>
                  <div class="result-item-content">
                    <div class="result-item-title" v-html="item.markedLabel || item.label"></div>
                    <div class="result-item-description" v-if="item.module">{{ item.module }}</div>
                  </div>
                  <div class="result-item-score" v-if="searchQuery">{{ Math.round(item.score) }}</div>
                </button>
              </div>

              <!-- Recent Group -->
              <div v-if="groupedResults.recent.length > 0 && !searchQuery" class="result-group">
                <div class="result-group-label">{{ __('Recently Used') }}</div>
                <button v-for="(item, index) in groupedResults.recent" :key="`recent-${item.name}`"
                  :class="['result-item', { 'result-item-selected': selectedIndex === groupStartIndices.recent + index }]"
                  @click="selectItem(item)" @mouseover="selectedIndex = groupStartIndices.recent + index">
                  <div class="result-item-icon">{{ getItemIcon(item) }}</div>
                  <div class="result-item-content">
                    <div class="result-item-title">{{ item.label }}</div>
                    <div class="result-item-description" v-if="item.module">{{ item.module }}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="command-footer">
            <div class="command-hint">
              <kbd>↑↓</kbd>
              <span>to navigate</span>
            </div>
            <div class="command-hint">
              <kbd>Enter</kbd>
              <span>to select</span>
            </div>
            <div class="command-hint">
              <kbd>ESC</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchManager, type SearchResult } from '../utils/searchManager'
import { __ } from '../utils/translate';

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const isOpen = ref(false)
const searchQuery = ref('')
const loading = ref(false)
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement>()

const allResults = ref<SearchResult[]>([])

// Group results by type
const groupedResults = computed(() => {
  const groups: { [key: string]: SearchResult[] } = {
    doctype: [],
    module: [],
    workspace: [],
    page: [],
    recent: []
  }

  for (const item of allResults.value) {
    const type = item.type || 'page'
    if (groups[type]) {
      groups[type].push(item)
    }
  }

  return groups
})

// Compute start indices for each group for keyboard navigation
const groupStartIndices = computed(() => {
  let index = 0
  const indices: { [key: string]: number } = {}

  if (groupedResults.value.doctype.length > 0) {
    indices.doctype = index
    index += groupedResults.value.doctype.length
  }

  if (groupedResults.value.module.length > 0) {
    indices.module = index
    index += groupedResults.value.module.length
  }

  if (groupedResults.value.workspace.length > 0) {
    indices.workspace = index
    index += groupedResults.value.workspace.length
  }

  if (groupedResults.value.page.length > 0) {
    indices.page = index
    index += groupedResults.value.page.length
  }

  if (groupedResults.value.recent.length > 0) {
    indices.recent = index
  }

  return indices
})

const totalResults = computed(() => allResults.value.length)

const handleSearch = async () => {
  selectedIndex.value = 0

  if (!searchQuery.value.trim()) {
    allResults.value = []
    // Show recent items if no search query
    const recent = await searchManager.search('')
    allResults.value = recent
    return
  }

  loading.value = true
  try {
    const results = await searchManager.search(searchQuery.value)
    allResults.value = results
  } catch (error) {
    console.error('Search failed:', error)
    allResults.value = []
  } finally {
    loading.value = false
  }
}

const selectNext = () => {
  if (selectedIndex.value < totalResults.value - 1) {
    selectedIndex.value++
  }
}

const selectPrev = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const selectCurrent = () => {
  if (selectedIndex.value >= 0 && selectedIndex.value < allResults.value.length) {
    selectItem(allResults.value[selectedIndex.value])
  }
}

const selectItem = (item: SearchResult) => {
  // Add to recent
  searchManager.addRecent(item.type, item.name, item.label)

  // Navigate based on type
  if (item.type === 'doctype') {
    router.push({
      name: 'ListView',
      params: { doctype: item.name }
    })
  } else if (item.type === 'recent') {
    // Handle recent items - navigate based on module
    router.push({
      name: 'App',
      params: { app: item.name }
    })
  } else {
    // Default navigation
    router.push(`/list/${item.name}`)
  }
  close()
}

const getItemIcon = (item: SearchResult): string => {
  switch (item.type) {
    case 'doctype':
      return '📄'
    case 'module':
      return '📦'
    case 'workspace':
      return '📋'
    case 'recent':
      return '⏱️'
    default:
      return '📝'
  }
}

const getModuleColor = (moduleName: string): string => {
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#6366f1'
  ]
  let hash = 0
  for (let i = 0; i < moduleName.length; i++) {
    hash = moduleName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const open = () => {
  isOpen.value = true
  searchQuery.value = ''
  selectedIndex.value = 0
  // Load recent items on open
  handleSearch()
  setTimeout(() => inputRef.value?.focus(), 0)
}

const close = () => {
  isOpen.value = false
  searchManager.clearCache()
  emit('close')
}

// Expose open method
defineExpose({
  open,
  close
})

onMounted(() => {
  // Keyboard shortcut to open command dialog (Cmd+K or Ctrl+K)
  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      open()
    }
  }
  window.addEventListener('keydown', handleKeyDown)

  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
})
</script>

<style scoped>
.command-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  z-index: 100;
}

.command-modal {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.command-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #374151;
  background-color: #111827;
}

.command-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  flex-shrink: 0;
}

.command-input {
  flex: 1;
  background-color: transparent;
  color: white;
  border: none;
  outline: none;
  font-size: 1rem;
  font-family: inherit;
}

.command-input::placeholder {
  color: #6b7280;
}

.close-button {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
  flex-shrink: 0;
}

.close-button:hover {
  color: #f3f4f6;
}

.close-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.command-results {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.command-results::-webkit-scrollbar {
  width: 0.5rem;
}

.command-results::-webkit-scrollbar-track {
  background-color: transparent;
}

.command-results::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 0.25rem;
}

.command-results::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}

.no-results,
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  ;
  justify-content: center;
  padding: 3rem 1.5rem;
  color: #9ca3af;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #374151;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-group {
  padding: 0.5rem 0;
}

.result-group-label {
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.05em;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.15s;
}

.result-item:hover {
  background-color: #2d3748;
}

.result-item-selected {
  background-color: #4f46e5 !important;
}

.result-item-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(79, 70, 229, 0.2);
  color: #a78bfa;
}

.result-item-content {
  flex: 1;
  min-width: 0;
}

.result-item-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #f3f4f6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-item-title :deep(mark) {
  background-color: #f59e0b;
  color: #1f2937;
  font-weight: 600;
  padding: 0 0.125rem;
  border-radius: 0.25rem;
}

.result-item-description {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-item-score {
  font-size: 0.75rem;
  color: #6b7280;
  background-color: rgba(107, 114, 128, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.command-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #374151;
  background-color: #111827;
  font-size: 0.875rem;
  color: #9ca3af;
}

.command-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

kbd {
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-family: monospace;
  font-size: 0.75rem;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.empty-state {
  padding: 2rem 1.5rem;
  color: #9ca3af;
  text-align: center;
  min-height: 150px;
}

.empty-hint {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.no-results p,
.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.results-container {
  display: flex;
  flex-direction: column;
}

@media (max-width: 640px) {
  .command-modal {
    width: 95%;
    max-height: 80vh;
  }

  .command-footer {
    gap: 1rem;
    font-size: 0.75rem;
  }
}
</style>
