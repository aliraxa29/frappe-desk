<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
    <div class="w-full max-w-3xl bg-white rounded-xl shadow-lg p-10 text-center">
      <h1 class="text-6xl font-extrabold text-slate-800">404</h1>
      <p class="text-xl text-slate-600 mt-4">Page not found</p>
      <p class="text-sm text-slate-500 mt-2">The page you are looking for does not exist or has been moved.</p>

      <div class="mt-6 flex items-center justify-center gap-4">
        <button @click="router.push('/login')" class="py-2 px-4 bg-indigo-600 text-white rounded-md">Sign in</button>
        <button @click="router.push('/')" class="py-2 px-4 bg-slate-100 text-slate-700 rounded-md">Go home</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
