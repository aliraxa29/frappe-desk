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
  reqd: boolean;
  bold?: number;
  hidden: number;
  read_only: boolean;
  depends_on?: string;
  fetch_from?: string;
  fetch_if_empty?: number;
  default?: any;
  description?: string;
  columns?: number;
  precision?: number;
  in_list_view?: number;
  in_filter?: number;
  in_standard_filter?: number;
  in_global_search?: number;
  search_index?: number;
  allow_bulk_edit?: number;
  collapsible?: number;
  collapsed?: number;
  collapsible_depends_on?: string;
  mandatory_depends_on?: string;
  read_only_depends_on?: string;
  print_hide?: number;
  print_hide_if_no_value?: number;
  no_copy?: number;
  unique?: number;
  parent?: string;
  idx?: number;
  width?: string;
  permlevel?: number;
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
  | "Link"
  | "Select"
  | "Attach"
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
  | "Button";

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
export interface FormContext {
  doctype: string;
  doc: Document;
  meta: DocTypeMeta;
  dirty: boolean;
  customButtons?: any[];
  set_value(field: string, value: any): void;
  get_value(field: string): any;
  refresh_field(field?: string): void;
  throw(msg: string): void;
  notify(msg: string, type?: "info" | "success" | "error" | "warning"): void;
  validate(): boolean;
  save(): Promise<void>;
  submit(): Promise<void>;
  amend(): Promise<void>;
  duplicate(): Promise<void>;
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
  setup?: (ctx: FormContext) => void | Promise<void>;
  load?: (ctx: FormContext) => void | Promise<void>;
  validate?: (ctx: FormContext) => boolean | Promise<boolean>;
  before_save?: (ctx: FormContext) => void | Promise<void>;
  after_save?: (ctx: FormContext) => void | Promise<void>;
  before_submit?: (ctx: FormContext) => void | Promise<void>;
  after_submit?: (ctx: FormContext) => void | Promise<void>;
  field_changed?: (ctx: FieldChangeContext) => void | Promise<void>;
  [key: string]: any;
}

export interface FieldChangeContext extends FormContext {
  field: string;
  value: any;
  previous_value?: any;
}

export interface ListHandlers {
  setup?: (ctx: ListContext) => void | Promise<void>;
  refresh?: (ctx: ListContext) => void | Promise<void>;
  [key: string]: any;
}

export interface ListContext {
  doctype: string;
  data: Document[];
  filters: Record<string, any>;
}
