/**
 * Global locals accessor
 * Provides window.locals access similar to Frappe
 *
 * This allows reactive access to the locals store from anywhere in the app
 */

import type { Pinia } from "pinia";
import { useLocalsStore } from "./locals";
import type { LocalsStore } from "../../types/locals";

/**
 * Reactive proxy for locals access
 * Returns a Proxy that syncs with the Pinia store
 */
export function createLocalsProxy(pinia: Pinia): LocalsStore {
  const store = useLocalsStore(pinia);

  return new Proxy(
    {},
    {
      get(_target, prop: string | symbol) {
        if (typeof prop === "symbol") {
          return undefined;
        }

        return store.locals[prop];
      },

      set(_target, prop: string | symbol, value) {
        if (typeof prop === "symbol") {
          return true;
        }

        if (value && typeof value === "object") {
          store.locals[prop] = value;
        }

        return true;
      },

      has(_target, prop: string | symbol) {
        if (typeof prop === "symbol") {
          return false;
        }

        return prop in store.locals;
      },

      deleteProperty(_target, prop: string | symbol) {
        if (typeof prop === "symbol") {
          return true;
        }

        delete store.locals[prop];
        return true;
      },

      ownKeys() {
        return Object.keys(store.locals);
      },

      getOwnPropertyDescriptor() {
        return {
          value: undefined,
          writable: true,
          enumerable: true,
          configurable: true,
        };
      },
    },
  ) as LocalsStore;
}

/**
 * Initialize and attach locals to window object
 * Must be called during app initialization
 */
export function initializeLocalsGlobal(pinia: Pinia) {
  if (!window.desk) {
    window.desk = {};
  }

  // Create the proxy
  const localsProxy = createLocalsProxy(pinia);
  (window as any).locals.Proxy = localsProxy;
  (window.locals.Proxy as any) = localsProxy;

  window.desk.model._getLocalsStore = () => useLocalsStore();
  window.locals.DocType = {};

  console.log("Locals store initialized");
}

/**
 * Get the store instance directly
 */
export function getLocalsStore() {
  return useLocalsStore();
}
