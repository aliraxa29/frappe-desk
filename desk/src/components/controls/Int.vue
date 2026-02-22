<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-sm text-slate-700 dark:text-slate-300"
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
			class="px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded text-[0.95rem] transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 read-only:bg-slate-50 dark:read-only:bg-slate-900/50 read-only:cursor-not-allowed disabled:opacity-50"
			@input="onInput"
			@keydown="validateKeypress"
			@blur="onBlur"
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
import { computed, ref, watch } from "vue";
import type { Field } from "../../types";

const props = defineProps<{
	field: Field;
	modelValue: any;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
}>();

const localValue = ref("");

watch(
	() => props.modelValue,
	(val) => {
		if (val !== null && val !== undefined) {
			localValue.value = String(val);
		} else {
			localValue.value = "";
		}
	},
	{ immediate: true },
);

const displayValue = computed(() => {
	const val = props.modelValue;
	return val !== null && val !== undefined ? String(val) : "";
});

function validateKeypress(e: KeyboardEvent) {
	if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) return;
	if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) return;
	if (e.keyCode === 35 || e.keyCode === 36) return;

	const input = e.target as HTMLInputElement;
	if (e.key === "-" && input.selectionStart === 0 && !input.value.includes("-")) return;
	if ((e.shiftKey || e.key < "0" || e.key > "9") && e.key !== "-") {
		e.preventDefault();
	}
}

function onInput(e: Event) {
	localValue.value = (e.target as HTMLInputElement).value;
}

function onBlur() {
	let value = localValue.value.trim().replace(/[^\d-]/g, "");
	if (value.includes("-")) {
		const parts = value.split("-");
		value = "-" + parts.filter((p) => p).join("");
	}

	let parsed: number | null = null;
	if (value !== "" && value !== "-") {
		parsed = parseInt(value, 10);
		if (isNaN(parsed)) parsed = null;
	}
	emit("update:modelValue", parsed);
}
</script>
