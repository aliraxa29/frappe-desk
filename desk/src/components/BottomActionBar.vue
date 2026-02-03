<template>
  <Transition name="slide-up">
    <div 
      v-if="show" 
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 ml-64"
    >
      <div class="px-6 py-4 flex items-center justify-between">
        <p class="text-slate-700 font-medium">{{ message }}</p>
        <div class="flex gap-3">
          <Button 
            @click="$emit('discard')" 
            variant="secondary" 
            size="sm"
            :disabled="loading"
          >
            {{ discardText }}
          </Button>
          <Button 
            @click="$emit('save')" 
            variant="primary" 
            size="sm"
            :disabled="loading"
          >
            {{ loading ? loadingText : saveText }}
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import Button from './Button.vue'

interface Props {
  show: boolean
  loading?: boolean
  message?: string
  saveText?: string
  discardText?: string
  loadingText?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  message: 'Do you want to save changes?',
  saveText: 'Save changes',
  discardText: 'Discard',
  loadingText: 'Saving...'
})

defineEmits<{
  save: []
  discard: []
}>()
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
