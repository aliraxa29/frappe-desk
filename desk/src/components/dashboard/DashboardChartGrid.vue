<template>
    <div class="grid gap-6" :class="gridClass">
        <transition-group name="chart-fade" tag="div" class="contents">
            <div v-for="(chartName, index) in chartNames" :key="`chart-${chartName}`" :class="getSpanClass(index)">
                <DashboardChart :chart-name="chartName" :show-metrics="showMetrics" :auto-refresh="autoRefresh"
                    @error="handleChartError(chartName, $event)" @loaded="handleChartLoaded(chartName, $event)" />
            </div>
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardChart from './DashboardChart.vue'

interface Props {
    chartNames: string[]
    columns?: number | 'responsive'
    gap?: 'sm' | 'md' | 'lg'
    showMetrics?: boolean
    autoRefresh?: number
    spanConfig?: Record<number, number> // index -> span mapping
}

const props = withDefaults(defineProps<Props>(), {
    columns: 'responsive',
    gap: 'md',
    showMetrics: true,
    autoRefresh: 0
})

const loadedCharts = ref<Set<string>>(new Set())
const erroredCharts = ref<Map<string, string>>(new Map())

// Computed grid classes
const gridClass = computed(() => {
    const gapClass: Record<string, string> = {
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8'
    }

    const gridColsClass: Record<string | number, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }

    return [
        gridColsClass[props.columns] || gridColsClass.responsive,
        gapClass[props.gap]
    ]
})

// Methods
function getSpanClass(index: number): string {
    if (!props.spanConfig || !props.spanConfig[index]) {
        return ''
    }

    const span = props.spanConfig[index]
    const spanMap: Record<number, string> = {
        1: 'col-span-1',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-4'
    }

    return spanMap[span] || ''
}

function handleChartLoaded(chartName: string, chart: any) {
    loadedCharts.value.add(chartName)
    erroredCharts.value.delete(chartName)
}

function handleChartError(chartName: string, error: string) {
    erroredCharts.value.set(chartName, error)
}

const loadedCount = computed(() => loadedCharts.value.size)
const totalCount = computed(() => props.chartNames.length)
const allLoaded = computed(() => loadedCount.value === totalCount.value)
const hasErrors = computed(() => erroredCharts.value.size > 0)

// Expose stats
defineExpose({
    loadedCount,
    totalCount,
    allLoaded,
    hasErrors,
    erroredCharts: computed(() => Array.from(erroredCharts.value.entries()))
})
</script>

<style scoped>
.chart-fade-move,
.chart-fade-enter-active,
.chart-fade-leave-active {
    transition: all 0.3s ease;
}

.chart-fade-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.chart-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.chart-fade-leave-active {
    position: absolute;
}
</style>
