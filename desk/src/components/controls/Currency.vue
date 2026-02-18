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
		<div class="relative">
			<span
				class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400 pointer-events-none"
			>
				{{ currencySymbol }}
			</span>
			<input
				:id="`field-${field.fieldname}`"
				:value="localValue"
				:readonly="field.read_only"
				:required="field.reqd"
				type="text"
				inputmode="decimal"
				class="w-full pl-8 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded text-[0.95rem] transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-right focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 read-only:bg-slate-50 dark:read-only:bg-slate-900/50 read-only:cursor-not-allowed disabled:opacity-50"
				@input="onInput"
				@blur="onBlur"
				@keydown="validateKeypress"
			/>
		</div>
		<small
			v-if="field.description"
			class="block text-slate-600 dark:text-slate-400 text-[0.85rem] leading-relaxed"
		>
			{{ field.description }}
		</small>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Field } from "../../types";

const props = defineProps<{
	field: Field;
	modelValue: any;
	currency?: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
}>();

const localValue = ref("0.00");
const isFocused = ref(false);

const currencySymbol = computed(() => {
	try {
		return (
			new Intl.NumberFormat("en", {
				style: "currency",
				currency: props.currency || props.field.options || "USD",
			})
				.formatToParts(0)
				.find((p) => p.type === "currency")?.value || "$"
		);
	} catch {
		return "$";
	}
});

watch(
	() => props.modelValue,
	(val) => {
		if (!isFocused.value) {
			const precision = props.field.precision ?? 2;
			localValue.value = val != null ? Number(val).toFixed(precision) : "0.00";
		}
	},
	{ immediate: true },
);

function validateKeypress(e: KeyboardEvent) {
	if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) return;
	if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) return;
	const input = e.target as HTMLInputElement;
	if (e.key === "-" && input.selectionStart === 0 && !input.value.includes("-")) return;
	if (e.key === "." && !input.value.includes(".")) return;
	if ((e.shiftKey || e.key < "0" || e.key > "9") && e.key !== "-" && e.key !== ".") {
		e.preventDefault();
	}
}

function onInput(e: Event) {
	isFocused.value = true;
	localValue.value = (e.target as HTMLInputElement).value;
}

function onBlur() {
	isFocused.value = false;
	const precision = props.field.precision ?? 2;
	let raw = localValue.value.trim().replace(/[^\d.-]/g, "");
	let numVal = parseFloat(raw);
	if (isNaN(numVal)) numVal = 0;
	numVal = parseFloat(numVal.toFixed(precision));
	localValue.value = numVal.toFixed(precision);
	emit("update:modelValue", numVal);
}
</script>
