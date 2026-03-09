<script setup lang="ts">
import { cn } from "@/lib/utils";
import { useVModel } from "@vueuse/core";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
	defaultValue?: string | number;
	modelValue?: string | number;
	class?: HTMLAttributes["class"];
	type?: string;
}>();

const emits = defineEmits<{
	(e: "update:modelValue", payload: string | number): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
	passive: true,
	defaultValue: props.defaultValue,
});

/** Block 'e', 'E', '+', '-' keys on numeric inputs to prevent scientific notation */
function onKeyDown(event: KeyboardEvent) {
	if (props.type === "number" && ["e", "E", "+", "-"].includes(event.key)) {
		event.preventDefault();
	}
}
</script>

<template>
	<input
		v-model="modelValue"
		autocomplete="new-password"
		:type="type"
		:class="
			cn(
				'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
				props.class,
			)
		"
		@keydown="onKeyDown"
	/>
</template>
