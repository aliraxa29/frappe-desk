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
		"transition-all duration-100 ease-out",
		"focus:outline-none focus-visible:outline-none",
		"active:scale-[0.98]",
	];

	// Disabled state
	if (props.disabled || props.loading) {
		classes.push("cursor-not-allowed opacity-50");
	}

	// Size variants
	switch (props.size) {
		case "sm":
			classes.push("px-3 py-1.5 text-xs min-h-[32px]");
			break;
		case "lg":
			classes.push("px-6 py-3 text-base min-h-[44px]");
			break;
		case "md":
		default:
			classes.push("px-4 py-2 text-sm min-h-[36px]");
	}

	// Full width
	if (props.fullWidth) {
		classes.push("w-full");
	}

	// Variant styles
	switch (props.variant) {
		case "primary":
			classes.push(
				"bg-[#303030] text-white rounded-[6px]",
				"shadow-[0_1px_0_0_rgba(0,0,0,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2)]",
				"hover:bg-[#1a1a1a] hover:shadow-[0_1px_0_0_rgba(0,0,0,0.1),inset_0_-1px_0_0_rgba(0,0,0,0.2)]",
				"active:bg-[#0a0a0a] active:shadow-[inset_0_2px_1px_0_rgba(0,0,0,0.2)]",
				"focus-visible:outline-[#303030] focus-visible:outline-2 focus-visible:outline-offset-2",
				"disabled:bg-[#9ca3af] disabled:shadow-none",
				// Dark mode
				"dark:bg-[#e5e5e5] dark:text-gray-900",
				"dark:hover:bg-[#f5f5f5] dark:active:bg-white",
				"dark:disabled:bg-[#4b5563]",
			);
			break;

		case "destructive":
			classes.push(
				"bg-[#D72C0D] text-white rounded-[6px]",
				"shadow-[0_1px_0_0_rgba(0,0,0,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.2)]",
				"hover:bg-[#BD2509] hover:shadow-[0_1px_0_0_rgba(0,0,0,0.1),inset_0_-1px_0_0_rgba(0,0,0,0.2)]",
				"active:bg-[#A32107] active:shadow-[inset_0_2px_1px_0_rgba(0,0,0,0.2)]",
				"focus-visible:outline-[#D72C0D] focus-visible:outline-2 focus-visible:outline-offset-2",
				"disabled:bg-[#F0B9AF] disabled:shadow-none",
				// Dark mode
				"dark:bg-[#EF4444] dark:hover:bg-[#DC2626] dark:active:bg-[#B91C1C]",
				"dark:disabled:bg-[#7C2D12]",
			);
			break;

		case "tertiary":
			classes.push(
				"bg-transparent text-[#202223] rounded-[6px]",
				"hover:bg-[#F6F6F7]",
				"active:bg-[#F1F1F2]",
				"focus-visible:outline-[#005BD3] focus-visible:outline-2 focus-visible:outline-offset-2",
				// Dark mode
				"dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600",
			);
			break;

		case "plain":
			classes.push(
				"bg-transparent text-[#005BD3] rounded-[6px] px-2",
				"hover:bg-[#F1F2F3] hover:underline",
				"active:bg-[#E4E5E7]",
				"focus-visible:outline-[#005BD3] focus-visible:outline-2 focus-visible:outline-offset-2",
				// Dark mode
				"dark:text-blue-400 dark:hover:bg-gray-700 dark:active:bg-gray-600",
			);
			break;

		case "secondary":
		default:
			classes.push(
				"bg-white text-[#202223] rounded-[6px]",
				"border border-[#C9CCCF] shadow-[0_1px_0_0_rgba(0,0,0,0.05)]",
				"hover:bg-[#F6F6F7] hover:border-[#8C9196]",
				"active:bg-[#F1F1F2] active:shadow-none",
				"focus-visible:outline-[#005BD3] focus-visible:outline-2 focus-visible:outline-offset-2",
				"disabled:bg-white disabled:border-[#E1E3E5] disabled:text-[#8C9196]",
				// Dark mode
				"dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600",
				"dark:hover:bg-gray-700 dark:hover:border-gray-500",
				"dark:active:bg-gray-600",
				"dark:disabled:bg-gray-800 dark:disabled:border-gray-700 dark:disabled:text-gray-500",
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
		return "text-white dark:text-gray-900";
	}
	return "text-[#202223] dark:text-gray-200";
});

function handleClick(event: MouseEvent) {
	if (!props.disabled && !props.loading) {
		emit("click", event);
	}
}
</script>

<style scoped>
.polaris-button {
	user-select: none;
	-webkit-tap-highlight-color: transparent;
}

.polaris-button:disabled {
	pointer-events: none;
}
</style>
