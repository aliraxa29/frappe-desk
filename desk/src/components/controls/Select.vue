<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-sm text-foreground"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-600 dark:text-red-500 ml-1">*</span>
		</label>
		<select
			:id="`field-${field.fieldname}`"
			v-model="value"
			:disabled="field.read_only"
			:required="field.reqd"
			class="px-3 py-2.5 border border-border rounded text-[0.95rem] transition-colors bg-background"
		>
			<option v-for="option in options" :key="option.value" :value="option.value">
				{{ option.label }}
			</option>
		</select>
		<small
			v-if="field.description"
			class="block text-muted-foreground text-[0.85rem] leading-relaxed"
		>
			{{ field.description }}
		</small>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field } from "../../types";

const props = defineProps<{
	field: Field;
	modelValue: any;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
}>();

const value = computed({
	get() {
		return props.modelValue;
	},
	set(value: any) {
		emit("update:modelValue", value);
	},
});

const options = computed(() => {
	if (!props.field.options) return [];
	const optionsStr = props.field.options.trim();
	let optionsList: string[] = [];

	if (optionsStr.startsWith("[")) {
		try {
			optionsList = JSON.parse(optionsStr);
		} catch {
			optionsList = optionsStr.split("\n").filter((o) => o.trim());
		}
	} else {
		optionsList = optionsStr.split("\n");
	}

	return optionsList.map((option) => ({ value: option, label: option }));
});
</script>
