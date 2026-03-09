<template>
	<SelectPortal>
		<SelectContent
			v-bind="{ ...forwardedProps, ...$attrs }"
			:class="
				cn(
					'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
					position === 'popper' &&
						'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
					$attrs.class as string,
				)
			"
		>
			<SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
				<ChevronUp class="h-4 w-4" />
			</SelectScrollUpButton>
			<SelectViewport
				:class="
					cn(
						'p-1',
						position === 'popper' &&
							'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
					)
				"
			>
				<slot />
			</SelectViewport>
			<SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
				<ChevronDown class="h-4 w-4" />
			</SelectScrollDownButton>
		</SelectContent>
	</SelectPortal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
	SelectContent,
	SelectPortal,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectViewport,
	type SelectContentProps,
} from "radix-vue";
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import { cn } from "@/lib/utils";

defineOptions({
	inheritAttrs: false,
});

const props = withDefaults(defineProps<SelectContentProps>(), {
	position: "popper",
	sideOffset: 4,
});

const forwardedProps = computed(() => {
	const { class: _, ...rest } = props as SelectContentProps & { class?: string };
	return rest;
});
</script>
