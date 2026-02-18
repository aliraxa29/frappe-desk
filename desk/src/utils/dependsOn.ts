/**
 * Evaluator for Frappe depends_on expressions.
 *
 * Supports:
 *  - Simple field references: "fieldname" → truthy check on doc[fieldname]
 *  - eval expressions: "eval:doc.status == 'Active'" → sandboxed evaluation
 *  - Frappe helpers: in_list, cint, cstr, flt, etc.
 */

import type { Document } from "../types";

/**
 * Evaluate a depends_on expression against a document.
 * Returns true if the condition is met (field should be visible / mandatory / read-only).
 */
export function evaluateDependsOn(
  expression: string | undefined | null,
  doc: Document | null | undefined,
): boolean {
  if (!expression || !doc) return true; // No expression = always visible

  const trimmed = expression.trim();
  if (!trimmed) return true;

  try {
    if (trimmed.startsWith("eval:")) {
      return evaluateEvalExpression(trimmed.slice(5), doc);
    }
    // Simple field reference — truthy check
    return !!doc[trimmed];
  } catch (err) {
    console.warn(`[depends_on] Failed to evaluate "${expression}":`, err);
    return true; // Fail-open: show field if expression errors
  }
}

/**
 * Frappe-compatible helper functions provided inside eval scope.
 */
function createHelpers(_doc: Document) {
  return {
    /** Check if value is in list */
    in_list(list: any[], value: any): boolean {
      if (!Array.isArray(list)) return false;
      return list.includes(value);
    },
    /** Convert to integer */
    cint(val: any): number {
      const n = parseInt(val, 10);
      return isNaN(n) ? 0 : n;
    },
    /** Convert to float */
    flt(val: any, precision?: number): number {
      const n = parseFloat(val);
      if (isNaN(n)) return 0;
      if (typeof precision === "number") {
        return parseFloat(n.toFixed(precision));
      }
      return n;
    },
    /** Convert to string */
    cstr(val: any): string {
      if (val === null || val === undefined) return "";
      return String(val);
    },
    /** Check if value is null/undefined/empty */
    is_null(val: any): boolean {
      return val === null || val === undefined || val === "";
    },
    /** Check if value is not null/undefined/empty */
    has_value(val: any): boolean {
      return val !== null && val !== undefined && val !== "" && val !== 0;
    },
    /** Strip HTML tags */
    strip_html(html: string): string {
      if (!html) return "";
      return html.replace(/<[^>]*>/g, "").trim();
    },
    /** Current date in YYYY-MM-DD */
    frappe: {
      datetime: {
        get_today(): string {
          return new Date().toISOString().split("T")[0] as string;
        },
        nowdate(): string {
          return new Date().toISOString().split("T")[0] as string;
        },
      },
      session: {
        user: (window as any).dash?.boot?.user?.name || "Administrator",
      },
    },
  };
}

/**
 * Evaluate an eval: expression in a sandboxed scope.
 * The expression has access to `doc`, helper functions, and standard JS.
 */
function evaluateEvalExpression(expr: string, doc: Document): boolean {
  const trimmed = expr.trim();
  if (!trimmed) return true;

  const helpers = createHelpers(doc);

  // Build the function body with doc and helpers in scope
  // Using new Function for controlled sandboxing
  const fn = new Function(
    "doc",
    "in_list",
    "cint",
    "flt",
    "cstr",
    "is_null",
    "has_value",
    "strip_html",
    "frappe",
    "cur_frm",
    `"use strict"; try { return !!(${trimmed}); } catch(e) { return true; }`,
  );

  // Create a minimal cur_frm substitute
  const cur_frm = {
    doc,
    is_new: () =>
      !!doc.__islocal || !doc.name || String(doc.name).startsWith("new-"),
    get_field: (_fieldname: string) => null, // Placeholder
  };

  return fn(
    doc,
    helpers.in_list,
    helpers.cint,
    helpers.flt,
    helpers.cstr,
    helpers.is_null,
    helpers.has_value,
    helpers.strip_html,
    helpers.frappe,
    cur_frm,
  );
}
