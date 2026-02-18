<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-sm text-slate-700 dark:text-slate-300"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-500 ml-1">*</span>
		</label>
		<input
			:id="`field-${field.fieldname}`"
			:value="modelValue"
			:readonly="field.read_only"
			type="file"
			class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-[0.95rem] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-100 file:dark:bg-slate-700 file:text-slate-700 file:dark:text-slate-200 file:cursor-pointer hover:file:bg-slate-200 dark:hover:file:bg-slate-600 transition-colors"
			@change="onFileChange"
		/>
		<small
			v-if="field.description"
			class="block text-slate-600 dark:text-slate-400 text-[0.85rem] leading-relaxed"
		>
			{{ field.description }}
		</small>
	</div>
</template>

<script setup lang="ts">
import type { Field } from "../../types";

defineProps<{
	field: Field;
	modelValue: any;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
}>();

function onFileChange(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0];
	if (file) {
		emit("update:modelValue", file.name);
	}
}
</script>
