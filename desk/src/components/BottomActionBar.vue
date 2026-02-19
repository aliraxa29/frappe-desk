<template>
	<Transition name="slide-up">
		<div
			v-if="show"
			class="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg z-15 transition-all duration-300"
			:style="{ marginLeft: sidebarVisible ? '16rem' : '2rem' }"
		>
			<div class="px-6 py-4 flex items-center justify-between">
				<p class="text-slate-700 dark:text-slate-200 font-medium">{{ message }}</p>
				<div class="flex gap-3">
					<Button
						@click="$emit('discard')"
						variant="secondary"
						size="sm"
						:disabled="loading"
					>
						{{ discardText }}
					</Button>
					<Button @click="$emit('save')" size="sm" :disabled="loading" variant="primary">
						{{ loading ? loadingText : saveText }}
					</Button>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { __ } from "../utils/translate";
import Button from "./Button.vue";
import { useSidebarStore } from "../stores/sidebar";
import { computed } from "vue";

const sidebarStore = useSidebarStore();
const sidebarVisible = computed(() => !sidebarStore.collapsed);

interface Props {
	show: boolean;
	loading?: boolean;
	message?: string;
	saveText?: string;
	discardText?: string;
	loadingText?: string;
}

withDefaults(defineProps<Props>(), {
	loading: false,
	message: __("Do you want to save changes?"),
	saveText: __("Save changes"),
	discardText: __("Discard"),
	loadingText: __("Saving..."),
});

defineEmits<{
	save: [];
	discard: [];
}>();
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
	transition:
		transform 0.3s ease-out,
		opacity 0.3s ease-out;
}

.slide-up-enter-from {
	transform: translateY(100%);
	opacity: 0;
}

.slide-up-leave-to {
	transform: translateY(100%);
	opacity: 0;
}
</style>
