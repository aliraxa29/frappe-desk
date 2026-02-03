/**
 * Vue composable for working with locals
 * Provides reactive access to documents and doctypes
 */

import { computed } from "vue";
import { useLocalsStore } from "./locals";
import { getDoc, getList, hasDoc, clearDoc, removeFromLocals } from "../utils/sync";
import { getDocTitle, getValue, setValue, markDocSaved } from "../model";
import type { DeskDocument, DocTypeMetadata } from "../../types/locals";

export function useLocals() {
	const store = useLocalsStore();

	// Computed properties for document access
	const getDocument = (doctype: string, name: string) => {
		return computed(() => getDoc(doctype, name));
	};

	const getDocuments = (doctype: string, filters?: any) => {
		return computed(() => getList(doctype, filters));
	};

	const getDocMeta = (doctype: string) => {
		return computed(() => store.getMeta(doctype));
	};

	const getDocInfo = (doctype: string, name: string) => {
		return computed(() => store.getDocInfo(doctype, name));
	};

	// Methods for document manipulation
	const setDocField = (doctype: string, name: string, fieldname: string, value: any) => {
		const doc = getDoc(doctype, name);
		if (doc) {
			setValue(doctype, name, fieldname, value);
		}
	};

	const getDocField = (doctype: string, name: string, fieldname: string) => {
		return getValue(doctype, name, fieldname);
	};

	const refreshDoc = async (doctype: string, name: string) => {
		const doc = getDoc(doctype, name);
		if (doc) {
			doc.__needs_refresh = false;
			// TODO: Fetch from server and sync
		}
	};

	const saveDoc = async (doctype: string, name: string) => {
		const doc = getDoc(doctype, name);
		if (doc) {
			// TODO: Send to server
			markDocSaved(doctype, name);
		}
	};

	const deleteDoc = (doctype: string, name: string) => {
		clearDoc(doctype, name);
	};

	return {
		// Store access
		store,
		locals: computed(() => store.locals),
		docinfo: computed(() => store.docinfo),

		// Document access
		getDocument,
		getDocuments,
		getDocMeta,
		getDocInfo,

		// Document manipulation
		setDocField,
		getDocField,
		refreshDoc,
		saveDoc,
		deleteDoc,

		// Store methods
		...store,
	};
}

/**
 * Composable for working with a specific document
 */
export function useDoc(doctype: string, name: string) {
	const store = useLocalsStore();
	const doc = computed(() => store.getDoc(doctype, name));
	const docTitle = computed(() => {
		const d = doc.value;
		return d ? getDocTitle(d) : "";
	});
	const isDirty = computed(() => doc.value?.__unsaved || false);
	const needsRefresh = computed(() => doc.value?.__needs_refresh || false);

	const updateField = (fieldname: string, value: any) => {
		if (doc.value) {
			setValue(doctype, name, fieldname, value);
		}
	};

	const getField = (fieldname: string) => {
		return getValue(doctype, name, fieldname);
	};

	const refresh = async () => {
		if (doc.value) {
			doc.value.__needs_refresh = false;
			// TODO: Fetch from server
		}
	};

	const save = async () => {
		if (doc.value) {
			// TODO: Send to server
			markDocSaved(doctype, name);
		}
	};

	const delete_ = () => {
		clearDoc(doctype, name);
	};

	return {
		doc,
		docTitle,
		isDirty,
		needsRefresh,
		updateField,
		getField,
		refresh,
		save,
		delete: delete_,
	};
}

/**
 * Composable for working with a doctype
 */
export function useDocType(doctype: string) {
	const store = useLocalsStore();
	const meta = computed(() => store.getMeta(doctype));
	const docs = computed(() => store.getDocs(doctype));
	const docCount = computed(() => store.getCount(doctype));

	const getDoc = (name: string) => {
		return store.getDoc(doctype, name);
	};

	const getDocs = (filters?: any) => {
		return store.getDocs(doctype, filters);
	};

	const setMeta = (metadata: DocTypeMetadata) => {
		store.setMeta(doctype, metadata);
	};

	return {
		meta,
		docs,
		docCount,
		getDoc,
		getDocs,
		setMeta,
	};
}

/**
 * Composable for document forms
 */
export function useForm(doctype: string, name: string) {
	const store = useLocalsStore();
	const doc = computed(() => store.getDoc(doctype, name));
	const meta = computed(() => store.getMeta(doctype));
	const docInfo = computed(() => store.getDocInfo(doctype, name));

	const fields = computed(() => {
		const m = meta.value;
		return m ? m.fields : [];
	});

	const getFieldMeta = (fieldname: string) => {
		const m = meta.value;
		if (!m) return null;
		return m.fields.find((f) => f.fieldname === fieldname) || null;
	};

	const setFieldValue = (fieldname: string, value: any) => {
		if (doc.value) {
			doc.value[fieldname] = value;
			doc.value.__unsaved = true;
		}
	};

	const getFieldValue = (fieldname: string) => {
		return doc.value ? doc.value[fieldname] : null;
	};

	const isDirty = computed(() => !!doc.value?.__unsaved);

	const markClean = () => {
		if (doc.value) {
			doc.value.__unsaved = false;
		}
	};

	return {
		doc,
		meta,
		docInfo,
		fields,
		getFieldMeta,
		setFieldValue,
		getFieldValue,
		isDirty,
		markClean,
	};
}
