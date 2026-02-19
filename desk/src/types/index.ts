import type { ListView } from "../metadata/listview";

// DocType Meta Types
export interface DocTypeMeta {
  name: string;
  label: string;
  module: string;
  doctype: "DocType";
  docstatus: number;
  fields: Field[];
  permissions: Permission[];
  is_submittable: number;
  issingle?: number;
  track_changes: number;
  allow_rename: number;
  autoname?: string;
  naming_series?: string[];
  quick_entry?: number;
  sort_field?: string;
  sort_order?: string;
  title_field?: string;
  image_field?: string;
  show_title_field_in_link?: number;
}

// DocType Meta Response from API
export interface DocTypeMetaResponse {
  docs: DocTypeMeta[];
  user_settings?: Record<string, any>;
}

export interface Field {
  fieldname: string;
  label: string;
  fieldtype: FieldType;
  options?: string;
  search_index?: number;
  show_dashboard?: number;
  hidden?: number;
  set_only_once?: number;
  allow_in_quick_entry?: number;
  print_hide?: number;
  report_hide?: number;
  reqd?: number;
  bold?: number;
  in_global_search?: number;
  collapsible?: number;
  unique?: number;
  no_copy?: number;
  allow_on_submit?: number;
  show_preview_pop?: number;
  trigger?: string;
  collapsible_depends_on?: string;
  mandatory_depends_on?: string;
  read_only_depends_on?: string;
  depends_on?: string;
  permlevel?: number;
  ignore_user_permissions?: number;
  width?: string;
  print_width?: string;
  columns?: number;
  default?: string;
  description?: string;
  in_list_view?: number;
  fetch_if_empty?: number;
  in_filter?: number;
  remember_last_selected_value?: number;
  ignore_xss_filter?: number;
  print_hide_if_no_value?: number;
  allow_bulk_edit?: number;
  in_standard_filter?: number;
  in_preview?: number;
  read_only?: number;
  precision?: string;
  max_height?: string;
  length?: number;
  translatable?: number;
  hide_border?: number;
  hide_days?: number;
  hide_seconds?: number;
  non_negative?: number;
  is_virtual?: number;
  sort_options?: number;
  link_filters?: string;
  fetch_from?: string;
  show_on_timeline?: number;
  make_attachment_public?: number;
  documentation_url?: string;
  placeholder?: string;
}

// List View Column definition
export interface ListColumn {
  type: "Subject" | "Status" | "Tag" | "Field";
  df?: Field;
  label?: string;
  fieldname?: string;
  width?: string;
}

// List View Settings from DocType
export interface ListViewSettings {
  total_fields?: number;
  fields?: string[];
  add_fields?: string[];
  filters?: any[];
  page_length?: number;
}

export type FieldType =
  | "Data"
  | "Email"
  | "Phone"
  | "URL"
  | "Link"
  | "Select"
  | "Attach"
  | "Attach Image"
  | "Currency"
  | "Date"
  | "DateTime"
  | "Time"
  | "Float"
  | "Int"
  | "Percent"
  | "Duration"
  | "Check"
  | "Small Text"
  | "Long Text"
  | "Text Editor"
  | "Code"
  | "Rating"
  | "Color"
  | "Barcode"
  | "Signature"
  | "GeoData"
  | "JSON"
  | "Table"
  | "Table MultiSelect"
  | "HTML"
  | "Image"
  | "Heading"
  | "Column Break"
  | "Section Break"
  | "Tab Break"
  | "Button"
  | "Read Only";

export interface Permission {
  role: string;
  create?: number;
  read?: number;
  write?: number;
  delete?: number;
  print?: number;
  email?: number;
  export?: number;
  submit?: number;
  amend?: number;
  cancel?: number;
  share?: number;
  report?: number;
  parent?: string;
  idx?: number;
}

export interface Document {
  [key: string]: any;
  name?: string;
  doctype?: string;
  docstatus?: number;
  creation?: string;
  modified?: string;
  modified_by?: string;
  owner?: string;
}

export interface ListResponse {
  data: Document[];
  keys: string[];
}

export interface APIResponse<T = any> {
  message: T;
  exc?: string;
}

// Form Context
// This interface is satisfied by the Form class (metadata/form.ts).
// Field components accept `ctx: FormContext` so the Form instance
// can be passed directly.
export interface FormContext {
  doctype: string;
  doc: Document;
  meta: DocTypeMeta;
  fields: Field[];
  perm: Permission[];
  dirty: boolean;
  saving: boolean;
  submitting: boolean;
  is_new_doc: boolean;
  ready: boolean;
  enabled: boolean;
  hidden: boolean;
  customButtons?: any[];
  dashboard: any;
  page: any;

