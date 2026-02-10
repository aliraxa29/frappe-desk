<template>
	<Teleport to="body">
		<Transition name="qb-overlay">
			<div v-if="show" class="fixed inset-0 z-50" @click="close">
				<div class="absolute inset-0 bg-black/20 dark:bg-black/40" />
				<div
					class="absolute z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl"
					:style="popoverStyle"
					@click.stop
				>
					<!-- Header -->
					<div
						class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700"
					>
						<span
							class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
						>
							{{ __("Filters") }}
						</span>
						<button
							type="button"
							class="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
							@click="addRow"
						>
							+ {{ __("Add Filter") }}
						</button>
					</div>

					<!-- Filter Rows -->
					<div class="p-3 max-h-[60vh] overflow-y-auto space-y-2.5">
						<div v-if="filters.length === 0" class="text-center py-6">
							<svg
								class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
								/>
							</svg>
							<p class="text-xs text-slate-400">{{ __("No filters applied") }}</p>
						</div>

						<div
							v-for="row in filters"
							:key="row.id"
							class="flex items-start gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50"
						>
							<div class="flex-1 grid grid-cols-3 gap-2">
								<!-- Field -->
								<select
									v-model="row.fieldname"
									class="text-sm px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									@change="onFieldChange(row)"
								>
									<option value="">{{ __("Field...") }}</option>
									<option
										v-for="f in fieldOptions"
										:key="f.fieldname"
										:value="f.fieldname"
									>
										{{ f.label || f.fieldname }}
									</option>
								</select>

								<!-- Operator -->
								<select
									v-model="row.operator"
									class="text-sm px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									@change="$emit('apply')"
								>
									<option
										v-for="op in getOperatorsForRow(row)"
										:key="op.value"
										:value="op.value"
									>
										{{ op.label }}
									</option>
								</select>

								<!-- Value -->
								<div class="flex gap-1">
									<template v-if="row.operator === 'between'">
										<input
											v-model="row.value.from"
											:type="getInputType(row)"
											placeholder="From"
											class="w-1/2 text-sm px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
											@change="$emit('apply')"
										/>
										<input
											v-model="row.value.to"
											:type="getInputType(row)"
											placeholder="To"
											class="w-1/2 text-sm px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
											@change="$emit('apply')"
										/>
									</template>
									<template
										v-else-if="getFieldMeta(row)?.fieldtype === 'Select'"
									>
										<select
											v-model="row.value"
											class="w-full text-sm px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
											@change="$emit('apply')"
										>
											<option value="">Any</option>
											<option
												v-for="opt in getSelectOptions(row)"
												:key="opt"
												:value="opt"
											>
												{{ opt }}
											</option>
										</select>
									</template>
									<template v-else-if="getFieldMeta(row)?.fieldtype === 'Check'">
										<select
											v-model="row.value"
											class="w-full text-sm px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
											@change="$emit('apply')"
										>
											<option value="">Any</option>
											<option value="1">Yes</option>
											<option value="0">No</option>
										</select>
									</template>
									<template v-else>
										<input
											v-model="row.value"
											:type="getInputType(row)"
											:placeholder="getPlaceholder(row)"
											class="w-full text-sm px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
											@keydown.enter="$emit('apply')"
											@change="$emit('apply')"
										/>
									</template>
								</div>
							</div>

							<!-- Remove -->
							<button
								type="button"
								class="mt-1 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
								@click="removeRow(row.id)"
							>
								<svg
									class="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>
					</div>

					<!-- Footer -->
					<div
						class="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 rounded-b-xl"
					>
						<button
							type="button"
							class="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
							@click="$emit('clear-all')"
						>
							{{ __("Clear All") }}
						</button>
						<button
							type="button"
							class="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
							@click="applyAndClose"
						>
							{{ __("Apply") }}
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field } from "../../types";
import { __ } from "../../utils/translate";

export interface QueryFilterRow {
	id: string;
	fieldname: string;
	operator: string;
	value: any;
}

const props = defineProps<{
	show: boolean;
	filters: QueryFilterRow[];
	fieldOptions: Field[];
	anchorRect?: DOMRect | null;
}>();

const emit = defineEmits<{
	close: [];
	"add-row": [];
	"remove-row": [id: string];
	"field-change": [row: QueryFilterRow];
	apply: [];
	"clear-all": [];
}>();

