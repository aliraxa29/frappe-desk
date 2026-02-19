/**
 * formRuntime.ts – Form script registration
 *
 * Custom scripts call desk.defineForm('DocType', { ... }) which
 * stores handler maps in the global registry. When a form loads,
 * FormRenderer.vue reads these handlers and calls frm.bindHandlers()
 * on the Form instance so that events like "setup", "onload",
 * "refresh", "validate", and field-change handlers are wired up.
 */

import { registry } from "./registry";

/**
 * Register form script handlers for a doctype.
 * Called by custom scripts: desk.defineForm('Invoice', { ... })
 */
export function defineForm(doctype: string, handlers: any) {
  registry.forms[doctype] ??= [];
  registry.forms[doctype].push(handlers);
}

/**
 * Trigger a form event across all registered handlers.
 * Prefer using frm.trigger(event) on a Form instance instead.
 */
export function triggerFormEvent(doctype: string, event: string, ctx: any) {
  const handlers = registry.forms[doctype] || [];

  for (const h of handlers) {
    if (typeof h[event] === "function") {
      try {
        h[event](ctx);
      } catch (err) {
        console.error(`Error in ${doctype}.${event}:`, err);
      }
    }
  }
}

// Re-export Form class for script convenience
export { Form, createForm, FORM_SCRIPT_EVENTS } from "../metadata/form";
