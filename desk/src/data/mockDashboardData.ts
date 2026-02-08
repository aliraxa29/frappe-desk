/**
 * Sample data and mock Frappe client for testing dashboard components
 */

import type { ChartData, DashboardChart } from '../types/dashboard'

/**
 * Mock dashboard charts data
 */
export const mockDashboardCharts: Record<string, DashboardChart> = {
    'Sales by Region': {
        name: 'Sales by Region',
        doctype: 'Dashboard Chart',
        chart_name: 'Sales by Region',
        chart_type: 'Custom',
        type: 'bar',
        source: 'Invoice',
        number_of_groups: 1,
        is_public: true,
        timeseries: false,
        show_values_over_chart: true,
        filters_json: '{}',
        custom_options: JSON.stringify({
            colors: ['#3b82f6']
        }),
        roles: [],
        y_axis: []
    },
    'Revenue Trend': {
        name: 'Revenue Trend',
        doctype: 'Dashboard Chart',
        chart_name: 'Revenue Trend',
        chart_type: 'Custom',
        type: 'line',
        source: 'Invoice',
        number_of_groups: 0,
        is_public: true,
        timeseries: true,
        show_values_over_chart: false,
        filters_json: '{}',
        custom_options: JSON.stringify({
            stroke: { curve: 'smooth', width: 3 }
        }),
        roles: [],
        y_axis: []
    },
    'Top Products': {
        name: 'Top Products',
        doctype: 'Dashboard Chart',
        chart_name: 'Top Products',
        chart_type: 'Custom',
        type: 'pie',
        source: 'Item',
        number_of_groups: 0,
        is_public: true,
        timeseries: false,
        show_values_over_chart: true,
        filters_json: '{}',
        custom_options: '{}',
        roles: [],
        y_axis: []
    },
    'Customer Acquisition': {
        name: 'Customer Acquisition',
        doctype: 'Dashboard Chart',
        chart_name: 'Customer Acquisition',
        chart_type: 'Custom',
        type: 'area',
        source: 'Customer',
        number_of_groups: 0,
        is_public: true,
        timeseries: true,
        show_values_over_chart: false,
        filters_json: '{}',
        custom_options: JSON.stringify({
            fill: { type: 'gradient' }
        }),
        roles: [],
        y_axis: []
    },
    'Sales Pipeline': {
        name: 'Sales Pipeline',
        doctype: 'Dashboard Chart',
        chart_name: 'Sales Pipeline',
        chart_type: 'Custom',
        type: 'donut',
        source: 'Opportunity',
        number_of_groups: 0,
        is_public: true,
        timeseries: false,
        show_values_over_chart: true,
        filters_json: '{}',
        custom_options: JSON.stringify({
            plotOptions: {
                pie: { donut: { size: '65%' } }
            }
        }),
        roles: [],
        y_axis: []
    },
    'Order Distribution': {
        name: 'Order Distribution',
        doctype: 'Dashboard Chart',
        chart_name: 'Order Distribution',
        chart_type: 'Custom',
        type: 'radar',
        source: 'Sales Order',
        number_of_groups: 0,
        is_public: true,
        timeseries: false,
        show_values_over_chart: false,
        filters_json: '{}',
        custom_options: '{}',
        roles: [],
        y_axis: []
    },
    'Market Share': {
        name: 'Market Share',
        doctype: 'Dashboard Chart',
        chart_name: 'Market Share',
        chart_type: 'Custom',
        type: 'scatter',
        source: 'Invoice',
        number_of_groups: 0,
        is_public: true,
        timeseries: false,
        show_values_over_chart: false,
        filters_json: '{}',
        custom_options: '{}',
        roles: [],
        y_axis: []
    },
    'Performance Scorecard': {
        name: 'Performance Scorecard',
        doctype: 'Dashboard Chart',
        chart_name: 'Performance Scorecard',
        chart_type: 'Custom',
        type: 'radialBar',
        source: 'Performance',
        number_of_groups: 0,
        is_public: true,
        timeseries: false,
        show_values_over_chart: true,
        filters_json: '{}',
        custom_options: JSON.stringify({
            colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']
        }),
        roles: [],
        y_axis: [],
        height: 500
    },
    'Warehouse wise Stock Value': {
        name: 'Warehouse wise Stock Value',
        doctype: 'Dashboard Chart',
        chart_name: 'Warehouse wise Stock Value',
        chart_type: 'Custom',
        type: 'heatmap',
        source: 'Stock Entry',
        number_of_groups: 0,
        is_public: true,
        timeseries: false,
        show_values_over_chart: false,
        filters_json: '{}',
        custom_options: '{}',
        roles: [],
        y_axis: []
    }
}

/**
 * Generate mock chart data based on chart type
 */
