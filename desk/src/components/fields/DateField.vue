<template>
  <div class="mb-4 flex flex-col relative">
    <label v-if="field.label" :for="`field-${field.fieldname}`" class="font-medium mb-1 text-sm text-slate-700 dark:text-slate-200">
      {{ field.label }}
      <span v-if="field.reqd" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Date Input Field -->
    <input
      ref="inputRef"
      :id="`field-${field.fieldname}`"
      :value="displayDate"
      :placeholder="field.description || 'YYYY-MM-DD'"
      :disabled="field.read_only"
      :required="field.reqd && !field.read_only"
      type="text"
      class="w-full px-3 py-2 border border-[#ddd] dark:border-slate-700 rounded focus:outline-none focus:border-[#0066cc] focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] disabled:bg-gray-100 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-[0.95rem] transition-colors duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
      readonly
      @focus="showPicker = true"
    />
    <small v-if="field.description" class="block text-gray-600 dark:text-slate-400 mt-1 text-[0.85rem]">{{ field.description }}</small>

    <!-- Date Picker Popover -->
    <Transition name="picker">
      <div
        v-if="showPicker"
        ref="pickerRef"
        class="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg p-3 z-50"
        style="width: 320px"
      >
        <!-- Date Display -->
        <div class="text-center mb-3 pb-2 border-b border-gray-200 dark:border-slate-700">
          <div class="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
            {{ formatDate(year, month, day) }}
          </div>
        </div>

        <!-- Calendar Section -->
        <div class="mb-3">
          <!-- Month/Year Navigation -->
          <div class="flex justify-between items-center mb-3">
            <button
              @click="prevMonth"
              class="px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors duration-200"
            >
              ← Prev
            </button>
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {{ getMonthName(month) }} {{ year }}
            </span>
            <button
              @click="nextMonth"
              class="px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors duration-200"
            >
              Next →
            </button>
          </div>

          <!-- Day Labels -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div
              v-for="dayLabel in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
              :key="dayLabel"
              class="text-center text-xs font-semibold text-gray-500 dark:text-slate-400"
            >
              {{ dayLabel }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="d in calendarDays"
              :key="d"
              :disabled="d === 0"
              :class="getDayButtonClass(d)"
              @click="selectDay(d)"
              class="text-xs py-1 cursor-pointer rounded transition-colors disabled:cursor-default hover:bg-gray-300 dark:hover:bg-slate-700"
            >
              {{ d || '' }}
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="border-t border-gray-200 dark:border-slate-700 pt-3 flex gap-2">
          <button
            @click="setToday"
            class="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors duration-200"
          >
            Today
          </button>
          <button
            @click="clearDate"
            class="flex-1 px-3 py-1.5 bg-gray-400 text-white rounded font-medium text-xs hover:bg-gray-500 transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Field, FormContext } from '../../types'

interface Props {
  field: Field
  ctx: FormContext
}

const props = defineProps<Props>()
const emit = defineEmits<{
  fieldChange: [value: any]
}>()

// Date state
const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth())
const day = ref(new Date().getDate())
const showPicker = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const pickerRef = ref<HTMLElement | null>(null)

const displayDate = computed(() => {
  const currentValue = props.ctx.doc?.[props.field.fieldname] as string || ''
  return currentValue || ''
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

  const isSelected = d === day.value && month.value === new Date(displayDate.value || Date.now()).getMonth() && year.value === new Date(displayDate.value || Date.now()).getFullYear()
  const isCurrentDay = d === new Date().getDate() && month.value === new Date().getMonth() && year.value === new Date().getFullYear()

  if (isSelected) return 'bg-blue-600 text-white font-semibold'
  if (isCurrentDay) return 'border border-blue-400 text-slate-900 dark:text-slate-100 font-medium'
  return 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700'
}

function selectDay(d: number) {
  if (d === 0) return
  day.value = d
  updateDate()
  showPicker.value = false
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
  return months[m] ?? ''
}

function padTime(value: number): string {
  return value.toString().padStart(2, '0')
}

function formatDate(y: number, m: number, d: number): string {
  return `${y}-${padTime(m + 1)}-${padTime(d)}`
}

function updateDate() {
  const formattedDate = formatDate(year.value, month.value, day.value)
  props.ctx.set_value(props.field.fieldname, formattedDate)
  emit('fieldChange', formattedDate)
}

function setToday() {
  const today = new Date()
  year.value = today.getFullYear()
  month.value = today.getMonth()
  day.value = today.getDate()
  updateDate()
  showPicker.value = false
}

function clearDate() {
  props.ctx.set_value(props.field.fieldname, '')
  emit('fieldChange', '')
  showPicker.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (
    pickerRef.value &&
    inputRef.value &&
    !pickerRef.value.contains(event.target as Node) &&
    !inputRef.value.contains(event.target as Node)
  ) {
    showPicker.value = false
  }
}

onMounted(() => {
  // Initialize from current value if exists
  const currentValue = props.ctx.doc?.[props.field.fieldname] as string
  if (currentValue) {
    const date = new Date(currentValue)
    if (!isNaN(date.getTime())) {
      year.value = date.getFullYear()
      month.value = date.getMonth()
      day.value = date.getDate()
    }
  }

  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.picker-enter-active,
.picker-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
