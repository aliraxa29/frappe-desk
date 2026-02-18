import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { SidebarItem } from "../data/app_sidebar";

const SIDEBAR_COLLAPSED_KEY = "app_sidebar_collapsed";

function getStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

export const useSidebarStore = defineStore("sidebar", () => {
  const items = ref<SidebarItem[]>([]);
  const source = ref<"app_sidebar" | "modules" | "workspaces">("app_sidebar");
  const loading = ref(false);
  const selectedModule = ref<string | null>(null);
  const collapsed = ref(getStoredCollapsed());

  watch(collapsed, (val) => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(val));
    } catch {
      /* ignore */
    }
  });

  function toggleCollapsed() {
    collapsed.value = !collapsed.value;
  }

  function setSidebarItems(
    newItems: SidebarItem[],
    newSource: "app_sidebar" | "modules" | "workspaces",
  ) {
    items.value = newItems;
    source.value = newSource;
  }

  function setSelectedModule(moduleName: string | null) {
    selectedModule.value = moduleName;
  }

  function clearSidebar() {
    items.value = [];
    selectedModule.value = null;
    source.value = "app_sidebar";
  }

  return {
    items,
    source,
    loading,
    selectedModule,
    collapsed,
    setSidebarItems,
    setSelectedModule,
    clearSidebar,
    toggleCollapsed,
  };
});
