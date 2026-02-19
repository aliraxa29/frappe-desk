<template>
	<div class="space-y-4">
		<div v-if="fields.length" class="space-y-4">
			<div v-for="field in visibleFields" :key="field.fieldname">
				<component
					:is="getControlComponent(field.fieldtype)"
					:field="field"
					:model-value="formData[field.fieldname]"
					:error="errors[field.fieldname]"
					@update:model-value="(val: any) => updateField(field.fieldname, val)"
					@blur="validateField(field.fieldname)"
				/>
			</div>
		</div>

		<!-- Validation Errors -->
		<div
			v-if="Object.keys(errors).length"
			class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md space-y-2"
		>
			<div class="text-sm font-medium text-red-900 dark:text-red-200">
				Validation errors:
			</div>
			<div
				v-for="(error, field) in errors"
				:key="field"
				class="text-sm text-red-800 dark:text-red-300"
			>
				• {{ error }}
			</div>
		</div>

		<!-- Loading State -->
		<div v-if="isLoading" class="flex items-center justify-center py-4">
			<Spinner class="w-5 h-5 text-blue-600" />
		</div>

		<!-- Action Buttons -->
		<div class="flex items-center gap-2">
			<Button @click="submitForm" :disabled="isLoading" variant="primary">
				{{ __("Save") }}
			</Button>
			<Button @click="$emit('close')" :disabled="isLoading" variant="secondary">
				{{ __("Cancel") }}
			</Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, type Component, watch } from "vue";
import { frappeClient } from "../api/resource";
import type { Field, FieldType } from "../types";
import Spinner from "../icons/Spinner.vue";
import Button from "./Button.vue";
import { __ } from "../utils/translate";

// Lazy-load control components
const controlComponents: Record<string, Component> = {
	Data: defineAsyncComponent(() => import("./controls/Data.vue")),
	Email: defineAsyncComponent(() => import("./controls/Email.vue")),
	Phone: defineAsyncComponent(() => import("./controls/Phone.vue")),
	URL: defineAsyncComponent(() => import("./controls/Url.vue")),
	Int: defineAsyncComponent(() => import("./controls/Int.vue")),
	Float: defineAsyncComponent(() => import("./controls/Float.vue")),
	Currency: defineAsyncComponent(() => import("./controls/Currency.vue")),
	Percent: defineAsyncComponent(() => import("./controls/Float.vue")),
	Check: defineAsyncComponent(() => import("./controls/Check.vue")),
	Select: defineAsyncComponent(() => import("./controls/Select.vue")),
	Link: defineAsyncComponent(() => import("./controls/Link.vue")),
	DynamicLink: defineAsyncComponent(() => import("./controls/DynamicLink.vue")),
	Date: defineAsyncComponent(() => import("./controls/Date.vue")),
	DateTime: defineAsyncComponent(() => import("./controls/DateTime.vue")),
	Time: defineAsyncComponent(() => import("./controls/Time.vue")),
	Color: defineAsyncComponent(() => import("./controls/Color.vue")),
	Rating: defineAsyncComponent(() => import("./controls/Rating.vue")),
	Password: defineAsyncComponent(() => import("./controls/Password.vue")),
	TextArea: defineAsyncComponent(() => import("./controls/TextArea.vue")),
	"Small Text": defineAsyncComponent(() => import("./controls/TextArea.vue")),
	"Long Text": defineAsyncComponent(() => import("./controls/TextArea.vue")),
	"Text Editor": defineAsyncComponent(() => import("./controls/TextEditor.vue")),
	Code: defineAsyncComponent(() => import("./controls/Code.vue")),
	JSON: defineAsyncComponent(() => import("./controls/Code.vue")),
	Attach: defineAsyncComponent(() => import("./controls/Attach.vue")),
	Image: defineAsyncComponent(() => import("./controls/Attach.vue")),
	"Read Only": defineAsyncComponent(() => import("./controls/ReadOnly.vue")),
	Heading: defineAsyncComponent(() => import("./controls/Heading.vue")),
};

function getControlComponent(fieldtype: FieldType): Component {
	return (controlComponents as Record<string, Component>)[fieldtype] ?? controlComponents.Data!;
}

interface Props {
	doctype: string;
	fields?: Field[];
	autoname?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	close: [result?: any];
}>();

const formData = ref<Record<string, any>>({});
const fields = ref<Field[]>([]);
const errors = ref<Record<string, string>>({});
const isLoading = ref(false);

const visibleFields = computed(() => {
	return fields.value.filter(
		(f) =>
			![
				"Section Break",
				"Column Break",
				"Tab Break",
				"Html",
				"Separator",
				"Table",
				"Table MultiSelect",
			].includes(f.fieldtype),
	);
});

function validateField(fieldname: string): boolean {
	const field = fields.value.find((f) => f.fieldname === fieldname);
	if (!field) return true;

	// Required validation
	if (field.reqd && !formData.value[fieldname]) {
		errors.value[fieldname] = `${field.label} is required`;
		return false;
	}

	// Email validation
	if (field.fieldtype === "Email" && formData.value[fieldname]) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.value[fieldname])) {
			errors.value[fieldname] = "Invalid email format";
			return false;
		}
	}

	delete errors.value[fieldname];
	return true;
}

function validateForm(): boolean {
	errors.value = {};
	let isValid = true;

	visibleFields.value.forEach((field) => {
		if (!validateField(field.fieldname)) {
			isValid = false;
		}
	});

	return isValid;
}

function updateField(fieldname: string, value: any) {
	formData.value[fieldname] = value;
}

async function submitForm() {
	if (!validateForm()) {
		return;
	}

	isLoading.value = true;
	try {
		const data: Record<string, any> = {
			doctype: props.doctype,
		};

		visibleFields.value.forEach((field) => {
			const value = formData.value[field.fieldname];
			if (value !== "" && value !== null && value !== undefined) {
				data[field.fieldname] = value;
			}
		});

		// Create the document
		const response = await frappeClient.createDocument(props.doctype, data);
		emit("close", response);
	} catch (err: any) {
		const errorMsg = err.message || "Failed to create document";
		errors.value["_submit"] = errorMsg;
		console.error("Submit error:", err);
	} finally {
		isLoading.value = false;
	}
}

watch(
	() => props.fields,
	(newFields) => {
		if (newFields && newFields.length > 0) {
			fields.value = newFields;
			if (
				props.autoname === "prompt" &&
				fields.value.filter((f) => f.fieldname === "__newname").length <= 0
			) {
				fields.value.unshift({
					fieldname: "__newname",
					label: __(`${props.doctype} Name`),
					fieldtype: "Data",
					reqd: 1,
				});
			}
			fields.value.forEach((f) => {
				if (!(f.fieldname in formData.value)) {
					formData.value[f.fieldname] = f.default || "";
				}
			});
		}
	},
	{ immediate: true },
);
</script>
