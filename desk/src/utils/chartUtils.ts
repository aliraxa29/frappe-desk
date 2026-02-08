/**
 * Utility functions for chart configuration and formatting
 */

import type { ApexChartOptions, ApexChartType, ChartData } from '../types/dashboard'

/**
 * Color palettes for different themes
 */
export const chartColorPalettes = {
    default: [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#6366f1'
    ],
    pastel: [
        '#a78bfa', '#f87171', '#86efac', '#fbbf24', '#c4b5fd',
        '#f472b6', '#2dd4bf', '#fed7aa', '#7dd3fc', '#a5f3fc'
    ],
    vibrant: [
        '#0ea5e9', '#dc2626', '#22c55e', '#eab308', '#a855f7',
        '#e911a0', '#06b6d4', '#ea580c', '#0891b2', '#4f46e5'
    ],
    dark: [
        '#1e40af', '#991b1b', '#065f46', '#78350f', '#3730a3',
        '#831843', '#155e75', '#7c1d12', '#0c4a6e', '#312e81'
    ]
}

/**
 * Get chart options template by type
 */
export function getChartTemplate(type: ApexChartType): ApexChartOptions {
    const templates: Record<ApexChartType, ApexChartOptions> = {
        line: {
            chart: {
                type: 'line',
                zoom: { enabled: true },
                toolbar: { show: true }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            markers: {
                size: 4
            }
        },
        area: {
            chart: {
                type: 'area',
                zoom: { enabled: true },
                toolbar: { show: true }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [20, 100, 100, 100]
                }
            }
        },
        bar: {
            chart: {
                type: 'bar',
                toolbar: { show: true }
            },
            barDataLabels: {
                position: 'top'
            },
            plotOptions: {
                bar: {
                    columnWidth: '45%',
                    distributed: false
                }
            }
        },
        pie: {
            chart: {
                type: 'pie',
                toolbar: { show: true }
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        offset: -5
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: (val: number) => `${val.toFixed(0)}%`
            }
        },
        donut: {
            chart: {
                type: 'donut',
                toolbar: { show: true }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            name: {
                                fontSize: '14px'
                            },
                            value: {
                                fontSize: '18px',
                                fontWeight: 600
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: true
            }
        },
        radar: {
            chart: {
                type: 'radar',
                toolbar: { show: true },
                zoom: { enabled: false }
            },
            plotOptions: {
                radar: {
                    size: 140,
                    polygons: {
                        strokeColors: '#e0e0e0',
                        fill: {
                            colors: ['#f3f3f3', '#fff']
                        }
                    }
                }
            }
        },
        scatter: {
            chart: {
                type: 'scatter',
                zoom: { enabled: true },
                toolbar: { show: true }
            },
            xaxis: {
                tickAmount: 5
            },
            yaxis: {
                tickAmount: 5
            }
        },
        bubble: {
            chart: {
                type: 'bubble',
                zoom: { enabled: true },
                toolbar: { show: true }
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#fff']
                }
            }
        },
        heatmap: {
            chart: {
                type: 'heatmap',
                toolbar: { show: true }
            },
            plotOptions: {
                heatmap: {
                    shadeIntensity: 0.5,
                    radius: 0,
                    useFillColorAsStroke: true,
                    colorScale: {
                        ranges: [
                            {
                                from: 0,
                                to: 50,
                                name: 'Low',
                                color: '#97e3d5'
                            },
                            {
                                from: 51,
                                to: 100,
                                name: 'Medium',
                                color: '#fcc468'
                            },
                            {
                                from: 101,
                                to: 200,
                                name: 'High',
                                color: '#ff6b6b'
                            }
                        ]
                    }
                }
            }
        },
        candlestick: {
            chart: {
                type: 'candlestick',
                toolbar: { show: true }
            },
            plotOptions: {
                candlestick: {
                    colors: {
                        upward: '#10b981',
                        downward: '#ef4444'
                    },
                    wick: {
                        useFillColor: true
                    }
                }
            }
        },
        boxPlot: {
            chart: {
                type: 'boxPlot',
                toolbar: { show: true }
            }
        },
        timeline: {
            chart: {
                type: 'timeline',
                toolbar: { show: true }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '80%'
                }
            }
        },
        treemap: {
            chart: {
                type: 'treemap',
                toolbar: { show: true }
            }
        },
        sunburst: {
            chart: {
                type: 'sunburst',
                toolbar: { show: true }
            }
        },
        radialBar: {
            chart: {
                type: 'radialBar',
                toolbar: { show: true }
            },
            plotOptions: {
                radialBar: {
                    startAngle: -135,
                    endAngle: 225,
                    hollow: {
                        margin: 0,
                        size: '70%',
                        background: 'transparent',
                        image: undefined,
                        imageOffsetX: 0,
                        imageOffsetY: 0,
                        labels: {
                            value: {
                                show: true,
                                color: '#64748b',
                                fontSize: '16px',
                                fontWeight: 600,
                                offsetY: 16
                            },
                            name: {
                                show: false
                            }
                        }
                    },
                    track: {
                        background: '#f1f5f9',
                        strokeWidth: '97%',
                        margin: 5,
                        dropShadow: {
                            enabled: false,
                            top: 2,
                            left: 0,
                            blur: 2,
                            color: '#000000',
                            opacity: 0.15
                        }
                    },
                    dataLabels: {
                        show: true,
                        name: {
                            offsetY: -10,
                            show: true,
                            color: '#64748b',
                            fontSize: '13px'
                        },
                        value: {
                            formatter(val: number) {
                                return parseInt(val.toString()) + '%'
                            },
                            color: '#3b82f6',
                            fontSize: '32px',
                            show: true
                        }
                    }
                }
            }
        }
    }

    return templates[type] || templates.line
}

