<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-sm text-slate-700 dark:text-white"
		>
			{{ field.label }}
		</label>
		<h4 class="text-base font-semibold text-slate-800 dark:text-slate-200 m-0">
			{{ field.label }}
		</h4>
	</div>
</template>

<script setup lang="ts">
import type { Field } from "../../types";

defineProps<{
	field: Field;
	modelValue?: any;
}>();
</script>
