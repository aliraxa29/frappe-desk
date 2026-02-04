<template>
  <Teleport to="body">
    <Transition name="freeze">
      <div v-if="isFrozen" class="freeze-overlay" @click.stop>
        <div class="freeze-content">
          <div class="freeze-spinner"></div>
          <p v-if="displayMessage" class="freeze-message">{{ displayMessage }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useFreezeStore } from '../stores/freeze'
import { __ } from '../utils/translate'

const freezeStore = useFreezeStore()
const { isFrozen, message } = storeToRefs(freezeStore)
const displayMessage = computed(() => message.value || __('Loading...'))
</script>

<style scoped>
.freeze-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  cursor: wait;
}

.freeze-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.dark .freeze-content {
  background: rgba(15, 23, 42, 0.95);
}

.freeze-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.freeze-message {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
  max-width: 20rem;
  text-align: center;
}

.dark .freeze-message {
  color: #e2e8f0;
}

/* Transition */
.freeze-enter-active,
.freeze-leave-active {
  transition: opacity 0.2s ease;
}

.freeze-enter-from,
.freeze-leave-to {
  opacity: 0;
}

.freeze-enter-active .freeze-content,
.freeze-leave-active .freeze-content {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.freeze-enter-from .freeze-content,
.freeze-leave-to .freeze-content {
  transform: scale(0.95);
  opacity: 0;
}
</style>
