# Dashboard Components Documentation

This directory contains comprehensive dashboard components for creating interactive data visualizations using ApexCharts.

## Components

### 1. **DashboardChart**
Main component for displaying individual dashboard charts with data loading and management.

```vue
<DashboardChart
  chart-name="Sales by Region"
  :show-metrics="true"
  :auto-refresh="60"
  @loaded="handleChartLoaded"
  @error="handleChartError"
/>
```

**Props:**
- `chartName` (string): Name of the Dashboard Chart DocType record
- `chart` (DashboardChart): Direct chart object (optional)
- `showMetrics` (boolean): Show metrics in footer (default: true)
- `metrics` (DashboardMetrics): Metrics to display
- `autoRefresh` (number): Auto-refresh interval in seconds (default: 0)

**Events:**
- `loaded`: Emitted when chart data loads successfully
- `error`: Emitted when chart fails to load

---

### 2. **DashboardChartGrid**
Grid layout component for displaying multiple dashboard charts responsively.

```vue
<DashboardChartGrid
  :chart-names="['Sales by Region', 'Revenue Trend', 'Top Products']"
  columns="responsive"
  gap="md"
  :span-config="{ 0: 2, 1: 2 }"
/>
```

**Props:**
- `chartNames` (string[]): Array of chart names to display
- `columns` (number | 'responsive'): Number of columns or responsive layout (default: 'responsive')
- `gap` ('sm' | 'md' | 'lg'): Gap between charts (default: 'md')
- `spanConfig` (Record<number, number>): Configure which columns charts span

---

### 3. **DashboardMetricCard**
Card component for displaying KPI metrics with sparklines and trends.

```vue
<DashboardMetricCard
  label="Total Revenue"
  :value="125000"
  value-type="currency"
  icon="lucide:dollar-sign"
  icon-color="green"
  :change="12.5"
  compare-label="last month"
/>
```

**Props:**
- `label` (string): Metric label
- `value` (number): Metric value
- `valueType` ('number' | 'currency' | 'percent'): How to format the value
- `icon` (string): Lucide icon name
- `iconColor`: Icon background color
- `change` (number): Percentage change (optional)
- `sparklineData` (number[]): Data for mini sparkline chart

---

### 4. **DashboardContainer**
Main dashboard layout with filters, metrics grid, and chart grid.

```vue
<DashboardContainer
  title="Sales Dashboard"
  description="Monitor sales performance"
  :chart-names="chartNames"
  :metrics="metrics"
  :filters="filters"
  @filters-change="handleFilterChange"
  @refresh="handleRefresh"
  @export="handleExport"
/>
```

**Props:**
- `title` (string): Dashboard title
- `description` (string): Dashboard description
- `chartNames` (string[]): Chart names to display
- `metrics` (DashboardMetric[]): KPI cards
- `filters` (DashboardFilter[]): Filter controls
- `showFilters` (boolean): Show filters section (default: true)
- `showRefresh` (boolean): Show refresh button (default: true)
- `showExport` (boolean): Show export button (default: true)

---

### 5. **DashboardFilterButton**
Button-based filter component for quick filtering.

```vue
<DashboardFilterButton
  v-model="selectedRegions"
  label="Region"
  :items="[
    { label: 'North', value: 'north' },
    { label: 'South', value: 'south' }
  ]"
  multiple
/>
```

---

### 6. **DashboardChartConfigurator**
Interactive tool for creating and configuring chart types.

```vue
<DashboardChartConfigurator />
```

---

### 7. **DashboardChartGallery**
Showcase of all available ApexCharts chart types with examples.

```vue
<DashboardChartGallery />
```

---

## Chart Types Supported

All ApexCharts types are supported:

| Type | Icon | Use Case |
|------|------|----------|
| Line | 📈 | Trends over time |
| Area | 📊 | Cumulative distribution |
| Bar | 📊 | Category comparison |
| Pie | 🥧 | Composition/proportions |
| Donut | 🍩 | Centered pie chart |
| Radar | 🎯 | Multi-dimensional comparison |
| Scatter | 🔵 | Correlation analysis |
| Bubble | 🫧 | 3-variable correlation |
| Heatmap | 🔥 | Intensity variation |
| Candlestick | 🕯️ | OHLC data |
| Radial Bar | 📍 | Circular metrics |
| Timeline | ⏱️ | Time-based events |
| Treemap | 📦 | Hierarchical data |
| Sunburst | ☀️ | Multi-level hierarchy |

---

## Composables

### `useDashboardChart(chartName: string)`
Hook for loading and managing single chart data.

```typescript
const {
  chart,
  data,
  loading,
  error,
  options,
  refresh
} = useDashboardChart('Sales by Region')
```

### `useDashboardCharts(chartNames: string[])`
Hook for loading multiple charts.

```typescript
const { charts, allData, loading, error } = useDashboardCharts([
  'Sales by Region',
  'Revenue Trend'
])
```

---

## Utilities

### Chart Configuration

```typescript
import {
  getChartTemplate,
  mergeChartOptions,
  formatNumber,
  formatCurrency,
  formatChartDate,
  chartColorPalettes,
  calculateChartHeight,
  getTooltipFormatter,
  getResponsiveOptions
} from '@/utils/chartUtils'

// Get template for chart type
const lineTemplate = getChartTemplate('line')

// Format numbers
formatNumber(1234.5, 2) // "1,234.50"
formatCurrency(1000) // "$1,000.00"
formatChartDate(new Date(), 'long') // "January 1, 2024"

// Use color palettes
chartColorPalettes.default // Array of 10 colors
chartColorPalettes.pastel
chartColorPalettes.vibrant
```

