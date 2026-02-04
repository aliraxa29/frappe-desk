<template>
  <div class="modal-field-editor">
    <label class="field-label">
      {{ field.label || field.fieldname }}
      <span v-if="field.reqd" class="required-mark">*</span>
    </label>

    <!-- Check -->
    <template v-if="field.fieldtype === 'Check'">
      <div class="check-wrapper">
        <input
          type="checkbox"
          :id="`field-${field.fieldname}`"
          :checked="!!value"
          @change="emit('update', ($event.target as HTMLInputElement).checked ? 1 : 0)"
          class="check-input"
        />
        <label :for="`field-${field.fieldname}`" class="check-label">
          {{ field.description || 'Enable' }}
        </label>
      </div>
    </template>

    <!-- Select -->
    <template v-else-if="field.fieldtype === 'Select'">
      <select
        :value="value"
        @change="emit('update', ($event.target as HTMLSelectElement).value)"
        class="form-select"
        :required="field.reqd"
      >
        <option value="">Select {{ field.label }}...</option>
        <option v-for="opt in selectOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </template>

    <!-- Link -->
    <template v-else-if="field.fieldtype === 'Link'">
      <div class="link-input-wrapper">
        <input
          type="text"
          :value="value"
          @input="emit('update', ($event.target as HTMLInputElement).value)"
          :placeholder="`Select ${field.options || field.label}`"
          class="form-input"
          :required="field.reqd"
        />
        <!-- TODO: Add Link search button -->
      </div>
    </template>

    <!-- Int -->
    <template v-else-if="field.fieldtype === 'Int'">
      <input
        type="number"
        :value="value"
        @input="emit('update', parseInt(($event.target as HTMLInputElement).value) || 0)"
        step="1"
        class="form-input number-input"
        :required="field.reqd"
      />
    </template>

    <!-- Float/Currency/Percent -->
    <template v-else-if="['Float', 'Currency', 'Percent'].includes(field.fieldtype)">
      <div class="number-input-wrapper">
        <span v-if="field.fieldtype === 'Currency'" class="input-prefix">$</span>
        <input
          type="number"
          :value="value"
          @input="emit('update', parseFloat(($event.target as HTMLInputElement).value) || 0)"
          :step="field.precision ? Math.pow(10, -field.precision) : 0.01"
          class="form-input number-input"
          :class="{ 'has-prefix': field.fieldtype === 'Currency', 'has-suffix': field.fieldtype === 'Percent' }"
          :required="field.reqd"
        />
        <span v-if="field.fieldtype === 'Percent'" class="input-suffix">%</span>
      </div>
    </template>

    <!-- Date -->
    <template v-else-if="field.fieldtype === 'Date'">
      <input
        type="date"
        :value="value"
        @input="emit('update', ($event.target as HTMLInputElement).value)"
        class="form-input"
        :required="field.reqd"
      />
    </template>

    <!-- Time -->
    <template v-else-if="field.fieldtype === 'Time'">
      <input
        type="time"
        :value="value"
        @input="emit('update', ($event.target as HTMLInputElement).value)"
        class="form-input"
        :required="field.reqd"
      />
    </template>

    <!-- DateTime -->
    <template v-else-if="field.fieldtype === 'DateTime'">
      <input
        type="datetime-local"
        :value="formatDateTimeLocal(value)"
        @input="emit('update', ($event.target as HTMLInputElement).value)"
        class="form-input"
        :required="field.reqd"
      />
    </template>

    <!-- Color -->
    <template v-else-if="field.fieldtype === 'Color'">
      <div class="color-input-wrapper">
        <input
          type="color"
          :value="value || '#000000'"
          @input="emit('update', ($event.target as HTMLInputElement).value)"
          class="color-input"
        />
        <input
          type="text"
          :value="value"
          @input="emit('update', ($event.target as HTMLInputElement).value)"
          placeholder="#000000"
          class="form-input color-text"
        />
      </div>
    </template>

    <!-- Small Text / Long Text / Text Editor -->
    <template v-else-if="['Small Text', 'Long Text', 'Text Editor', 'Text', 'Code', 'JSON'].includes(field.fieldtype)">
      <textarea
        :value="value"
        @input="emit('update', ($event.target as HTMLTextAreaElement).value)"
        :rows="field.fieldtype === 'Small Text' ? 2 : 4"
        class="form-textarea"
        :required="field.reqd"
      ></textarea>
    </template>

    <!-- Attach / Image -->
    <template v-else-if="['Attach', 'Attach Image', 'Image'].includes(field.fieldtype)">
      <div class="attach-wrapper">
        <input
          type="text"
          :value="value"
          @input="emit('update', ($event.target as HTMLInputElement).value)"
          placeholder="Enter file URL or path"
          class="form-input"
        />
        <label class="attach-upload-button">
          Upload
          <input
            type="file"
            class="attach-file-input"
            :accept="attachAccept"
            @change="onAttachFileChange"
          />
        </label>
      </div>
    </template>

    <!-- Default Text Input -->
    <template v-else>
      <input
        type="text"
        :value="value"
        @input="emit('update', ($event.target as HTMLInputElement).value)"
        class="form-input"
        :required="field.reqd"
        :placeholder="field.description || ''"
      />
    </template>

    <p v-if="field.description && field.fieldtype !== 'Check'" class="field-description">
      {{ field.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Field, DocTypeMeta } from '../../types'

const props = defineProps<{
  field: Field
  value: any
  meta?: DocTypeMeta | null
}>()

const emit = defineEmits<{
  update: [value: any]
}>()

// Parse select options from field.options
const selectOptions = computed<string[]>(() => {
  if (!props.field.options) return []
  return props.field.options.split('\n').filter(Boolean)
})

const attachAccept = computed(() => {
  return ['Attach Image', 'Image'].includes(props.field.fieldtype) ? 'image/*' : undefined
})

// Format datetime for datetime-local input
function formatDateTimeLocal(value: any): string {
  if (!value) return ''
  try {
    const date = new Date(value)
    return date.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

function onAttachFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('update', file.name)
  }
}
</script>

<style scoped>
.modal-field-editor {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
}

.required-mark {
  color: #ef4444;
  margin-left: 0.125rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #fff;
  color: #1e293b;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 4rem;
}

.number-input {
  text-align: right;
}

.number-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.input-prefix,
.input-suffix {
  position: absolute;
  color: #64748b;
  font-size: 0.875rem;
  pointer-events: none;
}

.input-prefix {
  left: 0.75rem;
}

.input-suffix {
  right: 0.75rem;
}

.number-input.has-prefix {
  padding-left: 1.5rem;
}

.number-input.has-suffix {
  padding-right: 1.5rem;
}

.check-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.check-input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.check-label {
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.125rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
}

.color-text {
  flex: 1;
  font-family: monospace;
}

.link-input-wrapper {
  position: relative;
}

.attach-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attach-upload-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  white-space: nowrap;
}

.attach-upload-button:hover {
  background: #eef2f7;
}

.attach-file-input {
  display: none;
}

.field-description {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}
</style>
