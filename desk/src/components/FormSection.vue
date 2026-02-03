<template>
  <div class="form-section" :class="{ 'form-section-collapsible': collapsible }">
    <Accordion
      v-if="collapsible"
      :label="label || 'Section'"
      :default-open="!collapsed"
      :collapsible="true"
    >
      <div class="section-columns">
        <div
          v-for="(column, colIdx) in columns"
          :key="colIdx"
          class="section-column"
          :style="{ flex: column.flex || 1 }"
        >
          <slot :name="`column-${colIdx}`" :fields="column.fields">
            <div v-for="field in column.fields" :key="field.fieldname" class="section-field">
              <slot name="field" :field="field">
                <!-- Default field slot -->
              </slot>
            </div>
          </slot>
        </div>
      </div>
    </Accordion>

    <template v-else>
      <div v-if="label" class="section-header">
        <h3 class="section-title">{{ label }}</h3>
        <p v-if="description" class="section-description">{{ description }}</p>
      </div>
      
      <div class="section-columns">
        <div
          v-for="(column, colIdx) in columns"
          :key="colIdx"
          class="section-column"
          :style="{ flex: column.flex || 1 }"
        >
          <slot :name="`column-${colIdx}`" :fields="column.fields">
            <div v-for="field in column.fields" :key="field.fieldname" class="section-field">
              <slot name="field" :field="field">
                <!-- Default field slot -->
              </slot>
            </div>
          </slot>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Field } from '../types'
import Accordion from './Accordion.vue'

export interface SectionColumn {
  fields: Field[]
  flex?: number
}

const props = withDefaults(defineProps<{
  label?: string
  description?: string
  collapsible?: boolean
  collapsed?: boolean
  columns?: SectionColumn[]
}>(), {
  collapsible: false,
  collapsed: false,
  columns: () => []
})
</script>

<style scoped>
.form-section {
  margin-bottom: 1.5rem;
}

.form-section-collapsible {
  margin-bottom: 1rem;
}

.section-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-description {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.section-columns {
  display: flex;
  gap: 1.5rem;
}

.section-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.section-field {
  /* Field wrapper */
}

@media (max-width: 768px) {
  .section-columns {
    flex-direction: column;
    gap: 1rem;
  }
  
  .section-column {
    flex: 1 1 100% !important;
  }
}
</style>
