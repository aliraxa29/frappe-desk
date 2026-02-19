/**
 * formContext.ts – Backward-compatible bridge
 *
 * The canonical Form class now lives in metadata/form.ts.
 * This file re-exports relevant symbols so that existing imports
 * continue to work without changes.
 *
 * New code should import directly from metadata/form.ts or formRuntime.ts.
 */

export { Form, createForm } from "../metadata/form";
export { defineForm, triggerFormEvent } from "./formRuntime";
