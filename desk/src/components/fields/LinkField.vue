<template>
	<div class="mb-4 flex flex-col relative">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium mb-1 text-sm text-slate-700 dark:text-slate-300"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-500 ml-1">*</span>
		</label>

		<div class="relative">
			<div
				class="flex items-center gap-1 border border-[#ddd] dark:border-slate-700 rounded bg-white dark:bg-slate-800 overflow-hidden transition-colors duration-200 focus-within:border-[#0066cc] focus-within:shadow-[0_0_0_3px_rgba(0,102,204,0.1)]"
			>
				<input
					autocomplete="off"
					:id="`field-${field.fieldname}`"
					v-model="searchText"
					:readonly="field.read_only"
					:required="field.reqd"
					:placeholder="`Select a ${field.options || 'record'}...`"
					type="text"
					class="flex-1 px-3 py-2 outline-none text-[0.95rem] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-200 read-only:bg-gray-100 read-only:dark:bg-slate-700 read-only:cursor-not-allowed"
					@input="handleInput"
					@focus="handleFocus"
					@keydown="handleKeydown"
					@blur="handleBlur"
				/>
				<button
					v-if="currentValue && !field.read_only"
					class="px-2 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
					title="Open"
					@click="openDocument"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</button>
				<button
					v-if="currentValue && !field.read_only"
					class="px-2 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
					title="Clear"
					@click="clearValue"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
				<div v-if="loading" class="px-3 py-2">
					<div
						class="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"
					></div>
				</div>
			</div>

			<!-- Dropdown Options -->
			<div
				v-if="showDropdown"
				class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-[#ddd] dark:border-slate-700 rounded shadow-lg z-180 max-h-87.5 overflow-y-auto scroll-area"
			>
				<!-- Loading State -->
				<div v-if="loading" class="p-3 text-center text-sm text-slate-500">
					<div class="flex items-center justify-center gap-2">
						<div
							class="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"
						></div>
						{{ __("Loading options...") }}
					</div>
				</div>

				<!-- Options List -->
				<div v-else-if="allItems.length > 0">
					<!-- Search Results -->
					<button
						v-for="(item, idx) in filteredResults"
						:key="`result-${item.value}`"
						class="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0 cursor-pointer"
						:class="
							selectedIdx === idx
								? 'bg-blue-100 text-blue-900 dark:text-slate-600 hover:dark:text-white'
								: 'text-slate-700 dark:text-slate-200'
						"
						@click="selectItem(item)"
						@mouseenter="selectedIdx = idx"
					>
						<div class="font-medium">{{ item.label }}</div>
						<div
							v-if="item.description"
							class="text-xs text-slate-500 mt-0.5 dark:text-white"
						>
							{{ item.description }}
						</div>
					</button>

					<div
						v-if="actionItems.length > 0"
						class="border-t border-slate-200 dark:border-slate-700"
					>
						<button
							v-for="(item, idx) in actionItems"
							:key="`action-${item.value}`"
							type="button"
							class="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0 text-slate-600 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
							:class="
								selectedIdx === filteredResults.length + idx
									? 'bg-blue-100 text-blue-900 dark:text-slate-600 hover:dark:text-white'
									: ''
							"
							@click="selectItem(item)"
							@mouseenter="selectedIdx = filteredResults.length + idx"
						>
							<span v-if="item.icon" class="text-base">{{ item.icon }}</span>
							<span>{{ item.label }}</span>
						</button>
					</div>
				</div>

				<!-- No Results -->
				<div
					v-else-if="!loading && searchText"
					class="p-3 text-center text-sm text-slate-500"
				>
					{{ __(`No results for ${searchText}`) }}
				</div>

				<!-- Empty State Hint -->
				<div v-else class="p-3 text-center text-sm text-slate-500">
					{{ __("Start typing to search...") }}
				</div>
			</div>
		</div>

		<small v-if="field.description" class="block text-gray-600 mt-1 text-[0.85rem]">{{
			field.description
		}}</small>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import type { Field, FormContext } from "../../types";
import { desk } from "../../utils/desk";
import { __ } from "../../utils/translate";

interface Props {
	field: Field;
	ctx: FormContext;
}

interface LinkItem {
	label: string;
	value: string;
	description?: string;
	html?: string;
	action?: (item: LinkItem) => void;
	icon?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	fieldChange: [value: any];
}>();

const searchText = ref("");
const showDropdown = ref(false);
const resultItems = ref<LinkItem[]>([]);
const loading = ref(false);
const selectedIdx = ref(0);

let searchTimeout: NodeJS.Timeout | null = null;

const currentValue = computed(() => props.ctx.doc?.[props.field.fieldname] as string);

const filteredResults = computed(() => {
	if (!searchText.value) return resultItems.value;
	return resultItems.value.filter(
		(item) =>
			item.label?.toLowerCase().includes(searchText.value.toLowerCase()) ||
			item.description?.toLowerCase().includes(searchText.value.toLowerCase()),
	);
});

const actionItems = computed(() => {
	const actions: LinkItem[] = [];
	actions.push({
		label: __("Create a new {0}", [props.field.options]),
		value: "create_new__link_option",
		icon: "+",
		action: () => createNewDoc(),
	});
	actions.push({
		label: __("Advanced Search"),
		value: "advanced_search__link_option",
		icon: "🔍",
		action: () => openAdvancedSearch(),
	});
	return actions;
});

const allItems = computed(() => [...filteredResults.value, ...actionItems.value]);

async function fetchOptions(search: string = "") {
	if (!props.field.options) {
		loading.value = false;
		return;
	}

	loading.value = true;
	try {
		const linkedDoctype = props.field.options;

		const response = await desk.call({
			method: "frappe.desk.search.search_link",
			args: {
				doctype: linkedDoctype,
				txt: search,
				limit_page_length: 20,
			},
		});
		if (response.exc) {
			console.error("Server error:", response.exc);
			resultItems.value = [];
			loading.value = false;
			return;
		}

		const data = response.message || [];

		if (Array.isArray(data)) {
			resultItems.value = data
				.filter((item: any) => {
					return item && !item?.value?.includes("__link_option");
				})
				.map((item: any) => {
					if (Array.isArray(item)) {
						return {
							label: item[1] || item[0],
							value: item[0],
							description: item[1] || "",
						};
					}
					if (typeof item === "object" && item !== null) {
						return {
							label: item.label || item.value || item.name || "",
							value: item.value || item.name || "",
							description: item.description || "",
						};
					}
					if (typeof item === "string") {
						return {
							label: item,
							value: item,
							description: "",
						};
					}
					return null;
				})
				.filter((item: any) => item && item.value);
		} else {
			console.warn("Response message is not an array:", data);
			resultItems.value = [];
		}

		selectedIdx.value = 0;
	} catch (error) {
		console.error("Failed to fetch linked options:", error);
		resultItems.value = [];
	} finally {
		loading.value = false;
	}
}

function handleInput(e: Event) {
	const value = (e.target as HTMLInputElement).value;
	searchText.value = value;
	selectedIdx.value = 0;

	// Debounce search
	if (searchTimeout) clearTimeout(searchTimeout);
	searchTimeout = setTimeout(() => {
		fetchOptions(value);
		showDropdown.value = true;
	}, 300);
}

function handleFocus() {
	if (props.field.read_only) {
		return;
	}
	showDropdown.value = true;
	if (!resultItems.value.length && !loading.value) {
		fetchOptions("");
	}
}

function handleBlur() {
	// Delay to allow click on dropdown item to register
	setTimeout(() => {
		if (!showDropdown.value) return;
		showDropdown.value = false;
	}, 250);
}

function handleKeydown(e: KeyboardEvent) {
	if (!showDropdown.value) return;

	switch (e.key) {
		case "ArrowDown":
			e.preventDefault();
			selectedIdx.value = Math.min(selectedIdx.value + 1, allItems.value.length - 1);
			break;
		case "ArrowUp":
			e.preventDefault();
			selectedIdx.value = Math.max(selectedIdx.value - 1, 0);
			break;
		case "Enter":
			e.preventDefault();
			if (allItems.value[selectedIdx.value]) {
				selectItem(allItems.value[selectedIdx.value]);
			}
			break;
		case "Escape":
			e.preventDefault();
			showDropdown.value = false;
			break;
	}
}

function selectItem(item: LinkItem) {
	if (item.action) {
		item.action(item);
	} else {
		props.ctx.set_value(props.field.fieldname, item.value);
		searchText.value = item.label;
		showDropdown.value = false;
		emit("fieldChange", item.value);
	}
}

function clearValue() {
	props.ctx.set_value(props.field.fieldname, "");
	searchText.value = "";
	showDropdown.value = false;
	emit("fieldChange", "");
}

function openDocument() {
	if (!currentValue.value || !props.field.options) return;
	// Open the document in a new tab
	const url = `/app/${props.field.options}/${encodeURIComponent(currentValue.value)}`;
	window.open(url, "_blank");
}

function createNewDoc() {
	// Open form to create new document
	console.log("Create new", props.field.options);
	// TODO: Implement navigation to create new document
}

function openAdvancedSearch() {
	// Open advanced search dialog
	console.log("Advanced search for", props.field.options);
	// TODO: Implement advanced search modal
}

// Initialize with current value
onMounted(() => {
	const current = currentValue.value;
	if (current) {
		searchText.value = current;
	}
});

// Watch for external changes (discard, reload, etc)
watch(currentValue, (newVal) => {
	if (newVal) {
		searchText.value = newVal;
	} else {
		searchText.value = "";
	}
});

onBeforeUnmount(() => {
	if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<style scoped>
/* Smooth transitions for dropdown animations */
:deep(.dropdown-enter-active, .dropdown-leave-active) {
	transition: all 0.2s ease;
}

:deep(.dropdown-enter-from, .dropdown-leave-to) {
	opacity: 0;
	transform: translateY(-4px);
}

/* Custom scrollbar styling for dropdown */
:deep(.dropdown::-webkit-scrollbar) {
	width: 6px;
}

:deep(.dropdown::-webkit-scrollbar-track) {
	background: #f1f5f9;
}

:deep(.dropdown::-webkit-scrollbar-thumb) {
	background: #cbd5e1;
	border-radius: 3px;
}

:deep(.dropdown::-webkit-scrollbar-thumb:hover) {
	background: #94a3b8;
}

/* Focus state - match other form fields */
input:focus {
	border-color: #0066cc !important;
	box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}
</style>
