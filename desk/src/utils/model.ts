/**
 * Model utilities for document manipulation
 * Similar to Frappe's model/model.js
 *
 * Provides utilities for working with documents and doctypes
 */

import { useLocalsStore } from "./locals/locals";
import { getDoc, getList, hasDoc, addToLocals, clearDoc } from "./locals/sync";
import type { DeskDocument, DocTypeMetadata, DocField } from "../types/locals";

/**
 * Get or fetch a document with callback
 */
export async function withDoc(
  doctype: string,
  name: string,
  callback?: () => void,
): Promise<DeskDocument | null> {
  const store = useLocalsStore();

  // Check if document exists in locals
  if (hasDoc(doctype, name) && store.getDocInfo(doctype, name)) {
    callback?.();
    return getDoc(doctype, name);
  }

  // Fetch from server (implement your API call here)
  // This is a placeholder - integrate with your actual API
  try {
    const response = await fetchDocFromServer(doctype, name);
    if (response) {
      addToLocals(response);
      callback?.();
      return response;
    }
  } catch (error) {
    console.error(`Failed to fetch ${doctype} ${name}:`, error);
  }

  return null;
}

/**
 * Fetch a document from server
 * Replace this with your actual API integration
 */
export async function fetchDocFromServer(
  doctype: string,
  name: string,
): Promise<DeskDocument | null> {
  try {
    // Placeholder for server API call
    // Replace with your actual API endpoint
    const response = await fetch(`/api/resource/${doctype}/${name}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching document:", error);
  }
  return null;
}

/**
 * Get document children (for child tables)
 */
export function getChildren(
  doctype: string,
  parent: string,
  parentfield: string,
  filters?: any,
): DeskDocument[] {
  const children: DeskDocument[] = [];
  const docs = getList(doctype);

  for (const doc of docs) {
    if (doc.parent === parent && doc.parentfield === parentfield) {
      if (!filters) {
        children.push(doc);
      } else {
        let match = true;
        for (const key in filters) {
          if (doc[key] !== filters[key]) {
            match = false;
            break;
          }
        }
        if (match) {
          children.push(doc);
        }
      }
    }
  }

  return children;
}

/**
 * Clear all child documents of a parent
 */
export function clearTable(doc: DeskDocument, parentfield: string) {
  const children = doc[parentfield];
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child.doctype && child.name) {
        clearDoc(child.doctype, child.name);
      }
    }
  }
  doc[parentfield] = [];
}

/**
 * Get document info (comments, attachments, etc.)
 */
export function getDocInfo(doctype: string, name: string) {
  const store = useLocalsStore();
  return store.getDocInfo(doctype, name);
}

/**
 * Set document info
 */
export function setDocInfo(doctype: string, name: string, info: any) {
  const store = useLocalsStore();
  store.setDocInfo(doctype, name, info);
}

/**
 * Get shared information for a document
 */
export function getShared(doctype: string, name: string) {
  const info = getDocInfo(doctype, name);
  return info?.shared || null;
}

/**
 * Get a value from a document
 */
export function getValue(
  doctype: string,
  filters: string | any,
  fieldname?: string,
  _callback?: any,
): any {
  // Synchronous version (for cached data)
  if (typeof filters === "string" || typeof filters === "number") {
    const doc = getDoc(doctype, filters as string);
    if (doc && fieldname) {
      return doc[fieldname];
    }
    return doc;
  }

  // For filter objects, search in locals
  if (typeof filters === "object") {
    const docs = getList(doctype, filters);
    if (docs.length > 0 && fieldname) {
      return docs[0][fieldname];
    }
    return docs.length > 0 ? docs[0] : null;
  }

  return null;
}

/**
 * Set a value in a document
 */
export function setValue(
  doctype: string,
  name: string,
  fieldname: string,
  value: any,
) {
  const doc = getDoc(doctype, name);
  if (doc) {
    doc[fieldname] = value;
    doc.__unsaved = true;
  }
}

/**
 * Get document title based on DocType title field
 */
export function getDocTitle(doc: DeskDocument): string {
  const store = useLocalsStore();
  const meta = store.getMeta(doc.doctype);

  if (!meta) {
    return doc.name;
  }

  // Find title field or use first link field
  let titleField = "name";
  for (const field of meta.fields) {
    if (field.fieldtype === "Data" || field.fieldtype === "Link") {
      titleField = field.fieldname;
      break;
    }
  }

  return doc[titleField] || doc.name;
}

/**
 * Get document count
 */
export function getDocCount(doctype: string): number {
  const store = useLocalsStore();
  return store.getCount(doctype);
}

/**
 * Check if document is dirty (has unsaved changes)
 */
export function isDocDirty(doctype: string, name: string): boolean {
  const doc = getDoc(doctype, name);
  return !!doc?.__unsaved;
}

/**
 * Mark document as saved
 */
export function markDocSaved(doctype: string, name: string) {
  const doc = getDoc(doctype, name);
  if (doc) {
    doc.__unsaved = false;
    doc.__last_sync_on = new Date();
  }
}

/**
 * Mark document as needing refresh
 */
export function markDocForRefresh(doctype: string, name: string) {
  const doc = getDoc(doctype, name);
  if (doc) {
    doc.__needs_refresh = true;
  }
}

/**
 * Get all unsaved documents
 */
export function getUnsavedDocs(): DeskDocument[] {
  const store = useLocalsStore();
  const unsaved: DeskDocument[] = [];

  for (const doctype in store.locals) {
    for (const name in store.locals[doctype]) {
      const doc = store.locals[doctype][name];
      if (doc?.__unsaved) {
        unsaved.push(doc);
      }
    }
  }

  return unsaved;
}

/**
 * Get all documents needing refresh
 */
export function getDocsNeedingRefresh(): DeskDocument[] {
  const store = useLocalsStore();
  const needsRefresh: DeskDocument[] = [];

  for (const doctype in store.locals) {
    for (const name in store.locals[doctype]) {
      const doc = store.locals[doctype][name];
      if (doc?.__needs_refresh) {
        needsRefresh.push(doc);
      }
    }
  }

  return needsRefresh;
}

/**
 * Convert doctype name to snake_case for API calls
 */
export function getServerModuleName(doctype: string): string {
  return doctype.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Get user settings for a doctype
 */
export function getUserSettings(doctype: string): any {
  const store = useLocalsStore();
  return store.getDocInfoField(doctype, "user_settings", "user_settings") || {};
}

/**
 * Set user settings for a doctype
 */
export function setUserSettings(doctype: string, settings: any) {
  const store = useLocalsStore();
  store.setDocInfoField(doctype, "user_settings", "user_settings", settings);
}
