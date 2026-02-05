<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from './components/ToastContainer.vue'
import DialogContainer from './components/DialogContainer.vue'
import FreezeOverlay from './components/FreezeOverlay.vue'
</script>

<template>
  <div id="app">
    <RouterView />
    <ToastContainer />
    <DialogContainer />
    <FreezeOverlay />
  </div>
</template>

