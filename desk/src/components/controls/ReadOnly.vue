<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-sm text-slate-700 dark:text-white"
		>
			{{ field.label }}
		</label>
		<input
			:id="`field-${field.fieldname}`"
			:value="modelValue"
			readonly
			type="text"
			class="w-full px-3 py-2.5 border border-[#ddd] dark:border-none rounded bg-gray-100 dark:bg-slate-900/50 cursor-not-allowed text-[0.95rem] transition-colors duration-200 dark:text-white"
		/>
		<small v-if="field.description" class="block text-gray-600 text-[0.85rem] leading-relaxed">
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
</script>
