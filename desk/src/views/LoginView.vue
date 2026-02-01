<script setup lang="ts">
import { ref } from 'vue'
import { desk } from '../utils/desk'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')

async function submit() {
  message.value = ''
  if (!email.value || !password.value) {
    message.value = 'Email and password are required.'
    return
  }
  loading.value = true
  try {
    await desk.call({
      method: 'login',
      args: {
        usr: email.value,
        pwd: password.value
      }
    })
    // on success, navigate to dashboard root
    window.location.href = '/'
  } catch (err: any) {
    message.value = err?.message || 'Login failed. Check credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h1 class="text-2xl font-semibold text-slate-800 mb-2">Welcome back</h1>
      <p class="text-sm text-slate-500 mb-6">Sign in to your account</p>

      <div v-if="message" class="mb-4 text-sm text-red-600">{{ message }}</div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700">Email</label>
          <input v-model="email" type="text" placeholder="you@example.com" class="mt-1 block w-full rounded-md border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-300" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700">Password</label>
          <input v-model="password" type="password" placeholder="••••••••" class="mt-1 block w-full rounded-md border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-300" />
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-600"> 
            <a @click.prevent="router.push('/reset-password')" class="text-indigo-600 hover:underline cursor-pointer">Forgot password?</a>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 disabled:opacity-60">
          <span v-if="!loading">Sign in</span>
          <span v-else>Signing in...</span>
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-slate-500">
        Need an account? <a href="#" class="text-indigo-600 hover:underline">Contact admin</a>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
