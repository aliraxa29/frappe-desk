import { reactive } from "vue";
import type { DocTypeMeta, Document, Field, Permission } from "../types";
import type {
  CustomFormButton,
  FormButton,
  FormButtonGroup,
} from "../composables/useFormButtons";
import { toast } from "../stores/toast";
import { dialog } from "../stores/dialog";
import { model } from "../data/model";
import { resource } from "../utils/resource";
import { __ } from "../utils/translate";
import { evaluateDependsOn } from "../utils/dependsOn";
import { FormDashboard } from "./dashboard";

export const FORM_SCRIPT_EVENTS = [
  "setup",
  "onload",
  "onload_post_render",
  "refresh",
  "validate",
  "before_save",
  "after_save",
  "before_submit",
  "after_submit",
  "before_cancel",
  "after_cancel",
  "before_amend",
  "after_amend",
  "on_submit",
  "timeline_refresh",
  "before_workflow_action",
  "after_workflow_action",
] as const;

export type FormScriptEvent = (typeof FORM_SCRIPT_EVENTS)[number];

/**
 * Form Class - Comprehensive form controller
 */
export class Form {
  doctype: string;
  docname: string;
  doc: Document;
  meta: DocTypeMeta;
  fields: Field[];
  perm: Permission[];

  // State flags
  dirty: boolean;
  saving: boolean;
  submitting: boolean;
  is_new_doc: boolean;
  ready: boolean;
  enabled: boolean;
  hidden: boolean;

  // UI state
  custom_buttons: CustomFormButton[];
  private _buttonGroups: Map<string, FormButton[]>;
  dashboard: FormDashboard;

  // Script registry
  private _events: Record<string, Array<(frm: Form) => void | Promise<void>>>;
  private _fieldChangeHandlers: Record<
    string,
    Array<(frm: Form) => void | Promise<void>>
  >;
  private _globalFieldChangeHandlers: Array<
    (ctx: {
      doctype: string;
      field: string;
      value: any;
      doc: Document;
      frm: Form;
    }) => void
  >;

  // Internal caches
  private _fieldMap: Map<string, Field>;
  private _originalDoc: Document;
  private _lastValues: Record<string, any>;

  // Timers
  private _saveDebounce: ReturnType<typeof setTimeout> | null;
  private _refreshTimeout: ReturnType<typeof setTimeout> | null;

  constructor(doctype: string, doc: Document, meta: DocTypeMeta) {
    this.doctype = doctype;
    this.doc = reactive(doc);
    this.meta = meta;
    this.fields = meta.fields || [];
    this.perm = meta.permissions || [];
    this.docname = doc.name || "";
    this.dirty = false;
    this.saving = false;
    this.submitting = false;
    this.ready = false;
    this.enabled = true;
    this.hidden = false;

    this.is_new_doc =
      !!doc.__islocal || !doc.name || String(doc.name).startsWith("new-");

    this.custom_buttons = reactive([]);
    this._buttonGroups = new Map();
    this.dashboard = new FormDashboard();

    this._events = {};
    this._fieldChangeHandlers = {};
    this._globalFieldChangeHandlers = [];
    this._fieldMap = new Map();
    this._lastValues = {};
    this._saveDebounce = null;
    this._refreshTimeout = null;

    this._buildFieldMap();

    try {
      this._originalDoc = JSON.parse(JSON.stringify(doc));
    } catch {
      this._originalDoc = { ...doc };
    }

    this._snapshotValues();
  }

  private _buildFieldMap(): void {
    this._fieldMap.clear();
    for (const field of this.fields) {
      this._fieldMap.set(field.fieldname, field);
    }
  }

  private _snapshotValues(): void {
    this._lastValues = {};
    for (const field of this.fields) {
      if (model.is_value_type(field.fieldtype)) {
        this._lastValues[field.fieldname] = this.doc[field.fieldname];
      }
    }
  }

