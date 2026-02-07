import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SidebarItem } from '../data/app_sidebar'

export const useSidebarStore = defineStore('sidebar', () => {
  const items = ref<SidebarItem[]>([])
  const source = ref<'app_sidebar' | 'modules' | 'workspaces'>('app_sidebar')
  const loading = ref(false)
  const selectedModule = ref<string | null>(null)

  function setSidebarItems(newItems: SidebarItem[], newSource: 'app_sidebar' | 'modules' | 'workspaces') {
    items.value = newItems
    source.value = newSource
  }

  function setSelectedModule(moduleName: string | null) {
    selectedModule.value = moduleName
  }

  function clearSidebar() {
    items.value = []
    selectedModule.value = null
    source.value = 'app_sidebar'
  }

  return {
    items,
    source,
    loading,
    selectedModule,
    setSidebarItems,
    setSelectedModule,
    clearSidebar
  }
})
