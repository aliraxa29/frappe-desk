/**
 * Types for the locals data store
 * Similar to Frappe's locals structure
 */

export interface DeskDocument {
  doctype: string;
  name: string;
  [key: string]: any;
  __islocal?: boolean;
  __unsaved?: boolean;
  __needs_refresh?: boolean;
  __last_sync_on?: Date;
  parentfield?: string;
  parenttype?: string;
  parent?: string;
}

export interface DocTypeMetadata {
  name: string;
  fields: DocField[];
  permissions?: any[];
  [key: string]: any;
}

export interface DocField {
  fieldname: string;
  fieldtype: string;
  label: string;
  options?: string;
  [key: string]: any;
}

export interface LocalsStore {
  [doctype: string]: {
    [docname: string]: DeskDocument;
  };
}

export interface DocumentInfo {
  doctype: string;
  name: string;
  comments?: any[];
  attachments?: any[];
  shared?: any[];
  user_info?: any[];
  [key: string]: any;
}

export interface ModelDocInfo {
  [doctype: string]: {
    [docname: string]: DocumentInfo;
  };
}

export interface SyncResponse {
  docs?: DeskDocument[];
  docinfo?: DocumentInfo;
  message?: any;
  [key: string]: any;
}
