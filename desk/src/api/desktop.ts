import { desk } from '../utils/desk'
import { APP_SIDEBARS, type SidebarItem } from '../data/app_sidebar'
import type { AppInfo } from '../types'

export interface Module {
  name: string
  title: string
  module_name: string
  description?: string
  publisher?: string
  icon?: string
}

export interface DocType {
  name: string
  label: string
  module: string
  description?: string
  icon?: string
  type?: string
}

export interface SearchItem {
  name: string
  label?: string
  title?: string
  description?: string
  module?: string
  module_name?: string
  icon?: string
  type: 'doctype' | 'module' | 'workspace' | 'page'
}

export interface SearchData {
  doctypes: SearchItem[]
  modules: SearchItem[]
  pages: SearchItem[]
  workspace: SearchItem[]
  recent: SearchItem[]
}

class DesktopAPI {
  private searchDataCache: SearchData | null = null
  private appsCache: AppInfo[] | null = null
  private lastFetchTime: number = 0
  private cacheDuration: number = 5 * 60 * 1000 // 5 minutes

  /**
   * Get all installed applications from the backend API
   */
  async getInstalledApps(): Promise<AppInfo[]> {
    try {
      if (this.appsCache && Date.now() - this.lastFetchTime < this.cacheDuration) {
        return this.appsCache
      }

      const response = await desk.call({
        method: 'desktop.api.apps.get_installed_apps'
      })

      if (response.message) {
        this.appsCache = response.message
        this.lastFetchTime = Date.now()
        return response.message
      }

      return []
    } catch (error) {
      console.error('Failed to fetch installed apps:', error)
      // Fallback to boot data
      if (window.desk?.boot?.modules) {
        return Object.entries(window.desk.boot.modules).map(([key, module]: any) => ({
          name: key,
          title: module.label || key,
          module_name: key,
          description: module.description || '',
          icon: module.icon
        }))
      }
      return []
    }
  }

  /**
   * Get bench apps that are not installed on this site
   */
  async getAvailableApps(): Promise<AppInfo[]> {
    try {
      const response = await desk.call({
        method: 'desktop.api.apps.get_available_apps'
      })

      if (response.message) {
        return response.message
      }

      return []
    } catch (error) {
      console.error('Failed to fetch available apps:', error)
      return []
    }
  }

  /**
   * Install an app from bench
   */
  async installApp(app: string): Promise<any> {
    const response = await desk.call({
      method: 'desktop.api.apps.install_app',
      args: { app },
      freeze: true,
      freeze_message: `Installing ${app}...`
    })

    // Clear all caches to ensure new doctypes appear immediately
    this.appsCache = null
    this.searchDataCache = null
    this.lastFetchTime = 0
    return response.message
  }

  /**
   * Uninstall an app from this site
   */
  async uninstallApp(app: string): Promise<any> {
    const response = await desk.call({
      method: 'desktop.api.apps.uninstall_app',
      args: { app },
      freeze: true,
      freeze_message: `Uninstalling ${app}...`
    })

    // Clear all caches to ensure removed doctypes disappear immediately
    this.appsCache = null
    this.searchDataCache = null
    this.lastFetchTime = 0
    return response.message
  }

  /**
   * Get all searchable items (doctypes, modules, workspaces, etc.)
   * This is loaded once and cached for the search dialog
   */
  async getSearchData(): Promise<SearchData> {
    try {
      // Return cached data if fresh
      if (this.searchDataCache && Date.now() - this.lastFetchTime < this.cacheDuration) {
        return this.searchDataCache
      }

      const response = await desk.call({
        method: 'desktop.api.apps.get_search_data'
      })

      if (response.message) {
        this.searchDataCache = response.message
        this.lastFetchTime = Date.now()
        return response.message
      }

      return {
        doctypes: [],
        modules: [],
        pages: [],
        workspace: [],
        recent: []
      }
    } catch (error) {
      console.error('Failed to fetch search data:', error)
      return {
        doctypes: [],
        modules: [],
        pages: [],
        workspace: [],
        recent: []
      }
    }
  }

