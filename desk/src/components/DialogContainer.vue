<template>
	<Teleport to="body">
		<TransitionGroup name="dialog-backdrop">
			<div
				v-for="dialog in dialogs"
				:key="dialog.id"
				class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
				@click.self="handleBackdropClick(dialog)"
			>
				<Transition name="dialog" appear>
					<div
						:class="[
							'bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col',
							dialog.size === 'sm'
								? 'w-full max-w-sm'
								: dialog.size === 'lg'
								  ? 'w-full max-w-2xl'
								  : dialog.size === 'xl'
								    ? 'w-full max-w-4xl'
								    : 'w-full max-w-md',
						]"
					>
						<!-- Header -->
						<div
							class="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700"
						>
							<div class="flex items-center gap-3">
								<!-- Icon -->
								<div
									v-if="dialog.icon"
									:class="[
										'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
										dialog.icon === 'success'
											? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
											: dialog.icon === 'error'
											  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
											  : dialog.icon === 'warning'
											    ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
											    : dialog.icon === 'question'
											      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
											      : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400',
									]"
								>
									<SuccessCircle
										v-if="dialog.icon === 'success'"
										class="w-12 h-12 text-green-500"
									/>
									<ErrorCircle
										v-else-if="dialog.icon === 'error'"
										class="w-12 h-12 text-red-500"
									/>
									<WarningTriangle
										v-else-if="dialog.icon === 'warning'"
										class="w-12 h-12 text-yellow-500"
									/>
									<QuestionCircle
										v-else-if="dialog.icon === 'question'"
										class="w-12 h-12 text-blue-500"
									/>
									<InfoCircle v-else class="w-12 h-12 text-blue-400" />
								</div>
								<h2
									class="text-lg font-semibold text-slate-900 dark:text-slate-50"
								>
									{{ dialog.title }}
								</h2>
							</div>
							<button
								v-if="dialog.showClose !== false"
								class="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded transition-colors shrink-0"
								@click="handleCancel(dialog)"
								aria-label="Close"
							>
								<Close class="w-5 h-5" />
							</button>
						</div>

						<!-- Body -->
						<div class="flex-1 overflow-y-auto p-6">
							<!-- Custom component -->
							<component
								v-if="dialog.type === 'custom' && dialog.component"
								:is="dialog.component"
								v-bind="dialog.componentProps"
								@close="(result: any) => handleClose(dialog, result)"
							/>

							<!-- Standard content -->
							<template v-else>
								<p
									v-if="dialog.message"
									:class="[
										'text-sm text-slate-600 dark:text-slate-400 m-0 leading-relaxed',
										{ 'p-0': dialog.isHtml },
									]"
								>
									<template v-if="dialog.isHtml">
										<div
											v-html="dialog.message"
											class="prose dark:prose-invert prose-sm max-w-none"
										/>
									</template>
									<template v-else>
										{{ dialog.message }}
									</template>
								</p>

								<!-- Prompt input -->
								<div v-if="dialog.type === 'prompt'" class="mt-4 space-y-3">
									<label
										v-if="dialog.inputLabel"
										class="block text-sm font-medium text-slate-700 dark:text-slate-300"
									>
										{{ dialog.inputLabel }}
										<span v-if="dialog.inputRequired" class="text-red-500"
											>*</span
										>
									</label>
									<textarea
										v-if="dialog.inputType === 'textarea'"
										v-model="dialog.inputValue"
										class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
										:placeholder="dialog.inputPlaceholder"
										rows="4"
										@keydown.enter.ctrl="handlePrimaryAction(dialog)"
									/>
									<input
										v-else
										v-model="dialog.inputValue"
										class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
										:type="dialog.inputType || 'text'"
										:placeholder="dialog.inputPlaceholder"
										@keydown.enter="handlePrimaryAction(dialog)"
									/>
								</div>
							</template>
						</div>

						<!-- Footer -->
						<div
							v-if="dialog.type !== 'custom'"
							class="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
						>
							<button
								v-if="dialog.secondaryButton"
								:class="[
									'px-4 py-2 text-sm font-medium rounded-md transition-colors',
									dialog.secondaryButton.variant === 'primary'
										? 'bg-blue-600 text-white hover:bg-blue-700'
										: dialog.secondaryButton.variant === 'danger'
										  ? 'bg-red-600 text-white hover:bg-red-700'
										  : dialog.secondaryButton.variant === 'ghost'
										    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
										    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600',
								]"
								@click="handleSecondaryAction(dialog)"
							>
								{{ __(dialog.secondaryButton.label) }}
							</button>
							<button
								v-if="dialog.primaryButton"
								:class="[
									'px-4 py-2 text-sm font-medium rounded-md transition-colors',
									dialog.primaryButton.variant === 'secondary'
										? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
										: dialog.primaryButton.variant === 'danger'
										  ? 'bg-red-600 text-white hover:bg-red-700'
										  : dialog.primaryButton.variant === 'ghost'
										    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
										    : 'bg-blue-600 text-white hover:bg-blue-700',
								]"
								@click="handlePrimaryAction(dialog)"
							>
								{{ __(dialog.primaryButton.label) }}
							</button>
						</div>
					</div>
				</Transition>
			</div>
		</TransitionGroup>
	</Teleport>