  /**
   * Set a field value and trigger change handlers.
   * Equivalent to frm.set_value(fieldname, value)
   */
  set_value(fieldname: string, value: any, skip_dirty?: boolean): void {
    const oldValue = this.doc[fieldname];
    if (oldValue === value) return;

    this.doc[fieldname] = value;

    if (!skip_dirty) {
      this.dirty = true;
    }

    this._triggerFieldChange(fieldname, value, oldValue);
  }

  /**
   * Set multiple field values at once.
   */
  set_values(values: Record<string, any>): void {
    for (const [fieldname, value] of Object.entries(values)) {
      this.set_value(fieldname, value);
    }
  }

  /**
   * Get a field value.
   */
  get_value(fieldname: string): any {
    return this.doc[fieldname];
  }

  /**
   * Get the document name.
   */
  get_docname(): string {
    return this.doc.name || this.docname;
  }

  /**
   * Get field metadata by fieldname.
   */
  get_field(fieldname: string): Field | undefined {
    return this._fieldMap.get(fieldname);
  }

  /**
   * Get all fields, optionally filtered by fieldtype.
   */
  get_fields(fieldtype?: string): Field[] {
    if (!fieldtype) return this.fields;
    return this.fields.filter((f) => f.fieldtype === fieldtype);
  }

  /**
   * Set a field display property such as hidden, read_only, reqd, etc.
   * Equivalent to frm.set_df_property(fieldname, property, value)
   */
  set_df_property(fieldname: string, property: string, value: any): void {
    const field = this._fieldMap.get(fieldname);
    if (field) {
      (field as any)[property] = value;
    }
  }

  /**
   * Get a field display property.
   */
  get_df_property(fieldname: string, property: string): any {
    const field = this._fieldMap.get(fieldname);
    return field ? (field as any)[property] : undefined;
  }

  /**
   * Toggle field visibility.
   * Equivalent to frm.toggle_display(fieldname, show)
   */
  toggle_display(fieldname: string | string[], show: boolean): void {
    const fns = Array.isArray(fieldname) ? fieldname : [fieldname];
    for (const fn of fns) {
      this.set_df_property(fn, "hidden", show ? 0 : 1);
    }
  }

  /**
   * Toggle required property.
   * Equivalent to frm.toggle_reqd(fieldname, reqd)
   */
  toggle_reqd(fieldname: string | string[], reqd: boolean): void {
    const fns = Array.isArray(fieldname) ? fieldname : [fieldname];
    for (const fn of fns) {
      this.set_df_property(fn, "reqd", reqd ? 1 : 0);
    }
  }

  /**
   * Toggle read_only / editable state.
   * Equivalent to frm.toggle_enable(fieldname, enable)
   */
  toggle_enable(fieldname: string | string[], enable: boolean): void {
    const fns = Array.isArray(fieldname) ? fieldname : [fieldname];
    for (const fn of fns) {
      this.set_df_property(fn, "read_only", enable ? 0 : 1);
    }
  }

  /** Shorthand: mark field(s) read-only. */
  set_read_only(fieldname: string | string[]): void {
    this.toggle_enable(fieldname, false);
  }

  /** Shorthand: mark field(s) editable. */
  set_editable(fieldname: string | string[]): void {
    this.toggle_enable(fieldname, true);
  }

  /**
   * Add a child row to a Table field.
   * Equivalent to frm.add_child(fieldname, values)
   */
  add_child(fieldname: string, values?: Record<string, any>): Document {
    if (!this.doc[fieldname]) {
      this.doc[fieldname] = [];
    }

    const rows = this.doc[fieldname] as Document[];
    const childDoc: Document = {
      doctype: this.get_field(fieldname)?.options || "",
      __islocal: 1,
      idx: rows.length + 1,
      parent: this.doc.name,
      parenttype: this.doctype,
      parentfield: fieldname,
      ...values,
    };

    rows.push(childDoc);
    this.dirty = true;
    return childDoc;
  }

