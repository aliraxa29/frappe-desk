<template>
	<div class="filter-area">
		<!-- Active Filter Pills + Quick Filters -->
		<div
			class="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 min-h-11"
		>
			<!-- Applied filter pills -->
			<TransitionGroup name="pill">
				<div
					v-for="pill in filterPills"
					:key="pill.id"
					class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group cursor-pointer"
					@click="editFilter(pill)"
				>
					<span class="text-blue-500 dark:text-blue-400">{{ pill.label }}</span>
					<span class="text-blue-400 dark:text-blue-500">{{ pill.operatorLabel }}</span>
					<span class="font-semibold max-w-30 truncate">{{ pill.displayValue }}</span>
					<button
						type="button"
						class="ml-0.5 -mr-1 p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
						@click.stop="removeFilter(pill.id)"
					>
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</TransitionGroup>

			<!-- Add filter button -->
			<div class="relative" ref="addFilterRef">
				<button
					type="button"
					class="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
					@click="showFilterPicker = !showFilterPicker"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
						/>
					</svg>
					<span>Add Filter</span>
				</button>
			</div>

			<!-- Saved filters / quick filter toggles -->
			<div class="ml-auto flex items-center gap-2">
				<button
					v-if="hasActiveFilters"
					type="button"
					class="text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
					@click="clearAllFilters"
				>
					Clear All
				</button>

				<button
					type="button"
					class="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
					@click="$emit('toggle-query-builder')"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
						/>
					</svg>
					<span>Edit Filters</span>
				</button>
			</div>
		</div>

		<!-- Quick filter picker popover -->
		<Teleport to="body">
			<Transition name="dropdown">
				<div
					v-if="showFilterPicker"
					class="fixed inset-0 z-50"
					@click="showFilterPicker = false"
				>
					<div
						class="absolute z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden"
						:style="pickerStyle"
						@click.stop
					>
						<!-- Search -->
						<div class="p-2 border-b border-slate-200 dark:border-slate-700">
							<input
								v-model="fieldSearch"
								type="text"
								placeholder="Search fields..."
								class="w-full px-2.5 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
								ref="fieldSearchInput"
								@keydown.escape="showFilterPicker = false"
							/>
						</div>
						<!-- Field list -->
						<div class="max-h-60 overflow-y-auto py-1">
							<button
								v-for="f in filteredFieldOptions"
								:key="f.fieldname"
								type="button"
								class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
								@click="addFilterFromPicker(f)"
							>
								<span class="flex-1 truncate">{{ f.label || f.fieldname }}</span>
								<span class="text-[10px] text-slate-400 uppercase">{{
									f.fieldtype
								}}</span>
							</button>
							<div
								v-if="filteredFieldOptions.length === 0"
								class="px-3 py-4 text-center text-xs text-slate-400"
							>
								No matching fields
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import type { Field } from "../../types";

export interface FilterRow {
	id: string;
	fieldname: string;
	operator: string;
	value: any;
}

export interface FilterPill {
	id: string;
	fieldname: string;
	label: string;
	operator: string;
	operatorLabel: string;
	value: any;
	displayValue: string;
}

const props = defineProps<{
	filters: FilterRow[];
	fieldOptions: Field[];
}>();

const emit = defineEmits<{
	"add-filter": [filter: FilterRow];
	"remove-filter": [id: string];
	"edit-filter": [filter: FilterRow];
	"clear-all": [];
	"toggle-query-builder": [];
}>();

const showFilterPicker = ref(false);
const fieldSearch = ref("");
const addFilterRef = ref<HTMLElement | null>(null);
const fieldSearchInput = ref<HTMLInputElement | null>(null);
const pickerStyle = ref<Record<string, string>>({});

const operatorLabels: Record<string, string> = {
	"=": "is",
	"!=": "is not",
	">": ">",
	">=": ">=",
	"<": "<",
	"<=": "<=",
	like: "contains",
	"not like": "not contains",
	in: "is one of",
	"not in": "is not one of",
	between: "between",
	is: "is",
	set: "is set",
	"not set": "is not set",
};

const filterPills = computed<FilterPill[]>(() => {
	return props.filters.map((f) => {
		const field = props.fieldOptions.find((fo) => fo.fieldname === f.fieldname);
		let displayValue = "";
		if (f.operator === "between" && f.value) {
			displayValue = `${f.value.from || "?"} to ${f.value.to || "?"}`;
		} else if (Array.isArray(f.value)) {
			displayValue = f.value.join(", ");
		} else if (f.value === "" || f.value === null || f.value === undefined) {
			displayValue = "...";
		} else {
			displayValue = String(f.value);
		}
		return {
			id: f.id,
			fieldname: f.fieldname,
			label: field?.label || f.fieldname,
			operator: f.operator,
			operatorLabel: operatorLabels[f.operator] || f.operator,
			value: f.value,
			displayValue,
		};
	});
});

const hasActiveFilters = computed(() => props.filters.length > 0);

const filteredFieldOptions = computed(() => {
	const q = fieldSearch.value.toLowerCase();
	return props.fieldOptions.filter((f) => {
		if (!q) return true;
		return (f.label || "").toLowerCase().includes(q) || f.fieldname.toLowerCase().includes(q);
	});
});

watch(showFilterPicker, async (val) => {
	if (val) {
		fieldSearch.value = "";
		updatePickerPosition();
		await nextTick();
		fieldSearchInput.value?.focus();
	}
});

function updatePickerPosition() {
	if (!addFilterRef.value) return;
	const rect = addFilterRef.value.getBoundingClientRect();
	pickerStyle.value = {
		top: `${rect.bottom + 4}px`,
		left: `${rect.left}px`,
	};
}

function addFilterFromPicker(field: Field) {
	showFilterPicker.value = false;
	const operators = getOperatorsForType(field.fieldtype);
	const id = `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
	emit("add-filter", {
		id,
		fieldname: field.fieldname,
		operator: operators[0] || "=",
		value: "",
	});
}

function removeFilter(id: string) {
	emit("remove-filter", id);
}

function editFilter(pill: FilterPill) {
	emit("edit-filter", {
		id: pill.id,
		fieldname: pill.fieldname,
		operator: pill.operator,
		value: pill.value,
	});
}

function clearAllFilters() {
	emit("clear-all");
}

function getOperatorsForType(fieldtype: string): string[] {
	if (["Int", "Float", "Currency", "Percent"].includes(fieldtype)) {
		return ["=", "!=", ">", ">=", "<", "<=", "between", "in"];
	}
	if (["Date", "DateTime"].includes(fieldtype)) {
		return ["=", "!=", ">", ">=", "<", "<=", "between"];
	}
	if (["Check"].includes(fieldtype)) {
		return ["="];
	}
	if (["Link"].includes(fieldtype)) {
		return ["=", "!=", "like", "in", "not in"];
	}
	if (["Select"].includes(fieldtype)) {
		return ["=", "!=", "in", "not in"];
	}
	return ["=", "!=", "like", "not like", "in"];
}
</script>

<style scoped>
.pill-enter-active,
.pill-leave-active {
	transition: all 0.2s ease;
}
.pill-enter-from {
	opacity: 0;
	transform: scale(0.9) translateX(-4px);
}
.pill-leave-to {
	opacity: 0;
	transform: scale(0.9);
}

.dropdown-enter-active,
.dropdown-leave-active {
	transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
	opacity: 0;
	transform: translateY(-4px);
}
</style>
