<template>
  <div>
    <FormRenderer
      :doctype="doctype"
      :docname="name"
      @close="handleClose"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import FormRenderer from './FormRenderer.vue'

const route = useRoute()
const router = useRouter()
const doctype = (route.params.doctype as string) || ''
const name = (route.params.name as string) || ''

function handleClose() {
  router.back()
}

function handleSave(doc: any) {
  router.push(`/form/${doctype}/${doc.name}`)
}
</script>