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
					{{ selectedCount }} {{ selectedCount === 1 ? __("row") : __("rows") }}
					{{ __("selected") }}
				</span>
			</div>

			<div class="h-4 w-px bg-blue-200 dark:bg-blue-700" />

			<!-- Action buttons -->
			<div class="flex items-center gap-1.5">
				<!-- Edit (bulk edit) -->
				<button
					v-if="canWrite"
					type="button"
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors cursor-pointer"
					@click="$emit('bulk-edit')"
				>
					<Edit class="w-3.5 h-3.5" />
					{{ __("Edit") }}
				</button>

				<!-- Assign -->
				<button
					type="button"
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors cursor-pointer"
					@click="$emit('bulk-assign')"
				>
					<UserAssign class="w-3.5 h-3.5" />
					{{ __("Assign To") }}
				</button>

				<!-- Add Tags -->
				<button
					type="button"
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors cursor-pointer"
					@click="$emit('bulk-add-tags')"
				>
					<Tag class="w-3.5 h-3.5" />
					{{ __("Add Tags") }}
				</button>

				<!-- Print -->
				<button
					type="button"
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors cursor-pointer"
					@click="$emit('bulk-print')"
				>
					<Printer class="w-3.5 h-3.5" />
					{{ __("Print") }}
				</button>

				<!-- Delete -->
				<button
					v-if="canDelete"
					type="button"
					class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer"
					@click="$emit('bulk-delete')"
				>
					<Trash class="w-3.5 h-3.5" />
					{{ __("Delete") }}
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
				{{ __("Deselect All") }}
			</button>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import Edit from "../../icons/Edit.vue";
import UserAssign from "../../icons/UserAssign.vue";
import Tag from "../../icons/Tag.vue";
import Printer from "../../icons/Printer.vue";
import Trash from "../../icons/Trash.vue";

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
