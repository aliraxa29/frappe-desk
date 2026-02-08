/**
 * Advanced utilities for locals management
 * Includes batch operations, caching, and performance optimizations
 */

import { useLocalsStore } from "./locals";
import { getDoc, getList } from "./sync";
import type { DeskDocument } from "../../types/locals";

/**
 * Batch add documents to locals
 */
export function batchAddToLocals(docs: DeskDocument[]) {
  const store = useLocalsStore();
  for (const doc of docs) {
    store.addToLocals(doc);
  }
}

/**
 * Batch remove documents from locals
 */
export function batchRemoveFromLocals(doctype: string, names: string[]) {
  const store = useLocalsStore();
  for (const name of names) {
    store.removeFromLocals(doctype, name);
  }
}

/**
 * Get all documents across all doctypes
 */
export function getAllDocuments(): DeskDocument[] {
  const store = useLocalsStore();
  const allDocs: DeskDocument[] = [];

  for (const doctype in store.locals) {
    for (const name in store.locals[doctype]) {
      allDocs.push(store.locals[doctype][name]);
    }
  }

  return allDocs;
}

/**
 * Export locals to JSON
 */
export function exportLocals(): string {
  const store = useLocalsStore();
  return JSON.stringify({
    locals: store.locals,
    docinfo: store.docinfo,
    meta: store.meta,
  });
}

/**
 * Import locals from JSON
 */
