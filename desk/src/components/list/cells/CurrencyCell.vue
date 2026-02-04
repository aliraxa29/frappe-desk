<template>
  <span 
    v-if="value !== null && value !== undefined" 
    class="font-mono tabular-nums"
    :class="valueClass"
  >
    {{ formattedValue }}
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

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return ''
  
  const num = Number(props.value)
  if (isNaN(num)) return props.value
  
  // Determine precision
  const precision = props.field.precision ?? (props.field.fieldtype === 'Currency' ? 2 : 2)
  
  // Format based on field type
  if (props.field.fieldtype === 'Currency') {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    })
  }
  
  if (props.field.fieldtype === 'Percent') {
    return `${num.toFixed(precision)}%`
  }
  
  if (props.field.fieldtype === 'Int') {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision
  })
})

const valueClass = computed(() => {
  const num = Number(props.value)
  if (isNaN(num)) return ''
  
  if (num < 0) return 'text-red-600'
  if (num > 0 && props.field.fieldtype === 'Currency') return 'text-slate-900'
  return ''
})
</script>
