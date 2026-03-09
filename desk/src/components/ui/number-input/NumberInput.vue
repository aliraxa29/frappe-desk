<script setup lang="ts">
import { ref, watch, computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

export interface NumberInputProps {
	modelValue?: number;
	min?: number;
	max?: number;
	step?: number;
	precision?: number;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: HTMLAttributes["class"];
	allowDecimal?: boolean;
	selectOnFocus?: boolean;
}

const props = withDefaults(defineProps<NumberInputProps>(), {
	modelValue: 0,
	step: 1,
	precision: undefined,
	placeholder: "0",
	disabled: false,
	readonly: false,
	allowDecimal: true,
	selectOnFocus: true,
});

const emit = defineEmits<{
	(e: "update:modelValue", value: number): void;
	(e: "change", value: number): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);

const effectivePrecision = computed(() => {
	if (props.precision !== undefined) return props.precision;
	return props.allowDecimal ? 2 : 0;
});

function formatNumber(val: number): string {
	if (val === null || val === undefined || isNaN(val)) return "";
	const p = effectivePrecision.value;
	return p > 0 ? val.toFixed(p) : String(Math.round(val));
}

const displayValue = ref(formatNumber(props.modelValue));

function parseInput(raw: string): number | null {
	const cleaned = raw.trim();
	if (!cleaned) return null;
	const num = Number(cleaned);
	if (!Number.isFinite(num)) return null;
	return num;
}

function clampValue(val: number): number {
	if (props.min !== undefined && val < props.min) return props.min;
	if (props.max !== undefined && val > props.max) return props.max;
	return val;
}

function commitValue(val: number): void {
	const clamped = clampValue(val);
	const rounded =
		effectivePrecision.value > 0
			? parseFloat(clamped.toFixed(effectivePrecision.value))
			: Math.round(clamped);
	emit("update:modelValue", rounded);
	emit("change", rounded);
}

watch(
	() => props.modelValue,
	(newVal) => {
		if (!isFocused.value) {
			displayValue.value = formatNumber(newVal ?? 0);
		}
	},
);

function onFocus(event: FocusEvent): void {
	isFocused.value = true;
	const val = props.modelValue ?? 0;
	displayValue.value = val === 0 ? "" : String(val);
	if (props.selectOnFocus) {
		requestAnimationFrame(() => {
			(event.target as HTMLInputElement)?.select();
		});
	}
}

function onBlur(): void {
	isFocused.value = false;
	const parsed = parseInput(displayValue.value);
	if (parsed !== null) {
		commitValue(parsed);
		displayValue.value = formatNumber(clampValue(parsed));
	} else {
		displayValue.value = formatNumber(props.modelValue ?? 0);
	}
}

function onInput(event: Event): void {
	const target = event.target as HTMLInputElement;
	displayValue.value = target.value;
	const parsed = parseInput(target.value);
	if (parsed !== null) {
		emit("update:modelValue", clampValue(parsed));
	}
}

function onKeyDown(event: KeyboardEvent): void {
	const blocked = ["e", "E"];
	if (!props.allowDecimal) {
		blocked.push(".");
	}
	if (blocked.includes(event.key)) {
		event.preventDefault();
		return;
	}

	if (event.key === "ArrowUp") {
		event.preventDefault();
		const current = props.modelValue ?? 0;
		commitValue(current + props.step);
		displayValue.value = formatNumber(clampValue(current + props.step));
	} else if (event.key === "ArrowDown") {
		event.preventDefault();
		const current = props.modelValue ?? 0;
		commitValue(current - props.step);
		displayValue.value = formatNumber(clampValue(current - props.step));
	} else if (event.key === "Enter") {
		(event.target as HTMLInputElement)?.blur();
	}
}

function focus() {
	inputRef.value?.focus();
}

function select() {
	inputRef.value?.select();
}

defineExpose({ inputRef, focus, select });
</script>

<template>
	<input
		ref="inputRef"
		type="text"
		inputmode="decimal"
		autocomplete="off"
		:value="displayValue"
		:placeholder="placeholder"
		:disabled="disabled"
		:readonly="readonly"
		:class="
			cn(
				'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
				props.class,
			)
		"
		@focus="onFocus"
		@blur="onBlur"
		@input="onInput"
		@keydown="onKeyDown"
	/>
</template>
