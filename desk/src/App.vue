<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from './components/ToastContainer.vue'
import DialogContainer from './components/DialogContainer.vue'
</script>

<template>
  <div id="app">
    <RouterView />
    <ToastContainer />
    <DialogContainer />
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

body {
  background-color: #f5f5f5;
}
</style>