export function importLocals(jsonData: string) {
  const store = useLocalsStore();
  try {
    const data = JSON.parse(jsonData);

    if (data.locals) {
      for (const doctype in data.locals) {
        for (const name in data.locals[doctype]) {
          store.addToLocals(data.locals[doctype][name]);
        }
      }
    }

    if (data.docinfo) {
      for (const doctype in data.docinfo) {
        for (const name in data.docinfo[doctype]) {
          store.setDocInfo(doctype, name, data.docinfo[doctype][name]);
        }
      }
    }

    if (data.meta) {
      for (const doctype in data.meta) {
        store.setMeta(doctype, data.meta[doctype]);
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to import locals:", error);
    return false;
  }
}

/**
 * Search documents by field value
 */
export function searchDocuments(
  doctype: string,
  searchTerm: string,
  searchFields: string[],
): DeskDocument[] {
  const docs = getList(doctype);
  const lowerTerm = searchTerm.toLowerCase();

  return docs.filter((doc) => {
    return searchFields.some((field) => {
      const value = doc[field];
      if (!value) return false;
      return String(value).toLowerCase().includes(lowerTerm);
    });
  });
}

/**
 * Get documents with pagination
 */
export function getPaginatedDocs(
  doctype: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  filters?: any,
): { docs: DeskDocument[]; total: number; pages: number } {
  const allDocs = getList(doctype, filters);
  const total = allDocs.length;
  const pages = Math.ceil(total / pageSize);
  const start = (pageNumber - 1) * pageSize;
  const end = start + pageSize;

  return {
    docs: allDocs.slice(start, end),
    total,
    pages,
  };
}

/**
 * Sort documents by field
 */
export function sortDocuments(
  docs: DeskDocument[],
  field: string,
  ascending: boolean = true,
): DeskDocument[] {
  return [...docs].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
}

/**
 * Get document statistics
 */
export function getDocTypeStats(doctype: string): {
  total: number;
  unsaved: number;
  local: number;
  needsRefresh: number;
  lastUpdated: Date | null;
} {
  const docs = getList(doctype);
  let lastUpdated: Date | null = null;

  const stats = {
    total: docs.length,
    unsaved: 0,
    local: 0,
    needsRefresh: 0,
    lastUpdated,
  };

  for (const doc of docs) {
    if (doc.__unsaved) stats.unsaved++;
    if (doc.__islocal) stats.local++;
    if (doc.__needs_refresh) stats.needsRefresh++;

    if (doc.__last_sync_on) {
      if (!lastUpdated || doc.__last_sync_on > lastUpdated) {
        lastUpdated = doc.__last_sync_on;
      }
    }
  }

  stats.lastUpdated = lastUpdated;
  return stats;
}

/**
 * Get memory usage estimate
 */
export function estimateMemoryUsage(): {
  totalDocuments: number;
  estimatedBytes: number;
  estimatedMB: number;
} {
  const docs = getAllDocuments();
  let estimatedBytes = 0;

  for (const doc of docs) {
    estimatedBytes += JSON.stringify(doc).length;
  }

  return {
    totalDocuments: docs.length,
    estimatedBytes,
    estimatedMB: Math.round((estimatedBytes / 1024 / 1024) * 100) / 100,
  };
}

/**
 * Clear old documents (not updated for specified days)
 */
export function clearOldDocuments(doctype: string, daysOld: number = 30) {
  const docs = getList(doctype);
  const store = useLocalsStore();
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - daysOld * 24 * 60 * 60 * 1000);

  let cleared = 0;
  for (const doc of docs) {
    if (
      doc.__last_sync_on &&
      doc.__last_sync_on < cutoffDate &&
      !doc.__unsaved
    ) {
      store.removeFromLocals(doctype, doc.name);
      cleared++;
    }
  }

  return cleared;
}

/**
 * Merge documents (for handling duplicates)
 */
export function mergeDocuments(
  doctype: string,
  targetName: string,
  sourceName: string,
) {
  const store = useLocalsStore();
  const source = getDoc(doctype, sourceName);
  const target = getDoc(doctype, targetName);

  if (!source || !target) {
    return false;
  }

  // Merge fields from source to target
  for (const key in source) {
    if (!key.startsWith("__") && key !== "name" && key !== "doctype") {
      if (!target[key]) {
        target[key] = source[key];
      }
    }
  }

  // Remove source
  store.removeFromLocals(doctype, sourceName);
  return true;
}

/**
 * Validate documents against a schema
 */
export function validateDocuments(
  doctype: string,
  schema: { [fieldname: string]: (value: any) => boolean },
): {
  valid: DeskDocument[];
  invalid: { doc: DeskDocument; errors: string[] }[];
} {
  const docs = getList(doctype);
  const valid: DeskDocument[] = [];
  const invalid: { doc: DeskDocument; errors: string[] }[] = [];

  for (const doc of docs) {
    const errors: string[] = [];

    for (const fieldname in schema) {
      const validator = schema[fieldname];
      if (!validator(doc[fieldname])) {
        errors.push(`Field '${fieldname}' failed validation`);
      }
    }

    if (errors.length === 0) {
      valid.push(doc);
    } else {
      invalid.push({ doc, errors });
    }
  }

  return { valid, invalid };
}

/**
 * Get document relationships (parent-child)
 */
export function getDocumentRelationships(doctype: string, name: string) {
  const doc = getDoc(doctype, name);
  if (!doc) return null;

  const relationships = {
    parent:
      doc.parent && doc.parenttype
        ? { doctype: doc.parenttype, name: doc.parent }
        : null,
    children: [] as { doctype: string; field: string; count: number }[],
  };

  // Find child documents
  const allDocs = getAllDocuments();
  const childMap = new Map<string, number>();

  for (const d of allDocs) {
    if (d.parent === name && d.parenttype === doctype) {
      const key = `${d.doctype}:${d.parentfield}`;
      childMap.set(key, (childMap.get(key) || 0) + 1);
    }
  }

  childMap.forEach((count, key) => {
    const [doctype, field] = key.split(":");
    relationships.children.push({ doctype, field, count });
  });

  return relationships;
}

/**
 * Create a snapshot of current locals state
 */
export function createSnapshot(): string {
  const store = useLocalsStore();
  const snapshot = {
    timestamp: new Date().toISOString(),
    data: {
      locals: store.locals,
      docinfo: store.docinfo,
      meta: store.meta,
    },
  };
  return JSON.stringify(snapshot);
}

/**
 * Restore from snapshot
 */
export function restoreFromSnapshot(snapshotJson: string): boolean {
  try {
    const snapshot = JSON.parse(snapshotJson);
    if (!snapshot.data) return false;

    // Clear current data
    const store = useLocalsStore();
    store.clearAll();

    // Restore
    return importLocals(JSON.stringify(snapshot.data));
  } catch (error) {
    console.error("Failed to restore snapshot:", error);
    return false;
  }
}

/**
 * Detect conflicts in documents
 */
export function detectConflicts(doctype: string): {
  conflicts: DeskDocument[];
  count: number;
} {
  const docs = getList(doctype);
  const conflicts = docs.filter((doc) => doc.__needs_refresh && doc.__unsaved);

  return {
    conflicts,
    count: conflicts.length,
  };
}

/**
 * Watch for changes in a document
 */
export function watchDocumentChanges(
  doctype: string,
  name: string,
  callback: (oldDoc: DeskDocument | null, newDoc: DeskDocument | null) => void,
) {
  const store = useLocalsStore();
  let lastDoc = getDoc(doctype, name);

  const interval = setInterval(() => {
    const currentDoc = getDoc(doctype, name);

    if (JSON.stringify(lastDoc) !== JSON.stringify(currentDoc)) {
      callback(lastDoc, currentDoc);
      lastDoc = currentDoc ? { ...currentDoc } : null;
    }
  }, 1000);

  // Return unwatch function
  return () => clearInterval(interval);
}
