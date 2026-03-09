<script setup lang="ts">
import { TooltipRoot, type TooltipRootProps, useForwardProps } from "radix-vue";

const props = defineProps<TooltipRootProps>();
const forwarded = useForwardProps(props);
</script>

<template>
	<TooltipRoot v-bind="forwarded">
		<slot />
	</TooltipRoot>
</template>
