<template>
	<div class="rounded-2xl border border-border bg-secondary/70 shadow-sm mb-4">
		<button
			type="button"
			class="flex items-center justify-between w-full px-6 py-4 bg-muted dark:bg-muted hover:bg-muted dark:hover:bg-secondary cursor-pointer text-left transition-colors duration-200 rounded-2xl"
			:class="{ 'border-b border-border': isOpen }"
			@click="toggle"
		>
			<div class="flex items-center gap-2 font-bold text-base text-foreground">
				<slot name="icon">
					<ChevronRight
						v-if="showIcon"
						class="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200"
						:class="{ 'rotate-90': isOpen }"
					/>
				</slot>
				<div class="h-6 w-1 rounded bg-blue-500/70 mr-2"></div>
				<span class="flex-1">{{ label }}</span>
				<span
					v-if="badge"
					class="inline-flex items-center justify-center min-w-5 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full"
				>
					{{ badge }}
				</span>
			</div>
			<slot name="actions" />
		</button>

		<transition name="accordion-fade" mode="out-in">
			<div
				v-show="isOpen"
				class="transition-all duration-300"
				:style="isOpen ? 'max-height: none;' : 'max-height: 0; overflow: hidden;'"
			>
				<div class="py-6 px-3.5">
					<slot />
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import ChevronRight from "../icons/ChevronRight.vue";

const props = withDefaults(
	defineProps<{
		label: string;
		defaultOpen?: boolean;
		collapsible?: boolean;
		showIcon?: boolean;
		badge?: string | number;
		modelValue?: boolean;
	}>(),
	{
		defaultOpen: true,
		collapsible: true,
		showIcon: true,
	},
);

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
	toggle: [isOpen: boolean];
}>();

// Use simple ref for internal state
const isOpen = ref(props.modelValue ?? props.defaultOpen);

// Watch for v-model changes from parent
watch(
	() => props.modelValue,
	(newVal) => {
		if (newVal !== undefined) {
			isOpen.value = newVal;
		}
	},
);

// Watch for defaultOpen changes
watch(
	() => props.defaultOpen,
	(newVal) => {
		if (props.modelValue === undefined) {
			isOpen.value = newVal;
		}
	},
);

function toggle() {
	if (!props.collapsible) return;

	isOpen.value = !isOpen.value;
	emit("update:modelValue", isOpen.value);
	emit("toggle", isOpen.value);
}
</script>

<style scoped>
.accordion-fade-enter-active,
.accordion-fade-leave-active {
	transition:
		max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
		opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	overflow: hidden;
}

.accordion-fade-enter-from,
.accordion-fade-leave-to {
	max-height: 0;
	opacity: 0;
}

.accordion-fade-enter-to,
.accordion-fade-leave-from {
	max-height: 2000px;
	opacity: 1;
}
</style>
