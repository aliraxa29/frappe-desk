import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { desk } from '../utils/desk'

export interface UserInfo {
  name: string
  email: string
  full_name: string
  user_image?: string
  roles?: string[]
  flags?: Record<string, any>
  [key: string]: any
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<UserInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const userName = computed(() => currentUser.value?.full_name || currentUser.value?.name || '')
  const userEmail = computed(() => currentUser.value?.email || '')
  const userImage = computed(() => currentUser.value?.user_image || '')
  const userRoles = computed(() => currentUser.value?.roles || [])

  /**
   * Fetch current user information
   */
  const fetchUserInfo = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await desk.call({
        method: 'frappe.client.get',
        args: {
          doctype: 'User',
          name: 'frappe.session.user'
        }
      })

      if (response?.message) {
        currentUser.value = response.message as UserInfo
        return true
      }
      return false
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch user info'
      currentUser.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Update user profile
   */
  const updateUserProfile = async (updates: Partial<UserInfo>) => {
    loading.value = true
    error.value = null
    try {
      if (!currentUser.value) return false

      const response = await desk.call({
        method: 'frappe.client.set_value',
        args: {
          doctype: 'User',
          name: currentUser.value.name,
          fieldname: updates
        }
      })

      if (response?.message) {
        currentUser.value = { ...currentUser.value, ...updates }
        return true
      }
      return false
    } catch (err: any) {
      error.value = err?.message || 'Failed to update profile'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return userRoles.value.includes(role)
  }

  /**
   * Check if user has any of the given roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => userRoles.value.includes(role))
  }

  /**
   * Check if user has all of the given roles
   */
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => userRoles.value.includes(role))
  }

  /**
   * Clear user data
   */
  const clearUser = () => {
    currentUser.value = null
    error.value = null
  }

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    currentUser,
    loading,
    error,

    // Computed
    userName,
    userEmail,
    userImage,
    userRoles,

    // Methods
    fetchUserInfo,
    updateUserProfile,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    clearUser,
    clearError
  }
})
