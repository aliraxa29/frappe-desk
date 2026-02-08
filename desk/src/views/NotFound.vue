<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
	<div
		class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6"
	>
		<div
			class="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-lg p-10 text-center text-slate-900 dark:text-slate-100"
		>
			<h1 class="text-6xl font-extrabold text-slate-800 dark:text-slate-100">404</h1>
			<p class="text-xl text-slate-600 dark:text-slate-300 mt-4">Page not found</p>
			<p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
				The page you are looking for does not exist or has been moved.
			</p>

			<div class="mt-6 flex items-center justify-center gap-4">
				<button
					@click="router.push('/login')"
					class="py-2 px-4 bg-indigo-600 text-white rounded-md"
				>
					Sign in
				</button>
				<button
					@click="router.push('/')"
					class="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md"
				>
					Go home
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
