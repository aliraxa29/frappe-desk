/**
 * Dashboard Components barrel export
 * Import all dashboard-related components from here
 */

// Components
export { default as DashboardChart } from './DashboardChart.vue'
export { default as DashboardChartGrid } from './DashboardChartGrid.vue'
export { default as DashboardMetricCard } from './DashboardMetricCard.vue'
export { default as DashboardFilterButton } from './DashboardFilterButton.vue'
export { default as DashboardContainer } from './DashboardContainer.vue'
export { default as DashboardChartConfigurator } from './DashboardChartConfigurator.vue'
export { default as DashboardChartGallery } from './DashboardChartGallery.vue'

// Composables
export { useDashboardChart, useDashboardCharts } from '../../composables/useDashboardChart'

// Types
export type {
    DashboardChart as IDashboardChart,
    DashboardMetrics,
    DashboardWidget,
    ChartData,
    ApexChartOptions,
    ApexChartType
} from '../../types/dashboard'

// Utilities
export {
    chartColorPalettes,
    getChartTemplate,
    formatCurrency,
    formatNumber,
    formatChartDate,
    calculateChartHeight,
    getTooltipFormatter,
    mergeChartOptions,
    getResponsiveOptions
} from '../../utils/chartUtils'

// Data
export { getDashboardConfig, availableDashboards } from '../../data/dashboardConfigs'
export type { DashboardFilter, DashboardMetric } from '../../components/dashboard/DashboardContainer.vue'
