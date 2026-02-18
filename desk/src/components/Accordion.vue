<template>
	<div
		class="rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/70 shadow-sm mb-4"
	>
		<button
			type="button"
			class="flex items-center justify-between w-full px-6 py-4 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer text-left transition-colors duration-200 rounded-2xl"
			:class="{ 'border-b border-slate-200 dark:border-slate-700': isOpen }"
			@click="toggle"
		>
			<div
				class="flex items-center gap-2 font-bold text-base text-slate-800 dark:text-white"
			>
				<slot name="icon">
					<ChevronRight
						v-if="showIcon"
						class="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200"
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
				<div class="py-2 px-6">
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
