<template>
	<PopoverRoot v-model:open="open">
		<slot />
	</PopoverRoot>
</template>

<script setup lang="ts">
import { PopoverRoot } from "radix-vue";

const open = defineModel<boolean>("open", { default: false });
</script>