  /**
   * Get child table rows.
   */
  get_children(fieldname: string): Document[] {
    return (this.doc[fieldname] || []) as Document[];
  }

  /**
   * Remove a child row by index (0-based).
   */
  remove_child(fieldname: string, index: number): void {
    const rows = this.doc[fieldname] as Document[];
    if (!rows || index < 0 || index >= rows.length) return;

    rows.splice(index, 1);
    rows.forEach((row, i) => {
      row.idx = i + 1;
    });
    this.dirty = true;
  }

  /**
   * Clear all rows in a child table.
   * Equivalent to frm.clear_table(fieldname)
   */
  clear_table(fieldname: string): void {
    this.doc[fieldname] = [];
    this.dirty = true;
  }

  /** Evaluate a depends_on expression against the current document. */
  evaluate_depends_on(expression: string | undefined | null): boolean {
    return evaluateDependsOn(expression, this.doc);
  }

  /** Check if a field should be visible based on depends_on. */
  is_field_visible(fieldname: string): boolean {
    const field = this.get_field(fieldname);
    if (!field) return false;
    if (field.hidden) return false;
    return this.evaluate_depends_on(field.depends_on);
  }

  /** Check mandatory accounting for mandatory_depends_on. */
  is_field_mandatory(fieldname: string): boolean {
    const field = this.get_field(fieldname);
    if (!field) return false;
    if (field.reqd) return true;
    if (field.mandatory_depends_on) {
      return this.evaluate_depends_on(field.mandatory_depends_on);
    }
    return false;
  }

  /** Check read_only accounting for read_only_depends_on. */
  is_field_read_only(fieldname: string): boolean {
    const field = this.get_field(fieldname);
    if (!field) return false;
    if (field.read_only) return true;
    if (field.read_only_depends_on) {
      return this.evaluate_depends_on(field.read_only_depends_on);
    }
    return false;
  }

  /**
   * Add a custom button to the form toolbar.
   * Equivalent to frm.add_custom_button(label, callback, group)
   */
  add_custom_button(
    label: string,
    callback: () => void | Promise<void>,
    options: {
      group?: string;
      icon?: string;
      className?: string;
      variant?: "primary" | "secondary" | "tertiary" | "destructive" | "plain";
      show_on?: "new" | "edit" | "always";
    } = {},
  ): void {
    if (options.show_on === "new" && !this.is_new_doc) return;
    if (options.show_on === "edit" && this.is_new_doc) return;

    const button: FormButton = {
      label,
      name: label.toLowerCase().replace(/\s+/g, "_"),
      onClick: callback,
      icon: options.icon,
      className: options.className,
      variant: options.variant,
      visible: true,
    };

    if (options.group) {
      if (!this._buttonGroups.has(options.group)) {
        const groupButton: FormButtonGroup = {
          label: options.group,
          name: options.group.toLowerCase().replace(/\s+/g, "_"),
          buttons: [],
          visible: true,
        };
        this.custom_buttons.push(groupButton);
        this._buttonGroups.set(options.group, []);
      }

      this._buttonGroups.get(options.group)!.push(button);

      const groupIndex = this.custom_buttons.findIndex(
        (b: any) => "buttons" in b && b.label === options.group,
      );
      if (groupIndex >= 0) {
        (this.custom_buttons[groupIndex] as FormButtonGroup).buttons =
          this._buttonGroups.get(options.group)!;
      }
    } else {
      this.custom_buttons.push(button);
    }
  }

  /**
   * Remove a custom button by label.
   * Equivalent to frm.remove_custom_button(label, group)
   */
  remove_custom_button(label: string, group?: string): void {
    if (group) {
      const buttons = this._buttonGroups.get(group);
      if (buttons) {
        const index = buttons.findIndex((b) => b.label === label);
        if (index >= 0) buttons.splice(index, 1);

        if (buttons.length === 0) {
          this._buttonGroups.delete(group);
          const groupIndex = this.custom_buttons.findIndex(
            (b: any) => "buttons" in b && b.label === group,
          );
          if (groupIndex >= 0) this.custom_buttons.splice(groupIndex, 1);
        }
      }
    } else {
      const index = this.custom_buttons.findIndex(
        (b: any) => !("buttons" in b) && b.label === label,
      );
      if (index >= 0) this.custom_buttons.splice(index, 1);
    }
  }

