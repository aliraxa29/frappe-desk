<template>
	<span :class="pillClasses" role="status" @click="handleClick">
		<span class="flex items-center gap-1.5">
			<slot />
		</span>

		<!-- Close button -->
		<button
			v-if="closable"
			type="button"
			class="ml-1 rounded-full p-0.5 transition hover:bg-black/10"
			@click.stop="$emit('close')"
		>
			<Close class="h-3.5 w-3.5" />
		</button>
	</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Close from "../icons/Close.vue";

type PillVariant = "primary" | "success" | "warning" | "danger" | "neutral" | "orange";
type PillSize = "sm" | "md";

const emit = defineEmits<{
	(e: "click"): void;
	(e: "close"): void;
}>();

const props = withDefaults(
	defineProps<{
		variant?: PillVariant;
		size?: PillSize;
		clickable?: boolean;
		closable?: boolean;
	}>(),
	{
		variant: "neutral",
		size: "md",
		clickable: false,
		closable: false,
	},
);

const baseClasses =
	"inline-flex items-center rounded-md border font-semibold transition-colors select-none";

const variantClasses: Record<PillVariant, string> = {
	primary: "border-transparent bg-primary text-primary-foreground shadow",
	success: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
	warning: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
	danger: "border-transparent bg-destructive text-destructive-foreground shadow",
	neutral: "border-transparent bg-secondary text-secondary-foreground",
	orange: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

const sizeClasses: Record<PillSize, string> = {
	sm: "px-2 py-0.5 text-xs",
	md: "px-2.5 py-0.5 text-xs",
};

const interactiveClasses =
	"cursor-pointer hover:brightness-95 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const pillClasses = computed(() => [
	baseClasses,
	variantClasses[props.variant],
	sizeClasses[props.size],
	props.clickable && interactiveClasses,
]);

function handleClick() {
	if (props.clickable) {
		emit("click");
	}
}
</script>
