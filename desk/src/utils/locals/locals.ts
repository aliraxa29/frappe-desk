import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  DeskDocument,
  DocTypeMetadata,
  LocalsStore,
  DocumentInfo,
  ModelDocInfo,
} from "../../types/locals";
import { model } from "../../data/model";

/**
 * Main locals store for managing documents in memory
 * Similar to Frappe's locals global variable
 *
 * Structure:
 * locals[doctype][docname] = document
 */
export const useLocalsStore = defineStore("locals", () => {
  // Main storage for documents
  const locals = ref<LocalsStore>({});

  // Storage for document metadata and additional information
  const docinfo = ref<ModelDocInfo>({});

  // Storage for document metadata (DocType definitions)
  const meta = ref<{ [doctype: string]: DocTypeMetadata }>({});

  // New document names counter
  const newNames = ref<{ [doctype: string]: number }>({});

  /**
   * Get a document from locals
   */
  const getDoc = (doctype: string, name: string): DeskDocument | null => {
    return locals.value[doctype]?.[name] || null;
  };

  /**
   * Add a document to locals
   */
  const addToLocals = (doc: DeskDocument) => {
    if (!locals.value[doc.doctype]) {
      locals.value[doc.doctype] = {};
    }

    // Generate name if it's a new local document
    if (!doc.name && doc.__islocal) {
      doc.name = getNewName(doc.doctype);
    }

    locals.value[doc.doctype][doc.name] = doc;
    doc.__last_sync_on = new Date();
  };

  /**
   * Update a document in locals
   */
  const updateInLocals = (doc: DeskDocument) => {
    const localDoc = locals.value[doc.doctype]?.[doc.name];
    if (!localDoc) {
      addToLocals(doc);
      return;
    }

    // Update existing document with new values
    for (const key in doc) {
      if (doc[key] !== undefined) {
        localDoc[key] = doc[key];
      }
    }
    localDoc.__last_sync_on = new Date();
  };

  /**
   * Remove a document from locals
   */
  const removeFromLocals = (doctype: string, name: string) => {
    if (locals.value[doctype] && locals.value[doctype][name]) {
      delete locals.value[doctype][name];
    }
  };

  /**
   * Clear a specific document from locals
   */
  const clearDoc = (doctype: string, name: string) => {
    removeFromLocals(doctype, name);
  };

  /**
   * Get all documents of a specific doctype
   */
  const getDocs = (doctype: string, filters?: any): DeskDocument[] => {
    const docs = Object.values(locals.value[doctype] || {});

    if (!filters) {
      return docs;
    }

    return docs.filter((doc) => {
      for (const key in filters) {
        if (doc[key] !== filters[key]) {
          return false;
        }
      }
      return true;
    });
  };

  /**
   * Get a new unique name for a document
   */
  const getNewName = (doctype: string): string => {
    if (!newNames.value[doctype]) {
      newNames.value[doctype] = 0;
    }
    newNames.value[doctype]++;
    return `__local_${newNames.value[doctype]}`;
  };

  /**
   * Set DocType metadata
   */
  const setMeta = (doctype: string, metadata: DocTypeMetadata) => {
    meta.value[doctype] = metadata;
  };

  /**
   * Get DocType metadata
   */
  const getMeta = (doctype: string): DocTypeMetadata | null => {
    if (!meta.value[doctype]) {
      model.with_doctype(doctype, (result: any) => {
        if (!meta.value[doctype]) {
          meta.value[doctype] = result.message || {};
        }
      });
    }
    return meta.value[doctype] || null;
  };

  /**
   * Set document info (comments, attachments, etc.)
   */
  const setDocInfo = (doctype: string, name: string, info: DocumentInfo) => {
    if (!docinfo.value[doctype]) {
      docinfo.value[doctype] = {};
    }
    docinfo.value[doctype][name] = info;
  };

  /**
   * Get document info
   */
  const getDocInfo = (doctype: string, name: string): DocumentInfo | null => {
    return docinfo.value[doctype]?.[name] || null;
  };

  /**
   * Set a specific field in document info
   */
  const setDocInfoField = (
    doctype: string,
    name: string,
    key: string,
    value: any,
  ) => {
    if (!docinfo.value[doctype]) {
      docinfo.value[doctype] = {};
    }
    if (!docinfo.value[doctype][name]) {
      docinfo.value[doctype][name] = { doctype, name };
    }
    docinfo.value[doctype][name][key] = value;
  };

  /**
   * Get a specific field from document info
   */
  const getDocInfoField = (doctype: string, name: string, key: string): any => {
    return docinfo.value[doctype]?.[name]?.[key] || null;
  };

  /**
   * Clear all locals
   */
  const clearAll = () => {
    locals.value = {};
    docinfo.value = {};
    meta.value = {};
    newNames.value = {};
  };

  /**
   * Get count of documents for a doctype
   */
  const getCount = (doctype: string): number => {
    return Object.keys(locals.value[doctype] || {}).length;
  };

  /**
   * Check if a document exists in locals
   */
  const hasDoc = (doctype: string, name: string): boolean => {
    return !!(locals.value[doctype] && locals.value[doctype][name]);
  };

  return {
    // State
    locals,
    docinfo,
    meta,
    newNames,

    // Getters
    getDoc,
    getDocs,
    getMeta,
    getDocInfo,
    getDocInfoField,
    getCount,
    hasDoc,

    // Actions
    addToLocals,
    updateInLocals,
    removeFromLocals,
    clearDoc,
    setMeta,
    setDocInfo,
    setDocInfoField,
    clearAll,
    getNewName,
  };
});

// Export for backward compatibility with global locals access
export function useGlobalLocals() {
  const store = useLocalsStore();
  return {
    get locals() {
      return store.locals;
    },
    get docinfo() {
      return store.docinfo;
    },
    get meta() {
      return store.meta;
    },
  };
}
