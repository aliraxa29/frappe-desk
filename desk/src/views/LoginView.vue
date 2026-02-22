<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Lock from "../icons/Lock.vue";
import Button from "../components/Button.vue";
import Spinner from "../icons/Spinner.vue";
import Eye from "../icons/Eye.vue";
import EyeOff from "../icons/EyeOff.vue";
import { __ } from "@/utils/translate";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);

const isLoading = computed(() => authStore.loading);

async function handleLogin() {
	authStore.clearError();

	if (!email.value.trim()) {
		return;
	}

	if (!password.value) {
		return;
	}

	const success = await authStore.login(email.value, password.value);

	if (success) {
		const redirect = (route.query.redirect as string) || "/";
		router.push(redirect);
	}
}

function goToResetPassword() {
	router.push({ name: "ResetPassword" });
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
				<div class="bg-gray-900 px-8 py-12 text-center">
					<div
						class="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"
					>
						<Lock class="w-6 h-6" />
					</div>
					<h1 class="text-3xl font-bold text-white mb-2">{{ __("Welcome Back") }}</h1>
					<p class="text-blue-100">{{ __("Sign in to your account") }}</p>
				</div>

				<div class="px-8 py-10">
					<div class="mb-6">
						<label
							class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
						>
							{{ __("Email or Username") }}</label
						>
						<input
							v-model="email"
							type="text"
							placeholder="you@example.com"
							:disabled="isLoading"
							@keydown.enter="handleLogin"
							class="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 disabled:dark:bg-slate-700 disabled:cursor-not-allowed"
						/>
					</div>

					<div class="mb-2">
						<label class="block text-sm font-semibold text-slate-700 mb-2">{{
							__("Password")
						}}</label>
						<div class="relative">
							<input
								v-model="password"
								:type="showPassword ? 'text' : 'password'"
								placeholder="••••••••"
								:disabled="isLoading"
								@keydown.enter="handleLogin"
								class="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:bg-slate-100 disabled:dark:bg-slate-700 disabled:cursor-not-allowed"
							/>
							<button
								@click="showPassword = !showPassword"
								:disabled="isLoading"
								type="button"
								class="absolute right-3 top-4 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							>
								<Eye v-if="!showPassword" />
								<EyeOff v-else />
							</button>
						</div>
					</div>

					<Button
						variant="primary"
						@click="handleLogin"
						:disabled="isLoading || !email || !password"
						class="w-full py-3 mt-4 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<span v-if="!isLoading">{{ __("Sign In") }}</span>
						<span v-else class="flex items-center gap-2">
							<Spinner />
							{{ __("Signing in...") }}
						</span>
					</Button>

					<div class="mt-8 relative">
						<div class="absolute inset-0 flex items-center">
							<div
								class="w-full border-t border-slate-300 dark:border-slate-700"
							></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span
								class="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300"
							>
								{{ __("Don't have an account?") }}
								<a
									href="#"
									class="text-indigo-600 hover:text-indigo-700 font-medium"
								>
									{{ __("Sign up") }}</a
								>
							</span>
						</div>
					</div>

					<Button
						@click="goToResetPassword"
						:disabled="isLoading"
						type="button"
						variant="secondary"
						class="w-full mt-6 py-2 px-4 text-sm font-medium"
					>
						{{ __("Forgot your password?") }}
					</Button>
				</div>
				<div
					class="px-8 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-300"
				>
					<p>
						{{
							__(
								"By signing in, you agree to our Terms of Service and Privacy Policy",
							)
						}}
					</p>
				</div>
			</div>

			<div class="mt-6 text-center">
				<p class="text-sm text-slate-600">
					{{ __("Need help?") }}
					<a href="#" class="text-indigo-600 hover:text-indigo-700 font-medium">
						{{ __("Contact support") }}
					</a>
				</p>
			</div>
		</div>
	</div>
</template>
