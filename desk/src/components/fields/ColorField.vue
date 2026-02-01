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
      type="color"
      class="field-color"
      @input="updateValue"
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
  const value = (e.target as HTMLInputElement).value
  ctx.set_value(field.fieldname, value)
  emit('fieldChange', value)
}
</script>

<style scoped>
.field-wrapper {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.field-label {
  font-weight: 500;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.required {
  color: #dc3545;
  margin-left: 0.25rem;
}

.field-color {
  width: 4rem;
  height: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.field-color:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.field-color:disabled {
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
