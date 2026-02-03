<template>
  <span class="cell-display" :class="displayClass">
    <!-- Check -->
    <template v-if="field.fieldtype === 'Check'">
      <svg v-if="value" class="check-icon checked" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg v-else class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </template>

    <!-- Link -->
    <template v-else-if="field.fieldtype === 'Link'">
      <span class="link-value">{{ value || '-' }}</span>
    </template>

    <!-- Select -->
    <template v-else-if="field.fieldtype === 'Select'">
      <span class="select-badge" v-if="value">{{ value }}</span>
      <span v-else class="empty-value">-</span>
    </template>

    <!-- Currency/Float/Int/Percent -->
    <template v-else-if="['Currency', 'Float', 'Int', 'Percent'].includes(field.fieldtype)">
      <span class="number-value">
        {{ formatNumber(value, field.fieldtype, field.precision) }}
      </span>
    </template>

    <!-- Date -->
    <template v-else-if="field.fieldtype === 'Date'">
      <span class="date-value">{{ formatDate(value) }}</span>
    </template>

    <!-- DateTime -->
    <template v-else-if="field.fieldtype === 'DateTime'">
      <span class="date-value">{{ formatDateTime(value) }}</span>
    </template>

    <!-- Time -->
    <template v-else-if="field.fieldtype === 'Time'">
      <span class="time-value">{{ value || '-' }}</span>
    </template>

    <!-- Color -->
    <template v-else-if="field.fieldtype === 'Color'">
      <span class="color-display">
        <span class="color-swatch" :style="{ background: value || '#ccc' }"></span>
        <span>{{ value || '-' }}</span>
      </span>
    </template>

    <!-- Image/Attach -->
    <template v-else-if="['Image', 'Attach', 'Attach Image'].includes(field.fieldtype)">
      <span v-if="value" class="attach-value">📎 {{ getFileName(value) }}</span>
      <span v-else class="empty-value">-</span>
    </template>

    <!-- Text Editor/Long Text/Small Text -->
    <template v-else-if="['Text Editor', 'Long Text', 'Small Text', 'Text'].includes(field.fieldtype)">
      <span class="text-value" :title="value">{{ truncateText(value, 50) }}</span>
    </template>

    <!-- Default (Data, etc.) -->
    <template v-else>
      <span class="data-value">{{ value ?? '-' }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Field } from '../../types'

const props = defineProps<{
  field: Field
  value: any
}>()

const displayClass = computed(() => {
  return `cell-${props.field.fieldtype.toLowerCase().replace(/\s+/g, '-')}`
})

function formatNumber(value: any, fieldtype: string, precision?: number): string {
  if (value === null || value === undefined || value === '') return '-'
  
  const num = parseFloat(value)
  if (isNaN(num)) return String(value)
  
  const prec = precision ?? (fieldtype === 'Int' ? 0 : 2)
  
  if (fieldtype === 'Currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: prec,
      maximumFractionDigits: prec
    }).format(num)
  }
  
  if (fieldtype === 'Percent') {
    return `${num.toFixed(prec)}%`
  }
  
  return num.toFixed(prec)
}

function formatDate(value: any): string {
  if (!value) return '-'
  try {
    const date = new Date(value)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return String(value)
  }
}

function formatDateTime(value: any): string {
  if (!value) return '-'
  try {
    const date = new Date(value)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return String(value)
  }
}

function getFileName(path: string): string {
  if (!path) return ''
  const parts = path.split('/')
  return parts[parts.length - 1] || path
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return '-'
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen) + '...'
}
</script>

<style scoped>
.cell-display {
  display: inline-flex;
  align-items: center;
  min-height: 1.25rem;
}

.check-icon {
  width: 1rem;
  height: 1rem;
  color: #94a3b8;
}

.check-icon.checked {
  color: #22c55e;
}

.link-value {
  color: #3b82f6;
  font-weight: 500;
}

.select-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  border-radius: 9999px;
}

.number-value {
  font-variant-numeric: tabular-nums;
  color: #334155;
}

.date-value,
.time-value {
  color: #64748b;
  font-size: 0.8125rem;
}

.color-display {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.color-swatch {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #e2e8f0;
}

.attach-value {
  color: #3b82f6;
  font-size: 0.8125rem;
}

.text-value {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-value {
  color: #334155;
}

.empty-value {
  color: #94a3b8;
}
</style>
