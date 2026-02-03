import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  
  function generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  function show(options: Omit<Toast, 'id'>) {
    const id = generateId()
    const toast: Toast = {
      id,
      duration: 4000, // Default 4 seconds
      ...options
    }
    
    toasts.value.push(toast)
    
    // Auto-remove after duration (unless duration is 0)
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, toast.duration)
    }
    
    return id
  }
  
  function remove(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  function clear() {
    toasts.value = []
  }
  
  // Convenience methods
  function success(title: string, message?: string, duration?: number) {
    return show({ type: 'success', title, message, duration })
  }
  
  function error(title: string, message?: string, duration?: number) {
    return show({ type: 'error', title, message, duration: duration || 6000 })
  }
  
  function warning(title: string, message?: string, duration?: number) {
    return show({ type: 'warning', title, message, duration })
  }
  
  function info(title: string, message?: string, duration?: number) {
    return show({ type: 'info', title, message, duration })
  }
  
  return {
    toasts,
    show,
    remove,
    clear,
    success,
    error,
    warning,
    info
  }
})

// Global toast helper (for use outside Vue components)
function getToastStore() {
  return useToastStore()
}

export const toast = {
  success(title: string, message?: string) {
    getToastStore().success(title, message)
  },
  error(title: string, message?: string) {
    getToastStore().error(title, message)
  },
  warning(title: string, message?: string) {
    getToastStore().warning(title, message)
  },
  info(title: string, message?: string) {
    getToastStore().info(title, message)
  },
  show(options: Omit<Toast, 'id'>) {
    getToastStore().show(options)
  },
  clear() {
    getToastStore().clear()
  }
}
