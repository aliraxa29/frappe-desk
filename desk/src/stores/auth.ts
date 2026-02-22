import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { resource } from "../utils/resource";

export const useAuthStore = defineStore("auth", () => {
  // Initialize from boot data — no API call needed on page load
  const boot = (window as any).dash?.boot;
  const bootUser = boot?.user?.name || null;

  const user = ref<string | null>(bootUser);
  const isAuthenticated = ref(!!bootUser && bootUser !== "Guest");
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoggedIn = computed(
    () => isAuthenticated.value && user.value !== null,
  );

  /**
   * Check if user is authenticated.
   * Uses boot data on first check, falls back to API if needed.
   */
  const checkAuth = async () => {
    // If already initialized from boot data, return immediately
    if (isAuthenticated.value && user.value) {
      return true;
    }

    loading.value = true;
    error.value = null;
    try {
      const response = await resource.call({
        method: "frappe.auth.get_logged_user",
      });

      if (response?.message) {
        user.value = response.message;
        isAuthenticated.value = true;
        return true;
      } else {
        user.value = null;
        isAuthenticated.value = false;
        return false;
      }
    } catch (err: any) {
      user.value = null;
      isAuthenticated.value = false;
      error.value = err?.message || "Failed to check authentication";
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      await resource.call({
        method: "login",
        args: {
          usr: email,
          pwd: password,
        },
      });
      await checkAuth();
      return true;
    } catch (err: any) {
      error.value = err?.message || "Login failed";
      user.value = null;
      isAuthenticated.value = false;
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    loading.value = true;
    error.value = null;
    try {
      await resource.call({
        method: "logout",
      });
      user.value = null;
      isAuthenticated.value = false;
      return true;
    } catch (err: any) {
      error.value = err?.message || "Logout failed";
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Request password reset
   */
  const requestPasswordReset = async (loginId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await resource.call({
        method: "frappe.core.doctype.user.user.reset_password",
        args: {
          user: loginId,
        },
      });
      return true;
    } catch (err: any) {
      error.value = err?.message || "Failed to send reset email";
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null;
  };

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
    clearError,
  };
});
