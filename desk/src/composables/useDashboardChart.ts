/**
 * Composable for Dashboard Chart loading and management
 */

import { ref, onMounted } from "vue";
import { resource as desk } from "../utils/resource";
import type {
  DashboardChart,
  ChartData,
  ApexChartOptions,
} from "../types/dashboard";

export function useDashboardChart(chartName: string) {
  const chart = ref<DashboardChart | null>(null);
  const data = ref<ChartData[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const options = ref<ApexChartOptions>({});

  /**
   * Load dashboard chart metadata
   */
  const loadChartMeta = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await desk.call({
        method: "frappe.client.get",
        args: {
          doctype: "Dashboard Chart",
          name: chartName,
        },
      });

      if (response.exc) {
        throw new Error(response.exc);
      }

      chart.value = response.message as DashboardChart;
      await loadChartData();
    } catch (err: any) {
      error.value = err.message || "Failed to load chart";
      console.error("Load chart meta error:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load chart data based on source
   */
  const loadChartData = async () => {
    if (!chart.value) return;

    try {
      loading.value = true;

      // Parse filters if provided
      const filters = chart.value.filters_json
        ? JSON.parse(chart.value.filters_json)
        : {};

      const response = await desk.call({
        method: "frappe.client.get_list",
        args: {
          doctype: chart.value.source,
          fields: ["*"],
          filters,
          limit_page_length: 500,
        },
      });

      if (response.exc) {
        throw new Error(response.exc);
      }

      // Transform list data into chart data format
      data.value = transformDataForChart(response.message || []);
      generateChartOptions();
    } catch (err: any) {
      error.value = err.message || "Failed to load chart data";
      console.error("Load chart data error:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Transform list data into chart-friendly format
   */
  const transformDataForChart = (items: any[]): ChartData[] => {
    if (!items.length) return [];

    // Group by the first field as series name
    const grouped: Record<string, any[]> = {};

    items.forEach((item) => {
      const key =
        item[chart.value?.number_of_groups ? `group_${1}` : "name"] || "Series";
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return Object.entries(grouped).map(([name, items]) => ({
      name,
      data: items.map((item) => ({
        x: item.name || item.date || new Date(),
        y: item.value || item.amount || 0,
      })),
    }));
  };

  /**
   * Generate ApexCharts options from dashboard chart config
   */
  const generateChartOptions = () => {
    if (!chart.value) return;

    const customOptions = chart.value.custom_options
      ? JSON.parse(chart.value.custom_options)
      : {};

    const baseOptions: ApexChartOptions = {
      chart: {
        type: chart.value.type,
        height: chart.value.height || 400,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 150,
          },
        },
      },
      series: data.value,
      xaxis: {
        type: chart.value.timeseries ? "datetime" : "category",
        categories: data.value[0]?.data.map((d) => d.x) || [],
      },
      yaxis: {
        title: {
          text: "Value",
        },
      },
      title: {
        text: chart.value.chart_name,
        align: "center",
        style: {
          fontSize: "16px",
          fontWeight: 600,
          color: "#64748b",
        },
      },
      dataLabels: {
        enabled: chart.value.show_values_over_chart,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      colors: [
        "#3b82f6",
        "#ef4444",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
        "#f97316",
        "#06b6d4",
        "#6366f1",
      ],
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: {
              height: 350,
            },
          },
        },
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 300,
            },
          },
        },
      ],
    };

    options.value = {
      ...baseOptions,
      ...customOptions,
    };
  };

  /**
   * Refresh chart data
   */
  const refresh = async () => {
    await loadChartData();
  };

  onMounted(() => {
    loadChartMeta();
  });

  return {
    chart,
    data,
    loading,
    error,
    options,
    refresh,
    transformDataForChart,
  };
}

/**
 * Composable for loading multiple dashboard charts
 */
export function useDashboardCharts(chartNames: string[]) {
  const charts = ref<Map<string, DashboardChart>>(new Map());
  const allData = ref<Map<string, ChartData[]>>(new Map());
  const loading = ref(true);
  const error = ref<string | null>(null);

  const loadAllCharts = async () => {
    try {
      loading.value = true;
      error.value = null;

      const promises = chartNames.map((name) =>
        desk.call({
          method: "frappe.client.get",
          args: {
            doctype: "Dashboard Chart",
            name,
          },
        }),
      );

      const responses = await Promise.all(promises);

      responses.forEach((Response, index) => {
        if (!Response.exc && Response.message) {
          charts.value.set(
            chartNames[index] as string,
            Response.message as DashboardChart,
          );
        }
      });
    } catch (err: any) {
      error.value = err.message || "Failed to load charts";
      console.error("Load all charts error:", err);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadAllCharts();
  });

  return {
    charts,
    allData,
    loading,
    error,
    loadAllCharts,
  };
}
