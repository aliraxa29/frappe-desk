<script setup lang="ts">
import { cn } from "@/lib/utils";
import {
	DialogClose,
	DialogContent,
	type DialogContentEmits,
	type DialogContentProps,
	DialogOverlay,
	DialogPortal,
	useForwardPropsEmits,
} from "radix-vue";
import { computed, type HTMLAttributes } from "vue";
import { X } from "lucide-vue-next";

const props = defineProps<
	DialogContentProps & { class?: HTMLAttributes["class"]; hideClose?: boolean }
>();
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;
	return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<DialogPortal to="body">
		<DialogOverlay
			class="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
		/>
		<DialogContent
			v-bind="forwarded"
			:class="
				cn(
					'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] grid content-start border bg-background shadow-lg duration-200 overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-xl max-h-[90vh] w-[90vw]',
					props.class,
				)
			"
		>
			<slot />

			<DialogClose
				v-if="!hideClose"
				class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
			>
				<X class="w-5 h-5" />
				<span class="sr-only">Close</span>
			</DialogClose>
		</DialogContent>
	</DialogPortal>
</template>
