/**
 * Pre-configured dashboard examples with various chart types
 */

import type {
  DashboardFilter,
  DashboardMetric,
} from "../components/dashboard/DashboardContainer.vue";

/**
 * Sales Dashboard Configuration
 */
export const salesDashboardConfig = {
  title: "Sales Dashboard",
  description:
    "Monitor sales performance and revenue metrics across all channels",
  metrics: [
    {
      label: "Total Revenue",
      value: 125000,
      valueType: "currency" as const,
      icon: "lucide:dollar-sign",
      iconColor: "green" as const,
      change: 12.5,
      compareLabel: "last month",
    },
    {
      label: "Total Orders",
      value: 1234,
      valueType: "number" as const,
      icon: "lucide:shopping-cart",
      iconColor: "blue" as const,
      change: 8.3,
      compareLabel: "last month",
    },
    {
      label: "Conversion Rate",
      value: 3.45,
      valueType: "percent" as const,
      icon: "lucide:percent",
      iconColor: "purple" as const,
      change: -1.2,
      compareLabel: "last month",
    },
    {
      label: "Avg Order Value",
      value: 101.5,
      valueType: "currency" as const,
      icon: "lucide:trending-up",
      iconColor: "yellow" as const,
      change: 5.8,
      compareLabel: "last month",
    },
  ] as DashboardMetric[],
  filters: [
    {
      name: "dateRange",
      label: "Date Range",
      type: "select" as const,
      options: [
        { label: "Last 7 Days", value: "7d" },
        { label: "Last 30 Days", value: "30d" },
        { label: "Last Quarter", value: "90d" },
        { label: "Year to Date", value: "ytd" },
      ],
    },
    {
      name: "region",
      label: "Region",
      type: "select" as const,
      options: [
        { label: "All Regions", value: "" },
        { label: "North", value: "north" },
        { label: "South", value: "south" },
        { label: "East", value: "east" },
        { label: "West", value: "west" },
      ],
    },
    {
      name: "channel",
      label: "Sales Channel",
      type: "select" as const,
      options: [
        { label: "All Channels", value: "" },
        { label: "Online", value: "online" },
        { label: "Retail", value: "retail" },
        { label: "Wholesale", value: "wholesale" },
      ],
    },
  ] as DashboardFilter[],
  chartNames: [
    "Sales by Region",
    "Revenue Trend",
    "Top Products",
    "Customer Acquisition",
    "Sales Pipeline",
    "Order Distribution",
    "Market Share",
    "Performance Scorecard",
  ],
  chartColumns: "responsive" as const,
  chartSpanConfig: {
    0: 2, // Sales by Region - spans 2 columns
    1: 2, // Revenue Trend - spans 2 columns
    4: 2, // Sales Pipeline - spans 2 columns
    7: 4, // Performance Scorecard - full width
  },
};

/**
 * Inventory Dashboard Configuration
 */
export const inventoryDashboardConfig = {
  title: "Inventory Dashboard",
  description: "Track warehouse stock levels and inventory movements",
  metrics: [
    {
      label: "Total Stock Value",
      value: 850000,
      valueType: "currency" as const,
      icon: "lucide:package",
      iconColor: "blue" as const,
      change: 3.2,
      compareLabel: "last month",
    },
    {
      label: "Stock Items",
      value: 5432,
      valueType: "number" as const,
      icon: "lucide:box",
      iconColor: "purple" as const,
      change: 1.5,
      compareLabel: "last month",
    },
    {
      label: "Low Stock Items",
      value: 34,
      valueType: "number" as const,
      icon: "lucide:alert-triangle",
      iconColor: "red" as const,
      change: -5.1,
      compareLabel: "last month",
    },
    {
      label: "Stock Turnover",
      value: 4.2,
      valueType: "number" as const,
      icon: "lucide:rotate-ccw",
      iconColor: "green" as const,
      change: 2.8,
      compareLabel: "last month",
    },
  ] as DashboardMetric[],
  filters: [
    {
      name: "warehouse",
      label: "Warehouse",
      type: "select" as const,
      options: [
        { label: "All Warehouses", value: "" },
        { label: "Main Warehouse", value: "main" },
        { label: "Secondary", value: "secondary" },
        { label: "Regional Hub", value: "regional" },
      ],
    },
    {
      name: "category",
      label: "Product Category",
      type: "select" as const,
      options: [
        { label: "All Categories", value: "" },
        { label: "Electronics", value: "electronics" },
        { label: "Clothing", value: "clothing" },
        { label: "Home Goods", value: "homegoods" },
      ],
    },
  ] as DashboardFilter[],
  chartNames: [
    "Warehouse wise Stock Value",
    "Stock Movement Trend",
    "Top Selling Items",
    "Stock Age Analysis",
    "Inventory Health",
    "ABC Analysis",
    "Reorder Status",
    "Warehouse Capacity",
  ],
  chartColumns: "responsive" as const,
  chartSpanConfig: {
    0: 2,
    1: 2,
    2: 1,
    3: 1,
    4: 2,
    5: 1,
    6: 1,
    7: 2,
  },
};

