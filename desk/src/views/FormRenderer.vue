<template>
	<div v-if="loading" class="flex justify-center items-center h-96 text-gray-600 text-base">
		{{ __(`Loading ${doctype}...`) }}
	</div>

	<div v-else-if="error" class="p-4 bg-red-100 text-red-600 rounded my-4">
		{{ error }}
	</div>

	<div v-else-if="ctx">
		<FormTabs v-if="hasTabs" :tabs="parsedTabs" :ctx="ctx">
			<template v-for="(tab, tabIdx) in parsedTabs" :key="tab.fieldname" #[`tab-${tabIdx}`]>
				<FormLayout
					:sections="tab.sections"
					:ctx="ctx"
					:image-fieldname="imageFieldname"
					@field-change="onFieldChange"
				/>
			</template>
		</FormTabs>

		<FormLayout
			v-else
			:sections="parsedSections"
			:ctx="ctx"
			:image-fieldname="imageFieldname"
			@field-change="onFieldChange"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from "vue";
import type {
	DocTypeMeta,
	Document,
	Field,
	ParsedTab,
	ParsedSection,
	ParsedColumn,
} from "../types";
import { Form, createForm } from "../metadata/form";
import { registry } from "../runtime/registry";
import { loadScript } from "../runtime/scriptLoader";
import FormLayout from "../components/FormLayout.vue";
import FormTabs from "../components/FormTabs.vue";
import { frappeClient } from "../api/resource";
import { model } from "../data/model";
import { useRoute } from "vue-router";
import { router } from "../router";
import { realtime } from "../utils/socketio/client";
import { __ } from "../utils/translate";
import { HIDDEN_FORM_FIELDS } from "../constants";

const props = defineProps<{
	doctype: string;
	doc?: Document;
	docname?: string | null;
}>();

const emit = defineEmits<{
	close: [];
	save: [doc: Document];
	loading: [value: boolean];
}>();

const loading = ref(true);
const error = ref("");
const meta = ref<DocTypeMeta | null>(null);
const ctx = ref<Form>();
const originalDoc = ref<Document | null>(null);
const route = useRoute();
const viewers = ref<Array<{ user: string; full_name: string }>>([]);

const unsubscribeDoc = ref<(() => void) | null>(null);

const hasTabs = computed(() => {
	if (!meta.value?.fields) return false;
	return meta.value.fields.some((f) => f.fieldtype === "Tab Break");
});

const imageFieldname = computed<string | undefined>(() => {
	if (!meta.value?.fields) return undefined;
	const imageField = meta.value.fields.find((f) => f.fieldtype === "Attach Image" && !f.hidden);
	return imageField?.fieldname || undefined;
});

const parsedTabs = computed<ParsedTab[]>(() => {
	if (!meta.value?.fields) return [];

	const fields = meta.value.fields.filter(
		(f) => !f.hidden && !HIDDEN_FORM_FIELDS.has(f.fieldname),
	);
	const tabs: ParsedTab[] = [];
	let currentTab: ParsedTab | null = null;

	for (const field of fields) {
		if (field.fieldtype === "Tab Break") {
			currentTab = {
				fieldname: field.fieldname,
				label: field.label,
				fields: [],
				sections: [],
				hidden: !!field.hidden,
				depends_on: field.depends_on,
			};
			if (currentTab) {
				tabs.push(currentTab);
			}
		} else if (currentTab) {
			currentTab.fields.push(field);
		}
	}

	for (const tab of tabs) {
		tab.sections = parseFieldsIntoSections(tab.fields);
	}

	return tabs.filter((t) => !t.hidden);
});

const parsedSections = computed<ParsedSection[]>(() => {
	if (!meta.value?.fields || hasTabs.value) return [];

	const fields = meta.value.fields.filter(
		(f) => !f.hidden && !HIDDEN_FORM_FIELDS.has(f.fieldname),
	);
	return parseFieldsIntoSections(fields);
});

