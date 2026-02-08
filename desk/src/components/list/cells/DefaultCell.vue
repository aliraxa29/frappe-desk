<template>
	<span class="truncate max-w-xs" :title="displayValue">
		{{ displayValue }}
	</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field, Document } from "../../../types";

const props = defineProps<{
	value: any;
	field: Field;
	row?: Document;
}>();

const displayValue = computed(() => {
	if (props.value === null || props.value === undefined) return "";
	return String(props.value);
});
</script>
