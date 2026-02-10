<template>
	<Teleport to="body">
		<Transition name="modal">
			<div
				v-if="show"
				class="fixed inset-0 z-50 flex items-center justify-center p-4"
				@click.self="$emit('close')"
			>
				<div class="absolute inset-0 bg-black/50" />
				<div
					class="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
				>
					<div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
						<h3 class="text-base font-semibold text-slate-900 dark:text-white">
							Bulk Edit {{ selectedCount }}
							{{ selectedCount === 1 ? "record" : "records" }}
						</h3>
						<p class="text-xs text-slate-500 mt-1">
							Set a field value for all selected records
						</p>
					</div>

					<div class="p-5 space-y-4">
						<!-- Field selector -->
						<div>
							<label
								class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
								>Field</label
							>
							<select
								v-model="selectedField"
								class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select a field...</option>
								<option
									v-for="f in editableFields"
									:key="f.fieldname"
									:value="f.fieldname"
								>
									{{ f.label || f.fieldname }}
								</option>
							</select>
						</div>

						<!-- Value input -->
						<div v-if="selectedField">
							<label
								class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
								>Value</label
							>

							<template v-if="selectedFieldMeta?.fieldtype === 'Check'">
								<select
									v-model="fieldValue"
									class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option :value="1">Yes</option>
									<option :value="0">No</option>
								</select>
							</template>

							<template v-else-if="selectedFieldMeta?.fieldtype === 'Select'">
								<select
									v-model="fieldValue"
									class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Select...</option>
									<option v-for="opt in selectOptions" :key="opt" :value="opt">
										{{ opt }}
									</option>
								</select>
							</template>

							<template v-else>
								<input
									v-model="fieldValue"
									:type="inputType"
									class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Enter value..."
								/>
							</template>
						</div>
					</div>

					<div
						class="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
					>
						<button
							type="button"
							class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
							@click="$emit('close')"
						>
							Cancel
						</button>
						<button
							type="button"
							class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
							:disabled="!canApply"
							@click="apply"
						>
							Update {{ selectedCount }} Records
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Field } from "../../types";

const props = defineProps<{
	show: boolean;
	fields: Field[];
	selectedCount: number;
}>();

const emit = defineEmits<{
	close: [];
	apply: [fieldname: string, value: any];
}>();

const selectedField = ref("");
const fieldValue = ref<any>("");

const editableFields = computed(() => {
	return props.fields.filter(
		(f) =>
			!f.read_only &&
			!f.hidden &&
			f.allow_bulk_edit &&
			![
				"Section Break",
				"Column Break",
				"Tab Break",
				"Table",
				"HTML",
				"Button",
				"Table MultiSelect",
			].includes(f.fieldtype),
	);
});

const selectedFieldMeta = computed(() => {
	return props.fields.find((f) => f.fieldname === selectedField.value);
});

const selectOptions = computed(() => {
	if (!selectedFieldMeta.value?.options) return [];
	return selectedFieldMeta.value.options.split("\n").filter(Boolean);
});

const inputType = computed(() => {
	if (!selectedFieldMeta.value) return "text";
	const ft = selectedFieldMeta.value.fieldtype;
	if (["Int", "Float", "Currency", "Percent"].includes(ft)) return "number";
	if (ft === "Date") return "date";
	if (ft === "DateTime") return "datetime-local";
	return "text";
});

const canApply = computed(() => {
	return (
		selectedField.value &&
		fieldValue.value !== "" &&
		fieldValue.value !== null &&
		fieldValue.value !== undefined
	);
});

watch(
	() => props.show,
	(val) => {
		if (val) {
			selectedField.value = "";
			fieldValue.value = "";
		}
	},
);

watch(selectedField, () => {
	fieldValue.value = "";
});

function apply() {
	if (!canApply.value) return;
	emit("apply", selectedField.value, fieldValue.value);
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
	transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}
</style>
