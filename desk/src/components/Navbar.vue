<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button @click="goHome" class="logo-button" title="Go to Home">
        <Icon icon="material-symbols-light:grid-on-sharp" class="w-6 h-6" />
        <span class="logo-text">Apps</span>
      </button>
    </div>

    <!-- Center - Search Bar -->
    <div class="navbar-center">
      <div class="search-container" @click="openCommandDialog">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search apps, doctypes... (Ctrl+K)" class="search-input"
          @focus="openCommandDialog" readonly />
        <span class="search-shortcut">⌘K</span>
      </div>
    </div>

    <!-- Right side - User Profile -->
    <div class="navbar-right">
      <button @click="toggleUserMenu" class="user-profile-button" :title="`${userFullName} (${userEmail})`">
        <div class="avatar-circle">
          {{ userInitials }}
        </div>
        <span class="user-name">{{ userFullName }}</span>
        <svg class="dropdown-icon" :class="{ 'rotate-180': showUserMenu }" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      <!-- User dropdown menu -->
      <transition name="fade">
        <div v-if="showUserMenu" class="user-menu">
          <div class="user-menu-header">
            <div class="avatar-large">{{ userInitials }}</div>
            <div class="user-info">
              <div class="font-semibold">{{ userFullName }}</div>
              <div class="text-sm text-gray-400">{{ userEmail }}</div>
            </div>
          </div>
          <div class="user-menu-divider"></div>
          <button class="user-menu-item" @click="handleLogout">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </transition>
    </div>

    <!-- Command Dialog -->
    <CommandDialog ref="commandDialogRef" @close="showUserMenu = false" />
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { user } from '../utils/user'
import CommandDialog from './CommandDialog.vue'
import { desk } from '../utils/desk'
import { Icon } from "@iconify/vue";
import { router } from '../router';
import { useRoute } from 'vue-router';

const showUserMenu = ref(false)
const userFullName = ref('User')
const userEmail = ref('user@example.com')
const commandDialogRef = ref<InstanceType<typeof CommandDialog>>()

const route = useRoute()

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

onMounted(() => {
  try {
    userFullName.value = user.get_full_name()
    userEmail.value = user.get_email()
  } catch (e) {
    console.warn('Could not load user info:', e)
  }

  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
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
  await desk.call({
    method: 'logout',
    args: {}
  }).then(() => {
    window.location.href = '/login'
  }).catch((err) => {
    console.error('Logout failed:', err)
  })
}

// Close menu when clicking outside
const handleClickOutside = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target.closest('.user-profile-button') && !target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #111827;
  border-bottom: 1px solid #1f2937;
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 40;
}

.navbar-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.logo-button:hover {
  background-color: #1f2937;
}

.logo-button svg {
  width: 1.5rem;
  height: 1.5rem;
}

.logo-text {
  font-size: 1.125rem;
  font-weight: 600;
  display: none;
}

@media (min-width: 640px) {
  .logo-text {
    display: inline;
  }
}

.navbar-center {
  flex: 1;
  max-width: 32rem;
  margin: 0 auto;
  display: none;
}

@media (min-width: 768px) {
  .navbar-center {
    display: flex;
  }
}

.search-container {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.search-input {
  width: 100%;
  background-color: #1f2937;
  color: white;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 0.5rem 3.5rem 0.5rem 2.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.search-shortcut {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: #9ca3af;
  pointer-events: none;
}

.navbar-right {
  position: relative;
}

.user-profile-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.user-profile-button:hover {
  background-color: #1f2937;
}

.avatar-circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  display: none;
}

@media (min-width: 640px) {
  .user-name {
    display: inline;
  }
}

.dropdown-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s;
}

.dropdown-icon.rotate-180 {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  right: 0;
  margin-top: 0.5rem;
  width: 16rem;
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  z-index: 50;
}

.user-menu-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.avatar-large {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.user-info {
  color: white;
  min-width: 0;
  flex: 1;
}

.user-info>div:first-child {
  font-weight: 600;
}

.user-info>div:last-child {
  font-size: 0.875rem;
  color: #9ca3af;
}

.user-menu-divider {
  height: 1px;
  background-color: #374151;
  margin: 0.5rem 0;
}

.user-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  text-align: left;
  color: #d1d5db;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.user-menu-item:hover {
  background-color: #374151;
  color: white;
}

.user-menu-item svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
