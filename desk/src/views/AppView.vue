<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between gap-4 w-full my-3">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-slate-800">
            {{ formatLabel(moduleName) }}
          </h2>
          <span class="text-sm text-slate-500">
            {{ sidebarItems.length }} items
          </span>
        </div>
      </div>
    </template>

    <template #content>
      <div class="space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="text-sm text-slate-500">Loading...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="groupedSidebar.doctypes.length === 0 && groupedSidebar.pages.length === 0 && groupedSidebar.reports.length === 0" class="flex flex-col items-center justify-center h-64 text-center">
          <div class="text-5xl mb-4">📦</div>
          <h3 class="text-lg font-semibold text-slate-700">No Items Found</h3>
          <p class="text-sm text-slate-500 mt-1">This module has no doctypes or pages available</p>
        </div>

        <!-- Content Grid -->
        <div v-else class="space-y-8">
          <!-- DocTypes Section -->
          <div v-if="groupedSidebar.doctypes.length > 0">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">DocTypes</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <div
                v-for="item in groupedSidebar.doctypes"
                :key="item.name"
                @click="navigateToDoctype(item)"
                class="group flex flex-col items-center gap-3 p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <span class="text-3xl">{{ item.icon || '📄' }}</span>
                <span class="text-sm font-medium text-slate-700 text-center group-hover:text-blue-600 transition-colors">
                  {{ item.label || item.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Pages Section -->
          <div v-if="groupedSidebar.pages.length > 0">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Pages</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <router-link
                v-for="item in groupedSidebar.pages"
                :key="item.name"
                :to="getPageRoute(item)"
                class="group flex flex-col items-center gap-3 p-5 bg-white rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all"
              >
                <span class="text-3xl">{{ item.icon || '📑' }}</span>
                <span class="text-sm font-medium text-slate-700 text-center group-hover:text-green-600 transition-colors">
                  {{ item.label || item.name }}
                </span>
              </router-link>
            </div>
          </div>

          <!-- Reports Section -->
          <div v-if="groupedSidebar.reports.length > 0">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Reports</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <router-link
                v-for="item in groupedSidebar.reports"
                :key="item.name"
                :to="getReportRoute(item)"
                class="group flex flex-col items-center gap-3 p-5 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <span class="text-3xl">{{ item.icon || '📊' }}</span>
                <span class="text-sm font-medium text-slate-700 text-center group-hover:text-purple-600 transition-colors">
                  {{ item.label || item.name }}
                </span>
              </router-link>
            </div>
          </div>

          <!-- Dashboards Section -->
          <div v-if="groupedSidebar.dashboards.length > 0">
            <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Dashboards</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <router-link
                v-for="item in groupedSidebar.dashboards"
                :key="item.name"
                :to="getDashboardRoute(item)"
                class="group flex flex-col items-center gap-3 p-5 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <span class="text-3xl">{{ item.icon || '📈' }}</span>
                <span class="text-sm font-medium text-slate-700 text-center group-hover:text-orange-600 transition-colors">
                  {{ item.label || item.name }}
                </span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { desktopAPI } from '../api/desktop'
import { useBreadcrumbStore } from '../stores/breadcrumbs'
import { model } from '../data/model'
import type { SidebarItem } from '../data/app_sidebar'
import AppLayout from '../layout/AppLayout.vue'

declare const locals: any

const route = useRoute()
const router = useRouter()
const breadcrumbStore = useBreadcrumbStore()
const loading = ref(true)
const sidebarItems = ref<SidebarItem[]>([])

// Get module name from route
const moduleName = computed(() => (route.params.app as string) || '')

// Group sidebar items by type
const groupedSidebar = computed(() => {
  const groups = {
    doctypes: [] as SidebarItem[],
    pages: [] as SidebarItem[],
    reports: [] as SidebarItem[],
    dashboards: [] as SidebarItem[],
  }

  for (const item of sidebarItems.value) {
    // Skip child doctypes
    if (item.istable) continue

    const t = (item.link_type || item.type || '').toLowerCase()
    if (t === 'doctype') groups.doctypes.push(item)
    else if (t === 'report') groups.reports.push(item)
    else if (t === 'dashboard') groups.dashboards.push(item)
    else if (t === 'page') groups.pages.push(item)
  }

  return groups
})

// Format label from slug
function formatLabel(str: string): string {
  if (!str) return ''
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

// Navigate to doctype (handle single vs regular)
async function navigateToDoctype(item: SidebarItem) {
  const doctypeName = item.link_to || item.name
  let isSingle = item.issingle || false

  // Check if we have metadata cached
  if (typeof locals !== 'undefined' && locals?.DocType?.[doctypeName]) {
    isSingle = locals.DocType[doctypeName].issingle === 1
  } else {
    // Load doctype metadata
    try {
      await new Promise((resolve) => {
        model.with_doctype(doctypeName, (result: any) => {
          if (result?.docs) {
            const metaDoc = result.docs.find((doc: any) => doc.name === doctypeName)
            if (metaDoc) {
              isSingle = metaDoc.issingle === 1
            }
          }
          resolve(true)
        })
      })
    } catch (error) {
      console.error('Failed to load doctype metadata:', error)
    }
  }

  if (isSingle) {
    router.push({
      name: 'EditForm',
      params: {
        app: moduleName.value,
        doctype: doctypeName,
        name: doctypeName
      }
    })
  } else {
    router.push({
      name: 'ListView',
      params: { app: moduleName.value, doctype: doctypeName }
    })
  }
}

function getPageRoute(item: SidebarItem) {
  // Pages typically use ListView or custom routes
  return `/${moduleName.value}/page/${encodeURIComponent(item.link_to || item.name)}`
}

function getReportRoute(item: SidebarItem) {
  // Reports use a report builder route
  return `/${moduleName.value}/report/${encodeURIComponent(item.link_to || item.name)}`
}

function getDashboardRoute(item: SidebarItem) {
  return `/${moduleName.value}/dashboard/${encodeURIComponent(item.link_to || item.name)}`
}

// Set breadcrumbs for app view
watch(moduleName, () => {
  breadcrumbStore.setForApp(moduleName.value, formatLabel(moduleName.value))
}, { immediate: true })

// Fetch sidebar data
async function fetchSidebar() {
  loading.value = true
  try {
    const module = moduleName.value || 'desktop'
    const sb = await desktopAPI.getModuleSidebar(module)
    sidebarItems.value = sb
  } catch (error) {
    console.error('Failed to load sidebar:', error)
    sidebarItems.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  breadcrumbStore.setForApp(moduleName.value, formatLabel(moduleName.value))
  await fetchSidebar()
})

// Refetch on route change
watch(() => route.params.app, async () => {
  await fetchSidebar()
})
</script>
