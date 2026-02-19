/**
 * listRuntime.ts – List script registration
 *
 * Custom scripts call desk.defineList('DocType', { ... }) which
 * stores handler maps in the global registry. When a list loads,
 * the ListView class reads these handlers and calls bindHandlers()
 * so that events like "setup", "onload", "refresh" and settings
 * like get_indicator, button, row_actions are wired up.
 */

import { registry } from "./registry";
import type { ListContext } from "../types";

/**
 * Register list script handlers for a doctype.
 * Called by custom scripts: desk.defineList('Invoice', { ... })
 */
export function defineList(doctype: string, handlers: any) {
  if (!registry.lists[doctype]) {
    registry.lists[doctype] = [];
  }
  registry.lists[doctype].push(handlers);
}

/**
 * Trigger a list event across all registered handlers.
 * Prefer using list.trigger(event) on a ListView instance instead.
 */
export function triggerListEvent(
  doctype: string,
  event: string,
  ctx: ListContext,
) {
  const handlers = registry.lists[doctype] || [];

  for (const handler of handlers) {
    if (typeof handler[event] === "function") {
      try {
        handler[event](ctx);
      } catch (error) {
        console.error(`Error in ${doctype} list.${event}:`, error);
      }
    }
  }
}