function parseFieldsIntoSections(fields: Field[]): ParsedSection[] {
	const sections: ParsedSection[] = [];
	let currentSection: ParsedSection | null = null;
	let currentColumn: ParsedColumn | null = null;

	const firstNonLayoutField = fields.find(
		(f) => !["Tab Break", "Section Break", "Column Break"].includes(f.fieldtype),
	);

	if (firstNonLayoutField && fields[0]?.fieldtype !== "Section Break") {
		currentSection = {
			label: "",
			columns: [{ fields: [] }],
		};
		currentColumn = currentSection.columns[0] as ParsedColumn;
		sections.push(currentSection);
	}

	for (const field of fields) {
		if (field.fieldtype === "Tab Break") {
			continue;
		}

		if (field.fieldtype === "Section Break") {
			currentSection = {
				fieldname: field.fieldname,
				label: field.label,
				description: field.description,
				collapsible: !!field.collapsible,
				collapsed: !!field.collapsible && !!field.collapsible_depends_on,
				depends_on: field.depends_on,
				collapsible_depends_on: field.collapsible_depends_on,
				columns: [{ fields: [] }],
			};
			currentColumn = currentSection.columns[0] as ParsedColumn;
			sections.push(currentSection);
		} else if (field.fieldtype === "Column Break") {
			if (currentSection) {
				currentColumn = { fields: [] };
				currentSection.columns.push(currentColumn);
			}
		} else {
			if (currentColumn) {
				currentColumn.fields.push(field);
			} else if (currentSection) {
				const firstColumn = currentSection.columns[0];
				if (firstColumn) {
					firstColumn.fields.push(field);
				}
			}
		}
	}

	return sections.filter((s) => s.columns.some((c) => c.fields.length > 0));
}

onMounted(async () => {
	await onLoad();
});

function createNewDocument(doctype: string, meta: DocTypeMeta): Document {
	const doc: Document = {
		doctype: doctype,
		name: "new-" + doctype + "-" + Date.now(),
		__islocal: 1,
		docstatus: 0,
	};

	for (const field of meta.fields) {
		if (field.default) {
			const defaultVal = String(field.default).toLowerCase();

			if (field.fieldtype === "Datetime" && defaultVal === "now") {
				const now = new Date();
				const year = now.getFullYear();
				const month = String(now.getMonth() + 1).padStart(2, "0");
				const day = String(now.getDate()).padStart(2, "0");
				const hours = String(now.getHours()).padStart(2, "0");
				const minutes = String(now.getMinutes()).padStart(2, "0");
				const seconds = String(now.getSeconds()).padStart(2, "0");
				doc[field.fieldname] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			} else if (field.fieldtype === "Date" && defaultVal === "now") {
				const today = new Date();
				const year = today.getFullYear();
				const month = String(today.getMonth() + 1).padStart(2, "0");
				const day = String(today.getDate()).padStart(2, "0");
				doc[field.fieldname] = `${year}-${month}-${day}`;
			} else if (field.fieldtype === "Time" && defaultVal === "now") {
				const now = new Date();
				const hours = String(now.getHours()).padStart(2, "0");
				const minutes = String(now.getMinutes()).padStart(2, "0");
				const seconds = String(now.getSeconds()).padStart(2, "0");
				doc[field.fieldname] = `${hours}:${minutes}:${seconds}`;
			} else if (
				["Int", "Float", "Currency"].includes(field.fieldtype) &&
				!isNaN(Number(field.default))
			) {
				doc[field.fieldname] = Number(field.default);
			} else {
				doc[field.fieldname] = field.default;
			}
		} else if (field.fieldtype === "Table") {
			doc[field.fieldname] = [];
		} else if (field.fieldtype === "Check") {
			doc[field.fieldname] = 0;
		}
	}

	return doc;
}

// triggerFormEvent is now handled by Form.trigger() internally