---

## Pre-configured Dashboards

Use pre-built dashboard configurations:

```typescript
import { getDashboardConfig, availableDashboards } from '@/data/dashboardConfigs'

// Get specific dashboard config
const salesConfig = getDashboardConfig('sales')

// List all available dashboards
console.log(availableDashboards)
// [
//   { name: 'sales', title: 'Sales Dashboard', ... },
//   { name: 'inventory', title: 'Inventory Dashboard', ... },
//   ...
// ]
```

---

## Usage Examples

### Example 1: Simple Sales Dashboard

```vue
<template>
  <DashboardContainer
    title="Sales Dashboard"
    :chart-names="['Sales by Region', 'Revenue Trend', 'Top Products']"
    :metrics="metrics"
    :filters="filters"
  />
</template>

<script setup>
import { DashboardContainer } from '@/components/dashboard'

const metrics = [
  {
    label: 'Total Revenue',
    value: 125000,
    valueType: 'currency',
    icon: 'lucide:dollar-sign',
    change: 12.5
  },
  {
    label: 'Total Orders',
    value: 1234,
    valueType: 'number',
    icon: 'lucide:shopping-cart',
    change: 8.3
  }
]

const filters = [
  {
    name: 'dateRange',
    label: 'Date Range',
    type: 'select',
    options: [
      { label: 'Last 7 Days', value: '7d' },
      { label: 'Last 30 Days', value: '30d' }
    ]
  }
]
</script>
```

### Example 2: Custom Dashboard with Grid Layout

```vue
<template>
  <div class="space-y-6">
    <DashboardChartGrid
      :chart-names="chartNames"
      columns="responsive"
      :span-config="spanConfig"
    />
  </div>
</template>

<script setup>
import { DashboardChartGrid } from '@/components/dashboard'

const chartNames = [
  'Sales by Region',
  'Revenue Trend',
  'Top Products',
  'Customer Acquisition'
]

const spanConfig = {
  0: 2, // First chart spans 2 columns
  1: 2, // Second chart spans 2 columns
  // Others default to 1
}
</script>
```

### Example 3: Single Chart with Metrics

```vue
<template>
  <div class="space-y-6">
    <DashboardMetricCard
      label="Revenue"
      :value="125000"
      value-type="currency"
      icon="lucide:trending-up"
      icon-color="green"
      :change="15"
    />

    <DashboardChart
      chart-name="Revenue Trend"
      :show-metrics="true"
      :auto-refresh="60"
    />
  </div>
</template>

<script setup>
import { DashboardMetricCard, DashboardChart } from '@/components/dashboard'
</script>
```

### Example 4: Chart Gallery

```vue
<template>
  <div>
    <DashboardChartGallery />
  </div>
</template>

<script setup>
import { DashboardChartGallery } from '@/components/dashboard'
</script>
```

---

## Creating Dashboard Charts via Frappe

To create dashboard charts using the Frappe UI:

1. Go to Dashboard Chart list
2. Click "New"
3. Fill in the form:
   - **Chart Name**: e.g., "Sales by Region"
   - **Chart Type**: Custom
   - **Type**: Select from dropdowns (Bar, Line, etc.)
   - **Source**: Doctype to pull data from
   - **Custom Options**: JSON configuration

Example configuration:

```json
{
  "colors": ["#3b82f6", "#ef4444"],
  "stroke": {
    "curve": "smooth",
    "width": 2
  }
}
```

---

## Styling

All components respect Tailwind dark mode with `dark:` classes. They integrate with the existing design system and use:
- Slate color palette for UI
- Blue accents for interactive elements
- Custom color palettes for chart data
- Responsive grid layouts

---

## API Integration

The dashboard components fetch data from the Frappe API:

- `frappe.client.get` - Fetch Dashboard Chart metadata
- `frappe.client.get_list` - Fetch data from source doctype

To customize data loading, override the `useDashboardChart` composable in your views.

---

## Advanced: Custom Chart Options

```typescript
// Override chart options
const customOptions = {
  chart: {
    height: 500,
    zoom: { enabled: true }
  },
  colors: ['#3b82f6', '#ef4444'],
  dataLabels: { enabled: true }
}

const merged = mergeChartOptions('bar', customOptions, data)
```

---

## Performance Tips

1. **Auto-refresh**: Use reasonable intervals (60+ seconds)
2. **Pagination**: Limit chart data to 500-1000 records
3. **Caching**: Implement caching in composites
4. **Lazy loading**: Load charts on demand in large dashboards
5. **Responsive**: Use `columns="responsive"` for automatic layout

---

## Troubleshooting

### Chart not displaying data
- Check browser console for API errors
- Verify Dashboard Chart doctype exists
- Check data source doctype has data

### Colors not applying
- Ensure custom_options is valid JSON
- Use hex color codes (#RRGGBB format)

### Performance issues
- Reduce auto-refresh interval
- Limit number of data points displayed
- Use pagination on large queries

---

## Real-world Dashboard

Check `src/views/DashboardView.vue` for a complete example of a dashboard page using all these components.
