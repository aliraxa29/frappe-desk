<template>
  <nav class="sticky top-0 z-40 flex items-center justify-between gap-6 px-6 py-1 bg-slate-900/90 dark:bg-gray-950 backdrop-blur border-b border-slate-800 dark:border-slate-700 text-white transition-colors">
    <div class="flex items-center min-w-0 gap-3">
      <button @click="goHome" class="text-white hover:text-white shrink-0 w-20 flex items-center gap-2 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer transition">
        <Icon icon="material-symbols-light:grid-on-sharp" class="w-6 h-6" />
        <span class="hidden sm:inline text-lg font-semibold">{{ __('Apps') }}</span>
      </button>
      
      <!-- Breadcrumbs -->
      <div class="flex-1 min-w-0 overflow-hidden">
        <Breadcrumbs />
      </div>
    </div>
    <div class="hidden md:flex flex-1 max-w-sm mx-auto">
      <div class="relative w-full cursor-pointer" @click="openCommandDialog">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          type="text"
          :placeholder="__('Search or type command... (Ctrl+K)')"
          readonly
          @focus="openCommandDialog"
          class="w-full rounded-lg bg-slate-800 dark:bg-gray-900 border border-slate-700 dark:border-gray-900 pl-10 pr-14 py-1 text-white placeholder-slate-400 dark:placeholder-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-mono text-slate-400 bg-slate-700 dark:bg-slate-600 border border-slate-600 dark:border-slate-500 rounded dark:text-white">
          ⌘K
        </span>
      </div>
    </div>

    <!-- Theme Toggle Button -->
    <button
      @click="themeStore.toggleTheme()"
      :title="`Switch to ${themeStore.theme === 'dark' ? 'light' : 'dark'} mode`"
      class="p-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer text-white"
    >
      <Icon v-if="isDark" icon="ph:moon-fill" class="w-5 h-5" />
      <Icon v-else icon="ph:sun-fill" class="w-5 h-5" />
    </button>

    <!-- Right - User -->
    <div class="relative user-profile-menu">
      <button 
        @click="toggleUserMenu" 
        :title="`${userFullName} (${userEmail})`" 
        class="user-profile-button flex items-center gap-3 px-4 py-2 rounded-lg text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0 bg-linear-to-br from-blue-500 to-purple-500">
          {{ userInitials }}
        </div>

        <span class="hidden sm:inline text-sm font-medium">
          {{ userFullName }}
        </span>

        <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showUserMenu }" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      <!-- Dropdown -->
      <transition name="fade">
        <div v-if="showUserMenu" class="user-menu absolute right-0 mt-2 w-64 z-50 bg-slate-800 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 rounded-lg shadow-xl p-2 text-slate-100 dark:text-slate-100">
          <div class="flex items-center gap-3 px-4 py-3">
            <div class="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white shrink-0 bg-linear-to-br from-blue-500 to-purple-500">
              {{ userInitials }}
            </div>

            <div class="min-w-0 flex-1">
              <div class="font-semibold text-slate-100 truncate">
                {{ userFullName }}
              </div>
              <div class="text-sm text-slate-400 truncate">
                {{ userEmail }}
              </div>
            </div>
          </div>

          <div class="h-px bg-slate-700 dark:bg-slate-600 my-2"></div>

          <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-600 transition cursor-pointer">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {{ __('Logout') }}
          </button>
        </div>
      </transition>
    </div>
    <CommandDialog ref="commandDialogRef" @close="showUserMenu = false" />
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { user } from '../utils/user'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { Icon } from "@iconify/vue";
import { router } from '../router';
import { useRoute } from 'vue-router';
import CommandDialog from '../components/CommandDialog.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { __ } from '../utils/translate';

const showUserMenu = ref(false)
const userFullName = ref('User')
const userEmail = ref('user@example.com')
const commandDialogRef = ref<InstanceType<typeof CommandDialog>>()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const route = useRoute()

const isDark = computed(() => themeStore.getEffectiveTheme() === 'dark')

const userInitials = computed(() => {
  return userFullName.value
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

const openCommandDialog = () => {
  commandDialogRef.value?.open()
}

const handleKeyDown = (e: KeyboardEvent) => {
  // Cmd+K or Ctrl+K
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openCommandDialog()
  }
}

const handleClickOutside = (e: Event) => {
  const target = e.target as HTMLElement
  // Check if click is outside the user profile menu
  if (!target.closest('.user-profile-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  try {
    userFullName.value = user.get_full_name()
    userEmail.value = user.get_email()
  } catch (e) {
    console.warn('Could not load user info:', e)
  }

  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', handleClickOutside)
})

const goHome = () => {
  if (route.name !== 'Desk') {
    router.push({ name: 'Desk' })
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
  showUserMenu.value = false
  
  try {
    await authStore.logout()
    router.push({ name: 'Login' })
  } catch (err) {
    console.error('Logout failed:', err)
    window.location.href = '/login'
  }
}
</script>

<style scoped></style>

