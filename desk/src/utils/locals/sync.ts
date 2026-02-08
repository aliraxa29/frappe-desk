/**
 * Document synchronization utilities
 * Similar to Frappe's model/sync.js
 *
 * Handles syncing documents from server to locals
 */

import { useLocalsStore } from "./locals";
import type { DeskDocument, SyncResponse } from "../../types/locals";

/**
 * Sync documents from server response to locals
 * Extracts docs and docinfo from response and stores them
 */
export function syncDocuments(response: SyncResponse): DeskDocument[] {
  const store = useLocalsStore();
  const syncedDocs: DeskDocument[] = [];

  // Handle different response formats
  let docs = response.docs;
  if (!docs && !response.docinfo) {
    docs = [response] as DeskDocument[];
  }

  // Convert single object to array
  if (docs && !Array.isArray(docs)) {
    docs = [docs as DeskDocument];
  }

  // Sync documents
  if (docs && Array.isArray(docs)) {
    for (const doc of docs) {
      if (store.hasDoc(doc.doctype, doc.name)) {
        // Update existing document
        updateInLocals(doc);
      } else {
        // Add new document
        addToLocals(doc);
      }

      syncedDocs.push(doc);

      // Add child documents to locals
      addChildDocsToLocals(doc);
    }
  }

  // Sync document info (comments, attachments, etc.)
  if (response.docinfo) {
    const { doctype, name } = response.docinfo;
    store.setDocInfo(doctype, name, response.docinfo);
  }

  return syncedDocs;
}

/**
 * Add a document to locals
 */
export function addToLocals(doc: DeskDocument) {
  const store = useLocalsStore();

  // For new local documents, generate a name
  if (!doc.name && doc.__islocal) {
    doc.name = store.getNewName(doc.doctype);

    // Provide meta information for new documents
    if (!doc.parentfield) {
      // This is a parent document
    }
  }

  store.addToLocals(doc);
}

/**
 * Update an existing document in locals
 */
export function updateInLocals(doc: DeskDocument) {
  const store = useLocalsStore();
  const localDoc = store.getDoc(doc.doctype, doc.name);

  if (!localDoc) {
    addToLocals(doc);
    return;
  }

  // Update values in the existing document instead of replacing
  const clearKeys = (source: any, target: any) => {
    Object.keys(target).forEach((key) => {
      if (source[key] === undefined) {
        delete target[key];
      }
    });
  };

  // Clear keys that are no longer present
  clearKeys(doc, localDoc);

  // Update all fields
  for (const key in doc) {
    if (key !== "name" && key !== "doctype") {
      localDoc[key] = doc[key];
    }
  }

  localDoc.__last_sync_on = new Date();
}

/**
 * Add child documents to locals
 */
export function addChildDocsToLocals(doc: DeskDocument) {
  const isTable = doc.parentfield;

  // Add child docs to locals if this is a parent document
  if (!isTable) {
    for (const key in doc) {
      const value = doc[key];

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const childDoc = value[i];

          if (typeof childDoc === "object" && !childDoc.parent) {
            childDoc.parent = doc.name;
          }

          if (childDoc.doctype && childDoc.name) {
            addToLocals(childDoc as DeskDocument);
          }
        }
      }
    }
  }
}

/**
 * Remove a document from locals
 */
export function removeFromLocals(doctype: string, name: string) {
  const store = useLocalsStore();
  store.removeFromLocals(doctype, name);
}

/**
 * Clear a document and its related data from locals
 */
export function clearDoc(doctype: string, name: string) {
  const store = useLocalsStore();
  const doc = store.getDoc(doctype, name);

  if (!doc) return;

  // If it's a child document, remove from parent
  if (doc.parenttype && doc.parentfield) {
    const parent = store.getDoc(doc.parenttype, doc.parent!);
    if (parent && parent[doc.parentfield]) {
      const children = parent[doc.parentfield] as any[];
      const index = children.findIndex((d) => d.name === name);
      if (index > -1) {
        children.splice(index, 1);
      }
    }
  }

  store.clearDoc(doctype, name);
}

/**
 * Get a document from locals
 */
export function getDoc(doctype: string, name: string): DeskDocument | null {
  const store = useLocalsStore();
  return store.getDoc(doctype, name);
}

/**
 * Get list of documents with optional filtering
 */
export function getList(doctype: string, filters?: any): DeskDocument[] {
  const store = useLocalsStore();
  return store.getDocs(doctype, filters);
}

/**
 * Check if document exists in locals
 */
export function hasDoc(doctype: string, name: string): boolean {
  const store = useLocalsStore();
  return store.hasDoc(doctype, name);
}

/**
 * Get a field value from a document
 */
export function getValue(
  doctype: string,
  name: string,
  fieldname: string,
): any {
  const doc = getDoc(doctype, name);
  return doc ? doc[fieldname] : null;
}

/**
 * Set a field value in a document
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
  }
}
