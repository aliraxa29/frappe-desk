import { defineStore } from 'pinia'
import { ref, markRaw, type Component } from 'vue'

export type DialogType = 'confirm' | 'alert' | 'prompt' | 'error' | 'custom'

export interface DialogButton {
  label: string
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  onClick?: () => void | Promise<void>
  closeOnClick?: boolean
}

export interface DialogOptions {
  type: DialogType
  title: string
  message?: string
  icon?: 'info' | 'warning' | 'error' | 'success' | 'question'
  primaryButton?: DialogButton
  secondaryButton?: DialogButton
  showClose?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  // For prompt dialogs
  inputLabel?: string
  inputPlaceholder?: string
  inputDefault?: string
  inputType?: 'text' | 'textarea' | 'number' | 'email' | 'password'
  inputRequired?: boolean
  // For custom dialogs
  component?: Component
  componentProps?: Record<string, any>
}

export interface Dialog extends DialogOptions {
  id: string
  resolve: (value: any) => void
  reject: (reason?: any) => void
  inputValue?: string
}

export const useDialogStore = defineStore('dialog', () => {
  const dialogs = ref<Dialog[]>([])

  function generateId(): string {
    return `dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  function open(options: DialogOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      const dialog: Dialog = {
        id: generateId(),
        ...options,
        component: options.component ? markRaw(options.component) : undefined,
        resolve,
        reject,
        inputValue: options.inputDefault || ''
      }
      dialogs.value.push(dialog)
    })
  }

  function close(id: string, result?: any) {
    const index = dialogs.value.findIndex(d => d.id === id)
    if (index > -1) {
      const dialog = dialogs.value[index]
      if (dialog) {
        dialog.resolve(result)
      }
      dialogs.value.splice(index, 1)
    }
  }

  function cancel(id: string) {
    const index = dialogs.value.findIndex(d => d.id === id)
    if (index > -1) {
      const dialog = dialogs.value[index]
      if (dialog) {
        dialog.resolve(null)
      }
      dialogs.value.splice(index, 1)
    }
  }

  function updateInputValue(id: string, value: string) {
    const dialog = dialogs.value.find(d => d.id === id)
    if (dialog) {
      dialog.inputValue = value
    }
  }

  // Convenience methods
  function confirm(title: string, message?: string): Promise<boolean> {
    return open({
      type: 'confirm',
      title,
      message,
      icon: 'question',
      primaryButton: {
        label: 'Confirm',
        variant: 'primary',
        closeOnClick: true
      },
      secondaryButton: {
        label: 'Cancel',
        variant: 'secondary',
        closeOnClick: true
      }
    }).then(result => result === true)
  }

  function alert(title: string, message?: string): Promise<void> {
    return open({
      type: 'alert',
      title,
      message,
      icon: 'info',
      primaryButton: {
        label: 'OK',
        variant: 'primary',
        closeOnClick: true
      }
    })
  }

  function error(title: string, message?: string): Promise<void> {
    return open({
      type: 'error',
      title,
      message,
      icon: 'error',
      primaryButton: {
        label: 'OK',
        variant: 'primary',
        closeOnClick: true
      }
    })
  }

  function warning(title: string, message?: string): Promise<boolean> {
    return open({
      type: 'confirm',
      title,
      message,
      icon: 'warning',
      primaryButton: {
        label: 'Continue',
        variant: 'danger',
        closeOnClick: true
      },
      secondaryButton: {
        label: 'Cancel',
        variant: 'secondary',
        closeOnClick: true
      }
    }).then(result => result === true)
  }

  function prompt(
    title: string,
    options?: {
      message?: string
      label?: string
      placeholder?: string
      defaultValue?: string
      type?: 'text' | 'textarea' | 'number' | 'email' | 'password'
      required?: boolean
    }
  ): Promise<string | null> {
    return open({
      type: 'prompt',
      title,
      message: options?.message,
      icon: 'question',
      inputLabel: options?.label,
      inputPlaceholder: options?.placeholder,
      inputDefault: options?.defaultValue,
      inputType: options?.type || 'text',
      inputRequired: options?.required ?? true,
      primaryButton: {
        label: 'Submit',
        variant: 'primary',
        closeOnClick: true
      },
      secondaryButton: {
        label: 'Cancel',
        variant: 'secondary',
        closeOnClick: true
      }
    })
  }

  function confirmDelete(itemName?: string): Promise<boolean> {
    return open({
      type: 'confirm',
      title: 'Delete Confirmation',
      message: itemName
        ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
        : 'Are you sure you want to delete this item? This action cannot be undone.',
      icon: 'warning',
      primaryButton: {
        label: 'Delete',
        variant: 'danger',
        closeOnClick: true
      },
      secondaryButton: {
        label: 'Cancel',
        variant: 'secondary',
        closeOnClick: true
      }
    }).then(result => result === true)
  }

  function custom(component: Component, props?: Record<string, any>, options?: Partial<DialogOptions>): Promise<any> {
    return open({
      type: 'custom',
      title: options?.title || '',
      component,
      componentProps: props,
      size: options?.size || 'md',
      showClose: options?.showClose ?? true,
      ...options
    })
  }

  return {
    dialogs,
    open,
    close,
    cancel,
    updateInputValue,
    // Convenience
    confirm,
    alert,
    error,
    warning,
    prompt,
    confirmDelete,
    custom
  }
})

// Global dialog helper for use outside of Vue components
function getDialogStore() {
  return useDialogStore()
}

export const dialog = {
  confirm: (title: string, message?: string) => getDialogStore().confirm(title, message),
  alert: (title: string, message?: string) => getDialogStore().alert(title, message),
  error: (title: string, message?: string) => getDialogStore().error(title, message),
  warning: (title: string, message?: string) => getDialogStore().warning(title, message),
  prompt: (title: string, options?: Parameters<ReturnType<typeof useDialogStore>['prompt']>[1]) =>
    getDialogStore().prompt(title, options),
  confirmDelete: (itemName?: string) => getDialogStore().confirmDelete(itemName),
  custom: (
    component: Component,
    props?: Record<string, any>,
    options?: Partial<DialogOptions>
  ) => getDialogStore().custom(component, props, options)
}
