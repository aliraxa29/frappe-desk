/**
 * Search utilities for CommandDialog
 * Implements Frappe-like search with fuzzy matching, recent items, and various search types
 */

import { desk } from './desk'
import { fuzzyMatch, fuzzySearchWithMarking, getMarkedString } from './fuzzyMatch'

export interface SearchResult {
  type: 'doctype' | 'module' | 'workspace' | 'page' | 'report' | 'recent'
  name: string
  label: string
  description?: string
  module?: string
  icon?: string
  score: number
  markedLabel?: string
  markedDescription?: string
}

export interface RecentItem {
  type: string
  name: string
  label: string
  timestamp: number
}

class SearchManager {
  private recentItems: RecentItem[] = []
  private searchCache: { [key: string]: SearchResult[] } = {}
  private readonly RECENT_STORAGE_KEY = 'desk_recent_items'
  private readonly MAX_RECENT = 20

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
  addRecent(type: string, name: string, label: string) {
    // Remove if exists
    this.recentItems = this.recentItems.filter((item) => !(item.type === type && item.name === name))

    // Add to front
    this.recentItems.unshift({
      type,
      name,
      label,
      timestamp: Date.now()
    })

    // Keep only MAX_RECENT items
    this.recentItems = this.recentItems.slice(0, this.MAX_RECENT)
    this.saveRecent()
  }

  /**
   * Get recent items
   */
  getRecent(): SearchResult[] {
    return this.recentItems.slice(0, 10).map((item) => ({
      type: 'recent' as const,
      name: item.name,
      label: item.label,
      score: 100,
      module: item.type
    }))
  }

  /**
   * Perform fuzzy search on an array of items
   */
  private fuzzySearchItems<T extends { name: string; label?: string; title?: string }>(
    items: T[],
    query: string
  ): { item: T; score: number; markedLabel: string }[] {
    const results: { item: T; score: number; markedLabel: string }[] = []

    items.forEach((item) => {
      const searchText = item.label || item.title || item.name || ''
      const [matched, score, matches] = fuzzyMatch(query, searchText, true)

      if (matched && score > 0) {
        results.push({
          item,
          score,
          markedLabel: getMarkedString(searchText, matches)
        })
      }
    })

    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * Search doctypes
   */
  private async searchDoctypes(query: string): Promise<SearchResult[]> {
    try {
      const response = await desk.call({
        method: 'frappe.client.get_list',
        args: {
          doctype: 'DocType',
          fields: ['name', 'module', 'istable'],
          filters: [['istable', '=', 0]],
          limit_page_length: 100
        }
      })

      const doctypes = response.message || []
      const fuzzyResults = this.fuzzySearchItems(
        doctypes.map((dt: any) => ({
          name: dt.name,
          label: dt.name,
          module: dt.module
        })),
        query
      )

      return fuzzyResults.map(({ item, score, markedLabel }) => ({
        type: 'doctype' as const,
        name: item.name,
        label: item.label,
        module: item.module,
        score,
        markedLabel
      }))
    } catch (error) {
      console.error('Failed to search doctypes:', error)
      return []
    }
  }

  /**
   * Search modules/apps
   */
  private async searchModules(query: string): Promise<SearchResult[]> {
    try {
      const response = await desk.call({
        method: 'desktop.api.apps.get_installed_apps'
      })

      const modules = response.message || []
      const fuzzyResults = this.fuzzySearchItems(modules, query)

      return fuzzyResults.map(({ item, score, markedLabel }) => ({
        type: 'module' as const,
        name: item.name,
        label: item.title || item.name,
        description: item.description,
        score,
        markedLabel
      }))
    } catch (error) {
      console.error('Failed to search modules:', error)
      return []
    }
  }

  /**
   * Search workspaces
   */
  private async searchWorkspaces(query: string): Promise<SearchResult[]> {
    try {
      const response = await desk.call({
        method: 'frappe.client.get_list',
        args: {
          doctype: 'Workspace',
          fields: ['name', 'title', 'module'],
          limit_page_length: 50
        }
      })

      const workspaces = response.message || []
      const fuzzyResults = this.fuzzySearchItems(
        workspaces.map((ws: any) => ({
          name: ws.name,
          label: ws.title || ws.name,
          module: ws.module
        })),
        query
      )

      return fuzzyResults.map(({ item, score, markedLabel }) => ({
        type: 'workspace' as const,
        name: item.name,
        label: item.label,
        module: item.module,
        score,
        markedLabel
      }))
    } catch (error) {
      console.error('Failed to search workspaces:', error)
      return []
    }
  }

  /**
   * Main search function - combines all search types
   */
  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 1) {
      return this.getRecent()
    }

    const cacheKey = query.toLowerCase()
    if (this.searchCache[cacheKey]) {
      return this.searchCache[cacheKey]
    }

    const [docTypes, modules, workspaces] = await Promise.all([
      this.searchDoctypes(query),
      this.searchModules(query),
      this.searchWorkspaces(query)
    ])

    // Combine and sort by score
    const combined = [...docTypes, ...modules, ...workspaces].sort((a, b) => b.score - a.score)

    // Limit results
    const results = combined.slice(0, 50)
    this.searchCache[cacheKey] = results

    return results
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.searchCache = {}
  }
}

export const searchManager = new SearchManager()