  // Value access
  set_value(field: string, value: any, skip_dirty?: boolean): void;
  set_values(values: Record<string, any>): void;
  get_value(field: string): any;
  get_docname(): string;

  // Field metadata
  get_field(fieldname: string): Field | undefined;
  get_fields(fieldtype?: string): Field[];
  set_df_property(fieldname: string, property: string, value: any): void;
  get_df_property(fieldname: string, property: string): any;
  toggle_display(fieldname: string | string[], show: boolean): void;
  toggle_reqd(fieldname: string | string[], reqd: boolean): void;
  toggle_enable(fieldname: string | string[], enable: boolean): void;
  set_read_only(fieldname: string | string[]): void;
  set_editable(fieldname: string | string[]): void;

  // Child table
  add_child(field: string, values?: Record<string, any>): Document;
  get_children(fieldname: string): Document[];
  remove_child(fieldname: string, index: number): void;
  clear_table(fieldname: string): void;

  // Depends-on
  evaluate_depends_on(expression: string | undefined | null): boolean;
  is_field_visible(fieldname: string): boolean;
  is_field_mandatory(fieldname: string): boolean;
  is_field_read_only(fieldname: string): boolean;

  // Custom buttons
  add_custom_button(
    label: string,
    callback: () => void | Promise<void>,
    options?: {
      group?: string;
      icon?: string;
      className?: string;
      variant?: "primary" | "secondary" | "tertiary" | "destructive" | "plain";
      show_on?: "new" | "edit" | "always";
    },
  ): void;
  remove_custom_button(label: string, group?: string): void;
  clear_custom_buttons(): void;

  // Validation
  validate(): Promise<boolean>;

  // CRUD
  save(): Promise<Document | null>;
  submit(): Promise<Document | null>;
  cancel(): Promise<Document | null>;
  amend(): Promise<Document | null>;
  duplicate(): Promise<Document | null>;
  discard(): void;
  reload_doc(): Promise<void>;

  // Notifications
  notify(
    msg: string,
    type?: "success" | "error" | "warning" | "info",
    duration?: number,
  ): void;
  throw(msg: string): void;
  throw_error(msg: string): void;
  show_alert(msg: string, seconds?: number): void;

  // RPC
  call(
    method: string,
    args?: Record<string, any>,
    callback?: (r: any) => void,
  ): Promise<any>;
  call_doc_method(method: string, args?: Record<string, any>): Promise<any>;

  // Utility
  refresh_field(field?: string): void;
  refresh_fields(): void;
  is_dirty(): boolean;
  is_new(): boolean;
  is_submitted(): boolean;
  is_cancelled(): boolean;
  get_formatted(fieldname: string): string;
  get_doctype_meta(doctype: string): Promise<DocTypeMeta | null>;
  getDoctypeMeta(doctype: string): Promise<DocTypeMeta | null>;
  get_status(): { label: string; color: string };
  set_intro(message: string, color?: string): void;
  scroll_to_field(fieldname: string): void;
  disable_save(): void;
  enable_save(): void;
  has_perm(perm_type: string): boolean;

  // Events
  on(event: string, handler: (frm: any) => void | Promise<void>): void;
  off(event: string, handler?: (frm: any) => void | Promise<void>): void;
  trigger(event: string): Promise<boolean | void>;
  on_field_change(
    fieldname: string,
    handler: (frm: any) => void | Promise<void>,
  ): void;
  bindHandlers(handlers: Record<string, any>): void;

  // Workflow
  get_workflow_state(): string | null;
  has_workflow(): boolean;

  // Lifecycle
  destroy(): void;
}

export interface FieldState {
  value: any;
  error?: string;
  touched: boolean;
}

// App Info
export interface AppInfo {
  name: string;
  title: string;
  icon?: string;
  image?: string;
  description?: string;
  module?: string;
}