  /**
   * Clear all custom buttons.
   */
  clear_custom_buttons(): void {
    this.custom_buttons.splice(0, this.custom_buttons.length);
    this._buttonGroups.clear();
  }

  /**
   * Change the variant of a custom button.
   */
  change_custom_button_type(
    label: string,
    group: string | null,
    variant: "primary" | "secondary" | "tertiary" | "destructive" | "plain",
  ): void {
    const button = this._findButton(label, group);
    if (button) {
      button.variant = variant;
    }
  }

  private _findButton(
    label: string,
    group?: string | null,
  ): FormButton | undefined {
    if (group) {
      return this._buttonGroups.get(group)?.find((b) => b.label === label);
    }
    return this.custom_buttons.find(
      (b: any) => !("buttons" in b) && b.label === label,
    ) as FormButton | undefined;
  }

  /**
   * Validate the form. Checks required fields, child tables, and fires
   * the `validate` event for custom script hooks.
   */
  async validate(): Promise<boolean> {
    let isValid = true;

    for (const field of this.fields) {
      if (!model.is_value_type(field.fieldtype)) continue;

      const isReqd =
        field.reqd ||
        (field.mandatory_depends_on &&
          this.evaluate_depends_on(field.mandatory_depends_on));

      if (isReqd && this._isValueEmpty(field.fieldname)) {
        toast.error(`${field.label || field.fieldname} is required`);
        isValid = false;
        break;
      }

      if (field.fieldtype === "Table") {
        const rows = this.doc[field.fieldname];
        if (field.reqd && (!rows || rows.length === 0)) {
          toast.error(`${field.label} must have at least one row`);
          isValid = false;
          break;
        }

        if (rows && rows.length > 0) {
          const childMeta = await this.get_doctype_meta(field.options || "");
          if (childMeta) {
            for (let i = 0; i < rows.length; i++) {
              for (const cf of childMeta.fields || []) {
                if (
                  cf.reqd &&
                  model.is_value_type(cf.fieldtype) &&
                  this._isChildValueEmpty(rows[i], cf.fieldname)
                ) {
                  toast.error(
                    `${cf.label} is required at Row ${i + 1} in ${field.label}`,
                  );
                  isValid = false;
                  break;
                }
              }
              if (!isValid) break;
            }
          }
        }
      }
    }

    if (!isValid) return false;

    const scriptResult = await this.trigger("validate");
    if (scriptResult === false) return false;

    return true;
  }

  private _isValueEmpty(fieldname: string): boolean {
    const val = this.doc[fieldname];
    return val === undefined || val === null || val === "" || val === 0;
  }

  private _isChildValueEmpty(row: Document, fieldname: string): boolean {
    const val = row[fieldname];
    return val === undefined || val === null || val === "";
  }

  /**
   * Save the document.
   * Equivalent to frm.save()
   */
  async save(): Promise<Document | null> {
    if (this.saving) return null;

    const isValid = await this.validate();
    if (!isValid) return null;

    this.saving = true;

    try {
      await this.trigger("before_save");

      let savedDoc: Document;

      if (this.is_new_doc) {
        savedDoc = await this._createDocument();
      } else {
        savedDoc = await this._updateDocument();
      }

      Object.assign(this.doc, savedDoc);
      this.docname = savedDoc.name || this.docname;
      this.is_new_doc = false;
      this.dirty = false;

      try {
        this._originalDoc = JSON.parse(JSON.stringify(this.doc));
      } catch {
        this._originalDoc = { ...this.doc };
      }
      this._snapshotValues();

      await this.trigger("after_save");
      this.notify(__("Saved"), "success");

      return savedDoc;
    } catch (err: any) {
      console.error("Save failed:", err);
      this.throw_error(`${__("Failed to save")}: ${err.message || err}`);
      return null;
    } finally {
      this.saving = false;
    }
  }

