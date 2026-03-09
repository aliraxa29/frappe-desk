<template>
	<div class="mb-6 flex flex-col gap-2">
		<ChildTableEditor
			:rows="rows"
			:reqd="field.reqd"
			:child-meta="childMeta"
			:field-label="field.label || field.fieldname"
			:parent-doctype="ctx.doctype"
			:parent-name="ctx.doc?.name"
			@update:rows="updateRows"
		/>
		<p v-if="field.description" class="text-muted-foreground mt-1 text-[0.8125rem]">
			{{ field.description }}
		</p>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { Field, FormContext, DocTypeMeta } from "../../types";
import { model } from "../../data/model";
import ChildTableEditor from "../ChildTableEditor.vue";

declare const locals: any;

const props = defineProps<{ field: Field; ctx: FormContext }>();

const emit = defineEmits<{
	fieldChange: [value: any];
}>();

const childMeta = ref<DocTypeMeta | null>(null);
const rows = ref<Record<string, any>[]>([]);

const childDoctype = computed(() => {
	return props.field.options || "";
});

// Load child doctype metadata
function loadMeta(doctype: string): Promise<DocTypeMeta> {
	return new Promise((resolve, reject) => {
		model.with_doctype(doctype, (result: any) => {
			if (result?.docs) {
				const metaDoc = result.docs.find((doc: any) => doc.name === doctype);
				if (metaDoc) {
					resolve(metaDoc);
					return;
				}
			}
			reject(new Error(`Failed to load metadata for ${doctype}`));
		});
	});
}

onMounted(async () => {
	// Load child doctype metadata
	if (childDoctype.value) {
		try {
			if (typeof locals !== "undefined" && locals.DocType?.[childDoctype.value]) {
				childMeta.value = locals.DocType[childDoctype.value];
			} else {
				childMeta.value = await loadMeta(childDoctype.value);
			}
		} catch (error) {
			console.error(`Failed to load child doctype ${childDoctype.value}:`, error);
		}
	}

	// Initialize rows from context
	initializeRows();
});

function initializeRows() {
	const docRows = props.ctx.doc[props.field.fieldname];
	if (Array.isArray(docRows)) {
		rows.value = JSON.parse(JSON.stringify(docRows));
	} else {
		rows.value = [];
	}
}

// Watch for external changes to the doc
watch(
	() => props.ctx.doc[props.field.fieldname],
	(newVal) => {
		if (Array.isArray(newVal)) {
			// Only update if different (avoid loops)
			const newStr = JSON.stringify(newVal);
			const currentStr = JSON.stringify(rows.value);
			if (newStr !== currentStr) {
				rows.value = JSON.parse(newStr);
			}
		}
	},
	{ deep: true },
);

function updateRows(updatedRows: Record<string, any>[]) {
	rows.value = updatedRows;
	// Update the context document
	props.ctx.doc[props.field.fieldname] = updatedRows;
	// Mark form as dirty
	if (props.ctx.dirty !== undefined) {
		props.ctx.dirty = true;
	}
	emit("fieldChange", updatedRows);
}
</script>

<style scoped></style>
