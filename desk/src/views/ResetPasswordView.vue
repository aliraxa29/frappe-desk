<script setup lang="ts">
import { ref } from 'vue'
import { desk } from '../utils/desk'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const message = ref('')

async function submit() {
  message.value = ''
  if (!email.value) {
    message.value = 'Please enter your login id (email or username).'
    return
  }
  loading.value = true
  try {
    await desk.call({
      method: 'frappe.core.doctype.user.user.reset_password',
      args: {
        user: email.value
      }
    })
    message.value = 'If the account exists, a reset link was sent to the email.'
  } catch (err: any) {
    message.value = err?.message || 'Unable to send reset email.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h1 class="text-2xl font-semibold text-slate-800 mb-2">Reset password</h1>
      <p class="text-sm text-slate-500 mb-6">Enter your login id to receive a password reset link.</p>

      <div v-if="message" class="mb-4 text-sm text-slate-700">{{ message }}</div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700">Login id</label>
          <input v-model="email" type="text" placeholder="email or username" class="mt-1 block w-full rounded-md border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-300" />
        </div>

        <div class="flex items-center justify-between">
          <a @click.prevent="router.push('/login')" class="text-sm text-indigo-600 hover:underline cursor-pointer">Back to sign in</a>
        </div>

        <button type="submit" :disabled="loading" class="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 disabled:opacity-60">
          <span v-if="!loading">Send reset link</span>
          <span v-else>Sending...</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