  /**
   * Submit the document (docstatus = 1).
   * Equivalent to frm.submit()
   */
  async submit(): Promise<Document | null> {
    if (!this.meta.is_submittable) {
      this.throw_error(__("This document type is not submittable"));
      return null;
    }

    const confirmed = await dialog.confirm(
      __("Submit"),
      __(
        "Are you sure you want to submit this document? Once submitted, it cannot be changed.",
      ),
    );
    if (!confirmed) return null;

    this.submitting = true;

    try {
      await this.trigger("before_submit");

      const response = await resource.call({
        method: "frappe.client.submit",
        args: { doc: this.doc },
      });

      const savedDoc = response.message;
      if (savedDoc) {
        Object.assign(this.doc, savedDoc);
        this.dirty = false;
      }

      await this.trigger("after_submit");
      await this.trigger("on_submit");
      this.notify(__("Submitted"), "success");

      return savedDoc;
    } catch (err: any) {
      console.error("Submit failed:", err);
      this.throw_error(`${__("Failed to submit")}: ${err.message || err}`);
      return null;
    } finally {
      this.submitting = false;
    }
  }

  /**
   * Cancel the document (docstatus = 2).
   */
  async cancel(): Promise<Document | null> {
    const confirmed = await dialog.confirm(
      __("Cancel"),
      __("Are you sure you want to cancel this document?"),
    );
    if (!confirmed) return null;

    try {
      await this.trigger("before_cancel");

      const response = await resource.call({
        method: "frappe.client.cancel",
        args: { doctype: this.doctype, name: this.doc.name },
      });

      const savedDoc = response.message;
      if (savedDoc) {
        Object.assign(this.doc, savedDoc);
        this.dirty = false;
      }

      await this.trigger("after_cancel");
      this.notify(__("Cancelled"), "info");

      return savedDoc;
    } catch (err: any) {
      console.error("Cancel failed:", err);
      this.throw_error(`${__("Failed to cancel")}: ${err.message || err}`);
      return null;
    }
  }

  /**
   * Amend the document (create amended copy from cancelled doc).
   */
  async amend(): Promise<Document | null> {
    if (this.doc.docstatus !== 2) {
      this.throw_error(__("Only cancelled documents can be amended"));
      return null;
    }

    try {
      await this.trigger("before_amend");

      const response = await resource.call({
        method: "frappe.client.amend",
        args: { doctype: this.doctype, name: this.doc.name },
      });

      const newDoc = response.message;
      await this.trigger("after_amend");
      return newDoc;
    } catch (err: any) {
      console.error("Amend failed:", err);
      this.throw_error(`${__("Failed to amend")}: ${err.message || err}`);
      return null;
    }
  }

  /**
   * Duplicate the document.
   */
  async duplicate(): Promise<Document | null> {
    try {
      const payload: Record<string, any> = {};
      const excluded = new Set([
        "name",
        "owner",
        "creation",
        "modified",
        "modified_by",
        "docstatus",
        "idx",
        "parent",
        "parenttype",
        "parentfield",
        "__islocal",
        "__unsaved",
      ]);

      for (const field of this.fields) {
        if (field.no_copy) continue;
        const value = this.doc[field.fieldname];
        if (value === undefined) continue;

        if (field.fieldtype === "Table" && Array.isArray(value)) {
          payload[field.fieldname] = value.map((row: Record<string, any>) => {
            const cleaned: Record<string, any> = {};
            for (const key of Object.keys(row)) {
              if (!excluded.has(key)) cleaned[key] = row[key];
            }
            return cleaned;
          });
        } else {
          payload[field.fieldname] = value;
        }
      }

      const response = await resource.call({
        method: "frappe.client.insert",
        args: { doc: { ...payload, doctype: this.doctype } },
      });

      this.notify(__("Duplicated"), "success");
      return response.message;
    } catch (err: any) {
      console.error("Duplicate failed:", err);
      this.throw_error(`${__("Failed to duplicate")}: ${err.message || err}`);
      return null;
    }
  }

