<template>
	<div class="mb-4 flex flex-col">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium mb-1 text-[0.95rem] text-slate-700 dark:text-slate-300"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-600 dark:text-red-500 ml-1">*</span>
		</label>
		<select
			:id="`field-${field.fieldname}`"
			:value="currentValue"
			:disabled="field.read_only"
			:required="field.reqd"
			class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-[0.95rem] transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
			@change="updateValue"
		>
			<option value="">{{ placeholderText }}</option>
			<option v-for="option in options" :key="option.value" :value="option.value">
				{{ option.label }}
			</option>
		</select>
		<small
			v-if="field.description"
			class="block text-slate-600 dark:text-slate-400 mt-1 text-[0.85rem]"
		>
			{{ field.description }}
		</small>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Field, FormContext } from "@/types";

const props = defineProps<{ field: Field; ctx: FormContext }>();

const emit = defineEmits<{
	fieldChange: [value: any];
}>();

const currentValue = ref("");
const originalValue = ref<any>(null);

const placeholderText = computed(() => {
	if (props.field.reqd) {
		return "-- Select --";
	}
	return "-- No Selection --";
});

const options = computed(() => {
	if (!props.field.options) return [];

	// Parse options: can be newline-separated, comma-separated, or JSON array
	let optionsList: string[] = [];

	const optionsStr = props.field.options.trim();

	// Try JSON array first
	if (optionsStr.startsWith("[")) {
		try {
			optionsList = JSON.parse(optionsStr);
		} catch {
			// Fall back to string parsing
			optionsList = optionsStr.split("\n").filter((o) => o.trim());
		}
	} else {
		// Split by newline or comma
		optionsList = optionsStr
			.split(/[\n,]/)
			.map((o) => o.trim())
			.filter((o) => o);
	}

	return optionsList.map((option) => ({
		value: option,
		label: option,
	}));
});

function updateValue(e: Event) {
	const value = (e.target as HTMLSelectElement).value || null;

	// Only update if value actually changed
	if (value !== originalValue.value) {
		props.ctx.set_value(props.field.fieldname, value);
		emit("fieldChange", value);
	}
}

watch(
	() => props.ctx.doc?.[props.field.fieldname],
	(next) => {
		originalValue.value = next;
		currentValue.value = next || "";
	},
	{ immediate: true },
);
</script>