function setupRealtimeSubscriptions() {
	if (!ctx.value || !ctx.value.doc.name || ctx.value.doc.__islocal) {
		return;
	}

	const doctype = props.doctype;
	const docname = ctx.value.doc.name;

	const handleDocUpdate = (data: any) => {
		if (data.doctype === doctype && data.name === docname) {
			console.log("[Realtime] Document updated:", data);

			if (ctx.value) {
				Object.assign(ctx.value.doc, data.doc || {});
				ctx.value.notify(`Document updated by another user`, "info");
			}
		}
	};

	const handleDocViewers = (data: any) => {
		if (data.doctype === doctype && data.name === docname) {
			viewers.value = data.viewers || [];
			console.log("[Realtime] Viewers updated:", viewers.value);
		}
	};

	realtime.on("doc_update", handleDocUpdate);
	realtime.on("doc_viewers", handleDocViewers);

	realtime.docSubscribe(doctype, docname, handleDocUpdate);
	realtime.docOpen(doctype, docname, handleDocViewers);

	unsubscribeDoc.value = () => {
		realtime.off("doc_update", handleDocUpdate);
		realtime.off("doc_viewers", handleDocViewers);
		realtime.docUnsubscribe(doctype, docname, handleDocUpdate);
		realtime.docClose(doctype, docname, handleDocViewers);
	};
}

function cleanupRealtimeSubscriptions() {
	if (unsubscribeDoc.value) {
		unsubscribeDoc.value();
		unsubscribeDoc.value = null;
	}
}

function onFieldChange(_field: Field) {
	// Field changes are handled by Form.set_value() which triggers
	// registered field-change handlers automatically via the event system.
}

async function handleSave() {
	if (!ctx.value) return;

	emit("loading", true);

	try {
		const savedDoc = await ctx.value.save();

		if (savedDoc && ctx.value.is_new_doc === false) {
			// navigate to the saved document URL if it was a new doc
			const wasNew =
				!originalDoc.value?.name || String(originalDoc.value.name).startsWith("new-");
			if (wasNew && savedDoc.name) {
				router.push({
					name: "EditForm",
					params: {
						app: route.params.app,
						doctype: props.doctype,
						name: savedDoc.name,
					},
				});
			}

			// Update original snapshot
			try {
				originalDoc.value = JSON.parse(JSON.stringify(ctx.value.doc));
			} catch {
				originalDoc.value = { ...ctx.value.doc };
			}
		}

		if (savedDoc) {
			emit("save", savedDoc);
		}
	} catch (err: any) {
		console.error("Save failed:", err);
	} finally {
		emit("loading", false);
	}
}

function loadMeta(doctype: string): Promise<DocTypeMeta> {
	return new Promise((resolve) => {
		model.with_doctype(doctype, (result: any) => {
			const metaDoc = result.message as DocTypeMeta;
			resolve(metaDoc);
		});
	});
}

function getAutonameField(docMeta: DocTypeMeta | null, isNew: boolean): Field | null {
	if (!isNew || !docMeta?.autoname) return null;

	const autoname = docMeta.autoname.trim().toLowerCase();

	if (autoname === "prompt") {
		return {
			fieldname: "__newname",
			label: __(`${docMeta.name} Name`),
			fieldtype: "Data",
			reqd: 1,
		};
	}
	if (autoname.startsWith("naming_series:")) {
		const seriesString = docMeta.autoname.substring("naming_series:".length).trim();
		const options = seriesString
			.split("\n")
			.map((s: string) => s.trim())
			.filter(Boolean)
			.join("\n");

		return {
			fieldname: "naming_series",
			label: __("Naming Series"),
			fieldtype: "Select",
			options: options,
			reqd: 1,
			default: options.split("\n")[0] || "",
		};
	}
	return null;
}

function applyAutonameFields(docMeta: DocTypeMeta | null, isNew: boolean): Field[] {
	let fields = [...(docMeta?.fields || [])];

	if (!fields) return [];

	fields = fields.filter((f) => f.fieldname !== "__newname");

	const autonameField = getAutonameField(docMeta, isNew);

	if (!autonameField) {
		return fields;
	}

	if (autonameField.fieldname === "naming_series") {
		const existingIdx = fields.findIndex((f) => f.fieldname === "naming_series");
		if (existingIdx !== -1) {
			const existing = fields[existingIdx]!;
			fields[existingIdx] = {
				...existing,
				...autonameField,
				label: existing.label || autonameField.label,
			} as Field;
		} else {
			fields.unshift(autonameField);
		}
		return fields;
	}

	fields.unshift(autonameField);
	return fields;
}

