<template>
  <span 
    v-if="value"
    class="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate max-w-xs inline-block"
    :title="value"
    @click.stop="openLink"
  >
    {{ value }}
  </span>
  <span v-else class="text-slate-400">—</span>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import type { Field, Document } from '../../../types'

const props = defineProps<{
  value: any
  field: Field
  row?: Document
}>()

const router = useRouter()
const route = useRoute()

function openLink() {
  if (!props.value || !props.field.options) return
  
  router.push({
    name: 'EditForm',
    params: {
      app: route.params.app,
      doctype: props.field.options,
      name: props.value
    }
  })
}
</script>
