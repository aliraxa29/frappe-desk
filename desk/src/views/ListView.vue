<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between gap-4 w-full my-3">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-slate-800">
            {{ doctypeLabel }}
          </h2>
          <span v-if="meta" class="text-sm text-slate-500">
            {{ meta.module }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Button @click="handleNewDocument" variant="primary" size="sm">
            + New {{ doctypeLabel }}
          </Button>
        </div>
      </div>
    </template>

    <template #content>
      <!-- List Component -->
      <div class="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <ListView 
          ref="listViewRef"
          :doctype="doctype" 
          @select="handleSelect"
        />
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { DocTypeMeta, DocTypeMetaResponse } from '../types'
import { frappeClient } from '../api/resource'
import { useBreadcrumbStore } from '../stores/breadcrumbs'
import AppLayout from '../layout/AppLayout.vue'
import ListView from '../components/list/ListView.vue'
import Button from '../components/Button.vue'

const route = useRoute()
const router = useRouter()
const breadcrumbStore = useBreadcrumbStore()

const doctype = computed(() => (route.params.doctype as string) || '')
const app = computed(() => (route.params.app as string) || '')

const listViewRef = ref<InstanceType<typeof ListView> | null>(null)
const meta = ref<DocTypeMeta | null>(null)
const selectedRows = ref<string[]>([])

// Get display label for doctype
const doctypeLabel = computed(() => {
  return meta.value?.label || doctype.value
})

// Update breadcrumbs when meta loads or route changes
watch([doctypeLabel, app], () => {
  breadcrumbStore.setForList(app.value, doctype.value, doctypeLabel.value)
}, { immediate: true })

onMounted(async () => {
  try {
    const response = await frappeClient.getDocTypeMeta(doctype.value)
    meta.value = response.docs?.[0] || null
    
    // Update breadcrumbs with proper label
    breadcrumbStore.setForList(app.value, doctype.value, meta.value?.label || doctype.value)
  } catch (err) {
    console.error('Failed to load doctype meta:', err)
  }
})

function handleNewDocument() {
  router.push({
    name: 'NewForm',
    params: { 
      doctype: doctype.value, 
      app: app.value,
      name: 'new'
    }
  })
}

function handleSelect(rows: string[]) {
  selectedRows.value = rows
}
</script>

<style scoped></style>