<template>
  <div class="mb-4">
    <label :for="id" class="flex items-start gap-3 cursor-pointer select-none"
      :class="field.read_only ? 'cursor-not-allowed opacity-60' : ''">
      <div class="relative mt-0.5">
        <input
          :id="id"
          type="checkbox"
          class="sr-only peer"
          :checked="modelValue"
          :required="field.reqd"
          :disabled="field.read_only"
          @change="updateValue"
        />
        <div class="h-5 w-9 rounded-full transition bg-gray-300 dark:bg-slate-700 peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2">

        </div>
        <div class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white dark:bg-slate-800 shadow transition-transform peer-checked:translate-x-4"></div>
      </div>
      <div class="flex flex-col">
        <span class="text-sm font-medium text-gray-900 dark:text-slate-100">
          {{ field.label }}
          <span v-if="field.reqd" class="text-red-500">*</span>
        </span>

        <span v-if="field.description" class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          {{ field.description }}
        </span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Field, FormContext } from '../../types'

const props = defineProps<{
  field: Field
  ctx: FormContext
}>()

const emit = defineEmits<{
  fieldChange: [value: number]
}>()

const id = `field-${props.field.fieldname}`

const modelValue = computed(() => {
  return Boolean(props.ctx.doc[props.field.fieldname])
})

function updateValue(e: Event) {
  const value = (e.target as HTMLInputElement).checked ? 1 : 0
  props.ctx.set_value(props.field.fieldname, value)
  emit('fieldChange', value)
}
</script>