  /**
   * Discard all changes and revert to original document state.
   */
  discard(): void {
    try {
      const original = JSON.parse(JSON.stringify(this._originalDoc));
      Object.assign(this.doc, original);
    } catch {
      Object.assign(this.doc, this._originalDoc);
    }
    this.dirty = false;
    this._snapshotValues();
  }

  /**
   * Reload the document from the server.
   */
  async reload_doc(): Promise<void> {
    if (this.is_new_doc || !this.doc.name) return;

    try {
      const doc = await this._fetchDocument(this.doctype, this.doc.name);
      Object.assign(this.doc, doc);
      this.dirty = false;

      try {
        this._originalDoc = JSON.parse(JSON.stringify(this.doc));
      } catch {
        this._originalDoc = { ...this.doc };
      }
      this._snapshotValues();

      await this.trigger("refresh");
    } catch (err: any) {
      console.error("Reload failed:", err);
      this.throw_error(`${__("Failed to reload")}: ${err.message || err}`);
    }
  }

  /**
   * Show a toast notification.
   */
  notify(
    msg: string,
    type: "success" | "error" | "warning" | "info" = "info",
    duration?: number,
  ): void {
    const defaultDurations = {
      success: 4000,
      info: 4000,
      warning: 5000,
      error: 6000,
    };
    const finalDuration = duration ?? defaultDurations[type];
    toast.show({ type, title: msg, duration: finalDuration });
  }

  /**
   * Show an error dialog.
   * Equivalent to frappe.throw(msg)
   */
  throw_error(msg: string): void {
    console.error("Form Error:", msg);
    dialog.error(__("Error"), msg);
  }

  /**
   * Alias for throw_error – matches legacy FormContext.throw(msg).
   */
  throw(msg: string): void {
    this.throw_error(msg);
  }

  /**
   * Show an info toast.
   */
  show_alert(msg: string, _seconds?: number): void {
    toast.info(msg);
  }

  /**
   * Call a server-side whitelisted method.
   * Equivalent to frm.call({ method, args })
   */
  async call(
    method: string,
    args?: Record<string, any>,
    callback?: (response: any) => void,
  ): Promise<any> {
    try {
      const response = await resource.call({
        method,
        args: { ...args, doctype: this.doctype, name: this.doc.name },
        callback,
      });
      return response;
    } catch (err) {
      console.error(`frm.call(${method}) failed:`, err);
      throw err;
    }
  }

  /**
   * Call a whitelisted method on the document's controller.
   */
  async call_doc_method(
    method: string,
    args?: Record<string, any>,
  ): Promise<any> {
    return this.call("frappe.client.run_doc_method", {
      dt: this.doctype,
      dn: this.doc.name,
      method,
      args: args || {},
    });
  }

  /** Check if form has unsaved changes. */
  is_dirty(): boolean {
    return this.dirty;
  }

  /** Check if this is a new (unsaved) document. */
  is_new(): boolean {
    return this.is_new_doc;
  }

  /** Check if the document has been submitted. */
  is_submitted(): boolean {
    return this.doc.docstatus === 1;
  }

  /** Check if the document has been cancelled. */
  is_cancelled(): boolean {
    return this.doc.docstatus === 2;
  }

