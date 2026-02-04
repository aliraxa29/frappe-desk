import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { desk } from '../utils/desk'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<string | null>(null)
    const isAuthenticated = ref(false)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const isLoggedIn = computed(() => isAuthenticated.value && user.value !== null)

    /**
     * Check if user is authenticated by calling backend
     */
    const checkAuth = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await desk.call({
                method: 'frappe.auth.get_logged_user',
            })

            if (response?.message) {
                user.value = response.message
                isAuthenticated.value = true
                return true
            } else {
                user.value = null
                isAuthenticated.value = false
                return false
            }
        } catch (err: any) {
            user.value = null
            isAuthenticated.value = false
            error.value = err?.message || 'Failed to check authentication'
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * Login with email and password
     */
    const login = async (email: string, password: string) => {
        loading.value = true
        error.value = null
        try {
            await desk.call({
                method: 'login',
                args: {
                    usr: email,
                    pwd: password
                }
            })
            await checkAuth()
            return true
        } catch (err: any) {
            error.value = err?.message || 'Login failed'
            user.value = null
            isAuthenticated.value = false
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * Logout user
     */
    const logout = async () => {
        loading.value = true
        error.value = null
        try {
            await desk.call({
                method: 'logout'
            })
            user.value = null
            isAuthenticated.value = false
            return true
        } catch (err: any) {
            error.value = err?.message || 'Logout failed'
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * Request password reset
     */
    const requestPasswordReset = async (loginId: string) => {
        loading.value = true
        error.value = null
        try {
            await desk.call({
                method: 'frappe.core.doctype.user.user.reset_password',
                args: {
                    user: loginId
                }
            })
            return true
        } catch (err: any) {
            error.value = err?.message || 'Failed to send reset email'
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * Clear error message
     */
    const clearError = () => {
        error.value = null
    }

    return {
        // State
        user,
        isAuthenticated,
        loading,
        error,

        // Computed
        isLoggedIn,

        // Methods
        checkAuth,
        login,
        logout,
        requestPasswordReset,
        clearError
    }
})
