<template>
  <div class="field-wrapper">
    <label v-if="field.label" :for="`field-${field.fieldname}`" class="field-label">
      {{ field.label }}
      <span v-if="field.reqd" class="required">*</span>
    </label>
    <input
      :id="`field-${field.fieldname}`"
      :value="ctx.doc[field.fieldname]"
      :readonly="field.read_only"
      :required="field.reqd"
      type="checkbox"
      class="field-checkbox"
      @change="updateValue"
    />
    <small v-if="field.description" class="field-description">{{ field.description }}</small>
  </div>
</template>

<script setup lang="ts">
import type { Field, FormContext } from '@/types'

defineProps<{ field: Field; ctx: FormContext }>()

const emit = defineEmits<{
  fieldChange: [value: any]
}>()

function updateValue(e: Event) {
  const value = (e.target as HTMLInputElement).checked ? 1 : 0
  ctx.set_value(field.fieldname, value)
  emit('fieldChange', value)
}
</script>

<style scoped>
.field-wrapper {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-label {
  font-weight: 500;
  font-size: 0.95rem;
}

.required {
  color: #dc3545;
  margin-left: 0.25rem;
}

.field-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.field-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.field-description {
  display: block;
  color: #666;
  margin-top: 0.25rem;
  font-size: 0.85rem;
}
</style>
