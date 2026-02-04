<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

const isLoading = computed(() => authStore.loading)
const errorMessage = computed(() => authStore.error)

async function handleLogin() {
  authStore.clearError()

  if (!email.value.trim()) {
    return
  }

  if (!password.value) {
    return
  }

  const success = await authStore.login(email.value, password.value)

  if (success) {
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  }
}

function goToResetPassword() {
  router.push({ name: 'ResetPassword' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-white p-4">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse">
      </div>
      <div
        class="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
        style="animation-delay: 2s;"></div>
    </div>

    <!-- Login card -->
    <div class="relative w-full max-w-md">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        <!-- Header -->
        <div class="bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center">
          <div class="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
              </path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p class="text-blue-100">Sign in to your account</p>
        </div>

        <!-- Form content -->
        <div class="px-8 py-10">
          <!-- Error message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-3">
            <svg class="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"></path>
            </svg>
            <p class="text-sm text-red-800 dark:text-red-300">{{ errorMessage }}</p>
          </div>

          <!-- Email field -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Email or Username</label>
            <input v-model="email" type="text" placeholder="you@example.com" :disabled="isLoading"
              @keydown.enter="handleLogin"
              class="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 disabled:dark:bg-slate-700 disabled:cursor-not-allowed" />
          </div>

          <!-- Password field -->
          <div class="mb-2">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                :disabled="isLoading" @keydown.enter="handleLogin"
                class="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 disabled:dark:bg-slate-700 disabled:cursor-not-allowed" />
              <button @click="showPassword = !showPassword" :disabled="isLoading" type="button"
                class="absolute right-3 top-4 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                  </path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z">
                  </path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.921 17.921l3.536-3.536M17.5 8.5l3.5-3.5"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember me checkbox -->
          <div class="mb-6 flex items-center">
            <input v-model="rememberMe" type="checkbox" id="rememberMe" :disabled="isLoading"
              class="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed" />
            <label for="rememberMe" class="ml-2 text-sm text-slate-600 dark:text-slate-300">Remember me</label>
          </div>

          <!-- Login button -->
          <button @click="handleLogin" :disabled="isLoading || !email || !password"
            class="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
            <span v-if="!isLoading">Sign In</span>
            <span v-else class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
              Signing in...
            </span>
          </button>

          <!-- Divider -->
          <div class="mt-8 relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-300 dark:border-slate-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300">Don't have an account?</span>
            </div>
          </div>

          <!-- Forgot password link -->
          <button @click="goToResetPassword" :disabled="isLoading" type="button"
            class="w-full mt-6 py-2 px-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            Forgot your password?
          </button>
        </div>

        <!-- Footer -->
        <div class="px-8 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-300">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>

      <!-- Support link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-slate-600">
          Need help?
          <a href="#" class="text-indigo-600 hover:text-indigo-700 font-medium">Contact support</a>
        </p>
      </div>
    </div>
  </div>
</template>