/**
 * Financial Dashboard Configuration
 */
export const financialDashboardConfig = {
  title: "Financial Dashboard",
  description: "Monitor financial performance and cash flow",
  metrics: [
    {
      label: "Total Revenue",
      value: 1250000,
      valueType: "currency" as const,
      icon: "lucide:trending-up",
      iconColor: "green" as const,
      change: 15.3,
      compareLabel: "last quarter",
    },
    {
      label: "Operating Expenses",
      value: 450000,
      valueType: "currency" as const,
      icon: "lucide:trending-down",
      iconColor: "red" as const,
      change: 8.2,
      compareLabel: "last quarter",
    },
    {
      label: "Profit Margin",
      value: 34.2,
      valueType: "percent" as const,
      icon: "lucide:percent",
      iconColor: "blue" as const,
      change: 2.1,
      compareLabel: "last quarter",
    },
    {
      label: "Cash Flow",
      value: 320000,
      valueType: "currency" as const,
      icon: "lucide:wallet",
      iconColor: "purple" as const,
      change: 11.5,
      compareLabel: "last quarter",
    },
  ] as DashboardMetric[],
  filters: [
    {
      name: "period",
      label: "Period",
      type: "select" as const,
      options: [
        { label: "Monthly", value: "monthly" },
        { label: "Quarterly", value: "quarterly" },
        { label: "Yearly", value: "yearly" },
      ],
    },
    {
      name: "department",
      label: "Department",
      type: "select" as const,
      options: [
        { label: "All Departments", value: "" },
        { label: "Sales", value: "sales" },
        { label: "Operations", value: "operations" },
        { label: "Admin", value: "admin" },
      ],
    },
  ] as DashboardFilter[],
  chartNames: [
    "Revenue Analysis",
    "Expense Distribution",
    "Cash Flow Forecast",
    "Profit Trend",
    "Budget vs Actual",
    "Income Statement",
    "Balance Sheet",
    "Financial Ratios",
  ],
  chartColumns: 2 as const,
};

/**
 * HR Dashboard Configuration
 */
export const hrDashboardConfig = {
  title: "HR Dashboard",
  description: "Monitor workforce metrics and HR analytics",
  metrics: [
    {
      label: "Total Employees",
      value: 342,
      valueType: "number" as const,
      icon: "lucide:users",
      iconColor: "blue" as const,
      change: 3.5,
      compareLabel: "last quarter",
    },
    {
      label: "Active Recruitment",
      value: 15,
      valueType: "number" as const,
      icon: "lucide:user-plus",
      iconColor: "green" as const,
      change: 0,
      compareLabel: "last month",
    },
    {
      label: "Employee Turnover",
      value: 2.1,
      valueType: "percent" as const,
      icon: "lucide:user-minus",
      iconColor: "red" as const,
      change: 0.3,
      compareLabel: "last month",
    },
    {
      label: "Training Hours",
      value: 450,
      valueType: "number" as const,
      icon: "lucide:book-open",
      iconColor: "purple" as const,
      change: 12.8,
      compareLabel: "last month",
    },
  ] as DashboardMetric[],
  filters: [
    {
      name: "department",
      label: "Department",
      type: "select" as const,
      options: [
        { label: "All Departments", value: "" },
        { label: "Engineering", value: "engineering" },
        { label: "Sales", value: "sales" },
        { label: "HR", value: "hr" },
      ],
    },
    {
      name: "status",
      label: "Employment Status",
      type: "select" as const,
      options: [
        { label: "All", value: "" },
        { label: "Active", value: "active" },
        { label: "On Leave", value: "leave" },
        { label: "Contracted", value: "contracted" },
      ],
    },
  ] as DashboardFilter[],
  chartNames: [
    "Employee Distribution",
    "Recruitment Pipeline",
    "Turnover Analysis",
    "Training Progress",
    "Salary Analysis",
    "Leave Utilization",
    "Department Performance",
    "Headcount Forecast",
  ],
  chartColumns: "responsive" as const,
};

/**
 * Get dashboard config by name
 */
export function getDashboardConfig(name: string) {
  const configMap: Record<string, any> = {
    sales: salesDashboardConfig,
    inventory: inventoryDashboardConfig,
    financial: financialDashboardConfig,
    hr: hrDashboardConfig,
  };

  return configMap[name.toLowerCase()] || salesDashboardConfig;
}

/**
 * All available dashboards
 */
export const availableDashboards = [
  {
    name: "sales",
    title: "Sales Dashboard",
    icon: "lucide:shopping-cart",
    description: "Monitor sales performance and revenue",
  },
  {
    name: "inventory",
    title: "Inventory Dashboard",
    icon: "lucide:package",
    description: "Track warehouse stock levels",
  },
  {
    name: "financial",
    title: "Financial Dashboard",
    icon: "lucide:trending-up",
    description: "Monitor financial performance",
  },
  {
    name: "hr",
    title: "HR Dashboard",
    icon: "lucide:users",
    description: "Monitor workforce metrics",
  },
];