/**
 * Format number as currency
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value)
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value)
}

/**
 * Format date for chart display
 */
export function formatChartDate(date: Date | string, format: string = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date

    const formats: Record<string, any> = {
        short: { month: 'short', day: 'numeric' },
        medium: { month: 'short', day: 'numeric', year: '2-digit' },
        long: { month: 'long', day: 'numeric', year: 'numeric' },
        time: { hour: 'numeric', minute: '2-digit' },
        datetime: { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
    }

    return d.toLocaleDateString('en-US', formats[format] || formats.short)
}

/**
 * Calculate chart height based on type
 */
export function calculateChartHeight(type: ApexChartType): number {
    const heights: Record<ApexChartType, number> = {
        pie: 350,
        donut: 350,
        radialBar: 380,
        radar: 400,
        heatmap: 450,
        timeline: 300,
        treemap: 350,
        sunburst: 350,
        candlestick: 400,
        boxPlot: 400,
        scatter: 400,
        bubble: 400,
        line: 400,
        area: 400,
        bar: 400
    }

    return heights[type] || 400
}

/**
 * Get tooltip content based on field type
 */
export function getTooltipFormatter(fieldType?: string): (value: number) => string {
    const formatters: Record<string, (val: number) => string> = {
        Currency: (val) => formatCurrency(val),
        Int: (val) => formatNumber(val, 0),
        Float: (val) => formatNumber(val, 2),
        Percent: (val) => `${val.toFixed(1)}%`,
        default: (val) => formatNumber(val, 2)
    }

    return formatters[fieldType || 'default'] || formatters.default
}

/**
 * Merge chart options with defaults
 */
export function mergeChartOptions(
    type: ApexChartType,
    customOptions?: Record<string, any>,
    data?: ChartData[]
): ApexChartOptions {
    const template = getChartTemplate(type)

    const merged: ApexChartOptions = {
        ...template,
        ...customOptions,
        chart: {
            ...template.chart,
            ...customOptions?.chart
        },
        plotOptions: {
            ...template.plotOptions,
            ...customOptions?.plotOptions
        }
    }

    if (data && data.length > 0) {
        merged.series = data
    }

    return merged
}

/**
 * Get responsive breakpoints
 */
export function getResponsiveOptions(): ApexChartOptions['responsive'] {
    return [
        {
            breakpoint: 1920,
            options: {
                chart: { height: 500 }
            }
        },
        {
            breakpoint: 1440,
            options: {
                chart: { height: 450 }
            }
        },
        {
            breakpoint: 1024,
            options: {
                chart: { height: 400 },
                legend: { position: 'bottom' }
            }
        },
        {
            breakpoint: 768,
            options: {
                chart: { height: 350 },
                plotOptions: {
                    bar: { columnWidth: '55%' }
                }
            }
        },
        {
            breakpoint: 480,
            options: {
                chart: { height: 250 },
                plotOptions: {
                    bar: { columnWidth: '65%' }
                },
                legend: { position: 'bottom', offsetY: 10 }
            }
        }
    ]
}
