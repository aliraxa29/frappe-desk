<template>
	<div class="flex justify-center">
		<svg
			v-if="isChecked"
			class="w-5 h-5 text-green-600"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 13l4 4L19 7"
			/>
		</svg>
		<svg
			v-else
			class="w-5 h-5 text-muted-foreground"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field, Document } from "../../../types";

const props = defineProps<{
	value: any;
	field: Field;
	row?: Document;
}>();

const isChecked = computed(() => {
	return props.value === 1 || props.value === true || props.value === "1";
});
</script>
