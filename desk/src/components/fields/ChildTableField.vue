<template>
  <div class="child-table-field-wrapper">
    <label v-if="field.label" class="field-label">
      {{ field.label }}
      <span v-if="field.reqd" class="required">*</span>
    </label>
    <ChildTableEditor
      :rows="rows"
      :fields="childFields"
      :field-label="field.label || field.fieldname"
      @update:rows="updateRows"
    />
    <small v-if="field.description" class="field-description">{{ field.description }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Field, FormContext, DocTypeMeta } from '@/types'
import { useDoctypeStore } from '@/metadata/doctypeStore'
import ChildTableEditor from '../ChildTableEditor.vue'

const props = defineProps<{ field: Field; ctx: FormContext }>()

const emit = defineEmits<{
  fieldChange: [value: any]
}>()

const doctypeStore = useDoctypeStore()
const childMeta = ref<DocTypeMeta | null>(null)
const rows = ref<Record<string, any>[]>([])

const childDoctype = computed(() => {
  return props.field.options || ''
})

const childFields = computed(() => {
  return childMeta.value?.fields || []
})

onMounted(async () => {
  if (childDoctype.value) {
    try {
      childMeta.value = await doctypeStore.loadMeta(childDoctype.value)
    } catch (error) {
      console.error(`Failed to load child doctype ${childDoctype.value}:`, error)
    }
  }

  // Initialize rows from context
  if (Array.isArray(props.ctx.doc[props.field.fieldname])) {
    rows.value = JSON.parse(JSON.stringify(props.ctx.doc[props.field.fieldname]))
  }
})

function updateRows(updatedRows: Record<string, any>[]) {
  rows.value = updatedRows
  // Update the context document
  props.ctx.doc[props.field.fieldname] = updatedRows
  emit('fieldChange', updatedRows)
}
</script>

<style scoped>
.child-table-field-wrapper {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #b0bec5;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.field-description {
  display: block;
  color: #6b7280;
  margin-top: 0.25rem;
  font-size: 0.85rem;
}
</style>