const operators: Record<string, { value: string; label: string }[]> = {
	text: [
		{ value: "=", label: __("Equals") },
		{ value: "!=", label: __("Not Equals") },
		{ value: "like", label: __("Like") },
		{ value: "not like", label: __("Not Like") },
		{ value: "in", label: __("In") },
		{ value: "not in", label: __("Not In") },
		{ value: "is", label: __("Is") },
	],
	number: [
		{ value: "=", label: __("Equals") },
		{ value: "!=", label: __("Not Equals") },
		{ value: ">", label: __("Greater Than") },
		{ value: ">=", label: __("Greater Than or Equal To") },
		{ value: "<", label: __("Less Than") },
		{ value: "<=", label: __("Less Than or Equal To") },
		{ value: "between", label: __("Between") },
		{ value: "in", label: __("In") },
	],
	date: [
		{ value: "=", label: __("Equals") },
		{ value: "!=", label: __("Not Equals") },
		{ value: ">", label: __("After") },
		{ value: ">=", label: __("On or After") },
		{ value: "<", label: __("Before") },
		{ value: "<=", label: __("On or Before") },
		{ value: "between", label: __("Between") },
	],
	select: [
		{ value: "=", label: __("Equals") },
		{ value: "!=", label: __("Not Equals") },
		{ value: "in", label: __("In") },
		{ value: "not in", label: __("Not In") },
	],
	check: [{ value: "=", label: __("Equals") }],
	link: [
		{ value: "=", label: __("Equals") },
		{ value: "!=", label: __("Not Equals") },
		{ value: "like", label: __("Like") },
		{ value: "in", label: __("In") },
		{ value: "not in", label: __("Not In") },
	],
};

const popoverStyle = computed(() => {
	if (props.anchorRect) {
		const top = props.anchorRect.bottom + 8;
		const right = window.innerWidth - props.anchorRect.right;
		return {
			top: `${top}px`,
			right: `${Math.max(8, right)}px`,
			width: "560px",
			maxWidth: "calc(100vw - 16px)",
		};
	}
	return {
		top: "80px",
		right: "16px",
		width: "560px",
		maxWidth: "calc(100vw - 16px)",
	};
});

function getFieldMeta(row: QueryFilterRow): Field | undefined {
	return props.fieldOptions.find((f) => f.fieldname === row.fieldname);
}

function getOperatorCategory(fieldtype: string): string {
	if (["Int", "Float", "Currency", "Percent"].includes(fieldtype)) return "number";
	if (["Date", "DateTime"].includes(fieldtype)) return "date";
	if (fieldtype === "Select") return "select";
	if (fieldtype === "Check") return "check";
	if (fieldtype === "Link") return "link";
	return "text";
}

function getOperatorsForRow(row: QueryFilterRow) {
	const field = getFieldMeta(row);
	if (!field) return operators.text;
	return operators[getOperatorCategory(field.fieldtype)] || operators.text;
}

function getInputType(row: QueryFilterRow): string {
	const field = getFieldMeta(row);
	if (!field) return "text";
	if (["Int", "Float", "Currency", "Percent"].includes(field.fieldtype)) return "number";
	if (["Date"].includes(field.fieldtype)) return "date";
	if (["DateTime"].includes(field.fieldtype)) return "datetime-local";
	return "text";
}

function getPlaceholder(row: QueryFilterRow): string {
	if (row.operator === "in" || row.operator === "not in") return "val1, val2, ...";
	if (row.operator === "like") return "%value%";
	return "Value...";
}

function getSelectOptions(row: QueryFilterRow): string[] {
	const field = getFieldMeta(row);
	if (!field?.options) return [];
	return field.options.split("\n").filter(Boolean);
}

function onFieldChange(row: QueryFilterRow) {
	const ops = getOperatorsForRow(row);
	if (ops) {
		row.operator = ops[0]?.value || "=";
		row.value = row.operator === "between" ? { from: "", to: "" } : "";
		emit("field-change", row);
	}
}

function addRow() {
	emit("add-row");
}

function removeRow(id: string) {
	emit("remove-row", id);
}

function close() {
	emit("close");
}

function applyAndClose() {
	emit("apply");
	emit("close");
}
</script>

<style scoped>
.qb-overlay-enter-active,
.qb-overlay-leave-active {
	transition: all 0.2s ease;
}

.qb-overlay-enter-from,
.qb-overlay-leave-to {
	opacity: 0;
}
</style>
