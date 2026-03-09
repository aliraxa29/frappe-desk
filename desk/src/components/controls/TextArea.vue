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
		<textarea
			:id="`field-${field.fieldname}`"
			:value="modelValue"
			:readonly="field.read_only"
			:required="field.reqd"
			rows="4"
			class="w-full px-3 py-2.5 border border-border rounded text-[0.95rem] transition-colors bg-background"
			@input="onInput"
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

function onInput(e: Event) {
	emit("update:modelValue", (e.target as HTMLTextAreaElement).value);
}
</script>
