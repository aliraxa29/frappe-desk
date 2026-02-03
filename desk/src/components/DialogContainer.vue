<template>
  <Teleport to="body">
    <TransitionGroup name="dialog-backdrop">
      <div
        v-for="dialog in dialogs"
        :key="dialog.id"
        class="dialog-backdrop"
        @click.self="handleBackdropClick(dialog)"
      >
        <Transition name="dialog" appear>
          <div class="dialog-container" :class="[`dialog-${dialog.size || 'md'}`]">
            <!-- Header -->
            <div class="dialog-header">
              <div class="dialog-header-content">
                <!-- Icon -->
                <div v-if="dialog.icon" class="dialog-icon" :class="[`icon-${dialog.icon}`]">
                  <svg v-if="dialog.icon === 'success'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="dialog.icon === 'error'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg v-else-if="dialog.icon === 'warning'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <svg v-else-if="dialog.icon === 'question'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 class="dialog-title">{{ dialog.title }}</h2>
              </div>
              <button
                v-if="dialog.showClose !== false"
                class="dialog-close"
                @click="handleCancel(dialog)"
                aria-label="Close"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="dialog-body">
              <!-- Custom component -->
              <component
                v-if="dialog.type === 'custom' && dialog.component"
                :is="dialog.component"
                v-bind="dialog.componentProps"
                @close="(result: any) => handleClose(dialog, result)"
              />

              <!-- Standard content -->
              <template v-else>
                <p v-if="dialog.message" class="dialog-message">{{ dialog.message }}</p>

                <!-- Prompt input -->
                <div v-if="dialog.type === 'prompt'" class="dialog-input-wrapper">
                  <label v-if="dialog.inputLabel" class="dialog-input-label">
                    {{ dialog.inputLabel }}
                    <span v-if="dialog.inputRequired" class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-if="dialog.inputType === 'textarea'"
                    v-model="dialog.inputValue"
                    class="dialog-textarea"
                    :placeholder="dialog.inputPlaceholder"
                    rows="4"
                    @keydown.enter.ctrl="handlePrimaryAction(dialog)"
                  />
                  <input
                    v-else
                    v-model="dialog.inputValue"
                    class="dialog-input"
                    :type="dialog.inputType || 'text'"
                    :placeholder="dialog.inputPlaceholder"
                    @keydown.enter="handlePrimaryAction(dialog)"
                  />
                </div>
              </template>
            </div>

            <!-- Footer -->
            <div v-if="dialog.type !== 'custom'" class="dialog-footer">
              <button
                v-if="dialog.secondaryButton"
                class="dialog-btn"
                :class="[`btn-${dialog.secondaryButton.variant || 'secondary'}`]"
                @click="handleSecondaryAction(dialog)"
              >
                {{ dialog.secondaryButton.label }}
              </button>
              <button
                v-if="dialog.primaryButton"
                class="dialog-btn"
                :class="[`btn-${dialog.primaryButton.variant || 'primary'}`]"
                @click="handlePrimaryAction(dialog)"
              >
                {{ dialog.primaryButton.label }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { useDialogStore, type Dialog } from '../stores/dialog'
import { storeToRefs } from 'pinia'

const dialogStore = useDialogStore()
const { dialogs } = storeToRefs(dialogStore)
const { close, cancel } = dialogStore

function handleBackdropClick(dialog: Dialog) {
  if (dialog.showClose !== false) {
    handleCancel(dialog)
  }
}

function handleCancel(dialog: Dialog) {
  cancel(dialog.id)
}

function handleClose(dialog: Dialog, result?: any) {
  close(dialog.id, result)
}

async function handlePrimaryAction(dialog: Dialog) {
  // Validate prompt input if required
  if (dialog.type === 'prompt' && dialog.inputRequired && !dialog.inputValue?.trim()) {
    return
  }

  if (dialog.primaryButton?.onClick) {
    await dialog.primaryButton.onClick()
  }

  if (dialog.primaryButton?.closeOnClick !== false) {
    // Return appropriate value based on dialog type
    if (dialog.type === 'prompt') {
      close(dialog.id, dialog.inputValue)
    } else if (dialog.type === 'confirm') {
      close(dialog.id, true)
    } else {
      close(dialog.id, true)
    }
  }
}

async function handleSecondaryAction(dialog: Dialog) {
  if (dialog.secondaryButton?.onClick) {
    await dialog.secondaryButton.onClick()
  }

  if (dialog.secondaryButton?.closeOnClick !== false) {
    cancel(dialog.id)
  }
}
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(2px);
}

.dialog-container {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-sm { width: 100%; max-width: 24rem; }
.dialog-md { width: 100%; max-width: 32rem; }
.dialog-lg { width: 100%; max-width: 42rem; }
.dialog-xl { width: 100%; max-width: 56rem; }

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dialog-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.dialog-icon svg {
  width: 1.5rem;
  height: 1.5rem;
}

.icon-success {
  background: #dcfce7;
  color: #22c55e;
}

.icon-error {
  background: #fee2e2;
  color: #ef4444;
}

.icon-warning {
  background: #fef3c7;
  color: #f59e0b;
}

.icon-question {
  background: #dbeafe;
  color: #3b82f6;
}

.icon-info {
  background: #e0e7ff;
  color: #6366f1;
}

.dialog-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.4;
}

.dialog-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 0.375rem;
  flex-shrink: 0;
  transition: all 0.15s;
}

.dialog-close:hover {
  color: #64748b;
  background: #f1f5f9;
}

.dialog-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.dialog-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.dialog-message {
  font-size: 0.9375rem;
  color: #475569;
  margin: 0;
  line-height: 1.6;
}

.dialog-input-wrapper {
  margin-top: 1rem;
}

.dialog-input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dialog-input,
.dialog-textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  color: #1e293b;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: all 0.15s;
}

.dialog-input:focus,
.dialog-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dialog-textarea {
  resize: vertical;
  min-height: 5rem;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.dialog-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #fff;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-ghost {
  background: transparent;
  color: #64748b;
}

.btn-ghost:hover {
  background: #f1f5f9;
  color: #334155;
}

/* Transitions */
.dialog-backdrop-enter-active,
.dialog-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-backdrop-enter-from,
.dialog-backdrop-leave-to {
  opacity: 0;
}

.dialog-enter-active {
  animation: dialogIn 0.25s ease-out;
}

.dialog-leave-active {
  animation: dialogOut 0.15s ease-in;
}

@keyframes dialogIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes dialogOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
}
</style>
