<template>
  <div class="form-tabs">
    <div class="tabs-header" role="tablist">
      <button
        v-for="(tab, idx) in tabs"
        :key="tab.fieldname || idx"
        class="tab-button"
        :class="{ 'tab-button-active': activeTab === idx }"
        role="tab"
        :aria-selected="activeTab === idx"
        @click="activeTab = idx"
      >
        {{ tab.label || `Tab ${idx + 1}` }}
      </button>
    </div>
    
    <div class="tabs-content">
      <div
        v-for="(tab, idx) in tabs"
        v-show="activeTab === idx"
        :key="tab.fieldname || idx"
        class="tab-panel"
        role="tabpanel"
      >
        <slot :name="`tab-${idx}`" :tab="tab" :fields="tab.fields">
          <!-- Default tab content -->
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Field } from '../types'

export interface TabDefinition {
  fieldname?: string
  label?: string
  fields: Field[]
  hidden?: boolean
}

const props = withDefaults(defineProps<{
  tabs: TabDefinition[]
  defaultTab?: number
}>(), {
  defaultTab: 0
})

const activeTab = ref(props.defaultTab)
</script>

<style scoped>
.form-tabs {
  display: flex;
  flex-direction: column;
}

.tabs-header {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 0.5rem;
  background: #f8fafc;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs-header::-webkit-scrollbar {
  display: none;
}

.tab-button {
  padding: 0.75rem 1.25rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  transition: color 0.2s ease;
}

.tab-button:hover {
  color: #334155;
}

.tab-button-active {
  color: #3b82f6;
}

.tab-button-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
  border-radius: 2px 2px 0 0;
}

.tabs-content {
  padding: 1.5rem 0;
}

.tab-panel {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
