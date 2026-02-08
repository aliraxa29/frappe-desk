/**
 * Module icon mapping
 * Maps module names to their SVG icon paths
 */

export const MODULE_ICONS: Record<string, string> = {
  // Core modules
  selling: new URL("../assets/icons/selling.svg", import.meta.url).href,
  buying: new URL("../assets/icons/buying.svg", import.meta.url).href,
  stock: new URL("../assets/icons/stock.svg", import.meta.url).href,
  accounts: new URL("../assets/icons/accounts.svg", import.meta.url).href,
  crm: new URL("../assets/icons/crm.svg", import.meta.url).href,
  hr: new URL("../assets/icons/hr.svg", import.meta.url).href,
  projects: new URL("../assets/icons/projects.svg", import.meta.url).href,
  manufacturing: new URL("../assets/icons/manufacturing.svg", import.meta.url)
    .href,
  website: new URL("../assets/icons/website.svg", import.meta.url).href,
  setup: new URL("../assets/icons/setup.svg", import.meta.url).href,
  quality: new URL("../assets/icons/quality.svg", import.meta.url).href,
  agriculture: new URL("../assets/icons/agriculture.svg", import.meta.url).href,
  loan: new URL("../assets/icons/loan.svg", import.meta.url).href,
  tools: new URL("../assets/icons/tools.svg", import.meta.url).href,
  desk: new URL("../assets/icons/desk.svg", import.meta.url).href,

  // Aliases
  erpnext: new URL("../assets/icons/default.svg", import.meta.url).href,
  desktop: new URL("../assets/icons/desk.svg", import.meta.url).href,
};

/**
 * Get icon for a module
 * @param moduleName - Name of the module
 * @returns URL to the SVG icon, or default if not found
 */
export function getModuleIcon(moduleName: string): string {
  const normalizedName = moduleName.toLowerCase().replace(/[-_\s]/g, "");

  // Try exact match first
  const exactMatch = Object.entries(MODULE_ICONS).find(
    ([key]) => key.toLowerCase() === normalizedName,
  );
  if (exactMatch) {
    return exactMatch[1];
  }

  // Try partial match
  const partialMatch = Object.entries(MODULE_ICONS).find(
    ([key]) =>
      normalizedName.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedName),
  );
  if (partialMatch) {
    return partialMatch[1];
  }

  // Default fallback
  return new URL("../assets/icons/default.svg", import.meta.url).href;
}
