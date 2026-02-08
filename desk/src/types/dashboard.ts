/**
 * Dashboard Chart Types and Interfaces
 */

export interface DashboardChart {
    name: string
    doctype: 'Dashboard Chart'
    chart_name: string
    chart_type: string
    type: ApexChartType
    source: string
    number_of_groups: number
    is_public: boolean
    timeseries: boolean
    show_values_over_chart: boolean
    filters_json: string
    custom_options: string
    roles: Array<{ role: string }>
    y_axis: any[]
    color?: string
    height?: number
}

export type ApexChartType =
    | 'line'
    | 'area'
    | 'bar'
    | 'pie'
    | 'donut'
    | 'radialBar'
    | 'scatter'
    | 'bubble'
    | 'heatmap'
    | 'candlestick'
    | 'boxPlot'
    | 'timeline'
    | 'treemap'
    | 'sunburst'
    | 'radar'

export interface ChartDataPoint {
    x: string | number | Date
    y: number | number[]
}

export interface ChartData {
    name: string
    data: ChartDataPoint[]
}

export interface ApexChartOptions {
    chart?: any
    series?: any[]
    xaxis?: any
    yaxis?: any
    title?: any
    subtitle?: any
    legend?: any
    colors?: string[]
    stroke?: any
    fill?: any
    responsive?: any[]
    dataLabels?: any
    tooltip?: any
    grid?: any
    plotOptions?: any
    states?: any
    annotations?: any
    markers?: any
    barDataLabels?: any
}

export interface DashboardMetrics {
    total: number
    growth: number
    trend: 'up' | 'down' | 'neutral'
    lastUpdated: Date
}

export interface DashboardWidget {
    id: string
    title: string
    chart: DashboardChart
    data: ChartData[]
    metrics?: DashboardMetrics
    loading: boolean
    error?: string
}
