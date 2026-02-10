import { desk } from "../utils/desk";

export interface MarketplaceApp {
  app_name: string;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  repo_url: string;
  version?: string;
  pricing?: "Free" | "Paid" | "Trial";
  author_name?: string;
  author_email?: string;
  tags?: string;
  homepage_url?: string;
  docs_url?: string;
  screenshots?: string;
  status?: "Pending" | "Approved" | "Rejected";
  submitted_by?: string;
  published_at?: string;
}

export interface MarketplaceFilters {
  status?: "Pending" | "Approved" | "Rejected";
  pricing?: "Free" | "Paid" | "Trial";
  tags?: string;
}

/**
 * Marketplace API - READONLY ACCESS WITH INSTALLATION
 * Fetches apps and handles free app installations from marketplace
 */
class MarketplaceAPI {
  /**
   * Get marketplace apps with optional filters
   * @param filters - Optional filters for status, pricing, tags
   * @returns Array of marketplace apps
   */
  async getMarketplaceApps(
    filters?: MarketplaceFilters,
  ): Promise<MarketplaceApp[]> {
    try {
      const response = await desk.call({
        method: "desktop.api.get_marketplace_apps",
      });
      let apps = response.message.data || [];

      // Apply client-side filtering for pricing and tags if provided
      if (filters?.pricing) {
        apps = apps.filter(
          (app: MarketplaceApp) => app.pricing === filters.pricing,
        );
      }

      if (filters?.tags) {
        apps = apps.filter(
          (app: MarketplaceApp) =>
            app.tags?.toLowerCase().includes(filters.tags!.toLowerCase()),
        );
      }

      return apps;
    } catch (error) {
      console.error("Failed to fetch marketplace apps:", error);
      return [];
    }
  }

  /**
   * Get a single marketplace app by name
   * @param appName - The app_name to fetch
   * @returns Marketplace app details or null
   */
  async getMarketplaceApp(appName: string): Promise<MarketplaceApp | null> {
    try {
      const response = await desk.call({
        method: "frappe.client.get",
        args: {
          doctype: "Marketplace App",
          name: appName,
        },
      });

      return response.message || null;
    } catch (error) {
      console.error(`Failed to fetch marketplace app ${appName}:`, error);
      return null;
    }
  }

  /**
   * Search marketplace apps by keyword
   * @param keyword - Search keyword
   * @returns Array of matching marketplace apps
   */
  async searchMarketplaceApps(keyword: string): Promise<MarketplaceApp[]> {
    if (!keyword?.trim()) {
      return this.getMarketplaceApps();
    }

    try {
      const apps = await this.getMarketplaceApps();
      const searchLower = keyword.toLowerCase();

      return apps.filter(
        (app) =>
          app.title?.toLowerCase().includes(searchLower) ||
          app.description?.toLowerCase().includes(searchLower) ||
          app.app_name?.toLowerCase().includes(searchLower) ||
          app.tags?.toLowerCase().includes(searchLower),
      );
    } catch (error) {
      console.error("Failed to search marketplace apps:", error);
      return [];
    }
  }

  /**
   * Get available pricing options
   * @returns Array of unique pricing options
   */
  async getPricingOptions(): Promise<string[]> {
    try {
      const apps = await this.getMarketplaceApps();
      const pricingSet = new Set(
        apps.map((app) => app.pricing).filter(Boolean) as string[],
      );
      return Array.from(pricingSet).sort();
    } catch (error) {
      console.error("Failed to get pricing options:", error);
      return [];
    }
  }

  /**
   * Get available tags
   * @returns Array of unique tags
   */
  async getAvailableTags(): Promise<string[]> {
    try {
      const apps = await this.getMarketplaceApps();
      const tagsSet = new Set<string>();

      apps.forEach((app) => {
        if (app.tags) {
          app.tags.split(",").forEach((tag) => {
            const trimmedTag = tag.trim();
            if (trimmedTag) {
              tagsSet.add(trimmedTag);
            }
          });
        }
      });

      return Array.from(tagsSet).sort();
    } catch (error) {
      console.error("Failed to get available tags:", error);
      return [];
    }
  }

  /**
   * Install a free marketplace app by cloning from GitHub and installing
   * @param repoUrl - GitHub repository URL
   * @param appName - Optional app name (extracted from URL if not provided)
   * @returns Installation status
   */
  async installMarketplaceApp(repoUrl: string, appName?: string): Promise<any> {
    try {
      const response = await desk.call({
        method: "desktop.api.install_marketplace_app",
        args: {
          repo_url: repoUrl,
          app_name: appName,
        },
      });

      return response.message || response;
    } catch (error) {
      console.error(
        `Failed to install marketplace app from ${repoUrl}:`,
        error,
      );
      throw error;
    }
  }
}

export const marketplaceAPI = new MarketplaceAPI();
