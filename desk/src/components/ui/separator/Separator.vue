<script setup lang="ts">
import { cn } from "@/lib/utils";
import { Separator as SeparatorPrimitive, type SeparatorProps } from "radix-vue";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;
	return delegated;
});
</script>

<template>
	<SeparatorPrimitive
		v-bind="delegatedProps"
		:class="
			cn(
				'shrink-0 bg-border',
				props.orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
				props.class,
			)
		"
	/>
</template>
