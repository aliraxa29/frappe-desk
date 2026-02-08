/**
 * Dashboard integration utilities
 * Helpers for integrating dashboard charts throughout the application
 */

import { desk } from '../utils/desk'
import type { DashboardChart, ChartData } from '../types/dashboard'

/**
 * Fetch dashboard chart from Frappe
 */
export async function fetchDashboardChart(chartName: string): Promise<DashboardChart | null> {
    try {
        const response = await desk.call({
            method: 'frappe.client.get',
            args: {
                doctype: 'Dashboard Chart',
                name: chartName
            }
        })

        if (response.exc) {
            console.error(`Error fetching chart ${chartName}:`, response.exc)
            return null
        }

        return response.message as DashboardChart
    } catch (error) {
        console.error(`Failed to fetch chart ${chartName}:`, error)
        return null
    }
}

/**
 * Fetch multiple dashboard charts
 */
export async function fetchDashboardCharts(chartNames: string[]): Promise<DashboardChart[]> {
    const charts = await Promise.all(chartNames.map(name => fetchDashboardChart(name)))
    return charts.filter((chart): chart is DashboardChart => chart !== null)
}

/**
 * Save dashboard chart configuration
 */
export async function saveDashboardChart(chart: Partial<DashboardChart> & { name: string }): Promise<boolean> {
    try {
        await desk.call({
            method: 'frappe.client.set_value',
            args: {
                doctype: 'Dashboard Chart',
                name: chart.name,
                fieldname: {
                    chart_type: chart.chart_type,
                    type: chart.type,
                    source: chart.source,
                    custom_options: chart.custom_options,
                    show_values_over_chart: chart.show_values_over_chart,
                    timeseries: chart.timeseries
                }
            }
        })

        return true
    } catch (error) {
        console.error('Failed to save dashboard chart:', error)
        return false
    }
}

/**
 * Delete dashboard chart
 */
export async function deleteDashboardChart(chartName: string): Promise<boolean> {
    try {
        await desk.call({
            method: 'frappe.client.delete',
            args: {
                doctype: 'Dashboard Chart',
                name: chartName
            }
        })

        return true
    } catch (error) {
        console.error('Failed to delete dashboard chart:', error)
        return false
    }
}

/**
 * Get list of all dashboard charts
 */
export async function listDashboardCharts(filters?: Record<string, any>): Promise<DashboardChart[]> {
    try {
        const response = await desk.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Dashboard Chart',
                filters: filters || {},
                fields: ['name', 'chart_name', 'type', 'source', 'module'],
                limit_page_length: 500
            }
        })

        if (response.exc) {
            console.error('Error fetching dashboard charts:', response.exc)
            return []
        }

        return response.message || []
    } catch (error) {
        console.error('Failed to list dashboard charts:', error)
        return []
    }
}

/**
 * Get charts by module
 */
export async function getDashboardChartsByModule(moduleName: string): Promise<DashboardChart[]> {
    return listDashboardCharts({
        module: moduleName,
        disabled: 0
    })
}

/**
 * Get charts by doctype source
 */
export async function getDashboardChartsBySource(doctype: string): Promise<DashboardChart[]> {
    return listDashboardCharts({
        source: doctype,
        disabled: 0
    })
}

/**
 * Add chart to dashboard
 */
export async function addChartToDashboard(
    dashboardName: string,
    chartName: string,
    chartLabel?: string
): Promise<boolean> {
    try {
        // Note: This assumes a Dashboard DocType exists
        // Adjust based on your actual dashboard structure
        await desk.call({
            method: 'frappe.client.set_value',
            args: {
                doctype: 'Dashboard',
                name: dashboardName,
                fieldname: 'charts',
                value: JSON.stringify([
                    chartName,
                    ...(chartLabel ? [chartLabel] : [])
                ])
            }
        })

        return true
    } catch (error) {
        console.error('Failed to add chart to dashboard:', error)
        return false
    }
}

/**
 * Calculate key metrics from chart data
 */
