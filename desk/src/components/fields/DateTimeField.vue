<template>
  <div class="mb-4 flex flex-col relative">
    <label v-if="field.label" :for="`field-${field.fieldname}`" class="font-medium mb-1 text-sm text-slate-700 dark:text-slate-200">
      {{ field.label }}
      <span v-if="field.reqd" class="text-red-500 ml-1">*</span>
    </label>

    <!-- DateTime Input Field -->
    <input ref="inputRef"
      :id="`field-${field.fieldname}`"
      :value="displayDateTime"
      :placeholder="field.description || 'YYYY-MM-DD HH:MM:SS'"
      :disabled="field.read_only"
      :required="field.reqd && !field.read_only"
      type="text"
      class="w-full px-3 py-2 border border-[#ddd] dark:border-slate-700 rounded focus:outline-none focus:border-[#0066cc] focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] disabled:bg-gray-100 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-[0.95rem] transition-colors duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
      readonly 
      @focus="showPicker = true"
    />
    <small v-if="field.description" class="block text-gray-600 mt-1 text-[0.85rem]">{{ field.description }}</small>

    <!-- DateTime Picker Popover -->
    <Transition name="picker">
      <div v-if="showPicker" ref="pickerRef"
        class="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg p-3 z-18"
        style="width: 320px">
        <!-- DateTime Display -->
        <div class="text-center mb-3 pb-2 border-b border-gray-200">
          <div class="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
            {{ formatDate(year, month, day) }} {{ padTime(hour) }}:{{ padTime(minute) }}:{{ padTime(second) }}
          </div>
        </div>

        <!-- Calendar Section -->
        <div class="mb-3">
          <!-- Month/Year Navigation -->
          <div class="flex justify-between items-center mb-3">
            <Button @click="prevMonth" size="sm"
              class="px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors duration-200">
              ← Prev
            </Button>
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {{ getMonthName(month) }} {{ year }}
            </span>
            <Button @click="nextMonth" size="sm"
              class="px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors duration-200">
              Next →
            </Button>
          </div>

          <!-- Day Labels -->
            <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="dayLabel in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="dayLabel"
              class="text-center text-xs font-semibold text-gray-500 dark:text-slate-400">
              {{ dayLabel }}
            </div>
          </div>

          <!-- Calendar Days -->
            <div class="grid grid-cols-7 gap-1">
            <button v-for="d in calendarDays" :key="d" :disabled="d === 0" :class="getDayButtonClass(d)"
              @click="selectDay(d)"
              class="text-xs py-1 cursor-pointer rounded transition-colors disabled:cursor-default hover:bg-gray-300 dark:hover:bg-slate-700">
              {{ d || '' }}
            </button>
          </div>
        </div>

        <!-- Time Section -->
        <div class="border-t border-gray-200 pt-3">
          <!-- Hour Slider -->
            <div class="mb-2">
            <div class="flex justify-between items-center mb-1">
              <label class="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide text-[11px]">Hour</label>
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ padTime(hour) }}</span>
            </div>
            <input v-model.number="hour" type="range" min="0" max="23"
              class="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer slider" @input="updateDateTime" />
          </div>

          <!-- Minute Slider -->
            <div class="mb-2">
            <div class="flex justify-between items-center mb-1">
              <label class="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide text-[11px]">Minute</label>
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ padTime(minute) }}</span>
            </div>
            <input v-model.number="minute" type="range" min="0" max="59"
              class="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer slider" @input="updateDateTime" />
          </div>

          <!-- Second Slider -->
            <div class="mb-3">
            <div class="flex justify-between items-center mb-1">
              <label class="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide text-[11px]">Second</label>
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ padTime(second) }}</span>
            </div>
            <input v-model.number="second" type="range" min="0" max="59"
              class="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer slider" @input="updateDateTime" />
          </div>

          <!-- Now Button -->
          <Button @click="setNow"
            class="w-full px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors duration-200">
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

// DateTime state
const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth())
const day = ref(new Date().getDate())
const hour = ref(0)
const minute = ref(0)
const second = ref(0)
const showPicker = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const pickerRef = ref<HTMLElement | null>(null)

const displayDateTime = computed(() => {
  const currentValue = props.ctx.doc?.[props.field.fieldname] as string || ''
  return currentValue || '0000-00-00 00:00:00'
})

// Get calendar days for current month
const calendarDays = computed(() => {
  const firstDay = new Date(year.value, month.value, 1).getDay()
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()
  const days: number[] = []

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(0)
  }

  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return days
})

function getDayButtonClass(d: number): string {
  if (d === 0) return 'bg-transparent'

  const isSelected = d === day.value && month.value === new Date().getMonth() && year.value === new Date().getFullYear()
  const isCurrentDay = d === new Date().getDate() && month.value === new Date().getMonth() && year.value === new Date().getFullYear()

  if (isSelected) return 'bg-blue-600 text-white font-semibold'
  if (isCurrentDay) return 'border border-blue-400 text-slate-900 dark:text-slate-100 font-medium'
  return 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700'
}

function selectDay(d: number) {
  if (d === 0) return
  day.value = d
  updateDateTime()
}

function prevMonth() {
  if (month.value === 0) {
    month.value = 11
    year.value--
  } else {
    month.value--
  }
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
}

function getMonthName(m: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return months[m] ?? ""
}

function formatDate(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function padTime(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDateTime(): string {
  const date = formatDate(year.value, month.value, day.value)
  const time = `${padTime(hour.value)}:${padTime(minute.value)}:${padTime(second.value)}`
  return `${date} ${time}`
}

function parseDateTime(dateTimeStr: string) {
  if (!dateTimeStr || typeof dateTimeStr !== 'string') {
    const now = new Date()
    year.value = now.getFullYear()
    month.value = now.getMonth()
    day.value = now.getDate()
    hour.value = now.getHours()
    minute.value = now.getMinutes()
    second.value = now.getSeconds()
    return
  }

  const [datePart, timePart] = dateTimeStr.split(' ')
  if (!datePart) return

  const [y, m, d] = datePart.split('-').map(Number)
  year.value = y || new Date().getFullYear()
  month.value = (m || 1) - 1
  day.value = d || new Date().getDate()

  if (timePart) {
    const [h, min, s] = timePart.split(':').map(Number)
    hour.value = h || 0
    minute.value = min || 0
    second.value = s || 0
  }
}

function updateDateTime() {
  const dateTimeStr = formatDateTime()
  props.ctx.set_value(props.field.fieldname, dateTimeStr)
  emit('fieldChange', dateTimeStr)
}

function setNow() {
  const now = new Date()
  year.value = now.getFullYear()
  month.value = now.getMonth()
  day.value = now.getDate()
  hour.value = now.getHours()
  minute.value = now.getMinutes()
  second.value = now.getSeconds()
  updateDateTime()
}

onMounted(() => {
  parseDateTime(displayDateTime.value)

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
