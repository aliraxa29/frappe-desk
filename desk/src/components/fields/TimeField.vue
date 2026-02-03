<template>
  <div class="mb-4 flex flex-col relative">
    <label v-if="field.label" class="font-medium mb-1 text-sm text-slate-700">
      {{ field.label }}
      <span v-if="field.reqd" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Time Input Field -->
    <input
      ref="inputRef"
      :value="displayTime"
      :placeholder="field.description || 'HH:MM:SS'"
      :disabled="field.read_only"
      :required="field.reqd && !field.read_only"
      type="text"
      class="w-full px-3 py-2 border border-[#ddd] rounded focus:outline-none focus:border-[#0066cc] focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed text-[0.95rem] transition-colors duration-200"
      readonly
      @focus="showPicker = true"
    />

    <small v-if="field.description" class="block text-gray-600 mt-1 text-[0.85rem]">{{ field.description }}</small>

    <!-- Time Picker Popover -->
    <Transition name="picker">
      <div
        v-if="showPicker"
        ref="pickerRef"
        class="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-18"
        style="width: 240px"
      >
        <!-- Time Display -->
        <div class="text-center mb-3 pb-2 border-b border-gray-200">
          <div class="text-lg font-semibold text-slate-900 font-mono">
            {{ padTime(hour) }}:{{ padTime(minute) }}:{{ padTime(second) }}
          </div>
        </div>

        <!-- Hour Slider -->
        <div class="mb-3">
          <div class="flex justify-between items-center mb-1">
            <label class="text-xs font-medium text-slate-600 uppercase tracking-wide text-[11px]">Hour</label>
            <span class="text-xs font-semibold text-slate-700">{{ padTime(hour) }}</span>
          </div>
          <input
            v-model.number="hour"
            type="range"
            min="0"
            max="23"
            class="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer slider"
            @input="updateTime"
          />
        </div>

        <!-- Minute Slider -->
        <div class="mb-3">
          <div class="flex justify-between items-center mb-1">
            <label class="text-xs font-medium text-slate-600 uppercase tracking-wide text-[11px]">Minute</label>
            <span class="text-xs font-semibold text-slate-700">{{ padTime(minute) }}</span>
          </div>
          <input
            v-model.number="minute"
            type="range"
            min="0"
            max="59"
            class="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer slider"
            @input="updateTime"
          />
        </div>

        <!-- Second Slider -->
        <div class="mb-3">
          <div class="flex justify-between items-center mb-1">
            <label class="text-xs font-medium text-slate-600 uppercase tracking-wide text-[11px]">Second</label>
            <span class="text-xs font-semibold text-slate-700">{{ padTime(second) }}</span>
          </div>
          <input
            v-model.number="second"
            type="range"
            min="0"
            max="59"
            class="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer slider"
            @input="updateTime"
          />
        </div>

        <!-- Now Button -->
        <div class="border-t border-gray-200 pt-2 mt-3">
          <Button
            @click="setNow"
            class="w-full px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors duration-200"
          >
            Now
        </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Field, FormContext } from '../../types'
import Button from '../Button.vue';

interface Props {
  field: Field
  ctx: FormContext
}

const props = defineProps<Props>()
const emit = defineEmits<{
  fieldChange: [value: any]
}>()

// Time state
const hour = ref(0)
const minute = ref(0)
const second = ref(0)
const showPicker = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const pickerRef = ref<HTMLElement | null>(null)

const displayTime = computed(() => {
  const currentValue = props.ctx.doc?.[props.field.fieldname] as string || ''
  return currentValue || '00:00:00'
})

// Parse time string (HH:MM:SS)
function parseTime(timeStr: string) {
  if (!timeStr || typeof timeStr !== 'string') {
    hour.value = 0
    minute.value = 0
    second.value = 0
    return
  }

  const parts = timeStr.split(':')
  hour.value = parseInt(parts[0] || '0', 10) || 0
  minute.value = parseInt(parts[1] || '0', 10) || 0
  second.value = parseInt(parts[2] || '0', 10) || 0
}

// Format time string
function formatTime(): string {
  return `${padTime(hour.value)}:${padTime(minute.value)}:${padTime(second.value)}`
}

// Pad time values with leading zero
function padTime(value: number): string {
  return String(value).padStart(2, '0')
}

// Update the time value
function updateTime() {
  const timeStr = formatTime()
  props.ctx.set_value(props.field.fieldname, timeStr)
  emit('fieldChange', timeStr)
}

// Set to current time
function setNow() {
  const now = new Date()
  hour.value = now.getHours()
  minute.value = now.getMinutes()
  second.value = now.getSeconds()
  updateTime()
}

// Initialize from current value
onMounted(() => {
  parseTime(displayTime.value)

  // Click outside handler
  const handleClickOutside = (event: Event) => {
    if (
      showPicker.value &&
      pickerRef.value &&
      !pickerRef.value.contains(event.target as Node) &&
      !inputRef.value?.contains(event.target as Node)
    ) {
      showPicker.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)

  // Cleanup
  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
/* Range slider styling */
.slider {
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #2563eb;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  margin-top: -6.25px;
}

.slider::-webkit-slider-thumb:hover {
  background: #1d4ed8;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transform: scale(1.15);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #2563eb;
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  background: #1d4ed8;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transform: scale(1.15);
}

.slider::-webkit-slider-runnable-track {
  background: linear-gradient(to right, #2563eb 0%, #2563eb var(--percentage), #e5e7eb var(--percentage), #e5e7eb 100%);
  height: 6px;
  border-radius: 3px;
}

.slider::-moz-range-track {
  background: transparent;
  border: none;
}

.slider::-moz-range-progress {
  background: #2563eb;
  height: 6px;
  border-radius: 3px;
}

/* Transitions */
.picker-enter-active,
.picker-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
