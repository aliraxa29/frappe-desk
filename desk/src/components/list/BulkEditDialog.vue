<template>
	<Teleport to="body">
		<Transition name="modal">
			<div
				v-if="show"
				class="fixed inset-0 z-50 flex items-center justify-center p-4"
				@click.self="$emit('close')"
			>
				<div class="absolute inset-0 bg-black/50" />
				<div
					class="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
				>
					<div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
						<h3 class="text-base font-semibold text-slate-900 dark:text-white">
							Bulk Edit {{ selectedCount }}
							{{ selectedCount === 1 ? "record" : "records" }}
						</h3>
						<p class="text-xs text-slate-500 mt-1">
							Set a field value for all selected records
						</p>
					</div>

					<div class="p-5 space-y-4">
						<!-- Field selector with autocomplete -->
						<FieldAutocomplete
							v-model="selectedField"
							:items="fieldItems"
							label="Field"
							placeholder="Search fields..."
						/>

						<!-- Dynamic value input based on field type -->
						<div
							v-if="selectedFieldMeta && fieldForRenderer"
							class="bulk-edit-value-field"
						>
							<FieldRenderer
								:field="fieldForRenderer"
								:ctx="formContext as any"
								@field-change="handleValueChange"
							/>
						</div>
					</div>

					<div
						class="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
					>
						<button
							type="button"
							class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
							@click="$emit('close')"
						>
							Cancel
						</button>
						<button
							type="button"
							class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
							:disabled="!canApply"
							@click="apply"
						>
							Update {{ selectedCount }} Records
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from "vue";
import type { Field } from "../../types";
import FieldAutocomplete from "./FieldAutocomplete.vue";
import FieldRenderer from "../../fields/FieldRenderer.vue";

// Simplified form context for bulk edit
interface BulkEditFormContext {
	doc: Record<string, any>;
	doctype: string;
	docname: string;
	is_new: boolean;
	is_dirty: boolean;
	meta: null;
	set_value: (fieldname: string, value: any) => void;
	get_value: (fieldname: string) => any;
	refresh_field: () => void;
	set_df_property: () => void;
	trigger: () => void;
}

const props = defineProps<{
	show: boolean;
	fields: Field[];
	selectedCount: number;
}>();

const emit = defineEmits<{
	close: [];
	apply: [fieldname: string, value: any];
}>();

const selectedField = ref("");
const fieldValue = ref<any>("");

// Reactive document for the form context
const bulkEditDoc = reactive<Record<string, any>>({});

const editableFields = computed(() => {
	return props.fields.filter(
		(f) =>
			!f.read_only &&
			!f.hidden &&
			// Exclude structural/non-editable field types
			![
				"Section Break",
				"Column Break",
				"Tab Break",
				"Table",
				"HTML",
				"Button",
				"Table MultiSelect",
				"Heading",
				"Image",
				"Signature",
				"Geolocation",
			].includes(f.fieldtype),
	);
});

const fieldItems = computed(() => {
	return editableFields.value.map((field) => ({
		label: field.label || field.fieldname,
		value: field.fieldname,
	}));
});

const selectedFieldMeta = computed(() => {
	return props.fields.find((f) => f.fieldname === selectedField.value);
});

// Create a modified field for the renderer (without label since we show it separately)
const fieldForRenderer = computed(() => {
	if (!selectedFieldMeta.value) return null;
	return {
		...selectedFieldMeta.value,
		label: "Value",
		reqd: false, // Don't require in bulk edit
		read_only: false,
	} as Field;
});

// Create a form context for the FieldRenderer
const formContext = computed<BulkEditFormContext>(() => {
	return {
		doc: bulkEditDoc,
		doctype: "",
		docname: "",
		is_new: true,
		is_dirty: false,
		meta: null,
		set_value: (fieldname: string, value: any) => {
			bulkEditDoc[fieldname] = value;
			if (fieldname === selectedField.value) {
				fieldValue.value = value;
			}
		},
		get_value: (fieldname: string) => {
			return bulkEditDoc[fieldname];
		},
		refresh_field: () => {},
		set_df_property: () => {},
		trigger: () => {},
	};
});

const canApply = computed(() => {
	const value = fieldValue.value;
	// For Check field, 0 is a valid value
	if (selectedFieldMeta.value?.fieldtype === "Check") {
		return selectedField.value && (value === 0 || value === 1);
	}
	return selectedField.value && value !== "" && value !== null && value !== undefined;
});

watch(
	() => props.show,
	(val) => {
		if (val) {
			selectedField.value = "";
			fieldValue.value = "";
			// Clear the bulk edit document
			Object.keys(bulkEditDoc).forEach((key) => {
				delete bulkEditDoc[key];
			});
		}
	},
);

watch(selectedField, (newField) => {
	fieldValue.value = "";
	// Clear previous field value and set up for new field
	Object.keys(bulkEditDoc).forEach((key) => {
		delete bulkEditDoc[key];
	});
	if (newField) {
		bulkEditDoc[newField] = "";
	}
});

function handleValueChange(value: any) {
	fieldValue.value = value;
}

function apply() {
	if (!canApply.value) return;
	emit("apply", selectedField.value, fieldValue.value);
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
	transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}

/* Override field renderer styles for bulk edit context */
.bulk-edit-value-field :deep(.mb-4) {
	margin-bottom: 0;
}

.bulk-edit-value-field :deep(.flex-col) {
	gap: 0.25rem;
}
</style>
