<script setup lang="ts">
import { cn } from "@/lib/utils";
import { AvatarImage, type AvatarImageProps } from "radix-vue";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<AvatarImageProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;
	return delegated;
});
</script>

<template>
	<AvatarImage v-bind="delegatedProps" :class="cn('aspect-square h-full w-full', props.class)" />
</template>
