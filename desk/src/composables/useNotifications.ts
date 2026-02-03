import { useToastStore, type ToastType } from '../stores/toast'
import { useDialogStore } from '../stores/dialog'
import type { Component } from 'vue'

/**
 * Composable for using toast notifications and dialogs in Vue components
 */
export function useNotifications() {
  const toastStore = useToastStore()
  const dialogStore = useDialogStore()

  return {
    // Toast notifications
    toast: {
      show: toastStore.show,
      success: (title: string, message?: string) => toastStore.success(title, message),
      error: (title: string, message?: string) => toastStore.error(title, message),
      warning: (title: string, message?: string) => toastStore.warning(title, message),
      info: (title: string, message?: string) => toastStore.info(title, message),
      clear: toastStore.clear
    },

    // Dialog modals
    dialog: {
      confirm: (title: string, message?: string) => dialogStore.confirm(title, message),
      alert: (title: string, message?: string) => dialogStore.alert(title, message),
      error: (title: string, message?: string) => dialogStore.error(title, message),
      warning: (title: string, message?: string) => dialogStore.warning(title, message),
      prompt: dialogStore.prompt,
      confirmDelete: (itemName?: string) => dialogStore.confirmDelete(itemName),
      custom: (
        component: Component,
        props?: Record<string, any>,
        options?: Parameters<typeof dialogStore.custom>[2]
      ) => dialogStore.custom(component, props, options)
    }
  }
}
