<template>
    <div class="w-full space-y-6">
        <!-- Dashboard Header -->
        <div class="flex items-center justify-between gap-4 py-4 border-b border-slate-200 dark:border-slate-800">
            <div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
                    {{ title }}
                </h1>
                <p v-if="description" class="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    {{ description }}
                </p>
            </div>

            <!-- Header Actions -->
            <div class="flex items-center gap-2">
                <button v-if="showRefresh" @click="refreshAll" :disabled="isRefreshing"
                    class="px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                    <Icon icon="lucide:refresh-cw" :class="{ 'animate-spin': isRefreshing }" />
                    <span class="text-sm font-medium">Refresh</span>
                </button>

                <button v-if="showSettings" @click="openSettings"
                    class="px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Icon icon="lucide:settings" />
                    <span class="text-sm font-medium">Settings</span>
                </button>

                <button v-if="showExport" @click="exportData"
                    class="px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Icon icon="lucide:download" />
                    <span class="text-sm font-medium">Export</span>
                </button>
            </div>
        </div>

        <!-- Filters -->
        <div v-if="showFilters && filters.length > 0" class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Filters</h3>
                <button v-if="activeFiltersCount > 0" @click="clearAllFilters"
                    class="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Clear All
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="filter in filters" :key="filter.name" class="space-y-2">
                    <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {{ filter.label }}
                    </label>

                    <select v-if="filter.type === 'select'" v-model="filterValues[filter.name]" @change="applyFilters"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All</option>
                        <option v-for="opt in filter.options" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>

                    <input v-else-if="filter.type === 'date'" v-model="filterValues[filter.name]" type="date"
                        @change="applyFilters"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    <input v-else-if="filter.type === 'number'" v-model.number="filterValues[filter.name]" type="number"
                        :placeholder="filter.label" @change="applyFilters"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    <input v-else v-model="filterValues[filter.name]" type="text" :placeholder="filter.label"
                        @change="applyFilters"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
        </div>

        <!-- Metrics Row -->
        <div v-if="metrics && metrics.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardMetricCard v-for="metric in metrics" :key="metric.label" :label="metric.label"
                :value="metric.value" :value-type="metric.valueType" :icon="metric.icon" :icon-color="metric.iconColor"
                :change="metric.change" :compare-label="metric.compareLabel" />
        </div>

        <!-- Charts Grid -->
        <div v-if="chartNames && chartNames.length > 0">
            <DashboardChartGrid :chart-names="chartNames" :columns="chartColumns" :gap="chartGap"
                :show-metrics="showChartMetrics" :auto-refresh="autoRefresh" :span-config="chartSpanConfig" />
        </div>

        <!-- Empty State -->
        <div v-else class="flex items-center justify-center h-96">
            <div class="text-center">
                <Icon icon="lucide:chart-line" class="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Charts Configured</h3>
                <p class="text-slate-500 dark:text-slate-400">
                    Add dashboard charts to display them here
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import DashboardChartGrid from './DashboardChartGrid.vue'
import DashboardMetricCard from './DashboardMetricCard.vue'

export interface DashboardFilter {
    name: string
    label: string
    type: 'text' | 'select' | 'date' | 'number'
    options?: Array<{ label: string; value: any }>
}

export interface DashboardMetric {
    label: string
    value: number
    valueType?: 'number' | 'currency' | 'percent'
    icon?: string
    iconColor?: string
    change?: number
    compareLabel?: string
}

interface Props {
    title: string
    description?: string
    chartNames?: string[]
    filters?: DashboardFilter[]
    metrics?: DashboardMetric[]
    chartColumns?: number | 'responsive'
    chartGap?: 'sm' | 'md' | 'lg'
    chartSpanConfig?: Record<number, number>
    showFilters?: boolean
    showChartMetrics?: boolean
    showRefresh?: boolean
    showSettings?: boolean
    showExport?: boolean
    autoRefresh?: number
}

const props = withDefaults(defineProps<Props>(), {
    chartColumns: 'responsive',
    chartGap: 'md',
    showFilters: true,
    showChartMetrics: true,
    showRefresh: true,
    showSettings: false,
    showExport: true,
    autoRefresh: 0
})

const emit = defineEmits<{
    (e: 'filtersChange', filters: Record<string, any>): void
    (e: 'refresh'): void
    (e: 'export'): void
    (e: 'settings'): void
}>()

const filterValues = reactive<Record<string, any>>({})
const isRefreshing = ref(false)

// Initialize filter values
onMounted(() => {
    props.filters?.forEach(filter => {
        filterValues[filter.name] = ''
    })
})

// Computed properties
const activeFiltersCount = computed(() => {
    return Object.values(filterValues).filter(v => v !== '' && v !== null).length
})

// Methods
function applyFilters() {
    emit('filtersChange', filterValues)
}

function clearAllFilters() {
    Object.keys(filterValues).forEach(key => {
        filterValues[key] = ''
    })
    applyFilters()
}

async function refreshAll() {
    isRefreshing.value = true
    try {
        emit('refresh')
        // Add a small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
        isRefreshing.value = false
    }
}

function openSettings() {
    emit('settings')
}

function exportData() {
    emit('export')
}
</script>
