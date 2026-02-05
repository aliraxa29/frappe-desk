<template>
  <div 
    class="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden"
  >
    <button
      type="button"
      class="flex items-center justify-between w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-left transition-colors duration-200"
      :class="{ 'border-b border-slate-200 dark:border-slate-700': isOpen }"
      @click="toggle"
    >
      <div class="flex items-center gap-2 font-semibold text-sm text-slate-700 dark:text-slate-200">
        <slot name="icon">
          <svg
            v-if="showIcon"
            class="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200"
            :class="{ 'rotate-90': isOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </slot>
        <span class="flex-1">{{ label }}</span>
        <span 
          v-if="badge" 
          class="inline-flex items-center justify-center min-w-5 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full"
        >
          {{ badge }}
        </span>
      </div>
      <slot name="actions" />
    </button>
    
    <div v-if="isOpen" class="overflow-hidden">
      <div class="p-4">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  defaultOpen?: boolean
  collapsible?: boolean
  showIcon?: boolean
  badge?: string | number
  modelValue?: boolean
}>(), {
  defaultOpen: true,
  collapsible: true,
  showIcon: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  toggle: [isOpen: boolean]
}>()

// Use simple ref for internal state
const isOpen = ref(props.modelValue ?? props.defaultOpen)

// Watch for v-model changes from parent
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) {
    isOpen.value = newVal
  }
})

// Watch for defaultOpen changes
watch(() => props.defaultOpen, (newVal) => {
  if (props.modelValue === undefined) {
    isOpen.value = newVal
  }
})

function toggle() {
  if (!props.collapsible) return
  
  isOpen.value = !isOpen.value
  emit('update:modelValue', isOpen.value)
  emit('toggle', isOpen.value)
}
</script>
