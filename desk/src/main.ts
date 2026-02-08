import "./style.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import { initializeGlobals } from "./utils/app";
import "./utils/index";
import { initializeLocalsGlobal } from "./utils/locals/localsGlobal";
import desk_object from "./plugins/desk_object";
import { realtime } from "./utils/socketio/client";
import { initializeRealtimeNotifications } from "./utils/socketio/notifications";
import { useThemeStore } from "./stores/theme";
import { useTranslationStore } from "./stores/translation";
import "./utils/translate"; // Import to register global __ function

initializeGlobals();

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

initializeLocalsGlobal(pinia);

// Initialize theme
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
app.use(desk_object);
app.mount("#app");
