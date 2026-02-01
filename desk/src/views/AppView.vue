<template>
  <div class="app-view">
    <Navbar />

    <div class="app-layout">
      <aside class="app-sidebar">
        <div class="sidebar-header">
          <h2>{{ moduleName }}</h2>
        </div>

        <div class="search-box px-4 py-3">
          <input v-model="searchQuery" type="text" placeholder="Search sidebar items..."
            class="search-input w-full rounded-md" />
        </div>

        <div class="doctypes-menu px-2">
          <div v-if="allSidebarEmpty" class="empty-state">
            <p>No sidebar items</p>
          </div>

          <div v-else>
            <div v-if="groupedSidebar.doctypes.length" class="doctypes-list">
              <h4 class="px-4 py-2 text-sm font-semibold">DocTypes</h4>
              <router-link v-for="item in groupedSidebar.doctypes" :key="`doctype-${item.name}`" :to="getRoute(item)"
                class="doctype-link flex items-center px-4 py-2 rounded-md hover:bg-blue-600/10">
                <span class="doctype-icon text-lg">{{ item.icon || '📄' }}</span>
                <span class="doctype-name ml-3">{{ item.label || item.name }}</span>
              </router-link>
            </div>

            <div v-if="groupedSidebar.pages.length" class="doctypes-list">
              <h4 class="px-4 py-2 text-sm font-semibold">Pages</h4>
              <router-link v-for="item in groupedSidebar.pages" :key="`page-${item.name}`" :to="getRoute(item)"
                class="doctype-link flex items-center px-4 py-2 rounded-md hover:bg-blue-600/10">
                <span class="doctype-icon text-lg">{{ item.icon || '📄' }}</span>
                <span class="doctype-name ml-3">{{ item.label || item.name }}</span>
              </router-link>
            </div>

            <div v-if="groupedSidebar.reports.length" class="doctypes-list">
              <h4 class="px-4 py-2 text-sm font-semibold">Reports</h4>
              <router-link v-for="item in groupedSidebar.reports" :key="`report-${item.name}`" :to="getRoute(item)"
                class="doctype-link flex items-center px-4 py-2 rounded-md hover:bg-blue-600/10">
                <span class="doctype-icon text-lg">{{ item.icon || '📄' }}</span>
                <span class="doctype-name ml-3">{{ item.label || item.name }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </aside>

      <main class="app-content">
        <div class="content-header">
          <h1>{{ moduleName }}</h1>
          <p class="text-gray-400">Select a doctype from the sidebar to view its records</p>
        </div>

        <div class="content-body">
          <div v-if="loading" class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading doctypes...</p>
          </div>
          <div v-else-if="doctypes.length === 0" class="empty-state-large">
            <div class="empty-icon">📦</div>
            <h3>No DocTypes</h3>
            <p class="text-gray-400">This module has no doctypes available</p>
          </div>
          <div v-else class="welcome-section">
            <div class="welcome-card">
              <h2>Welcome to {{ moduleName }}</h2>
              <p class="text-gray-300">This module contains {{ doctypes.length }} doctypes</p>

              <div class="doctypes-grid">
                <router-link v-for="doctype in doctypes.slice(0, 6)" :key="doctype" :to="`/${doctype}`"
                  class="doctype-card">
                  <div class="doctype-card-icon">📋</div>
                  <h4>{{ doctype }}</h4>
                </router-link>
              </div>

              <router-link v-if="doctypes.length > 6" :to="`/${doctypes[0]}`" class="view-all-btn">
                View All {{ doctypes.length }} DocTypes
              </router-link>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import { desktopAPI } from '../api/desktop'
import type { SidebarItem } from '../data/app_sidebar'

const route = useRoute()
const loading = ref(true)
const searchQuery = ref('')
const doctypes = ref<string[]>([])
const sidebarItems = ref<SidebarItem[]>([])

const moduleName = computed(() => {
  const name = (route.params.app as string) || 'Module'
  if (!name) return ''
  return name.charAt(0).toUpperCase() + name.slice(1)
})

const filteredDoctypes = computed(() => {
  if (!searchQuery.value) return doctypes.value
  const query = searchQuery.value.toLowerCase()
  return doctypes.value.filter(dt => dt.toLowerCase().includes(query))
})

const groupedSidebar = computed(() => {
  const q = (searchQuery.value || '').toLowerCase()

  const filtered = q
    ? sidebarItems.value.filter(si => (si.label || si.name).toLowerCase().includes(q))
    : sidebarItems.value

  const groups = {
    doctypes: [] as SidebarItem[],
    pages: [] as SidebarItem[],
    reports: [] as SidebarItem[],
  }

  for (const item of filtered) {
    // Skip child doctypes (istable = true)
    if (item.istable) continue

    const t = (item.type || '').toLowerCase()
    if (t === 'doctype') groups.doctypes.push(item)
    else if (t === 'report') groups.reports.push(item)
    else groups.pages.push(item)
  }

  return groups
})

const allSidebarEmpty = computed(() => {
  const g = groupedSidebar.value
  return g.doctypes.length === 0 && g.pages.length === 0 && g.reports.length === 0
})

function getRoute(item: SidebarItem) {
  const type = (item.link_type || '').toLowerCase()
  // base route mapping
  // For doctype: /doctype/name for list view
  if (type === 'doctype') return `/${item.link_to}`
  // both page and report navigate to page routes per spec
  if (type === 'page') return `/page/${item.name}`

  if (type === 'report') return `/page/${item.name}`
  // fallback: use provided route or hash
  return "#";
}

onMounted(async () => {
  try {
    loading.value = true
    const module = (route.params.module as string) || 'desktop'

    // load doctypes for content area (unchanged behaviour)
    const dtResult = await desktopAPI.getModuleDoctypes(module)
    doctypes.value = dtResult

    const sb = await desktopAPI.getModuleSidebar(module)
    sidebarItems.value = sb
  } catch (error) {
    console.error('Failed to load module data:', error)
    doctypes.value = []
    sidebarItems.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.app-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e0e0e0;
}

.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-sidebar {
  width: 280px;
  background: rgba(10, 10, 20, 0.8);
  border-right: 1px solid rgba(100, 100, 150, 0.2);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(100, 100, 150, 0.2);
  flex-shrink: 0;
}

.back-button {
  display: inline-block;
  padding: 8px 12px;
  margin-bottom: 12px;
  background: rgba(100, 150, 255, 0.1);
  border: 1px solid rgba(100, 150, 255, 0.3);
  border-radius: 6px;
  color: #7dd3fc;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(100, 150, 255, 0.2);
  border-color: rgba(100, 150, 255, 0.5);
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #e0e0e0;
}

.search-box {
  padding: 16px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(100, 100, 150, 0.2);
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(100, 100, 150, 0.1);
  border: 1px solid rgba(100, 100, 150, 0.3);
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  background: rgba(100, 100, 150, 0.15);
  border-color: rgba(100, 150, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(100, 150, 255, 0.1);
}

.search-input::placeholder {
  color: rgba(224, 224, 224, 0.4);
}

.doctypes-menu {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: rgba(224, 224, 224, 0.5);
  font-size: 14px;
}

.doctypes-list {
  display: flex;
  flex-direction: column;
}

.doctype-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #e0e0e0;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.doctype-link:hover {
  background: rgba(100, 150, 255, 0.1);
  border-left-color: rgba(100, 150, 255, 0.5);
  padding-left: 15px;
}

.doctype-icon {
  font-size: 16px;
}

.doctype-name {
  font-size: 14px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px;
}

.content-header {
  margin-bottom: 40px;
}

.content-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #fff;
  background: linear-gradient(135deg, #64b5f6 0%, #7dd3fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.content-header p {
  margin: 0;
  font-size: 14px;
}

.content-body {
  min-height: 300px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 60px 20px;
  color: rgba(224, 224, 224, 0.6);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(100, 150, 255, 0.2);
  border-top-color: #64b5f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: rgba(224, 224, 224, 0.6);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state-large h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #e0e0e0;
}

.welcome-section {
  max-width: 1000px;
}

.welcome-card {
  background: rgba(30, 30, 50, 0.5);
  border: 1px solid rgba(100, 150, 255, 0.2);
  border-radius: 12px;
  padding: 40px;
}

.welcome-card h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #fff;
}

.welcome-card>p {
  margin: 0 0 32px 0;
  font-size: 14px;
}

.doctypes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.doctype-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(50, 50, 80, 0.5);
  border: 1px solid rgba(100, 150, 255, 0.2);
  border-radius: 8px;
  text-decoration: none;
  color: #e0e0e0;
  transition: all 0.3s ease;
}

.doctype-card:hover {
  background: rgba(100, 150, 255, 0.1);
  border-color: rgba(100, 150, 255, 0.4);
  transform: translateY(-2px);
}

.doctype-card-icon {
  font-size: 24px;
}

.doctype-card h4 {
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  text-align: center;
  word-break: break-word;
  color: #7dd3fc;
}

.view-all-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #64b5f6 0%, #7dd3fc 100%);
  border: none;
  border-radius: 6px;
  color: #0a0a14;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.text-gray-400 {
  color: rgba(224, 224, 224, 0.4);
}

.text-gray-300 {
  color: rgba(224, 224, 224, 0.6);
}

/* Scrollbar styling */
.doctypes-menu::-webkit-scrollbar,
.app-content::-webkit-scrollbar {
  width: 8px;
}

.doctypes-menu::-webkit-scrollbar-track,
.app-content::-webkit-scrollbar-track {
  background: transparent;
}

.doctypes-menu::-webkit-scrollbar-thumb,
.app-content::-webkit-scrollbar-thumb {
  background: rgba(100, 150, 255, 0.3);
  border-radius: 4px;
}

.doctypes-menu::-webkit-scrollbar-thumb:hover,
.app-content::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 150, 255, 0.5);
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .app-sidebar {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid rgba(100, 100, 150, 0.2);
  }

  .app-content {
    padding: 24px;
  }

  .content-header h1 {
    font-size: 24px;
  }

  .welcome-card {
    padding: 24px;
  }

  .doctypes-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
