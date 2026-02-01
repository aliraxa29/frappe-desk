<template>
  <div class="field-wrapper">
    <label v-if="field.label" :for="`field-${field.fieldname}`" class="field-label">
      {{ field.label }}
      <span v-if="field.reqd" class="required">*</span>
    </label>
    <div class="link-field">
      <input
        :id="`field-${field.fieldname}`"
        :value="ctx.doc[field.fieldname]"
        :readonly="field.read_only"
        :required="field.reqd"
        type="text"
        class="field-input"
        :placeholder="`Select a ${field.options}`"
        @input="onInput"
      />
      <div v-if="showDropdown && filteredOptions.length" class="dropdown">
        <div
          v-for="option in filteredOptions"
          :key="option"
          class="dropdown-item"
          @click="selectOption(option)"
        >
          {{ option }}
        </div>
      </div>
    </div>
    <small v-if="field.description" class="field-description">{{ field.description }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Field, FormContext } from '../../types'
import { frappeClient } from '../../api/resource'

const props = defineProps<{ field: Field; ctx: FormContext }>()

const emit = defineEmits<{
  fieldChange: [value: any]
}>()

const searchText = ref('')
const showDropdown = ref(false)
const options = ref<string[]>([])

const filteredOptions = computed(() => {
  return options.value.filter((opt) =>
    opt.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

async function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  searchText.value = value
  props.ctx.set_value(props.field.fieldname, value)

  if (value && props.field.options) {
    try {
      const linkedDoctype = props.field.options
      const list = await frappeClient.getList(linkedDoctype, {
        fields: ['name'],
        limit_page_length: 10
      })
      options.value = list.data.map((d: any) => d.name)
      showDropdown.value = true
    } catch (error) {
      console.error('Failed to fetch linked options:', error)
    }
  }
}

function selectOption(option: string) {
  props.ctx.set_value(props.field.fieldname, option)
  searchText.value = option
  showDropdown.value = false
  emit('fieldChange', option)
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

.link-field {
  position: relative;
}

.field-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.field-input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.field-description {
  display: block;
  color: #666;
  margin-top: 0.25rem;
  font-size: 0.85rem;
}
</style>
