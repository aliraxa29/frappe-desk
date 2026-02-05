<template>
  <AppLayout>
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between gap-4 w-full py-4">
        <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
          {{ doctype }} 
        </h2>
        <span>{{ isNewDocument ? '(New)' : documentName }}</span>
      </div>
    </template>

    <!-- Content -->
    <template #content>
      <div class="relative pb-5">
        <FormRenderer 
          ref="formContext" 
          :doctype="doctype" 
          :docname="documentName"
          @loading="loading = $event"
        />
        
        <!-- Bottom Action Bar -->
        <BottomActionBar
          :show="formContext?.isDirty || false"
          :loading="loading"
          @save="handleSave"
          @discard="handleDiscard"
        />
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../layout/AppLayout.vue'
import { computed, ref, watch, onMounted } from 'vue'
import FormRenderer from './FormRenderer.vue'
import BottomActionBar from '../components/BottomActionBar.vue'
import { useBreadcrumbStore } from '../stores/breadcrumbs'

const formContext = ref()
const route = useRoute()
const router = useRouter()
const breadcrumbStore = useBreadcrumbStore()
const loading = ref(false)

const app = computed(() => route.params.app as string)
const doctype = computed(() => route.params.doctype as string)

// Determine if this is a new document or existing document
// New documents use the /new route path
const documentName = computed(() => {
  const param = route.params.name
  
  // If route name is explicitly 'NewForm' or param is 'new', it's a new document
  if (route.name === 'NewForm' || param === 'new') {
    return null
  }
  
  // Otherwise, it's an existing document name
  return param as string
})

const isNewDocument = computed(() => {
  return route.name === 'NewForm' || documentName.value === null
})

// Update breadcrumbs
watch([app, doctype, documentName], () => {
  breadcrumbStore.setForForm(app.value, doctype.value, documentName.value)
}, { immediate: true })

onMounted(() => {
  breadcrumbStore.setForForm(app.value, doctype.value, documentName.value)
})

const handleSave = () => {
  if (formContext.value?.handleSave) {
    formContext.value.handleSave()
  }
}

const handleDiscard = () => {
  if (formContext.value?.handleDiscard) {
    formContext.value.handleDiscard()
  }
}
</script>

<style scoped>
</style>