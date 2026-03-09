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
			type="email"
			inputmode="email"
			autocomplete="email"
			class="w-full px-3 py-2.5 border border-input rounded focus:outline-none focus:border-ring focus-visible:ring-2 focus-visible:ring-ring read-only:bg-muted read-only:cursor-not-allowed text-[0.95rem] transition-colors duration-200"
			@input="onInput"
			@blur="validate"
		/>
		<small
			v-if="field.description"
			class="block text-muted-foreground text-[0.85rem] leading-relaxed"
			>{{ field.description }}</small
		>
		<small v-if="localError || error" class="text-red-500 block text-[0.85rem]">{{
			localError || error
		}}</small>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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

const localError = ref("");

function onInput(e: Event) {
	localError.value = "";
	emit("update:modelValue", (e.target as HTMLInputElement).value);
}

function validate() {
	const val = props.modelValue as string;
	if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
		localError.value = "Invalid email format";
	} else {
		localError.value = "";
	}
	emit("blur");
}
</script>
