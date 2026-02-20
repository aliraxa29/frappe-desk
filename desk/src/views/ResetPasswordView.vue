<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Button from "../components/Button.vue";
import { toast } from "../stores/toast";
import { __ } from "../utils/translate";
import Mail from "../icons/Mail.vue";

const router = useRouter();
const authStore = useAuthStore();

const loginId = ref("");
const submitted = ref(false);

const isLoading = computed(() => authStore.loading);

async function handleResetRequest() {
	authStore.clearError();

	if (!loginId.value.trim()) {
		return;
	}

	const success = await authStore.requestPasswordReset(loginId.value);

	if (success) {
		submitted.value = true;
		loginId.value = "";
		toast.success(
			__("Success"),
			__(
				"If an account with that email or username exists, a password reset link has been sent.",
			),
		);
		setTimeout(() => {
			router.push({ name: "Login" });
		}, 5000);
	}
}

function goBackToLogin() {
	router.push({ name: "Login" });
}
</script>

<template>
	<div
		class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-white p-4"
	>
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div
				class="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
			></div>
			<div
				class="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
				style="animation-delay: 2s"
			></div>
		</div>

		<div class="relative w-full max-w-md">
			<div
				class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
			>
				<div class="bg-gray-950 px-8 py-12 text-center">
					<div
						class="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"
					>
						<Mail class="w-6 h-6" />
					</div>
					<h1 class="text-3xl font-bold text-white mb-2">{{ __("Reset Password") }}</h1>
					<p class="text-blue-100">
						{{ __("We'll send you instructions to reset your password") }}
					</p>
				</div>

				<div class="px-8 py-10">
					<div v-if="!submitted" class="space-y-6">
						<div>
							<label
								class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
								>{{ __("Email or Username") }}</label
							>
							<input
								v-model="loginId"
								type="text"
								placeholder="you@example.com or username"
								:disabled="isLoading"
								@keydown.enter="handleResetRequest"
								class="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 disabled:dark:bg-slate-700 disabled:cursor-not-allowed"
							/>
							<p class="mt-2 text-xs text-slate-500">
								{{
									__(
										"Enter the email address or username associated with your account",
									)
								}}
							</p>
						</div>

						<Button
							variant="primary"
							@click="handleResetRequest"
							:disabled="isLoading || !loginId.trim()"
							class="w-full py-3 px-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
						>
							<span v-if="!isLoading">{{ __("Send Reset Link") }}</span>
							<span v-else class="flex items-center gap-2">
								<svg
									class="w-4 h-4 animate-spin"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									></path>
								</svg>
								{{ __("Sending...") }}
							</span>
						</Button>

						<Button
							@click="goBackToLogin"
							:disabled="isLoading"
							type="button"
							variant="secondary"
							class="w-full py-2 px-4 text-sm font-medium dark:hover:bg-indigo-900/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							{{ __("← Back to Sign In") }}
						</Button>
					</div>

					<div v-else class="flex gap-3">
						<Button
							@click="goBackToLogin"
							type="button"
							variant="primary"
							class="flex-1 py-2 px-4 text-sm font-medium"
						>
							{{ __("Back to Sign In") }}
						</Button>
					</div>
				</div>
				<div
					class="px-8 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700"
				>
					<p class="text-xs text-slate-500 dark:text-slate-300 text-center">
						{{ __("Didn't receive an email?") }}
						<span
							class="text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 font-medium cursor-pointer"
							>{{ __("Check your spam folder or contact support") }}</span
						>
					</p>
				</div>
			</div>
			<div
				class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg"
			>
				<h3 class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
					{{ __("Didn't work?") }}
				</h3>
				<p class="text-sm text-blue-800 dark:text-blue-200">
					{{
						__(
							"If you're still having trouble accessing your account, please contact our support team.",
						)
					}}
				</p>
			</div>
		</div>
	</div>
</template>
