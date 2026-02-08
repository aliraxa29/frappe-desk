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
		<input
			:id="`field-${field.fieldname}`"
			:value="displayValue"
			:readonly="field.read_only"
			:required="field.reqd"
			type="text"
			inputmode="numeric"
			class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-[0.95rem] transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 read-only:bg-slate-50 dark:read-only:bg-slate-900/50 read-only:cursor-not-allowed disabled:opacity-50"
			@input="updateValue"
			@keydown="validateKeypress"
		/>
		<small
			v-if="field.description"
			class="block text-slate-600 dark:text-slate-400 mt-1 text-[0.85rem]"
		>
			{{ field.description }}
		</small>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field, FormContext } from "@/types";

const props = defineProps<{ field: Field; ctx: FormContext }>();

const emit = defineEmits<{
	fieldChange: [value: any];
}>();

const displayValue = computed(() => {
	const val = props.ctx.doc[props.field.fieldname];
	return val !== null && val !== undefined ? String(val) : "";
});

function validateKeypress(e: KeyboardEvent) {
	// Allow: backspace, delete, tab, escape, enter, arrows
	if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) {
		return;
	}

	// Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
	if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) {
		return;
	}

	// Allow: home, end
	if (e.keyCode === 35 || e.keyCode === 36) {
		return;
	}

	// Allow minus sign only at the beginning
	const input = e.target as HTMLInputElement;
	if (e.key === "-" && input.selectionStart === 0 && !input.value.includes("-")) {
		return;
	}

	// Ensure that it is a number and stop the keypress
	if ((e.shiftKey || e.key < "0" || e.key > "9") && e.key !== "-") {
		e.preventDefault();
	}
}

function updateValue(e: Event) {
	const input = e.target as HTMLInputElement;
	let value = input.value.trim();

	// Remove any non-numeric characters except minus at the start
	value = value.replace(/[^\d-]/g, "");

	// Ensure only one minus sign at the beginning
	if (value.includes("-")) {
		const parts = value.split("-");
		value = "-" + parts.filter((p) => p).join("");
	}

	// Parse and set value
	let parsedValue: number | null = null;
	if (value === "" || value === "-") {
		parsedValue = null;
	} else {
		parsedValue = parseInt(value, 10);
		if (isNaN(parsedValue)) {
			parsedValue = null;
		}
	}

	props.ctx.set_value(props.field.fieldname, parsedValue);
	emit("fieldChange", parsedValue);
}
</script>