  /**
   * Get doctypes for a specific module
   */
  async getModuleDoctypes(module: string): Promise<string[]> {
    try {
      const response = await desk.call({
        method: 'desktop.api.apps.get_module_doctypes',
        args: { module_name: module }
      })

      if (response.message) {
        return response.message.map((dt: any) => dt.name || dt)
      }

      return []
    } catch (error) {
      console.error(`Failed to fetch doctypes for module ${module}:`, error)
      return []
    }
  }

  /**
   * Get sidebar items for a module. Attempts server call, falls back to frontend data.
   */
  async getModuleSidebar(app: string): Promise<SidebarItem[]> {
    try {
      const response = await desk.call({
        method: 'desktop.api.apps.get_module_sidebar',
        args: { app }
      })

      if (response.message) {
        return response.message
      }

      // fallback to bundled data
      return APP_SIDEBARS[app] || []
    } catch (error) {
      console.error(`Failed to fetch sidebar for module ${app}:`, error)
      return APP_SIDEBARS[app] || []
    }
  }

  /**
   * Search doctypes by query
   */
  async searchDocTypes(query: string): Promise<SearchItem[]> {
    try {
      if (!query || query.length < 2) {
        return []
      }

      const response = await desk.call({
        method: 'desktop.api.apps.search_doctypes',
        args: { query }
      })

      if (response.message) {
        return response.message
      }

      return []
    } catch (error) {
      console.error('Failed to search doctypes:', error)
      return []
    }
  }

  /**
   * Perform comprehensive search across all data
   * This searches the cached search data for fast results
   */
  async search(query: string): Promise<SearchItem[]> {
    try {
      if (!query || query.length < 2) {
        return []
      }

      // Make sure search data is loaded
      if (!this.searchDataCache) {
        await this.getSearchData()
      }

      if (!this.searchDataCache) {
        return []
      }

      const queryLower = query.toLowerCase()
      const results: SearchItem[] = []
      const seen = new Set<string>()

      // Search in recent items first (higher priority)
      for (const item of this.searchDataCache.recent || []) {
        const key = `${item.type}-${item.name}`
        if (!seen.has(key)) {
          if (
            (item.name?.toLowerCase().includes(queryLower) ||
              item.label?.toLowerCase().includes(queryLower) ||
              item.title?.toLowerCase().includes(queryLower) ||
              item.description?.toLowerCase().includes(queryLower)) &&
            item.type === 'doctype'
          ) {
            results.push(item)
            seen.add(key)
          }
        }
      }

      // Search in doctypes
      for (const item of this.searchDataCache.doctypes || []) {
        const key = `${item.type}-${item.name}`
        if (!seen.has(key) && results.length < 20) {
          if (
            item.name?.toLowerCase().includes(queryLower) ||
            item.label?.toLowerCase().includes(queryLower) ||
            item.description?.toLowerCase().includes(queryLower)
          ) {
            results.push(item)
            seen.add(key)
          }
        }
      }

      // Search in modules
      for (const item of this.searchDataCache.modules || []) {
        const key = `${item.type}-${item.name}`
        if (!seen.has(key) && results.length < 20) {
          if (
            item.name?.toLowerCase().includes(queryLower) ||
            item.title?.toLowerCase().includes(queryLower) ||
            item.description?.toLowerCase().includes(queryLower)
          ) {
            results.push(item)
            seen.add(key)
          }
        }
      }

      // Search in workspaces
      for (const item of this.searchDataCache.workspace || []) {
        const key = `${item.type}-${item.name}`
        if (!seen.has(key) && results.length < 20) {
          if (
            item.name?.toLowerCase().includes(queryLower) ||
            item.label?.toLowerCase().includes(queryLower) ||
            item.description?.toLowerCase().includes(queryLower)
          ) {
            results.push(item)
            seen.add(key)
          }
        }
      }

      return results.slice(0, 20)
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }
}

export const desktopAPI = new DesktopAPI()
