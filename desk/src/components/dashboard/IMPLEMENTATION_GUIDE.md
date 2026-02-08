# Dashboard Implementation Guide

Complete guide for implementing and using ApexCharts dashboard components throughout your ERPNext/Frappe application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Components Overview](#components-overview)
3. [Integration Patterns](#integration-patterns)
4. [Dashboard Chart DocType](#dashboard-chart-doctype)
5. [Advanced Usage](#advanced-usage)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Import Components

```typescript
// In your Vue component
import {
  DashboardContainer,
  DashboardChart,
  DashboardChartGrid,
  DashboardMetricCard,
  getDashboardConfig
} from '@/components/dashboard'
```

### 2. Use Pre-configured Dashboard

```vue
<template>
  <DashboardContainer
    v-bind="salesDashboardConfig"
  />
</template>

<script setup>
import { getDashboardConfig } from '@/components/dashboard'

const salesDashboardConfig = getDashboardConfig('sales')
</script>
```

### 3. Custom Dashboard

```vue
<template>
  <DashboardContainer
    title="My Custom Dashboard"
    :chart-names="['Chart 1', 'Chart 2']"
    :metrics="metrics"
  />
</template>

<script setup>
import { DashboardContainer } from '@/components/dashboard'

const metrics = [
  {
    label: 'Total',
    value: 1000,
    valueType: 'number',
    icon: 'lucide:chart-line'
  }
]
</script>
```

---

## Components Overview

### Hierarchy

```
DashboardContainer (Main Entry Point)
├── DashboardMetricCard (KPI Cards)
├── DashboardChartGrid (Chart Container)
│   └── DashboardChart (Individual Chart)
└── Filters (Built-in)
```

### Component Relationships

```
┌─────────────────────────────────────────────────┐
│           DashboardContainer                    │
├─────────────────────────────────────────────────┤
│ • Title & Description                           │
│ • Filter Section                                │
│ • Metric Cards Grid                             │
│ • Chart Grid                                    │
│ • Action Buttons (Refresh, Export, Settings)   │
└─────────────────────────────────────────────────┘
         │                      │
    ┌────▼────┐            ┌────▼──────────────┐
    │ Metrics │            │ DashboardChartGrid│
    └─────────┘            └────┬──────────────┘
                                │
                    ┌───────────┴───────────┬─────────────┐
                    │                       │             │
                ┌───▼────┐            ┌────▼────┐  ┌─────▼────┐
                │ Chart 1 │            │ Chart 2 │  │ Chart N  │
                └────────┘            └────────┘  └──────────┘
```

---

## Integration Patterns

### Pattern 1: In List Views

Show dashboard charts within list views for context-aware analytics:

```vue
<!-- src/components/list/ListViewWithDashboard.vue -->
<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- List on left -->
    <div class="lg:col-span-2">
      <ListView :doctype="doctype" />
    </div>

    <!-- Related charts on right -->
    <div class="space-y-4">
      <DashboardChart
        :chart-name="`${doctype} Summary`"
        :show-metrics="true"
      />
    </div>
  </div>
</template>

<script setup>
import { DashboardChart } from '@/components/dashboard'
import ListView from '@/views/ListView.vue'

defineProps<{ doctype: string }>()
</script>
```

### Pattern 2: In Workspace

Add dashboard charts to workspace views:

```vue
<!-- src/views/WorkspaceView.vue enhancement -->
<template>
  <div class="space-y-6">
    <!-- Existing workspace content -->
    <WorkspaceContent :workspace="currentWorkspace" />

    <!-- Add dashboard charts below -->
    <DashboardChartGrid
      v-if="workspaceDashboards.length"
      :chart-names="workspaceDashboards"
      columns="responsive"
    />
  </div>
</template>

<script setup>
import { DashboardChartGrid } from '@/components/dashboard'

const workspaceDashboards = [
  'Workspace Chart 1',
  'Workspace Chart 2'
]
</script>
```

### Pattern 3: Module Dashboard

Create dashboard for each module:

```vue
<!-- src/views/ModuleView.vue enhancement -->
<template>
  <AppLayout>
    <template #content>
      <div class="space-y-8">
        <!-- Module apps grid -->
        <AppsGrid :apps="moduleApps" />

        <!-- Module dashboard -->
        <DashboardContainer
          v-if="moduleDashboard"
          :title="moduleDashboard.title"
          :chart-names="moduleDashboard.chartNames"
          :metrics="moduleDashboard.metrics"
        />
      </div>
    </template>
  </AppLayout>
</template>

<script setup>
import { DashboardContainer, getDashboardConfig } from '@/components/dashboard'

const moduleName = ref('erpnext')
const moduleDashboard = computed(() => getDashboardConfig(moduleName.value))
</script>
```

### Pattern 4: Form View Analytics

Add analytics sidebar to forms:

```vue
<!-- src/views/FormView.vue enhancement -->
<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Form on left -->
    <div class="lg:col-span-3">
      <FormRenderer :doctype="doctype" :doc="document" />
    </div>

    <!-- Analytics sidebar -->
    <div class="space-y-4">
      <DashboardChart
        v-if="relatedChart"
        :chart-name="relatedChart"
        height="350"
        :show-metrics="false"
      />

      <!-- Related metrics -->
      <DashboardMetricCard
        label="Related Records"
        :value="relatedCount"
        icon="lucide:link"
      />
    </div>
  </div>
</template>

<script setup>
import { DashboardChart, DashboardMetricCard } from '@/components/dashboard'

const relatedChart = computed(() => `${doctype} Statistics`)
</script>
```

---

## Dashboard Chart DocType

### Create a Dashboard Chart

1. Go to Dashboard Chart list view
2. Click "New"
3. Fill in the form:

| Field | Value | Example |
|-------|-------|---------|
| Chart Name | Display name | "Sales by Region" |
| Chart Type | Custom | Custom |
| Type | Chart type from dropdown | Bar, Line, Pie, etc. |
| Source | DocType to fetch from | Invoice, Sales Order |
| Number of Groups | Grouping level | 0 or 1 |
| Is Public | Visibility | ✓ Checked |
| Timeseries | Time-based data | ✓ for trends |
| Show Values Over Chart | Display data labels | ✓ if needed |
| Custom Options | JSON config | See below |

### Custom Options JSON

Configure advanced chart options:

```json
{
  "colors": [
    "#3b82f6",
    "#ef4444",
    "#10b981"
  ],
  "stroke": {
    "curve": "smooth",
    "width": 2
  },
  "fill": {
    "type": "gradient"
  },
  "plotOptions": {
    "bar": {
      "columnWidth": 50
    }
  }
}
```

### Filters JSON

Filter source data:

```json
{
  "status": "Open",
  "docstatus": 1,
  "date": {
    ">=": "2024-01-01"
  }
}
```

---

## Advanced Usage

### Custom Chart Loading

Override default chart loading for specific needs:

```typescript
// src/composables/useCustomDashboard.ts
import { ref, onMounted } from 'vue'
import { desk } from '@/utils/desk'
import type { DashboardChart, ChartData } from '@/types/dashboard'

export function useCustomDashboard(chartName: string) {
  const chart = ref<DashboardChart | null>(null)
  const data = ref<ChartData[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      // Custom loading logic
      const response = await desk.call({
        method: 'your_app.your_module.get_custom_chart_data',
        args: { chart_name: chartName }
      })

      if (response.exc) {
        error.value = response.exc
        return
      }

      data.value = response.message.data
      chart.value = response.message.chart
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  })

  return { chart, data, loading, error }
}
```

### Dynamic Metric Calculation

Create computed metrics based on chart data:

```typescript
import { computed } from 'vue'
import { useDashboardChart } from '@/components/dashboard'
import { calculateMetrics } from '@/utils/dashboardIntegration'

export function useDashboardMetrics(chartName: string) {
  const { data } = useDashboardChart(chartName)

  const metrics = computed(() => {
    return calculateMetrics(data.value)
  })

  return metrics
}
```

### Real-time Updates

Enable real-time dashboard updates via WebSocket:

```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import { useDashboardChart } from '@/components/dashboard'
import io from 'socket.io-client'

export function useRealtimeDashboard(chartName: string) {
  const { data, refresh } = useDashboardChart(chartName)
  const socket = ref(null)

  onMounted(() => {
    // Connect to WebSocket
    socket.value = io(window.location.origin, {
      path: '/socket.io/',
      reconnection: true
    })

    // Listen for chart updates
    socket.value.on(`chart:${chartName}:updated`, () => {
      refresh()
    })

    // Listen for data changes
    socket.value.on('document:update', (data: any) => {
      if (data.doctype === 'Dashboard Chart') {
        refresh()
      }
    })
  })

  onUnmounted(() => {
    if (socket.value) {
      socket.value.disconnect()
    }
  })

  return { data, refresh }
}
```

### Export Functionality

Implement data export:

```typescript
import { download } from '@/utils/download'
import {
  exportChartDataToCSV,
  exportChartDataToJSON
} from '@/utils/dashboardIntegration'

export function useChartExport(chartName: string, data: ChartData[]) {
  function exportAsCSV() {
    const csv = exportChartDataToCSV(chartName, data)
    download(csv, `${chartName}.csv`, 'text/csv')
  }

  function exportAsJSON() {
    const json = exportChartDataToJSON(chartName, data)
    download(json, `${chartName}.json`, 'application/json')
  }

  function exportAsPDF() {
    // Implement PDF export using html2pdf or similar
  }

  return { exportAsCSV, exportAsJSON, exportAsPDF }
}
```

### Custom Filters

Implement complex filtering logic:

```vue
<template>
  <div class="space-y-4">
    <!-- Filter controls -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label>Date Range</label>
        <input v-model="filters.dateFrom" type="date" />
      </div>
      <div>
        <label>Date To</label>
        <input v-model="filters.dateTo" type="date" />
      </div>
      <button @click="applyFilters" class="btn btn-primary mt-6">
        Apply Filters
      </button>
    </div>

    <!-- Charts with applied filters -->
    <DashboardChartGrid
      :chart-names="chartNames"
      @loaded="handleChartsLoaded"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { DashboardChartGrid } from '@/components/dashboard'

const filters = reactive({
  dateFrom: '',
  dateTo: ''
})

function applyFilters() {
  // Update filter state and trigger chart refresh
  // Charts can access filters via provide/inject or store
}
</script>
```

---

## Best Practices

### 1. Performance Optimization

```vue
<template>
  <!-- Lazy load charts below the fold -->
  <div v-if="showOptionalCharts">
    <DashboardChart :chart-name="expensiveChart" />
  </div>

  <!-- Use reasonable auto-refresh intervals -->
  <DashboardChart
    chart-name="Important Chart"
    :auto-refresh="300"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showOptionalCharts = ref(false)

onMounted(() => {
  // Load optional charts after main render
  setTimeout(() => {
    showOptionalCharts.value = true
  }, 2000)
})
</script>
```

### 2. Error Handling

```vue
<template>
  <DashboardChart
    chart-name="Sales by Region"
    @error="handleChartError"
  />
</template>

<script setup>
function handleChartError(error: string) {
  // Log error
  console.error('Chart error:', error)

  // Show user-friendly message
  showToast({
    type: 'error',
    message: 'Failed to load chart data',
    description: 'Please refresh and try again'
  })

  // Track error for monitoring
  trackError({
    type: 'chart_load_error',
    error,
    timestamp: new Date()
  })
}
</script>
```

### 3. Responsive Design

```vue
<template>
  <!-- Use responsive grid -->
  <DashboardChartGrid
    chart-names="chartNames"
    columns="responsive"
    gap="md"
  />

  <!-- Or custom breakpoints -->
  <DashboardChartGrid
    :chart-names="chartNames"
    :columns="windowWidth < 1024 ? 1 : 2"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const windowWidth = ref(window.innerWidth)

function handleResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>
```

### 4. State Management

Store dashboard state in Pinia:

```typescript
// src/stores/dashboards.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDashboardStore = defineStore('dashboards', () => {
  const activeTab = ref('sales')
  const filters = ref({})
  const chartSettings = ref({})
  const lastRefresh = ref(new Date())

  function setActiveTab(tab: string) {
    activeTab.value = tab
  }

  function updateFilters(newFilters: Record<string, any>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function saveSetting(key: string, value: any) {
    chartSettings.value[key] = value
  }

  return {
    activeTab,
    filters,
    chartSettings,
    lastRefresh,
    setActiveTab,
    updateFilters,
    saveSetting
  }
})
```

### 5. Documentation

Document your dashboards:

```typescript
/**
 * Sales Module Dashboard
 * 
 * Shows key sales metrics and performance trends
 * 
 * Charts:
 * - Sales by Region: Bar chart comparing sales across regions
 * - Revenue Trend: Line chart showing revenue over time
 * - Top Products: Pie chart of best-selling products
 * 
 * Metrics:
 * - Total Revenue: Sum of all invoices
 * - Total Orders: Count of sales orders
 * - Conversion Rate: New customers / total leads
 * 
 * Filters:
 * - Date Range: Filter by date
 * - Region: Filter by sales region
 * - Product Category: Filter by product type
 * 
 * @example
 * ```vue
 * <DashboardContainer v-bind="salesDashboardConfig" />
 * ```
 */
```

---

## Troubleshooting

### Chart not loading

**Symptoms**: Loading spinner never completes, or error message shown

**Solutions**:
1. Check browser console for API errors
2. Verify Dashboard Chart record exists: `bench shell > frappe.get_doc('Dashboard Chart', 'Chart Name')`
3. Check source DocType has data: `bench shell > frappe.get_list('Source DocType', limit_page_length=1)`
4. Verify user has permission to Chart and source DocType

### Wrong data displayed

**Symptoms**: Chart shows unexpected data or no data

**Solutions**:
1. Check `filters_json` field in Dashboard Chart
2. Verify data mapping in custom options
3. Check Chart's `source` field points to correct DocType
4. Verify field names exist in source DocType

### Performance issues

**Symptoms**: Slow dashboard load, laggy interactions

**Solutions**:
1. Reduce auto-refresh interval
2. Limit data points (add filters)
3. Use pagination on large result sets
4. Lazy load charts below the fold
5. Use browser DevTools Performance tab to identify bottlenecks

### Styling issues

**Symptoms**: Dark mode not working, colors incorrect

**Solutions**:
1. Ensure `dark:` classes are in Tailwind config
2. Check parent container has `.dark` class
3. Verify color values are valid hex codes
4. Use browser DevTools to inspect computed styles

---

## Resources

- [ApexCharts Documentation](https://apexcharts.com/docs/)
- [Dashboard Chart DocType](./dashboard-chart-doctype.md)
- [Chart Gallery](./dashboard-chart-gallery.md)
- [Component API Reference](./README.md)
- [Examples](./DashboardExamplesView.vue)

---

## Support

For issues or questions:
1. Check this guide and component documentation
2. Review example implementations
3. Check browser console for errors
4. Inspect network requests in DevTools
5. Create issue with reproduction steps