export function generateMockChartData(chartName: string): ChartData[] {
    const dataMap: Record<string, ChartData[]> = {
        'Sales by Region': [
            {
                name: 'Sales',
                data: [
                    { x: 'North', y: 45000 },
                    { x: 'South', y: 32000 },
                    { x: 'East', y: 28000 },
                    { x: 'West', y: 20000 }
                ]
            }
        ],
        'Revenue Trend': [
            {
                name: 'Revenue',
                data: [
                    { x: new Date(2024, 0, 1), y: 45000 },
                    { x: new Date(2024, 1, 1), y: 52000 },
                    { x: new Date(2024, 2, 1), y: 48000 },
                    { x: new Date(2024, 3, 1), y: 61000 },
                    { x: new Date(2024, 4, 1), y: 55000 },
                    { x: new Date(2024, 5, 1), y: 67000 }
                ]
            }
        ],
        'Top Products': [
            {
                name: 'Product A',
                data: [{ x: 'Product A', y: 35 }]
            },
            {
                name: 'Product B',
                data: [{ x: 'Product B', y: 25 }]
            },
            {
                name: 'Product C',
                data: [{ x: 'Product C', y: 20 }]
            },
            {
                name: 'Product D',
                data: [{ x: 'Product D', y: 20 }]
            }
        ],
        'Customer Acquisition': [
            {
                name: 'New Customers',
                data: [
                    { x: new Date(2024, 0, 1), y: 120 },
                    { x: new Date(2024, 1, 1), y: 145 },
                    { x: new Date(2024, 2, 1), y: 168 },
                    { x: new Date(2024, 3, 1), y: 192 },
                    { x: new Date(2024, 4, 1), y: 215 },
                    { x: new Date(2024, 5, 1), y: 248 }
                ]
            }
        ],
        'Sales Pipeline': [
            {
                name: 'Prospecting',
                data: [{ x: 'Prospecting', y: 25 }]
            },
            {
                name: 'Qualification',
                data: [{ x: 'Qualification', y: 35 }]
            },
            {
                name: 'Negotiation',
                data: [{ x: 'Negotiation', y: 25 }]
            },
            {
                name: 'Closed Won',
                data: [{ x: 'Closed Won', y: 15 }]
            }
        ],
        'Order Distribution': [
            {
                name: 'Electronics',
                data: [
                    { x: 'Q1', y: 35 },
                    { x: 'Q2', y: 41 },
                    { x: 'Q3', y: 35 },
                    { x: 'Q4', y: 51 },
                    { x: 'Q5', y: 49 },
                    { x: 'Q6', y: 62 }
                ]
            },
            {
                name: 'Clothing',
                data: [
                    { x: 'Q1', y: 40 },
                    { x: 'Q2', y: 36 },
                    { x: 'Q3', y: 41 },
                    { x: 'Q4', y: 35 },
                    { x: 'Q5', y: 40 },
                    { x: 'Q6', y: 45 }
                ]
            }
        ],
        'Market Share': [
            {
                name: 'Market Share',
                data: [
                    { x: 23, y: 11 },
                    { x: 32, y: 23 },
                    { x: 44, y: 17 },
                    { x: 52, y: 28 },
                    { x: 88, y: 45 }
                ]
            }
        ],
        'Performance Scorecard': [
            {
                name: 'Sales',
                data: [85]
            },
            {
                name: 'Marketing',
                data: [72]
            },
            {
                name: 'Operations',
                data: [91]
            },
            {
                name: 'Customer Service',
                data: [78]
            }
        ],
        'Warehouse wise Stock Value': [
            {
                name: 'Jan',
                data: [
                    { x: 'Product A', y: 120 },
                    { x: 'Product B', y: 90 },
                    { x: 'Product C', y: 110 }
                ]
            },
            {
                name: 'Feb',
                data: [
                    { x: 'Product A', y: 150 },
                    { x: 'Product B', y: 110 },
                    { x: 'Product C', y: 130 }
                ]
            },
            {
                name: 'Mar',
                data: [
                    { x: 'Product A', y: 180 },
                    { x: 'Product B', y: 130 },
                    { x: 'Product C', y: 160 }
                ]
            }
        ]
    }

    return dataMap[chartName] || []
}

/**
 * Create mock Frappe client for development
 */
export const mockFrappeClient = {
    call: async (options: any) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const { method, args } = options

                if (method === 'frappe.client.get') {
                    const chart = mockDashboardCharts[args.name]
                    if (chart) {
                        resolve({ message: chart })
                    } else {
                        resolve({ exc: null, message: chart })
                    }
                } else if (method === 'frappe.client.get_list') {
                    const data = generateMockChartData(args.doctype || '')
                    resolve({ message: data })
                } else {
                    resolve({ message: null })
                }
            }, 300)
        })
    }
}
