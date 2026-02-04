<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from './components/ToastContainer.vue'
import DialogContainer from './components/DialogContainer.vue'
import FreezeOverlay from './components/FreezeOverlay.vue'
import { computed } from 'vue'
import { useThemeStore } from './stores/theme'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.getEffectiveTheme() === 'dark')
</script>

<template>
  <div id="app" :class="{ dark: isDark, light: !isDark }">
    <RouterView />
    <ToastContainer />
    <DialogContainer />
    <FreezeOverlay />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body,
#app {
  background-color: #ffffff;
  color: #000000;
  transition: background-color 0.3s, color 0.3s;
}

body.dark,
.dark {
  background-color: #0f172a;
  color: #f1f5f9;
}

/* Tailwind dark mode support */
html.dark {
  color-scheme: dark;
}

html.light {
  color-scheme: light;
}
</style>

