<template>
	<button
		:type="type"
		:disabled="disabled || loading"
		:class="buttonClasses"
		@click="handleClick"
	>
		<!-- Loading spinner -->
		<Spinner v-if="loading" class="animate-spin h-5 w-5" :class="spinnerColor" />

		<!-- Icon (leading) -->
		<span v-if="icon && !loading" :class="iconClasses">
			{{ icon }}
		</span>

		<!-- Button text -->
		<span v-if="!loading || icon || iconTrailing">
			<slot />
		</span>

		<!-- Icon (trailing) -->
		<span v-if="iconTrailing && !loading" :class="iconClasses">
			{{ iconTrailing }}
		</span>
	</button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Spinner from "../icons/Spinner.vue";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "plain";

export type ButtonSize = "sm" | "md" | "lg";

interface Props {
	variant?: ButtonVariant;
	size?: ButtonSize;
	type?: "button" | "submit" | "reset";
	disabled?: boolean;
	loading?: boolean;
	fullWidth?: boolean;
	icon?: string;
	iconTrailing?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "secondary",
	size: "md",
	type: "button",
	disabled: false,
	loading: false,
	fullWidth: false,
});

const emit = defineEmits<{
	click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
	const classes = [
		"relative inline-flex items-center justify-center gap-2",
		"font-medium leading-5 text-center cursor-pointer",
		"rounded-lg text-sm transition-all duration-200",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"active:scale-[0.98]",
	];

	// Disabled state
	if (props.disabled || props.loading) {
		classes.push("pointer-events-none opacity-50");
	}

	// Size variants
	switch (props.size) {
		case "sm":
			classes.push("h-8 px-3 text-xs rounded-md");
			break;
		case "lg":
			classes.push("h-11 px-8 rounded-lg");
			break;
		case "md":
		default:
			classes.push("h-9 px-4 py-2");
	}

	// Full width
	if (props.fullWidth) {
		classes.push("w-full");
	}

	// Variant styles using theme tokens
	switch (props.variant) {
		case "primary":
			classes.push("bg-primary text-primary-foreground shadow", "hover:bg-primary/90");
			break;

		case "destructive":
			classes.push(
				"bg-destructive text-destructive-foreground shadow-sm",
				"hover:bg-destructive/90",
			);
			break;

		case "tertiary":
			classes.push("hover:bg-accent hover:text-accent-foreground");
			break;

		case "plain":
			classes.push("text-primary underline-offset-4 hover:underline");
			break;

		case "secondary":
		default:
			classes.push(
				"border border-input bg-background shadow-sm",
				"hover:bg-accent hover:text-accent-foreground",
			);
	}

	return classes;
});

const iconClasses = computed(() => {
	const classes = [];

	if (props.size === "sm") {
		classes.push("text-sm");
	} else if (props.size === "lg") {
		classes.push("text-lg");
	} else {
		classes.push("text-base");
	}

	return classes;
});

const spinnerColor = computed(() => {
	if (props.variant === "primary" || props.variant === "destructive") {
		return "text-primary-foreground";
	}
	return "text-foreground";
});

function handleClick(event: MouseEvent) {
	if (!props.disabled && !props.loading) {
		emit("click", event);
	}
}
</script>