export function calculateMetrics(data: ChartData[]): {
    total: number
    average: number
    max: number
    min: number
    trend: 'up' | 'down' | 'neutral'
} {
    if (!data || data.length === 0) {
        return {
            total: 0,
            average: 0,
            max: 0,
            min: 0,
            trend: 'neutral'
        }
    }

    const allValues = data.flatMap(series =>
        series.data.map(point => (typeof point.y === 'number' ? point.y : 0))
    )

    const total = allValues.reduce((sum, val) => sum + val, 0)
    const average = allValues.length > 0 ? total / allValues.length : 0
    const max = Math.max(...allValues)
    const min = Math.min(...allValues)

    // Determine trend based on first vs last values
    let trend: 'up' | 'down' | 'neutral' = 'neutral'
    if (allValues.length > 1) {
        const first = allValues[0]
        const last = allValues[allValues.length - 1]
        if (first && last) {
            if (last > first) trend = 'up'
            else if (last < first) trend = 'down'
        }
    }

    return {
        total,
        average,
        max,
        min,
        trend
    }
}

/**
 * Export chart data to CSV
 */
export function exportChartDataToCSV(
    chartName: string,
    data: ChartData[]
): string {
    const headers = ['Series', 'X', 'Y']
    const rows = [headers.join(',')]

    data.forEach(series => {
        series.data.forEach(point => {
            const xValue = typeof point.x === 'string' ? point.x : String(point.x)
            const yValue = typeof point.y === 'number' ? point.y : JSON.stringify(point.y)
            rows.push(`"${series.name}","${xValue}",${yValue}`)
        })
    })

    return rows.join('\n')
}

/**
 * Export chart data to JSON
 */
export function exportChartDataToJSON(
    chartName: string,
    chart: DashboardChart,
    data: ChartData[]
): string {
    return JSON.stringify({
        chart: {
            name: chart.name,
            title: chart.chart_name,
            type: chart.type,
            source: chart.source
        },
        exportedAt: new Date().toISOString(),
        data
    }, null, 2)
}

/**
 * Trigger chart data refresh
 */
export async function refreshChartData(chartName: string): Promise<boolean> {
    try {
        await desk.call({
            method: 'frappe.client.set_value',
            args: {
                doctype: 'Dashboard Chart',
                name: chartName,
                fieldname: 'last_synced_on',
                value: new Date().toISOString()
            }
        })

        return true
    } catch (error) {
        console.error('Failed to refresh chart:', error)
        return false
    }
}

/**
 * Check if user has permission to view chart
 */
export async function canViewChart(chartName: string): Promise<boolean> {
    try {
        const response = await desk.call({
            method: 'frappe.client.has_permission',
            args: {
                doctype: 'Dashboard Chart',
                name: chartName,
                perm_type: 'read'
            }
        })

        return response.message === true
    } catch (error) {
        console.error('Failed to check chart permission:', error)
        return false
    }
}

/**
 * Get dashboard chart statistics
 */
export function getChartStatistics(
    data: ChartData[]
): Record<string, any> {
    if (!data || data.length === 0) {
        return {}
    }

    const stats: Record<string, any> = {}

    data.forEach(series => {
        const values = series.data.map(point => (typeof point.y === 'number' ? point.y : 0))

        if (values.length === 0) return

        stats[series.name] = {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            average: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            median: getMedian(values),
            stdDev: calculateStdDev(values)
        }
    })

    return stats
}

/**
 * Helper: Calculate median
 */
function getMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Helper: Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const squareDiffs = values.map(value => Math.pow(value - avg, 2))
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length
    return Math.sqrt(avgSquareDiff)
}

/**
 * Validate dashboard chart configuration
 */
export function validateChartConfig(chart: Partial<DashboardChart>): {
    valid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (!chart.chart_name) errors.push('Chart name is required')
    if (!chart.type) errors.push('Chart type is required')
    if (!chart.source) errors.push('Data source is required')

    // Validate chart type
    const validTypes = ['line', 'area', 'bar', 'pie', 'donut', 'radar', 'scatter', 'bubble', 'heatmap', 'candlestick', 'radialBar', 'timeline']
    if (chart.type && !validTypes.includes(chart.type)) {
        errors.push(`Invalid chart type: ${chart.type}`)
    }

    // Validate custom options if provided
    if (chart.custom_options) {
        try {
            JSON.parse(chart.custom_options)
        } catch (e) {
            errors.push('Invalid JSON in custom options')
        }
    }

    return {
        valid: errors.length === 0,
        errors
    }
}
