<template>
	<div class="relative" ref="popoverRef">
		<!-- Trigger Button -->
		<button
			:class="[
				buttonClasses,
				'px-3 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 cursor-pointer',
			]"
			@click="togglePopover"
		>
			<span v-if="icon" class="text-base">{{ icon }}</span>
			{{ label }}
			<svg
				class="w-4 h-4 ml-1 transition-transform"
				:class="{ 'rotate-180': isOpen }"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 9l-7 7-7-7"
				/>
			</svg>
		</button>

		<!-- Popover Menu -->
		<Transition
			enter-active-class="transition ease-out duration-100"
			enter-from-class="transform opacity-0 scale-95"
			enter-to-class="transform opacity-100 scale-100"
			leave-active-class="transition ease-in duration-75"
			leave-from-class="transform opacity-100 scale-100"
			leave-to-class="transform opacity-0 scale-95"
		>
			<div
				v-if="isOpen"
				class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1"
			>
				<button
					v-for="button in buttons"
					:key="button.name"
					class="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer"
					:class="{
						'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30':
							button.className?.includes('red'),
					}"
					@click="handleItemClick(button)"
				>
					<span v-if="button.icon" class="text-base">{{ button.icon }}</span>
					{{ button.label }}
				</button>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { FormButton } from "../composables/useFormButtons";

interface Props {
	label: string;
	buttons: FormButton[];
	icon?: string;
	isPrimary?: boolean;
	variant?: "primary" | "secondary" | "tertiary" | "destructive" | "plain";
}

const props = withDefaults(defineProps<Props>(), {
	isPrimary: false,
	variant: "secondary",
});

const emit = defineEmits<{
	execute: [button: FormButton];
}>();

const isOpen = ref(false);
const popoverRef = ref<HTMLElement | null>(null);

const buttonClasses = computed(() => {
	const isPrimaryStyle = props.isPrimary || props.variant === "primary";

	return isPrimaryStyle
		? "bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-200 dark:hover:bg-gray-100 dark:text-gray-900"
		: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600";
});

function togglePopover() {
	isOpen.value = !isOpen.value;
}

function handleItemClick(button: FormButton) {
	isOpen.value = false;
	button.onClick();
	emit("execute", button);
}

// Close popover when clicking outside
function handleClickOutside(event: MouseEvent) {
	if (popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
		isOpen.value = false;
	}
}

onMounted(() => {
	document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
