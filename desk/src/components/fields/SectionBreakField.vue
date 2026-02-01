<template>
  <div class="section-break">
    <h3 class="section-title">{{ field.label }}</h3>
  </div>
</template>

<script setup lang="ts">
import type { Field, FormContext } from '@/types'

defineProps<{ field: Field; ctx: FormContext }>()
</script>

<style scoped>
.section-break {
  margin: 1.5rem 0 1rem 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #0066cc;
}
</style>
