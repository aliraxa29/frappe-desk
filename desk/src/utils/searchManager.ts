/**
 * Search Manager - Frappe-like awesomebar with local searching
 * Loads all search data once at startup and searches locally (no API calls per search)
 */

import { desk } from './desk'
import { fuzzyMatch, getMarkedString } from './fuzzyMatch'
import { router } from '../router'

export interface SearchResult {
  type: 'doctype' | 'module' | 'workspace' | 'page' | 'report' | 'recent' | 'new' | 'calculator' | 'help' | 'search-in' | 'dashboard' | 'global'
  name: string
  label: string
  description?: string
  module?: string
  icon?: string
  score: number
  markedLabel?: string
  markedDescription?: string
  route?: string[]
  routeOptions?: Record<string, any>
  onclick?: () => void
}

export interface RecentItem {
  type: string
  name: string
  label: string
  route?: string[]
  timestamp: number
}

interface DocTypeInfo {
  name: string
  module: string
  istable: number
  issingle: number
}

interface ReportInfo {
  name: string
  ref_doctype: string
  report_type: string
  module?: string
}

interface PageInfo {
  name: string
  title: string
  route?: string
}

interface WorkspaceInfo {
  name: string
  title: string
  module?: string
}

interface DashboardInfo {
  name: string
  module?: string
}

interface AppInfo {
  name: string
  title: string
  module_name: string
}

class SearchManager {
  private recentItems: RecentItem[] = []
  private readonly RECENT_STORAGE_KEY = 'desk_recent_items'
  private readonly MAX_RECENT = 20

  // Cached data from server - loaded ONCE
  private doctypes: DocTypeInfo[] = []
  private reports: ReportInfo[] = []
  private pages: PageInfo[] = []
  private workspaces: WorkspaceInfo[] = []
  private dashboards: DashboardInfo[] = []
  private installedApps: AppInfo[] = []
  private validAppNames: Set<string> = new Set()
  private canCreate: string[] = []
  private canRead: string[] = []
  private dataLoaded = false
  private loadingPromise: Promise<void> | null = null

  constructor() {
    this.loadRecent()
  }

