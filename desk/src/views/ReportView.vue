<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between gap-4 w-full my-4">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
            {{ reportName }}
          </h2>
          <span class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded">
            Report
          </span>
        </div>
      </div>
    </template>

    <template #content>
      <div class="space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="text-sm text-slate-500">Loading report...</div>
        </div>

        <!-- Report Content -->
        <div v-else class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex flex-col items-center justify-center h-64 text-center">
            <div class="text-5xl mb-4">📊</div>
            <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-100">{{ reportName }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Report view coming soon
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
const reportName = computed(() => decodeURIComponent((route.params.report as string) || ''))

// Format label from slug
function formatLabel(str: string): string {
  if (!str) return ''
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

// Set breadcrumbs
watch([appName, reportName], () => {
  breadcrumbStore.set([
    { label: formatLabel(appName.value), route: `/${appName.value}`, type: 'app' },
    { label: reportName.value, type: 'report' }
  ])
}, { immediate: true })

onMounted(() => {
  // Load report data if needed
})
</script>
