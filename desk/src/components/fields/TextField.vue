<template>
	<div class="mb-4 flex flex-col">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium mb-1 text-sm text-slate-700 dark:text-white"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-500 ml-1">*</span>
		</label>
		<input
			:id="`field-${field.fieldname}`"
			:value="ctx.doc[field.fieldname]"
			:readonly="field.read_only"
			:required="field.reqd"
			type="text"
			class="w-full px-3 py-2 border border-[#ddd] dark:border-none dark:bg-gray-800 rounded focus:outline-none focus:border-[#0066cc] dark:focus:border-gray-500 focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] read-only:bg-gray-100 read-only:cursor-not-allowed text-[0.95rem] transition-colors duration-200 dark:text-white"
			@input="updateValue"
			@blur="handleBlur"
		/>
		<small v-if="field.description" class="block text-gray-600 mt-1 text-[0.85rem]">{{
			field.description
		}}</small>
		<small v-if="error" class="text-red-500 mt-1 block text-[0.85rem]">{{ error }}</small>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field, FormContext } from "../../types";

const props = defineProps<{
	field: Field;
	ctx: FormContext;
}>();

const emit = defineEmits<{
	fieldChange: [value: any];
}>();

const error = computed(() => {
	return (props.ctx as any).fieldErrors?.[props.field.fieldname];
});

function updateValue(e: Event) {
	const value = (e.target as HTMLInputElement).value;
	props.ctx.set_value(props.field.fieldname, value);
	emit("fieldChange", value);
}

function handleBlur() {
	// Validation can be added here
}
</script>
