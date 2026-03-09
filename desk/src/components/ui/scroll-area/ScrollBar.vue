<script setup lang="ts">
import { cn } from "@/lib/utils";
import { ScrollAreaScrollbar, type ScrollAreaScrollbarProps, ScrollAreaThumb } from "radix-vue";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<ScrollAreaScrollbarProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;
	return delegated;
});

const forwardedProps = computed(() => ({
	...delegatedProps.value,
	orientation: props.orientation ?? "vertical",
}));
</script>

<template>
	<ScrollAreaScrollbar
		v-bind="forwardedProps"
		:class="
			cn(
				'flex touch-none select-none transition-colors',
				props.orientation === 'vertical' &&
					'h-full w-1.5 border-l border-l-transparent p-px',
				props.orientation === 'horizontal' &&
					'h-1.5 flex-col border-t border-t-transparent p-px',
				props.class,
			)
		"
	>
		<ScrollAreaThumb class="relative flex-1 rounded-full bg-border" />
	</ScrollAreaScrollbar>
</template>
