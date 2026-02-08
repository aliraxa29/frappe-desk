<template>
	<Teleport to="body">
		<div class="toast-container" aria-live="polite">
			<TransitionGroup name="toast">
				<div
					v-for="toast in toasts"
					:key="toast.id"
					class="toast"
					:class="[`toast-${toast.type}`]"
					role="alert"
				>
					<!-- Icon -->
					<div class="toast-icon">
						<svg
							v-if="toast.type === 'success'"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<svg
							v-else-if="toast.type === 'error'"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
						<svg
							v-else-if="toast.type === 'warning'"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>

					<!-- Content -->
					<div class="toast-content">
						<p class="toast-title">{{ toast.title }}</p>
						<p v-if="toast.message" class="toast-message">{{ toast.message }}</p>
						<button
							v-if="toast.action"
							class="toast-action"
							@click="handleAction(toast)"
						>
							{{ toast.action.label }}
						</button>
					</div>

					<!-- Close button -->
					<button class="toast-close" @click="remove(toast.id)" aria-label="Close">
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>

					<!-- Progress bar -->
					<div
						v-if="toast.duration && toast.duration > 0"
						class="toast-progress"
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
.toast-container {
	position: fixed;
	bottom: 1rem;
	right: 1rem;
	z-index: 9999;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	max-width: 24rem;
	pointer-events: none;
}

.toast {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	padding: 1rem;
	background: #fff;
	border-radius: 0.5rem;
	box-shadow:
		0 10px 15px -3px rgba(0, 0, 0, 0.1),
		0 4px 6px -2px rgba(0, 0, 0, 0.05);
	border-left: 4px solid;
	pointer-events: auto;
	position: relative;
	overflow: hidden;
}

.toast-success {
	border-left-color: #22c55e;
}

.toast-success .toast-icon {
	color: #22c55e;
	background: #f0fdf4;
}

.toast-error {
	border-left-color: #ef4444;
}

.toast-error .toast-icon {
	color: #ef4444;
	background: #fef2f2;
}

.toast-warning {
	border-left-color: #f59e0b;
}

.toast-warning .toast-icon {
	color: #f59e0b;
	background: #fffbeb;
}

.toast-info {
	border-left-color: #3b82f6;
}

.toast-info .toast-icon {
	color: #3b82f6;
	background: #eff6ff;
}

.toast-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	border-radius: 9999px;
	flex-shrink: 0;
}

.toast-icon svg {
	width: 1.25rem;
	height: 1.25rem;
}

.toast-content {
	flex: 1;
	min-width: 0;
}

.toast-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: #1e293b;
	margin: 0;
	line-height: 1.4;
}

.toast-message {
	font-size: 0.8125rem;
	color: #64748b;
	margin: 0.25rem 0 0 0;
	line-height: 1.4;
}

.toast-action {
	margin-top: 0.5rem;
	padding: 0;
	font-size: 0.8125rem;
	font-weight: 500;
	color: #3b82f6;
	background: none;
	border: none;
	cursor: pointer;
}

.toast-action:hover {
	text-decoration: underline;
}

.toast-close {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 1.5rem;
	height: 1.5rem;
	padding: 0;
	background: none;
	border: none;
	color: #94a3b8;
	cursor: pointer;
	border-radius: 0.25rem;
	flex-shrink: 0;
	transition: all 0.15s;
}

.toast-close:hover {
	color: #64748b;
	background: #f1f5f9;
}

.toast-close svg {
	width: 1rem;
	height: 1rem;
}

.toast-progress {
	position: absolute;
	bottom: 0;
	left: 0;
	height: 3px;
	background: currentColor;
	opacity: 0.2;
	animation: progress linear forwards;
}

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

/* Mobile responsiveness */
@media (max-width: 640px) {
	.toast-container {
		left: 1rem;
		right: 1rem;
		max-width: none;
	}
}
</style>
