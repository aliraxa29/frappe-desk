<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginId = ref('')
const submitted = ref(false)

const isLoading = computed(() => authStore.loading)
const errorMessage = computed(() => authStore.error)

async function handleResetRequest() {
  authStore.clearError()

  if (!loginId.value.trim()) {
    return
  }

  const success = await authStore.requestPasswordReset(loginId.value)

  if (success) {
    submitted.value = true
    loginId.value = ''
    // Auto-redirect after 5 seconds
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, 5000)
  }
}

function goBackToLogin() {
  router.push({ name: 'Login' })
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

    <!-- Reset password card -->
    <div class="relative w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
              </path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p class="text-blue-100">We'll send you instructions to reset your password</p>
        </div>

        <!-- Form content -->
        <div class="px-8 py-10">
          <!-- Success message -->
          <div v-if="submitted" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"></path>
              </svg>
              <div>
                <p class="font-medium text-green-900">Reset link sent!</p>
                <p class="text-sm text-green-800 mt-1">Check your email for a password reset link. Redirecting you back
                  to login in a few seconds...</p>
              </div>
            </div>
          </div>

          <!-- Error message -->
          <div v-else-if="errorMessage"
            class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg class="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"></path>
            </svg>
            <p class="text-sm text-red-800">{{ errorMessage }}</p>
          </div>

          <!-- Form -->
          <div v-if="!submitted" class="space-y-6">
            <!-- Login ID field -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Email or Username</label>
              <input v-model="loginId" type="text" placeholder="you@example.com or username" :disabled="isLoading"
                @keydown.enter="handleResetRequest"
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-slate-100 disabled:cursor-not-allowed" />
              <p class="mt-2 text-xs text-slate-500">Enter the email address or username associated with your account
              </p>
            </div>

            <!-- Submit button -->
            <button @click="handleResetRequest" :disabled="isLoading || !loginId.trim()"
              class="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
              <span v-if="!isLoading">Send Reset Link</span>
              <span v-else class="flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                  </path>
                </svg>
                Sending...
              </span>
            </button>

            <!-- Back to login -->
            <button @click="goBackToLogin" :disabled="isLoading" type="button"
              class="w-full py-2 px-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              ← Back to Sign In
            </button>
          </div>

          <!-- After submission links -->
          <div v-else class="flex gap-3">
            <button @click="goBackToLogin" type="button"
              class="flex-1 py-2 px-4 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              Back to Sign In
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-4 bg-slate-50 border-t border-slate-200">
          <p class="text-xs text-slate-500 text-center">
            Didn't receive an email?
            <a href="#" class="text-indigo-600 hover:text-indigo-700 font-medium">Check your spam folder or contact
              support</a>
          </p>
        </div>
      </div>

      <!-- Additional help -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 class="text-sm font-semibold text-blue-900 mb-2">Didn't work?</h3>
        <p class="text-sm text-blue-800">If you're still having trouble accessing your account, please contact our
          support team.</p>
      </div>
    </div>
  </div>
</template>