  /**
   * Load recent items from localStorage
   */
  private loadRecent() {
    try {
      const stored = localStorage.getItem(this.RECENT_STORAGE_KEY)
      if (stored) {
        this.recentItems = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load recent items:', e)
      this.recentItems = []
    }
  }

  /**
   * Save recent items to localStorage
   */
  private saveRecent() {
    try {
      localStorage.setItem(this.RECENT_STORAGE_KEY, JSON.stringify(this.recentItems))
    } catch (e) {
      console.error('Failed to save recent items:', e)
    }
  }

  /**
   * Add item to recent list
   */
  addRecent(type: string, name: string, label: string, route?: string[]) {
    this.recentItems = this.recentItems.filter((item) => !(item.type === type && item.name === name))
    this.recentItems.unshift({ type, name, label, route, timestamp: Date.now() })
    this.recentItems = this.recentItems.slice(0, this.MAX_RECENT)
    this.saveRecent()
  }

  /**
   * Get recent items formatted as SearchResults
   */
  getRecent(query: string = ''): SearchResult[] {
    let items = this.recentItems.slice(0, 10)

    if (query) {
      items = items.filter(item => {
        const [matched] = fuzzyMatch(query, item.label, false)
        return matched
      })
    }

    return items.map((item) => ({
      type: 'recent' as const,
      name: item.name,
      label: item.label,
      description: item.type,
      score: 80,
      route: item.route
    }))
  }

  /**
   * Load ALL search data once from server
   * Called at app startup or when CommandDialog opens
   */
  async loadSearchData(): Promise<void> {
    if (this.dataLoaded) return
    
    // Prevent multiple concurrent loads
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    this.loadingPromise = this._doLoadSearchData()
    await this.loadingPromise
    this.loadingPromise = null
  }

  private async _doLoadSearchData(): Promise<void> {
    try {
      // Load all data in parallel for faster loading
      const [doctypeRes, reportRes, pageRes, workspaceRes, dashboardRes, appsRes] = await Promise.all([
        desk.call({
          method: 'frappe.client.get_list',
          args: {
            doctype: 'DocType',
            fields: ['name', 'module', 'istable', 'issingle'],
            filters: [['istable', '=', 0]],
            limit_page_length: 0
          }
        }),
        desk.call({
          method: 'frappe.client.get_list',
          args: {
            doctype: 'Report',
            fields: ['name', 'ref_doctype', 'report_type', 'module'],
            filters: [['disabled', '=', 0]],
            limit_page_length: 0
          }
        }),
        desk.call({
          method: 'frappe.client.get_list',
          args: {
            doctype: 'Page',
            fields: ['name', 'title'],
            limit_page_length: 0
          }
        }),
        desk.call({
          method: 'frappe.client.get_list',
          args: {
            doctype: 'Workspace',
            fields: ['name', 'title', 'module'],
            limit_page_length: 0
          }
        }),
        desk.call({
          method: 'frappe.client.get_list',
          args: {
            doctype: 'Dashboard',
            fields: ['name', 'module'],
            limit_page_length: 0
          }
        }),
        desk.call({
          method: 'desktop.api.apps.get_installed_apps'
        })
      ])

      this.doctypes = doctypeRes.message || []
      this.reports = reportRes.message || []
      this.pages = pageRes.message || []
      this.workspaces = workspaceRes.message || []
      this.dashboards = dashboardRes.message || []
      this.installedApps = appsRes.message || []

      // Build valid app names set for validation
      this.validAppNames = new Set(
        this.installedApps.map(app => app.module_name?.toLowerCase().replace(/\s+/g, '_') || app.name.toLowerCase())
      )
      // Also add module names from doctypes
      this.doctypes.forEach(dt => {
        if (dt.module) {
          this.validAppNames.add(dt.module.toLowerCase().replace(/\s+/g, '_'))
        }
      })

      this.canRead = this.doctypes.map(dt => dt.name)
      this.canCreate = this.doctypes.filter(dt => !dt.issingle).map(dt => dt.name)

      this.dataLoaded = true
    } catch (error) {
      console.error('Failed to load search data:', error)
    }
  }

  /**
   * Get app name from module, with validation
   */
  getValidAppName(module: string | undefined): string {
    if (!module) return 'core'
    
    const appName = module.toLowerCase().replace(/\s+/g, '_')
    
    // Check if this is a valid app
    if (this.validAppNames.has(appName)) {
      return appName
    }

    // Try to find matching app
    for (const validApp of this.validAppNames) {
      if (validApp.includes(appName) || appName.includes(validApp)) {
        return validApp
      }
    }

    // Default to 'core' for unknown apps
    return 'core'
  }

  /**
   * Check if app exists
   */
  isValidApp(appName: string): boolean {
    return this.validAppNames.has(appName.toLowerCase())
  }

  /**
   * Enhanced fuzzy search with better scoring for exact/prefix matches
   * IMPORTANT: Exact match or starts-with should score highest
   */
  private fuzzySearchItems<T extends { name: string; label?: string; title?: string; module?: string }>(
    items: T[],
    query: string
  ): { item: T; score: number; markedLabel: string }[] {
    const results: { item: T; score: number; markedLabel: string }[] = []
    const queryLower = query.toLowerCase().trim()

    items.forEach((item) => {
      const searchText = item.label || item.title || item.name || ''
      const searchTextLower = searchText.toLowerCase()

      // Calculate base fuzzy match
      const [matched, fuzzyScore, matches] = fuzzyMatch(query, searchText, true)

      if (!matched || fuzzyScore <= 0) return

      let finalScore = fuzzyScore

      // PRIORITY SCORING for exact/prefix matches
      
      // 1. EXACT MATCH - highest priority (e.g., "Item" matches "Item")
      if (searchTextLower === queryLower) {
        finalScore += 10000
      }
      // 2. STARTS WITH query (e.g., "Item" matches "Item Group")
      else if (searchTextLower.startsWith(queryLower)) {
        // Shorter names that start with query get higher scores
        const lengthPenalty = Math.max(0, searchText.length - query.length) * 2
        finalScore += 5000 - lengthPenalty
      }
      // 3. Contains query as a whole word (e.g., "Item" in "Sales Item")
      else if (searchTextLower.includes(` ${queryLower}`) || searchTextLower.includes(`${queryLower} `)) {
        finalScore += 2000
      }
      // 4. Word starts with query (e.g., "Man" matches "Item Manufacturer" -> "Man" in Manufacturer)
      else if (searchTextLower.split(/[\s_-]/).some(word => word.startsWith(queryLower))) {
        finalScore += 1000
      }

      results.push({
        item,
        score: finalScore,
        markedLabel: getMarkedString(searchText, matches)
      })
    })

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * Calculate expression (calculator feature)
   */
  getCalculator(query: string): SearchResult[] {
    if (!query.startsWith('=')) return []

    const expression = query.substring(1).trim()
    if (!expression) return []

    try {
      // Safe evaluation of mathematical expressions only
      const safeExpression = expression.replace(/[^0-9+\-*/().%\s]/g, '')
      if (!safeExpression || safeExpression !== expression.replace(/\s/g, '')) {
        return []
      }

      const result = Function(`"use strict"; return (${safeExpression})`)()

      if (typeof result === 'number' && !isNaN(result)) {
        return [{
          type: 'calculator' as const,
          name: 'calculator',
          label: `${expression} = ${result}`,
          score: 1000,
          onclick: () => {
            navigator.clipboard.writeText(String(result))
          }
        }]
      }
    } catch (e) {
      // Invalid expression
    }

    return []
  }

  /**
   * Get help option
   */
  getHelp(): SearchResult {
    return {
      type: 'help' as const,
      name: 'help',
      label: 'Help',
      description: 'View keyboard shortcuts and search tips',
      score: -100
    }
  }

  /**
   * Search for "new [doctype]" commands
   */
  getCreatables(query: string): SearchResult[] {
    const lowerQuery = query.toLowerCase()
    if (!lowerQuery.startsWith('new ')) return []

    const searchTerm = query.substring(4).trim()
    if (!searchTerm) return []

    const creatables = this.doctypes
      .filter(dt => this.canCreate.includes(dt.name))
      .map(dt => ({ name: dt.name, label: dt.name, module: dt.module }))

    const fuzzyResults = this.fuzzySearchItems(creatables, searchTerm)

    return fuzzyResults.slice(0, 10).map(({ item, score, markedLabel }) => ({
      type: 'new' as const,
      name: item.name,
      label: `New ${markedLabel}`,
      module: item.module,
      score: score + 10,
      markedLabel: `New ${markedLabel}`,
      onclick: () => {
        const app = this.getValidAppName(item.module)
        router.push({ name: 'NewForm', params: { app, doctype: item.name } })
      }
    }))
  }

  /**
   * Search doctypes - returns list & new options
   */
  getDoctypes(query: string): SearchResult[] {
    const results: SearchResult[] = []
    const fuzzyResults = this.fuzzySearchItems(
      this.doctypes.map(dt => ({ name: dt.name, label: dt.name, module: dt.module })),
      query
    )

    fuzzyResults.slice(0, 15).forEach(({ item, score, markedLabel }) => {
      const doctype = this.doctypes.find(dt => dt.name === item.name)
      const app = this.getValidAppName(item.module)

      if (doctype?.issingle) {
        // Single doctype - go directly to form
        results.push({
          type: 'doctype' as const,
          name: item.name,
          label: markedLabel,
          module: item.module,
          score: score + 0.05,
          markedLabel,
          route: ['Form', item.name, item.name],
          onclick: () => {
            router.push({ name: 'EditForm', params: { app, doctype: item.name, name: item.name } })
          }
        })
      } else {
        // Regular doctype - show list option FIRST (higher score)
        results.push({
          type: 'doctype' as const,
          name: item.name,
          label: `${markedLabel}`,
          description: 'List',
          module: item.module,
          score: score + 0.05,
          markedLabel: markedLabel,
          route: ['List', item.name],
          onclick: () => {
            router.push({ name: 'ListView', params: { app, doctype: item.name } })
          }
        })

        // Add "New" option if can create (lower score than list)
        if (this.canCreate.includes(item.name)) {
          results.push({
            type: 'new' as const,
            name: item.name,
            label: `New ${markedLabel}`,
            module: item.module,
            score: score - 0.5, // Lower than list so "Item" comes before "New Item"
            markedLabel: `New ${markedLabel}`,
            onclick: () => {
              router.push({ name: 'NewForm', params: { app, doctype: item.name } })
            }
          })
        }
      }
    })

    return results
  }

  /**
   * Search reports
   */
  getReports(query: string): SearchResult[] {
    const fuzzyResults = this.fuzzySearchItems(
      this.reports.map(r => ({ name: r.name, label: r.name, module: r.module })),
      query
    )

    return fuzzyResults.slice(0, 10).map(({ item, score, markedLabel }) => {
      const report = this.reports.find(r => r.name === item.name)
      const app = this.getValidAppName(item.module)

      return {
        type: 'report' as const,
        name: item.name,
        label: `${markedLabel}`,
        description: 'Report',
        module: item.module,
        score,
        markedLabel,
        onclick: () => {
          if (report?.report_type === 'Report Builder' && report.ref_doctype) {
            router.push(`/dashboard/${app}/${report.ref_doctype}/report/${item.name}`)
          } else {
            router.push(`/dashboard/query-report/${item.name}`)
          }
        }
      }
    })
  }

  /**
   * Search pages
   */
  getPages(query: string): SearchResult[] {
    const fuzzyResults = this.fuzzySearchItems(
      this.pages.map(p => ({ name: p.name, label: p.title || p.name })),
      query
    )

    return fuzzyResults.slice(0, 10).map(({ item, score, markedLabel }) => {
      const page = this.pages.find(p => p.name === item.name)
      return {
        type: 'page' as const,
        name: item.name,
        label: markedLabel,
        description: 'Page',
        score,
        markedLabel,
        onclick: () => {
          router.push(`/dashboard/${page?.route || page?.name || item.name}`)
        }
      }
    })
  }

  /**
   * Search workspaces
   */
  getWorkspaces(query: string): SearchResult[] {
    const fuzzyResults = this.fuzzySearchItems(
      this.workspaces.map(ws => ({ name: ws.name, label: ws.title || ws.name, module: ws.module })),
      query
    )

    return fuzzyResults.slice(0, 10).map(({ item, score, markedLabel }) => ({
      type: 'workspace' as const,
      name: item.name,
      label: markedLabel,
      description: 'Workspace',
      module: item.module,
      score,
      markedLabel,
      onclick: () => {
        const app = this.getValidAppName(item.module) || item.name.toLowerCase().replace(/\s+/g, '_')
        router.push({ name: 'App', params: { app } })
      }
    }))
  }

  /**
   * Search dashboards
   */
  getDashboards(query: string): SearchResult[] {
    const fuzzyResults = this.fuzzySearchItems(
      this.dashboards.map(d => ({ name: d.name, label: d.name, module: d.module })),
      query
    )

    return fuzzyResults.slice(0, 5).map(({ item, score, markedLabel }) => ({
      type: 'dashboard' as const,
      name: item.name,
      label: markedLabel,
      description: 'Dashboard',
      module: item.module,
      score,
      markedLabel,
      onclick: () => {
        router.push(`/dashboard/dashboard-view/${item.name}`)
      }
    }))
  }

  /**
   * Search "[text] in [doctype]" pattern
   */
  getSearchInList(query: string): SearchResult[] {
    if (!query.includes(' in ') || query.endsWith(' in')) return []

    const parts = query.split(' in ')
    const searchTerm = parts[0]?.trim() ?? ''
    const doctypePart = parts[1]?.trim() ?? ''

    if (!searchTerm || !doctypePart) return []

    const fuzzyResults = this.fuzzySearchItems(
      this.canRead.map(name => {
        const dt = this.doctypes.find(d => d.name === name)
        return { name, label: name, module: dt?.module }
      }),
      doctypePart
    )

    return fuzzyResults.slice(0, 5).map(({ item, score, markedLabel }) => {
      const app = this.getValidAppName(item.module)
      return {
        type: 'search-in' as const,
        name: item.name,
        label: `Search "${searchTerm}" in ${markedLabel}`,
        score: score + 1,
        markedLabel: `Search "${searchTerm}" in ${markedLabel}`,
        onclick: () => {
          router.push({
            name: 'ListView',
            params: { app, doctype: item.name },
            query: { search: searchTerm }
          })
        }
      }
    })
  }

  /**
   * Global search across all documents
   */
  async getGlobalSearch(query: string): Promise<SearchResult[]> {
    if (query.length < 3) return []

    try {
      const response = await desk.call({
        method: 'frappe.utils.global_search.search',
        args: { text: query, start: 0, limit: 10 }
      })

      if (!response.message) return []

      return response.message.map((item: any) => {
        const app = this.getValidAppName(item.doctype_module)
        return {
          type: 'global' as const,
          name: item.name,
          label: item.content || item.name,
          description: item.doctype,
          module: item.doctype_module,
          score: 10,
          onclick: () => {
            router.push({ name: 'EditForm', params: { app, doctype: item.doctype, name: item.name } })
          }
        }
      })
    } catch (error) {
      console.error('Global search failed:', error)
      return []
    }
  }

  /**
   * Main search function - searches LOCALLY (no API calls except for global search)
   */
  async search(query: string): Promise<SearchResult[]> {
    // Ensure data is loaded (only loads once)
    await this.loadSearchData()

    if (!query || query.trim().length < 1) {
      return this.getRecent()
    }

    const trimmedQuery = query.trim().replace(/\s\s+/g, ' ')
    const lowerQuery = trimmedQuery.toLowerCase()

    let results: SearchResult[] = []

    // 1. "new [doctype]" pattern
    if (lowerQuery.startsWith('new ')) {
      results = results.concat(this.getCreatables(trimmedQuery))
    }

    // 2. "[text] in [doctype]" pattern
    if (lowerQuery.includes(' in ')) {
      results = results.concat(this.getSearchInList(trimmedQuery))
    }

    // 3. Calculator
    results = results.concat(this.getCalculator(trimmedQuery))

    // 4. Standard searches - ALL LOCAL, no API calls
    results = results.concat(this.getDoctypes(trimmedQuery))
    results = results.concat(this.getReports(trimmedQuery))
    results = results.concat(this.getPages(trimmedQuery))
    results = results.concat(this.getWorkspaces(trimmedQuery))
    results = results.concat(this.getDashboards(trimmedQuery))

    // 5. Recent items matching query
    results = results.concat(this.getRecent(trimmedQuery))

    // 6. Global search - ONLY API call, and only for longer queries
    if (trimmedQuery.length >= 3) {
      const globalResults = await this.getGlobalSearch(trimmedQuery)
      results = results.concat(globalResults)
    }

    // 7. Help option
    results.push(this.getHelp())

    // Deduplicate by name+type
    const seen = new Set<string>()
    const deduped = results.filter(item => {
      const key = `${item.type}:${item.name}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Sort by score descending
    const sorted = deduped.sort((a, b) => b.score - a.score)

    return sorted.slice(0, 50)
  }

  /**
   * Clear all data and reload
   */
  reset() {
    this.dataLoaded = false
    this.loadingPromise = null
  }
}

export const searchManager = new SearchManager()
