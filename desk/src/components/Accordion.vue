<template>
  <div class="accordion" :class="{ 'accordion-collapsed': !isOpen }">
    <button
      type="button"
      class="accordion-header"
      :class="{ 'accordion-header-open': isOpen }"
      @click="toggle"
    >
      <div class="accordion-title">
        <slot name="icon">
          <svg
            v-if="showIcon"
            class="accordion-chevron"
            :class="{ 'accordion-chevron-open': isOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </slot>
        <span class="accordion-label">{{ label }}</span>
        <span v-if="badge" class="accordion-badge">{{ badge }}</span>
      </div>
      <slot name="actions" />
    </button>
    
    <Transition name="accordion">
      <div v-show="isOpen" class="accordion-content">
        <div class="accordion-body">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

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

const internalOpen = ref(props.defaultOpen)

// Support v-model
const isOpen = computed({
  get: () => props.modelValue !== undefined ? props.modelValue : internalOpen.value,
  set: (val) => {
    internalOpen.value = val
    emit('update:modelValue', val)
  }
})

function toggle() {
  if (!props.collapsible) return
  isOpen.value = !isOpen.value
  emit('toggle', isOpen.value)
}

// Watch for external changes
watch(() => props.defaultOpen, (val) => {
  if (props.modelValue === undefined) {
    internalOpen.value = val
  }
})
</script>

<style scoped>
.accordion {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #fff;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
}

.accordion-header:hover {
  background: #f1f5f9;
}

.accordion-header-open {
  border-bottom: 1px solid #e2e8f0;
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
}

.accordion-chevron {
  width: 1rem;
  height: 1rem;
  color: #64748b;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.accordion-chevron-open {
  transform: rotate(90deg);
}

.accordion-label {
  flex: 1;
}

.accordion-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #3b82f6;
  background: #dbeafe;
  border-radius: 9999px;
}

.accordion-content {
  overflow: hidden;
}

.accordion-body {
  padding: 1rem;
}

/* Transition */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.2s ease;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 2000px;
}

/* Collapsed state */
.accordion-collapsed .accordion-header {
  border-bottom: none;
}
</style>