async function onLoad() {
	loading.value = true;
	emit("loading", true);
	error.value = "";
	const isNewDocument = !props.docname || props.docname === "new" || props.docname === null;
	cleanupRealtimeSubscriptions();

	try {
		if (!locals?.DocType?.[props.doctype]) {
			meta.value = await loadMeta(props.doctype);
		} else {
			meta.value = locals.DocType[props.doctype];
		}
		if (meta.value) {
			meta.value.fields = applyAutonameFields(meta.value, isNewDocument);
			loadScript(meta.value, "form");
		}

		if (meta.value?.issingle && props.docname !== props.doctype) {
			router.push({
				name: "EditForm",
				params: {
					app: route.params.app,
					doctype: props.doctype,
					name: props.doctype,
				},
			});
			return;
		}

		let doc: Document;

		if (!isNewDocument && props.docname) {
			doc = await desk.db.get_doc(props.doctype, props.docname);

			if (!doc || typeof doc !== "object") {
				throw new Error("Failed to load document: Invalid response");
			}

			try {
				originalDoc.value = JSON.parse(JSON.stringify(doc));
			} catch (e) {
				console.error("Failed to clone document:", e);
				originalDoc.value = { ...doc };
			}
		} else {
			doc = props.doc || createNewDocument(props.doctype, meta.value as DocTypeMeta);

			try {
				originalDoc.value = JSON.parse(JSON.stringify(doc));
			} catch (e) {
				console.error("Failed to clone document:", e);
				originalDoc.value = { ...doc };
			}
		}

		if (meta.value) {
			const frm = createForm(props.doctype, doc, meta.value);

			// Bind all registered script handlers
			const handlers = registry.forms[props.doctype] || [];
			for (const h of handlers) {
				frm.bindHandlers(h);
			}

			ctx.value = frm;

			// Fire lifecycle events
			await frm.trigger("setup");
			await frm.trigger("onload");

			if (!isNewDocument && frm.doc.name) {
				setupRealtimeSubscriptions();
			}
		}

		loading.value = false;
		emit("loading", false);
	} catch (err: any) {
		console.error("Failed to load form:", err);
		error.value = err.message || "Failed to load form";
		loading.value = false;
		emit("loading", false);
	}
}

watch(
	() => [route.params.doctype, route.params.name],
	async (newParams, oldParams) => {
		if (JSON.stringify(newParams) !== JSON.stringify(oldParams)) {
			await onLoad();
		}
	},
);

const formStatus = computed(() => {
	if (!ctx.value) return null;

	if (ctx.value.dirty) {
		return {
			label: "Not Saved",
			value: "orange",
		};
	}
	if (ctx.value.doc.docstatus === 1) {
		return {
			label: "Submitted",
			value: "primary",
		};
	}
	if (ctx.value.doc.docstatus === 2) {
		return {
			label: "Cancelled",
			value: "danger",
		};
	}
	if (ctx.value.doc.docstatus === 0) {
		return {
			label: "Draft",
			value: "secondary",
		};
	}
	return {
		label: "Saved",
		value: "success",
	};
});

const isDirty = computed(() => {
	return ctx.value?.dirty || false;
});

function handleDiscard() {
	if (!ctx.value) return;
	ctx.value.discard();
}

async function reload() {
	await onLoad();
}

function focusFirstField() {
	nextTick(() => {
		const selector = `input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable='true']:not([disabled])`;
		const formContent = document.querySelector("[data-form-content]");
		const el = formContent?.querySelector(selector) || document.querySelector(selector);
		if (el && el instanceof HTMLElement) {
			el.focus({ preventScroll: true });
			setTimeout(() => {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
			}, 100);
		}
	});
}

// Cleanup on component unmount
onUnmounted(() => {
	cleanupRealtimeSubscriptions();
	if (ctx.value) {
		ctx.value.destroy();
	}
});

defineExpose({
	handleSave,
	handleDiscard,
	reload,
	focusFirstField,
	formStatus,
	isDirty,
	ctx,
	frm: ctx, // Form class instance (preferred access)
	customButtons: computed(() => ctx.value?.customButtons || []),
});
</script>

<style scoped></style>
