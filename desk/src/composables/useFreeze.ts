import { useFreezeStore } from "../stores/freeze";

/**
 * Composable for freezing/unfreezing the UI
 * Similar to Frappe's freeze functionality
 */
export function useFreeze() {
  const freezeStore = useFreezeStore();

  /**
   * Freeze the UI with an optional message
   * @param message - Message to display (default: "Loading...")
   */
  function freeze(message?: string) {
    freezeStore.freeze(message || "Loading...");
  }

  /**
   * Unfreeze the UI
   */
  function unfreeze() {
    freezeStore.unfreeze();
  }

  /**
   * Execute a function while the UI is frozen
   * @param fn - Function to execute
   * @param message - Message to display while frozen
   */
  async function withFreeze<T>(
    fn: () => Promise<T>,
    message?: string,
  ): Promise<T> {
    freeze(message);
    try {
      return await fn();
    } finally {
      unfreeze();
    }
  }

  return {
    freeze,
    unfreeze,
    withFreeze,
  };
}