  /** Get formatted field value for display. */
  get_formatted(fieldname: string): string {
    const val = this.doc[fieldname];
    const field = this.get_field(fieldname);
    if (!field) return String(val ?? "");

    if (field.fieldtype === "Currency" && typeof val === "number") {
      return val.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    if (field.fieldtype === "Check") {
      return val ? __("Yes") : __("No");
    }
    if (field.fieldtype === "Date" && val) {
      try {
        return new Date(val).toLocaleDateString();
      } catch {
        return String(val);
      }
    }

    return String(val ?? "");
  }

  /**
   * Get DocType metadata for any doctype (useful for child table lookups).
   */
  async get_doctype_meta(doctype: string): Promise<DocTypeMeta | null> {
    if ((window as any).locals?.DocType?.[doctype]) {
      return (window as any).locals.DocType[doctype] as DocTypeMeta;
    }

    return new Promise((resolve) => {
      model.with_doctype(doctype, (result: any) => {
        resolve((result?.message as DocTypeMeta) || null);
      });
    });
  }

  /**
   * Alias for get_doctype_meta – matches legacy FormContext.getDoctypeMeta().
   */
  async getDoctypeMeta(doctype: string): Promise<DocTypeMeta | null> {
    return this.get_doctype_meta(doctype);
  }

  /** Set intro message (shows as an alert toast). */
  set_intro(
    message: string,
    _color?: "blue" | "green" | "yellow" | "red" | "orange",
  ): void {
    this.show_alert(message);
  }

  /** Scroll to a field in the form. */
  scroll_to_field(fieldname: string): void {
    const formEl = document.querySelector("[data-form-content]") || document;
    const fieldEl =
      formEl.querySelector(`[data-fieldname="${fieldname}"] input`) ||
      formEl.querySelector(`[data-fieldname="${fieldname}"] select`) ||
      formEl.querySelector(`[data-fieldname="${fieldname}"] textarea`) ||
      formEl.querySelector(`[data-fieldname="${fieldname}"]`);

    if (fieldEl instanceof HTMLElement) {
      fieldEl.focus({ preventScroll: true });
      setTimeout(
        () => fieldEl.scrollIntoView({ behavior: "smooth", block: "center" }),
        100,
      );
    }
  }

  /** Disable save (e.g. when form is read-only by script). */
  disable_save(): void {
    this.enabled = false;
  }

  /** Enable save. */
  enable_save(): void {
    this.enabled = true;
  }

  /** Check if the current user has a specific permission. */
  has_perm(perm_type: string): boolean {
    if (!this.perm || this.perm.length === 0) return false;
    return this.perm.some((p) => (p as any)[perm_type]);
  }

  /** Get the document status for display. */
  get_status(): { label: string; color: string } {
    if (this.dirty) return { label: __("Not Saved"), color: "orange" };
    if (this.doc.docstatus === 1)
      return { label: __("Submitted"), color: "primary" };
    if (this.doc.docstatus === 2)
      return { label: __("Cancelled"), color: "danger" };
    if (this.doc.docstatus === 0)
      return { label: __("Draft"), color: "secondary" };
    return { label: __("Saved"), color: "success" };
  }

  /** Register an event handler. */
  on(event: string, handler: (frm: Form) => void | Promise<void>): void {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(handler);
  }

  /** Remove an event handler. */
  off(event: string, handler?: (frm: Form) => void | Promise<void>): void {
    if (!handler) {
      delete this._events[event];
    } else {
      const handlers = this._events[event];
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index >= 0) handlers.splice(index, 1);
      }
    }
  }

  /**
   * Trigger an event. Returns false if any handler returned false
   * (which aborts the chain, e.g. validation).
   */
  async trigger(event: string): Promise<boolean | void> {
    const handlers = this._events[event] || [];

    for (const handler of handlers) {
      try {
        const result = (await handler(this)) as unknown;
        if (result === false) return false;
      } catch (err) {
        console.error(`Error in ${this.doctype}.${event}:`, err);
        return false;
      }
    }
  }

  /** Register a handler for a specific field change. */
  on_field_change(
    fieldname: string,
    handler: (frm: Form) => void | Promise<void>,
  ): void {
    if (!this._fieldChangeHandlers[fieldname]) {
      this._fieldChangeHandlers[fieldname] = [];
    }
    this._fieldChangeHandlers[fieldname].push(handler);
  }

  /** Internal: fire field change handlers. */
  private _triggerFieldChange(
    fieldname: string,
    _value: any,
    _oldValue: any,
  ): void {
    // Fire field-specific handlers
    const handlers = this._fieldChangeHandlers[fieldname] || [];
    for (const handler of handlers) {
      try {
        handler(this);
      } catch (err) {
        console.error(
          `Error in ${this.doctype}.${fieldname} change handler:`,
          err,
        );
      }
    }

    const eventHandlers = this._events[fieldname] || [];
    for (const handler of eventHandlers) {
      try {
        handler(this);
      } catch (err) {
        console.error(
          `Error in ${this.doctype}.${fieldname} event handler:`,
          err,
        );
      }
    }

    // Fire global field_changed catch-all handlers
    for (const handler of this._globalFieldChangeHandlers) {
      try {
        handler({
          doctype: this.doctype,
          field: fieldname,
          value: _value,
          doc: this.doc,
          frm: this,
        });
      } catch (err) {
        console.error(`Error in ${this.doctype}.field_changed handler:`, err);
      }
    }
  }

  /**
   * Bind all handlers from a handler map (from desk.defineForm()).
   * Standard events go to the event system; everything else is
   * treated as a field-change handler.
   */
  bindHandlers(handlers: Record<string, any>): void {
    for (const [key, handler] of Object.entries(handlers)) {
      if (typeof handler !== "function") continue;

      if (
        (FORM_SCRIPT_EVENTS as readonly string[]).includes(key) ||
        key === "load" ||
        key === "setup"
      ) {
        const eventName = key === "load" ? "onload" : key;
        this.on(eventName, handler as (frm: Form) => void);
      } else if (key === "field_changed") {
        // Catch-all handler fired on ANY field change
        // Receives { doctype, field, value, doc, frm }
        this._globalFieldChangeHandlers.push(handler as any);
      } else {
        // Field change handler (e.g. "customer", "amount")
        this.on(key, handler as (frm: Form) => void);
        this.on_field_change(key, handler as (frm: Form) => void);
      }
    }
  }

  /** Get the current workflow state. */
  get_workflow_state(): string | null {
    return this.doc.workflow_state || null;
  }

  /** Check if form has a workflow. */
  has_workflow(): boolean {
    return !!this.doc.workflow_state;
  }

  private async _createDocument(): Promise<Document> {
    const response = await resource.call({
      method: "frappe.client.insert",
      args: { doc: { ...this.doc, doctype: this.doctype } },
    });
    return response.message;
  }

  private async _updateDocument(): Promise<Document> {
    const response = await resource.call({
      method: "frappe.client.save",
      args: {
        doc: { ...this.doc, doctype: this.doctype },
      },
    });
    return response.message;
  }

  private async _fetchDocument(
    doctype: string,
    name: string,
  ): Promise<Document> {
    const response = await fetch(`/api/resource/${doctype}/${name}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    return data.data || data.message || data;
  }

  /**
   * Cleanup timers, event handlers, etc.
   * Call when the form component is destroyed.
   */
  destroy(): void {
    if (this._saveDebounce) clearTimeout(this._saveDebounce);
    if (this._refreshTimeout) clearTimeout(this._refreshTimeout);
    this._events = {};
    this._fieldChangeHandlers = {};
    this._globalFieldChangeHandlers = [];
    this.custom_buttons.splice(0, this.custom_buttons.length);
    this._buttonGroups.clear();
  }
}

/**
 * Create a new Form instance from doctype metadata and document data.
 */
export function createForm(
  doctype: string,
  doc: Document,
  meta: DocTypeMeta,
): Form {
  return new Form(doctype, doc, meta);
}
