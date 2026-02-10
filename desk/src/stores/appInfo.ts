import { defineStore } from "pinia";
import type { AppInfo } from "../types";

export const useAppInfoStore = defineStore("appInfo", {
  state: () => ({
    currentApp: null as AppInfo | null,
  }),

  getters: {
    // Get current app name
    currentAppName(): string | undefined {
      return this.currentApp?.name;
    },

    // Get current app title
    currentAppTitle(): string | undefined {
      return this.currentApp?.title;
    },

    // Get current app full info
    appInfo(): AppInfo | null {
      return this.currentApp;
    },
  },

  actions: {
    // Set current app info
    setCurrentApp(app: AppInfo | null) {
      this.currentApp = app;
    },

    // Clear current app
    clearCurrentApp() {
      this.currentApp = null;
    },
  },
});
