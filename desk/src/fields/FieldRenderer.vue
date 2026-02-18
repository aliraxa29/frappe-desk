<template>
	<component
		:is="getFieldComponentName(field.fieldtype)"
		:field="field"
		:ctx="ctx"
		@field-change="$emit('fieldChange', $event)"
	/>
</template>

<script setup lang="ts">
import type { Field, FormContext, FieldType } from "../types";
import { getFieldComponent } from "../fields/registry";
import { defineAsyncComponent } from "vue";

const props = defineProps({
	field: {
		type: Object as () => Field,
		required: true,
	},
	ctx: {
		type: Object as () => FormContext,
		required: true,
	},
});

const emit = defineEmits<{
	fieldChange: [field: Field];
}>();

const fieldComponents = {
	TextField: defineAsyncComponent(() => import("../components/fields/TextField.vue")),
	TextAreaField: defineAsyncComponent(() => import("../components/fields/TextAreaField.vue")),
	CheckField: defineAsyncComponent(() => import("../components/fields/CheckField.vue")),
	SelectField: defineAsyncComponent(() => import("../components/fields/SelectField.vue")),
	LinkField: defineAsyncComponent(() => import("../components/fields/LinkField.vue")),
	IntField: defineAsyncComponent(() => import("../components/fields/IntField.vue")),
	FloatField: defineAsyncComponent(() => import("../components/fields/FloatField.vue")),
	CurrencyField: defineAsyncComponent(() => import("../components/fields/CurrencyField.vue")),
	DateField: defineAsyncComponent(() => import("../components/fields/DateField.vue")),
	TimeField: defineAsyncComponent(() => import("../components/fields/TimeField.vue")),
	DateTimeField: defineAsyncComponent(() => import("../components/fields/DateTimeField.vue")),
	ColorField: defineAsyncComponent(() => import("../components/fields/ColorField.vue")),
	AttachField: defineAsyncComponent(() => import("../components/fields/AttachField.vue")),
	SectionBreakField: defineAsyncComponent(
		() => import("../components/fields/SectionBreakField.vue"),
	),
	HeadingField: defineAsyncComponent(() => import("../components/fields/HeadingField.vue")),
	ChildTableField: defineAsyncComponent(
		() => import("../components/fields/ChildTableField.vue"),
	),
	TextEditorField: defineAsyncComponent(
		() => import("../components/fields/TextEditorField.vue"),
	),
	ReadOnlyField: defineAsyncComponent(() => import("../components/fields/ReadOnlyField.vue")),
	EmailField: defineAsyncComponent(() => import("../components/fields/EmailField.vue")),
	PhoneField: defineAsyncComponent(() => import("../components/fields/PhoneField.vue")),
	UrlField: defineAsyncComponent(() => import("../components/fields/UrlField.vue")),
	PasswordField: defineAsyncComponent(() => import("../components/fields/PasswordField.vue")),
	RatingField: defineAsyncComponent(() => import("../components/fields/RatingField.vue")),
	CodeField: defineAsyncComponent(() => import("../components/fields/CodeField.vue")),
	DynamicLinkField: defineAsyncComponent(
		() => import("../components/fields/DynamicLinkField.vue"),
	),
};

function getFieldComponentName(fieldtype: FieldType): any {
	const componentName = getFieldComponent(fieldtype);
	return (fieldComponents as any)[componentName] || fieldComponents.TextField;
}
</script>
