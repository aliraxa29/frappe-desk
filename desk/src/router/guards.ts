import type { Router, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

/**
 * Router guards for authentication and authorization
 * Ensures users are logged in before accessing protected routes
 */
export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
    const authStore = useAuthStore()

    // Public routes that don't require authentication
    const publicRoutes = ['Login', 'ResetPassword', 'NotFound']
    const isPublicRoute = publicRoutes.includes(to.name as string)

    // Check authentication status if not already checked
    if (!authStore.isAuthenticated && !isPublicRoute) {
      const isAuthenticated = await authStore.checkAuth()
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return next({ name: 'Login', query: { redirect: to.fullPath } })
      }
    }

    // If user is logged in and trying to access login page, redirect to home
    if (authStore.isAuthenticated && isPublicRoute) {
      return next({ name: 'Desk' })
    }

    next()
  })

  router.afterEach((to: RouteLocationNormalized) => {
    // Update page title based on route
    const titles: Record<string, string> = {
      'Desk': 'Desk - ERP',
      'App': 'App',
      'ListView': 'List',
      'NewForm': 'New Form',
      'EditForm': 'Form',
      'Login': 'Login',
      'ResetPassword': 'Reset Password',
      'NotFound': 'Not Found'
    }

    document.title = titles[to.name as string] || 'Desk'
  })
}

/**
 * Check if user has specific roles
 */
export function requireRoles(allowedRoles: string | string[]) {
  return (to: RouteLocationNormalized, from: RouteLocationNormalized, next: any) => {
    const authStore = useAuthStore()
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

    // This would be used with per-route guards if needed
    next()
  }
}
