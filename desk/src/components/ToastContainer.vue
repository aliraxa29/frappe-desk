<template>
	<Teleport to="body">
		<div
			class="fixed bottom-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none max-sm:left-4"
			aria-live="polite"
		>
			<TransitionGroup name="toast">
				<div
					v-for="toast in toasts"
					:key="toast.id"
					class="flex items-start gap-3 p-4 bg-background rounded-lg shadow-lg border-l-4 pointer-events-auto relative overflow-hidden w-[320px] max-w-[320px]"
					:class="{
						'border-l-green-500': toast.type === 'success',
						'border-l-red-500': toast.type === 'error',
						'border-l-amber-500': toast.type === 'warning',
						'border-l-blue-500': toast.type === 'info',
					}"
					role="alert"
				>
					<div
						class="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
						:class="{
							'text-green-500 bg-green-50': toast.type === 'success',
							'text-red-500 bg-red-50': toast.type === 'error',
							'text-amber-500 bg-amber-50': toast.type === 'warning',
							'text-blue-500 bg-blue-50': toast.type === 'info',
						}"
					>
						<SuccessCircle v-if="toast.type === 'success'" class="w-5 h-5" />
						<ErrorCircle v-else-if="toast.type === 'error'" class="w-5 h-5" />
						<WarningTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5" />
						<InfoCircle v-else class="w-5 h-5" />
					</div>

					<div class="flex-1 min-w-0">
						<p class="text-sm font-semibold text-foreground m-0 leading-[1.4]">
							{{ toast.title }}
						</p>
						<p
							v-if="toast.message"
							class="text-[0.8125rem] text-muted-foreground mt-1 mb-0 leading-[1.4]"
						>
							{{ toast.message }}
						</p>
						<button
							v-if="toast.action"
							class="mt-2 p-0 text-[0.8125rem] font-medium text-blue-500 bg-transparent border-none cursor-pointer hover:underline"
							@click="handleAction(toast)"
						>
							{{ toast.action.label }}
						</button>
					</div>

					<button
						class="flex items-center justify-center w-6 h-6 p-0 bg-transparent border-none text-muted-foreground cursor-pointer rounded shrink-0 transition-all duration-150 hover:text-muted-foreground hover:bg-muted"
						@click="remove(toast.id)"
						aria-label="Close"
					>
						<Close class="w-4 h-4" />
					</button>

					<div
						v-if="toast.duration && toast.duration > 0"
						class="absolute bottom-0 left-0 h-0.75 bg-current opacity-20 animate-[progress_linear_forwards]"
						:style="{ animationDuration: `${toast.duration}ms` }"
					/>
				</div>
			</TransitionGroup>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { useToastStore, type Toast } from "../stores/toast";
import { storeToRefs } from "pinia";
import SuccessCircle from "../icons/SuccessCircle.vue";
import ErrorCircle from "../icons/ErrorCircle.vue";
import WarningTriangle from "../icons/WarningTriangle.vue";
import InfoCircle from "../icons/InfoCircle.vue";
import Close from "../icons/Close.vue";

const toastStore = useToastStore();
const { toasts } = storeToRefs(toastStore);
const { remove } = toastStore;

function handleAction(toast: Toast) {
	if (toast.action?.onClick) {
		toast.action.onClick();
	}
	remove(toast.id);
}
</script>

<style scoped>
@keyframes progress {
	from {
		width: 100%;
	}
	to {
		width: 0%;
	}
}

/* Transition animations */
.toast-enter-active {
	animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
	animation: slideOut 0.2s ease-in;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateX(100%);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

@keyframes slideOut {
	from {
		opacity: 1;
		transform: translateX(0);
	}
	to {
		opacity: 0;
		transform: translateX(100%);
	}
}
</style>
