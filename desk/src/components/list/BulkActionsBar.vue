<template>
	<Transition name="bulk-bar">
		<div
			v-if="selectedCount > 0"
			class="flex items-center gap-3 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800"
		>
			<!-- Selection info -->
			<div class="flex items-center gap-2">
				<div
					class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold"
				>
					{{ selectedCount }}
				</div>
				<span class="text-sm font-medium text-blue-700 dark:text-blue-300">
					{{ selectedCount }} {{ selectedCount === 1 ? "row" : "rows" }} selected
				</span>
			</div>

			<div class="h-4 w-px bg-blue-200 dark:bg-blue-700" />

			<!-- Action buttons -->
			<div class="flex items-center gap-1.5">
				<!-- Edit (bulk edit) -->
				<button
					v-if="canWrite"
					type="button"
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors"
					@click="$emit('bulk-edit')"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
					Edit
				</button>

				<!-- Assign -->
				<button
					type="button"
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors"
					@click="$emit('bulk-assign')"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					Assign To
				</button>

				<!-- Add Tags -->
				<button
					type="button"
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors"
					@click="$emit('bulk-add-tags')"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
						/>
					</svg>
					Add Tags
				</button>

				<!-- Print -->
				<button
					type="button"
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors"
					@click="$emit('bulk-print')"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
						/>
					</svg>
					Print
				</button>

				<!-- Delete -->
				<button
					v-if="canDelete"
					type="button"
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
					@click="$emit('bulk-delete')"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
					Delete
				</button>
			</div>

			<!-- Spacer -->
			<div class="flex-1" />

			<!-- Deselect -->
			<button
				type="button"
				class="px-2.5 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors"
				@click="$emit('deselect-all')"
			>
				Deselect All
			</button>
		</div>
	</Transition>
</template>

<script setup lang="ts">
defineProps<{
	selectedCount: number;
	canWrite?: boolean;
	canDelete?: boolean;
}>();

defineEmits<{
	"bulk-edit": [];
	"bulk-delete": [];
	"bulk-assign": [];
	"bulk-add-tags": [];
	"bulk-print": [];
	"deselect-all": [];
}>();
</script>

<style scoped>
.bulk-bar-enter-active,
.bulk-bar-leave-active {
	transition: all 0.2s ease;
}
.bulk-bar-enter-from,
.bulk-bar-leave-to {
	opacity: 0;
	max-height: 0;
	padding-top: 0;
	padding-bottom: 0;
	overflow: hidden;
}
.bulk-bar-enter-to,
.bulk-bar-leave-from {
	max-height: 50px;
}
</style>
