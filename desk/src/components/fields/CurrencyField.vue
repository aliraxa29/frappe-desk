<template>
  <div class="mb-4 flex flex-col">
    <label v-if="field.label" :for="`field-${field.fieldname}`" class="font-medium mb-1 text-sm text-slate-700">
      {{ field.label }}
      <span v-if="field.reqd" class="text-red-500 ml-1">*</span>
    </label>
    <div class="relative">
      <span
        v-if="currencySymbol"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[0.95rem]"
      >
        {{ currencySymbol }}
      </span>
      <input
        :id="`field-${field.fieldname}`"
        :value="localValue"
        :readonly="field.read_only"
        :required="field.reqd"
        type="text"
        inputmode="decimal"
        class="w-full px-3 py-2 border border-[#ddd] rounded focus:outline-none focus:border-[#0066cc] focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] read-only:bg-gray-100 read-only:cursor-not-allowed text-[0.95rem] transition-colors duration-200 text-right"
        :class="currencySymbol ? 'pl-8' : ''"
        @input="updateValue"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
    <small v-if="field.description" class="block text-gray-600 mt-1 text-[0.85rem]">{{ field.description }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Field, FormContext } from '../../types'

const props = defineProps<{
  field: Field
  ctx: FormContext
}>()

const emit = defineEmits<{
  fieldChange: [value: any]
}>()

const localValue = ref('0')
const isFocused = ref(false)

const currencyCode = computed(() => {
  const desk = (window as any)?.desk
  if (desk?.meta?.get_field_currency) {
    try {
      return desk.meta.get_field_currency(props.field, props.ctx.doc)
    } catch {
      // ignore
    }
  }

  const options = props.field.options
  if (options && typeof options === 'string') {
    const docValue = props.ctx.doc?.[options]
    if (typeof docValue === 'string' && docValue.trim()) return docValue
    if (options.length <= 5) return options
  }

  return desk?.boot?.sysdefaults?.currency || ''
})

const currencySymbol = computed(() => {
  if (!currencyCode.value) return ''
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode.value,
      currencyDisplay: 'symbol'
    }).formatToParts(0)
    return parts.find((p) => p.type === 'currency')?.value || currencyCode.value
  } catch {
    return currencyCode.value
  }
})

function updateValue(e: Event) {
  localValue.value = (e.target as HTMLInputElement).value
}

function handleFocus() {
  isFocused.value = true
}

function handleBlur() {
  isFocused.value = false
  let raw = localValue.value.trim()
  if (currencySymbol.value) raw = raw.replaceAll(currencySymbol.value, '')
  if (currencyCode.value) raw = raw.replaceAll(currencyCode.value, '')
  raw = raw.replace(/[^0-9+\-.,]/g, '').replace(/,/g, '')

  if (!raw) {
    props.ctx.set_value(props.field.fieldname, null)
    emit('fieldChange', null)
    localValue.value = '0'
    return
  }

  const parsed = Number(raw)
  if (Number.isNaN(parsed)) {
    props.ctx.set_value(props.field.fieldname, null)
    emit('fieldChange', null)
    localValue.value = '0'
    return
  }

  const precision = props.field.precision
  const normalized = typeof precision === 'number' && precision >= 0
    ? Number(parsed.toFixed(precision))
    : parsed

  props.ctx.set_value(props.field.fieldname, normalized)
  emit('fieldChange', normalized)
  localValue.value = typeof precision === 'number' && precision >= 0
    ? normalized.toFixed(precision)
    : String(normalized)
}

watch(
  () => props.ctx.doc?.[props.field.fieldname],
  (next) => {
    if (isFocused.value) return
    if (next === null || next === undefined || next === '') {
      localValue.value = '0'
      return
    }

    const precision = props.field.precision
    const numeric = Number(next)
    if (Number.isNaN(numeric)) {
      localValue.value = ''
      return
    }

    localValue.value = typeof precision === 'number' && precision >= 0
      ? numeric.toFixed(precision)
      : String(numeric)
  },
  { immediate: true }
)
</script>
