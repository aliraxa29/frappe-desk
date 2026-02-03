<template>
  <div v-if="loading" class="loading">Loading applications...</div>
  <div v-else class="desk-container">
    <Navbar />
    <div class="apps-section">
      <div class="section-header">
        <h2>Your Apps</h2>
        <p class="text-gray-400">Click on any app to view and manage</p>
      </div>
      <div v-if="apps.length === 0" class="empty-state">
        <p>No apps found</p>
      </div>
      <div v-else class="grid gap-6
         grid-cols-1
         sm:grid-cols-2
         md:grid-cols-3
         lg:grid-cols-4
         xl:grid-cols-5">
        <AppCard v-for="app in apps" :key="app.name" :app="app" @select="selectApp" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { AppInfo } from '../types'
import { desktopAPI } from '../api/desktop'
import { useBreadcrumbStore } from '../stores/breadcrumbs'
import Navbar from '../layout/Navbar.vue'
import AppCard from '../components/AppCard.vue'


const router = useRouter()
const route = useRoute()
const breadcrumbStore = useBreadcrumbStore()
const loading = ref(true)
const apps = ref<AppInfo[]>([])

const defaultApps: AppInfo[] = []

onMounted(async () => {
  // Clear breadcrumbs on home page
  breadcrumbStore.clear()
  await getApps()
})

async function getApps() {
  try {
    loading.value = true
    const apiApps = await desktopAPI.getInstalledApps()

    if (apiApps && apiApps.length > 0) {
      apps.value = apiApps
    } else {
      apps.value = defaultApps
    }

    loading.value = false
  } catch (error) {
    console.error('Failed to load apps:', error)
    apps.value = defaultApps
    loading.value = false
  }
}

async function selectApp(app_name: string) {
  router.push({
    name: 'App',
    params: { app: app_name }
  })
}

watch(
  () => route.fullPath,
  async () => {
    await getApps()
  }
)
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #9ca3af;
}

.desk-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2d1b69 100%);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.apps-section {
  padding: 2rem 1.5rem;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .apps-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) {
  .apps-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (min-width: 1024px) {
  .apps-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

.app-card {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.app-card:hover {
  border-color: #a855f7;
  box-shadow: 0 20px 25px -5px rgba(168, 85, 247, 0.1);
  transform: scale(1.05);
}

.app-icon {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.app-card:hover .app-icon {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  transform: scale(1.1);
}

.app-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 1rem 0 0.5rem 0;
}

.app-card p {
  margin: 0;
  color: #9ca3af;
  font-size: 0.875rem;
}

.doctypes-section {
  background-color: #1f2937;
  border: 1px solid #374151;
  margin: 2rem 1.5rem;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.doctypes-section .section-header h2 {
  font-size: 1.5rem;
}

.doctypes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 24rem;
  overflow-y: auto;
}

.doctypes-list::-webkit-scrollbar {
  width: 0.5rem;
}

.doctypes-list::-webkit-scrollbar-track {
  background-color: #111827;
  border-radius: 0.25rem;
}

.doctypes-list::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 0.25rem;
}

.doctypes-list::-webkit-scrollbar-thumb:hover {
  background-color: #6b7280;
}

.doctype-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #111827;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.doctype-item:hover {
  background-color: #7c3aed;
  border-left-color: #a855f7;
  transform: translateX(0.25rem);
}

.doctype-name {
  font-weight: 500;
  color: white;
}

.doctype-action {
  color: #a855f7;
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .apps-section {
    padding: 1.5rem 1rem;
  }

  .doctypes-section {
    margin: 1.5rem 1rem;
    padding: 1.5rem;
  }
}
</style>
