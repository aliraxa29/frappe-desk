<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between gap-4 w-full my-4">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
            {{ dashboardName }}
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded">
            Dashboard
          </span>
        </div>
      </div>
    </template>

    <template #content>
      <div class="space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="text-sm text-slate-500">Loading dashboard...</div>
        </div>

        <!-- Dashboard Content -->
        <div v-else class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex flex-col items-center justify-center h-64 text-center">
            <div class="text-5xl mb-4">📈</div>
            <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-100">{{ dashboardName }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Dashboard view coming soon
            </p>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBreadcrumbStore } from '../stores/breadcrumbs'
import AppLayout from '../layout/AppLayout.vue'

const route = useRoute()
const breadcrumbStore = useBreadcrumbStore()
const loading = ref(false)

const appName = computed(() => (route.params.app as string) || '')
const dashboardName = computed(() => decodeURIComponent((route.params.dashboard as string) || ''))

// Format label from slug
function formatLabel(str: string): string {
  if (!str) return ''
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

// Set breadcrumbs
watch([appName, dashboardName], () => {
  breadcrumbStore.set([
    { label: formatLabel(appName.value), route: `/${appName.value}`, type: 'app' },
    { label: dashboardName.value }
  ])
}, { immediate: true })

onMounted(() => {
  // Load dashboard data if needed
})
</script>
