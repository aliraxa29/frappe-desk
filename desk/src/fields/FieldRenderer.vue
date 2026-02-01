<template>
  <component :is="getFieldComponentName(field.fieldtype)" :field="field" :ctx="ctx"
    @field-change="$emit('fieldChange', $event)" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import type { Field, FormContext, FieldType } from '../types'
import { getFieldComponent } from '../fields/registry'

const props = defineProps({
  field: {
    type: Object as () => Field,
    required: true
  },
  ctx: {
    type: Object as () => FormContext,
    required: true
  }
})

const emit = defineEmits<{
  fieldChange: [field: Field]
}>()

// Dynamically import field components
const fieldComponents = {
  TextField: defineAsyncComponent(() => import('../components/fields/TextField.vue')),
  TextAreaField: defineAsyncComponent(() => import('../components/fields/TextAreaField.vue')),
  CheckField: defineAsyncComponent(() => import('../components/fields/CheckField.vue')),
  SelectField: defineAsyncComponent(() => import('../components/fields/SelectField.vue')),
  LinkField: defineAsyncComponent(() => import('../components/fields/LinkField.vue')),
  IntField: defineAsyncComponent(() => import('../components/fields/IntField.vue')),
  FloatField: defineAsyncComponent(() => import('../components/fields/FloatField.vue')),
  DateField: defineAsyncComponent(() => import('../components/fields/DateField.vue')),
  TimeField: defineAsyncComponent(() => import('../components/fields/TimeField.vue')),
  DateTimeField: defineAsyncComponent(() => import('../components/fields/DateTimeField.vue')),
  ColorField: defineAsyncComponent(() => import('../components/fields/ColorField.vue')),
  AttachField: defineAsyncComponent(() => import('../components/fields/AttachField.vue')),
  SectionBreakField: defineAsyncComponent(() => import('../components/fields/SectionBreakField.vue')),
  HeadingField: defineAsyncComponent(() => import('../components/fields/HeadingField.vue')),
  ChildTableField: defineAsyncComponent(() => import('../components/fields/ChildTableField.vue'))
}

function getFieldComponentName(fieldtype: FieldType): any {
  const componentName = getFieldComponent(fieldtype)
  switch (componentName) {
    case 'TextField':
      return fieldComponents.TextField
    case 'TextAreaField':
      return fieldComponents.TextAreaField
    case 'CheckField':
      return fieldComponents.CheckField
    case 'SelectField':
      return fieldComponents.SelectField
    case 'LinkField':
      return fieldComponents.LinkField
    case 'IntField':
      return fieldComponents.IntField
    case 'FloatField':
      return fieldComponents.FloatField
    case 'DateField':
      return fieldComponents.DateField
    case 'TimeField':
      return fieldComponents.TimeField
    case 'DateTimeField':
      return fieldComponents.DateTimeField
    case 'ColorField':
      return fieldComponents.ColorField
    case 'AttachField':
      return fieldComponents.AttachField
    case 'SectionBreakField':
      return fieldComponents.SectionBreakField
    case 'HeadingField':
      return fieldComponents.HeadingField
    case 'ChildTableField':
      return fieldComponents.ChildTableField

    default:
      break;
  }
}
</script>