// Script Registry
export interface FormHandlers {
  setup?: (frm: FormContext) => void | Promise<void>;
  onload?: (frm: FormContext) => void | Promise<void>;
  load?: (frm: FormContext) => void | Promise<void>;
  refresh?: (frm: FormContext) => void | Promise<void>;
  validate?: (frm: FormContext) => boolean | Promise<boolean>;
  before_save?: (frm: FormContext) => void | Promise<void>;
  after_save?: (frm: FormContext) => void | Promise<void>;
  before_submit?: (frm: FormContext) => void | Promise<void>;
  after_submit?: (frm: FormContext) => void | Promise<void>;
  before_cancel?: (frm: FormContext) => void | Promise<void>;
  after_cancel?: (frm: FormContext) => void | Promise<void>;
  before_amend?: (frm: FormContext) => void | Promise<void>;
  after_amend?: (frm: FormContext) => void | Promise<void>;
  on_submit?: (frm: FormContext) => void | Promise<void>;
  timeline_refresh?: (frm: FormContext) => void | Promise<void>;
  onload_post_render?: (frm: FormContext) => void | Promise<void>;
  [key: string]: any; // field-change handlers: e.g. customer(frm) { ... }
}

export interface ListHandlers {
  setup?: (list: ListContext) => void | Promise<void>;
  onload?: (list: ListContext) => void | Promise<void>;
  refresh?: (list: ListContext) => void | Promise<void>;
  render?: (list: ListContext) => void | Promise<void>;
  before_render?: (list: ListContext) => void | Promise<void>;
  get_indicator?: (doc: Document) => [string, string] | null;
  primary_action?: (list: ListContext) => void | Promise<void>;
  formatters?: Record<
    string,
    (value: any, field: Field, doc: Document) => string
  >;
  button?: {
    show?: (doc: Document) => boolean;
    get_label?: () => string;
    get_description?: (doc: Document) => string;
    action?: (doc: Document) => void;
  };
  row_actions?: Array<{
    label: string;
    action: (doc: Document) => void;
    show?: (doc: Document) => boolean;
  }>;
  add_fields?: string[];
  hide_name_column?: boolean;
  hide_serial_column?: boolean;
  show_id_column?: boolean;
  columns?: Array<{ fieldname: string; label?: string; width?: string }>;
  [key: string]: any;
}

export interface ListContext {
  doctype: string;
  meta: DocTypeMeta | null;
  data: Document[];
  filters: any[];
  columns: ListColumn[];
  selected: string[];
  page_length: number;
  current_page: number;
  total_count: number;
  sort_field: string;
  sort_order: "asc" | "desc";
  refresh: () => Promise<void>;
  set_filter: (fieldname: string, value: any) => void;
  remove_filter: (fieldname: string) => void;
  clear_filters: () => void;
  get_checked_items: () => Document[];
  set_page_length: (length: number) => void;
  toggle_sort: (fieldname: string) => void;
  open_document: (name: string) => void;
}

// Parsed Form Layout Types
export interface ParsedColumn {
  fields: Field[];
}

export interface ParsedSection {
  fieldname?: string;
  label?: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  depends_on?: string;
  collapsible_depends_on?: string;
  columns: ParsedColumn[];
}

export interface ParsedTab {
  fieldname?: string;
  label?: string;
  fields: Field[];
  sections: ParsedSection[];
  hidden?: boolean;
  depends_on?: string;
}

export interface DeskCallOptions {
  method: string;
  args?: Record<string, any>;
  type?: string;
  callback?: (response: any) => void;
  error_callback?: (error: any) => void;
  freeze?: boolean;
  freeze_message?: string;
  async?: boolean;
}

export interface DeskCallResponse {
  message?: any;
  exc?: string;
  status?: number;
  _server_messages?: string[];
}

export const LIST_SCRIPT_EVENTS = [
  "setup",
  "onload",
  "refresh",
  "render",
  "before_render",
] as const;

export type ListScriptEvent = (typeof LIST_SCRIPT_EVENTS)[number];

export interface ListviewSettings {
  add_fields?: string[];
  columns?: Array<{ fieldname: string; label?: string; width?: string }>;
  hide_name_column?: boolean;
  hide_serial_column?: boolean;
  show_id_column?: boolean;
  get_indicator?: (doc: Document) => [string, string] | null;
  formatters?: Record<
    string,
    (value: any, field: Field, doc: Document) => string
  >;
  onload?: (list: ListView) => void;
  refresh?: (list: ListView) => void;
  render?: (list: ListView) => void;
  before_render?: (list: ListView) => void;
  button?: {
    show?: (doc: Document) => boolean;
    get_label?: () => string;
    get_description?: (doc: Document) => string;
    action?: (doc: Document) => void;
  };
  primary_action?: (list: ListView) => void;
  row_actions?: Array<{
    label: string;
    action: (doc: Document) => void;
    show?: (doc: Document) => boolean;
  }>;
  [key: string]: any;
}

export interface FilterRow {
  id: string;
  fieldname: string;
  operator: string;
  value: any;
}
