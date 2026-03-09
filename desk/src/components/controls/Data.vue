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
			:required="field.reqd"
			:maxlength="field.length === 0 ? 140 : field.length"
			type="text"
			class="w-full px-3 py-2.5 border border-border rounded text-[0.95rem] transition-colors bg-background"
			@input="onInput"
			@blur="$emit('blur')"
		/>
		<small
			v-if="field.description"
			class="block text-muted-foreground text-[0.85rem] leading-relaxed"
			>{{ __(field.description) }}
		</small>
		<small v-if="error" class="text-red-500 block text-[0.85rem]">{{ error }}</small>
	</div>
</template>

<script setup lang="ts">
import type { Field } from "../../types";

const props = defineProps<{
	field: Field;
	modelValue: any;
	error?: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
	blur: [];
}>();

function onInput(e: Event) {
	emit("update:modelValue", (e.target as HTMLInputElement).value);
}
</script>