</template>

<script setup lang="ts">
import { useDialogStore, type Dialog } from "../stores/dialog";
import { storeToRefs } from "pinia";
import { __ } from "../utils/translate";
import SuccessCircle from "../icons/SuccessCircle.vue";
import ErrorCircle from "../icons/ErrorCircle.vue";
import WarningTriangle from "../icons/WarningTriangle.vue";
import QuestionCircle from "../icons/QuestionCircle.vue";
import InfoCircle from "../icons/InfoCircle.vue";
import Close from "../icons/Close.vue";

const dialogStore = useDialogStore();
const { dialogs } = storeToRefs(dialogStore);
const { close, cancel } = dialogStore;

function handleBackdropClick(dialog: Dialog) {
	if (dialog.showClose !== false) {
		handleCancel(dialog);
	}
}

function handleCancel(dialog: Dialog) {
	cancel(dialog.id);
}

function handleClose(dialog: Dialog, result?: any) {
	close(dialog.id, result);
}

async function handlePrimaryAction(dialog: Dialog) {
	// Validate prompt input if required
	if (dialog.type === "prompt" && dialog.inputRequired && !dialog.inputValue?.trim()) {
		return;
	}

	if (dialog.primaryButton?.onClick) {
		await dialog.primaryButton.onClick();
	}

	if (dialog.primaryButton?.closeOnClick !== false) {
		// Return appropriate value based on dialog type
		if (dialog.type === "prompt") {
			close(dialog.id, dialog.inputValue);
		} else if (dialog.type === "confirm") {
			close(dialog.id, true);
		} else {
			close(dialog.id, true);
		}
	}
}

async function handleSecondaryAction(dialog: Dialog) {
	if (dialog.secondaryButton?.onClick) {
		await dialog.secondaryButton.onClick();
	}

	if (dialog.secondaryButton?.closeOnClick !== false) {
		cancel(dialog.id);
	}
}
</script>

<style scoped>
/* Dialog animations */
.dialog-backdrop-enter-active,
.dialog-backdrop-leave-active {
	transition: opacity 0.2s ease;
}

.dialog-backdrop-enter-from,
.dialog-backdrop-leave-to {
	opacity: 0;
}

.dialog-enter-active {
	animation: dialogIn 0.25s ease-out;
}

.dialog-leave-active {
	animation: dialogOut 0.15s ease-in;
}

@keyframes dialogIn {
	from {
		opacity: 0;
		transform: scale(0.95) translateY(-10px);
	}
	to {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

@keyframes dialogOut {
	from {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
	to {
		opacity: 0;
		transform: scale(0.95) translateY(-10px);
	}
}
</style>
