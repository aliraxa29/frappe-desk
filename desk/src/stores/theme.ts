import { defineStore } from "pinia";
import { ref, watch } from "vue";

export type Theme = "light" | "dark" | "system";

export const useThemeStore = defineStore("theme", () => {
  const theme = ref<Theme>("system");

  // Initialize theme from localStorage
  const initializeTheme = () => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved && ["light", "dark", "system"].includes(saved)) {
      theme.value = saved;
    } else {
      theme.value = "system";
    }
    applyTheme();
  };

  // Get effective theme (light or dark)
  const getEffectiveTheme = (): "light" | "dark" => {
    if (theme.value === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme.value;
  };

  // Apply theme to document - applies to html element for Tailwind
  const applyTheme = () => {
    const effective = getEffectiveTheme();
    const html = document.documentElement;

    if (effective === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.add("light");
      html.classList.remove("dark");
    }
  };

  // Set theme
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem("theme", newTheme);
    applyTheme();
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const effective = getEffectiveTheme();
    setTheme(effective === "dark" ? "light" : "dark");
  };

  // Watch for system theme changes
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme.value === "system") {
        applyTheme();
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  };

  // Watch theme changes
  watch(
    () => theme.value,
    () => {
      applyTheme();
    },
  );

  return {
    theme,
    getEffectiveTheme,
    initializeTheme,
    setTheme,
    toggleTheme,
    watchSystemTheme,
    applyTheme,
  };
});
