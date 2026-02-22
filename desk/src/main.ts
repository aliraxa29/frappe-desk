import "./style.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import { initializeGlobals } from "./utils/app";
import "./utils/index";
import { realtime } from "./utils/socketio/client";
import { initializeRealtimeNotifications } from "./utils/socketio/notifications";
import { useThemeStore } from "./stores/theme";
import { useTranslationStore } from "./stores/translation";
import dayjs from "./plugins/dayjs";

initializeGlobals();

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const themeStore = useThemeStore(pinia);
themeStore.initializeTheme();
themeStore.watchSystemTheme();

const bootData = (window as any).dash?.boot || {};

// Initialize translations
try {
  const translationStore = useTranslationStore(pinia);
  if (bootData.__messages) {
    translationStore.loadTranslations(bootData.__messages, bootData.lang);
  }
} catch (error) {
  console.warn("Failed to initialize translations:", error);
}

realtime.init(bootData);

initializeRealtimeNotifications();

app.use(router);
app.provide("dayjs", dayjs);
app.mount("#app");
