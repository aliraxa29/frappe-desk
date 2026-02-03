<template>
  <span v-if="formattedDate" class="text-slate-600 whitespace-nowrap">
    {{ formattedDate }}
  </span>
  <span v-else class="text-slate-400">—</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Field, Document } from '../../../types'

const props = defineProps<{
  value: any
  field: Field
  row?: Document
}>()

const formattedDate = computed(() => {
  if (!props.value) return ''
  
  try {
    const date = new Date(props.value)
    if (isNaN(date.getTime())) return props.value
    
    // Check if it's datetime or just date
    const isDateTime = props.field.fieldtype === 'DateTime' || props.value.includes(' ')
    
    if (isDateTime) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return props.value
  }
})
</script>
