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
		<textarea
			:id="`field-${field.fieldname}`"
			:value="modelValue"
			:readonly="field.read_only"
			:required="field.reqd"
			rows="4"
			class="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded text-[0.95rem] transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 read-only:bg-slate-50 dark:read-only:bg-slate-900/50 read-only:cursor-not-allowed disabled:opacity-50 resize-y"
			@input="onInput"
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

function onInput(e: Event) {
	emit("update:modelValue", (e.target as HTMLTextAreaElement).value);
}
</script>
