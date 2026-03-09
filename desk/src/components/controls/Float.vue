<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-[0.95rem] text-foreground"
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
				'px-3 py-2.5 border border-border rounded text-[0.95rem] transition-colors bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/20 read-only:bg-muted read-only:cursor-not-allowed disabled:opacity-50',
				align === 'left' ? 'text-left' : 'text-right',
			]"
			@input="onInput"
			@focus="isFocused = true"
			@blur="onBlur"
			@keydown="validateKeypress"
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
import { ref, watch } from "vue";
import type { Field } from "../../types";

const props = withDefaults(
	defineProps<{
		field: Field;
		modelValue: any;
		align?: "left" | "right";
	}>(),
	{ align: "right" },
);

const emit = defineEmits<{
	"update:modelValue": [value: any];
}>();

const localValue = ref("0");
const isFocused = ref(false);

watch(
	() => props.modelValue,
	(val) => {
		if (!isFocused.value) {
			const precision = props.field.precision ?? 2;
			localValue.value = val != null ? Number(val).toFixed(precision) : "0";
		}
	},
	{ immediate: true },
);

function validateKeypress(e: KeyboardEvent) {
	if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) return;
	if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) return;
	if (e.keyCode === 35 || e.keyCode === 36) return;

	const input = e.target as HTMLInputElement;
	if (e.key === "-" && input.selectionStart === 0 && !input.value.includes("-")) return;
	if (e.key === "." && !input.value.includes(".")) return;
	if ((e.shiftKey || e.key < "0" || e.key > "9") && e.key !== "-" && e.key !== ".") {
		e.preventDefault();
	}
}

function onInput(e: Event) {
	localValue.value = (e.target as HTMLInputElement).value;
}

function onBlur() {
	isFocused.value = false;
	let raw = localValue.value.trim().replace(/[^\d.-]/g, "");
	if (raw.includes("-")) {
		const parts = raw.split("-");
		raw = "-" + parts.filter((p) => p).join("");
	}
	const decimalCount = (raw.match(/\./g) || []).length;
	if (decimalCount > 1) {
		const parts = raw.split(".");
		raw = parts[0] + "." + parts.slice(1).join("");
	}

	const precision = props.field.precision ?? 2;
	let numVal = parseFloat(raw);
	if (isNaN(numVal)) numVal = 0;
	numVal = parseFloat(numVal.toFixed(precision));

	localValue.value = numVal.toFixed(precision);
	emit("update:modelValue", numVal);
}
</script>
