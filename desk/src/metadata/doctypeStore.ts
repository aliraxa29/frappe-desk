import { defineStore } from 'pinia'
import type { DocTypeMeta } from '../types'
import { frappeClient } from '../api/resource'

export const useDoctypeStore = defineStore('doctype', {
  state: () => ({
    metaCache: {} as Record<string, DocTypeMeta>
  }),

  actions: {
    async loadMeta(doctype: string): Promise<DocTypeMeta> {
      if (this.metaCache[doctype]) {
        return this.metaCache[doctype]
      }

      try {
        const meta = await frappeClient.getDocTypeMeta(doctype)
        this.metaCache[doctype] = meta
        return meta
      } catch (error) {
        console.error(`Failed to load DocType meta for ${doctype}:`, error)
        throw error
      }
    },

    clearCache(doctype?: string) {
      if (doctype) {
        delete this.metaCache[doctype]
      } else {
        this.metaCache = {}
      }
    }
  }
})
