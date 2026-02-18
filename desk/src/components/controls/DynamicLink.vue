<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-sm text-slate-700 dark:text-white"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-500 ml-1">*</span>
		</label>
		<!-- Uses the Link control internally but resolves the doctype from field.options dynamically -->
		<Link
			:field="resolvedField"
			:model-value="modelValue"
			:error="error"
			@update:model-value="emit('update:modelValue', $event)"
			@blur="emit('blur')"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field } from "../../types";
import Link from "./Link.vue";

const props = defineProps<{
	field: Field;
	modelValue: any;
	/** The resolved doctype name for the dynamic link */
	linkedDoctype?: string;
	error?: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
	blur: [];
}>();

// Build a field descriptor with the resolved options (doctype) for the Link component
const resolvedField = computed(() => ({
	...props.field,
	options: props.linkedDoctype || props.field.options || "",
	label: "", // Don't double-render label
}));
</script>
