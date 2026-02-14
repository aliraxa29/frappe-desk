<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-[0.95rem] text-slate-700 dark:text-slate-300"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-600 dark:text-red-500 ml-1">*</span>
		</label>
		<input
			:id="`field-${field.fieldname}`"
			:value="localValue"
			:readonly="field.read_only"
			:required="field.reqd"
			type="text"
			inputmode="decimal"
			:class="[
				'px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded text-[0.95rem] transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 read-only:bg-slate-50 dark:read-only:bg-slate-900/50 read-only:cursor-not-allowed disabled:opacity-50',
				align === 'left' ? 'text-left' : 'text-right',
			]"
			@input="updateValue"
			@focus="handleFocus"
			@blur="handleBlur"
			@keydown="validateKeypress"
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
import { ref, watch } from "vue";
import type { Field, FormContext } from "../../types";

const props = withDefaults(
	defineProps<{
		field: Field;
		ctx: FormContext;
		align?: "left" | "right";
	}>(),
	{
		align: "right",
	},
);

const emit = defineEmits<{
	fieldChange: [value: any];
}>();

const localValue = ref("0");
const isFocused = ref(false);
const originalValue = ref<any>(null);

function validateKeypress(e: KeyboardEvent) {
	// Allow: backspace, delete, tab, escape, enter, arrows
	if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.code as number)) {
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

	const input = e.target as HTMLInputElement;
	const currentValue = input.value;

	// Allow minus sign only at the beginning
	if (e.key === "-" && input.selectionStart === 0 && !currentValue.includes("-")) {
		return;
	}

	// Allow decimal point only once
	if (e.key === "." && !currentValue.includes(".")) {
		return;
	}

	// Ensure that it is a number
	if ((e.shiftKey || e.key < "0" || e.key > "9") && e.key !== "-" && e.key !== ".") {
		e.preventDefault();
	}
}

function updateValue(e: Event) {
	localValue.value = (e.target as HTMLInputElement).value;
}

function handleFocus() {
	isFocused.value = true;
}

function handleBlur() {
	isFocused.value = false;
	let raw = localValue.value.trim();

	// Clean up input - remove any non-numeric characters except minus and decimal
	raw = raw.replace(/[^\d.-]/g, "");

	// Ensure only one minus sign at the beginning
	if (raw.includes("-")) {
		const parts = raw.split("-");
		raw = "-" + parts.filter((p) => p).join("");
	}

	// Ensure only one decimal point
	const decimalCount = (raw.match(/\./g) || []).length;
	if (decimalCount > 1) {
		const parts = raw.split(".");
		raw = parts[0] + "." + parts.slice(1).join("");
	}

	let newValue: number | null = null;

	if (!raw || raw === "-" || raw === ".") {
		newValue = null;
	} else {
		const parsed = parseFloat(raw);
		if (isNaN(parsed)) {
			newValue = null;
		} else {
			const precision = props.field.precision;
			newValue =
				typeof precision === "number" && precision >= 0
					? Number(parsed.toFixed(precision))
					: parsed;
		}
	}

	// Only update if value actually changed
	if (newValue !== originalValue.value) {
		props.ctx.set_value(props.field.fieldname, newValue);
		emit("fieldChange", newValue);
	}

	// Update display value
	if (newValue === null) {
		localValue.value = "0";
	} else {
		const precision = props.field.precision;
		localValue.value =
			typeof precision === "number" && precision >= 0
				? newValue.toFixed(precision)
				: String(newValue);
	}
}

watch(
	() => props.ctx.doc?.[props.field.fieldname],
	(next) => {
		if (isFocused.value) return;

		originalValue.value = next;

		if (next === null || next === undefined || next === "") {
			localValue.value = "0";
			return;
		}

		const precision = props.field.precision;
		const numeric = Number(next);
		if (Number.isNaN(numeric)) {
			localValue.value = "";
			return;
		}

		localValue.value =
			typeof precision === "number" && precision >= 0
				? numeric.toFixed(precision)
				: String(numeric);
	},
	{ immediate: true },
);
</script>
