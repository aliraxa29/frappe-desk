<script setup lang="ts">
import { cn } from "@/lib/utils";
import { AvatarRoot, type AvatarRootProps } from "radix-vue";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<
	AvatarRootProps & { class?: HTMLAttributes["class"]; size?: "sm" | "default" | "lg" }
>();

const delegatedProps = computed(() => {
	const { class: _, size: __, ...delegated } = props;
	return delegated;
});

const sizeClasses: Record<string, string> = {
	sm: "h-8 w-8 text-xs",
	default: "h-10 w-10 text-sm",
	lg: "h-12 w-12 text-base",
};
</script>

<template>
	<AvatarRoot
		v-bind="delegatedProps"
		:class="
			cn(
				'relative flex shrink-0 overflow-hidden rounded-full',
				sizeClasses[size ?? 'default'],
				props.class,
			)
		"
	>
		<slot />
	</AvatarRoot>
</template>
