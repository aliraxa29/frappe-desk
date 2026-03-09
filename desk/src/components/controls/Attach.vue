<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-sm text-foreground"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-500 ml-1">*</span>
		</label>
		<input
			:id="`field-${field.fieldname}`"
			:value="modelValue"
			:readonly="field.read_only"
			type="file"
			class="w-full px-3 py-2 border border-border rounded text-[0.95rem] bg-background"
			@change="onFileChange"
		/>
		<small
			v-if="field.description"
			class="block text-muted-foreground text-[0.85rem] leading-relaxed"
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
