<template>
	<SelectRoot v-model="modelValue">
		<slot />
	</SelectRoot>
</template>

<script setup lang="ts">
import { SelectRoot } from "radix-vue";

const modelValue = defineModel<string>();
</script>
