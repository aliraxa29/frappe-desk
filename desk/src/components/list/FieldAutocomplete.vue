<template>
	<div class="relative" ref="containerRef">
		<label
			v-if="label"
			class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
		>
			{{ label }}
		</label>

		<div class="relative">
			<div
				class="flex items-center gap-1 border rounded-lg bg-white dark:bg-slate-800 overflow-hidden transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-500/20"
				:class="[
					showDropdown
						? 'border-blue-500 dark:border-blue-400'
						: 'border-slate-300 dark:border-slate-600',
				]"
			>
				<input
					ref="inputRef"
					v-model="searchText"
					:placeholder="placeholder"
					type="text"
					autocomplete="off"
					class="flex-1 px-3 py-2 text-sm outline-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
					@input="handleInput"
					@focus="handleFocus"
					@blur="handleBlur"
				/>

				<button
					v-if="selectedItem && !disabled"
					type="button"
					class="px-2 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
					title="Clear"
					@mousedown.prevent="clearSelection"
				>
					<Close class="w-4 h-4" />
				</button>

				<button
					type="button"
					class="px-2 py-2 text-slate-400 transition-transform cursor-pointer"
					:class="{ 'rotate-180': showDropdown }"
					@mousedown.prevent="toggleDropdown"
				>
					<ChevronDown class="w-4 h-4" />
				</button>
			</div>

			<Transition name="dropdown">
				<div
					v-if="showDropdown"
					class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto scroll-area"
				>
					<div
						v-if="items.length === 0"
						class="p-3 text-center text-sm text-slate-500 dark:text-slate-400"
					>
						No items available
					</div>
					<div
						v-else-if="filteredItems.length === 0"
						class="p-3 text-center text-sm text-slate-500 dark:text-slate-400"
					>
						No items matching "{{ searchText }}"
					</div>
					<button
						v-for="(item, idx) in filteredItems"
						:key="item.value"
						type="button"
						class="w-full px-3 py-2 text-left text-sm transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0 cursor-pointer"
						:class="[
							selectedIdx === idx
								? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
								: 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50',
						]"
						@click="selectItem(item)"
						@mouseenter="selectedIdx = idx"
					>
						<div class="font-medium truncate">{{ item.label }}</div>
					</button>
				</div>
			</Transition>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import Close from "../../icons/Close.vue";
import ChevronDown from "../../icons/ChevronDown.vue";

interface AutocompleteItem {
	label: string;
	value: string;
}

interface Props {
	items: AutocompleteItem[];
	modelValue?: string;
	label?: string;
	placeholder?: string;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	label: "",
	placeholder: "Search...",
	disabled: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: string];
}>();

const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const searchText = ref("");
const showDropdown = ref(false);
const selectedIdx = ref(0);

const selectedItem = computed(() => {
	if (!props.modelValue) return null;
	return props.items.find((item) => item.value === props.modelValue) || null;
});

const filteredItems = computed(() => {
	const query = searchText.value.toLowerCase().trim();
	if (!query) return props.items;

	return props.items.filter((item) => {
		const label = (item.label || "").toLowerCase();
		const value = (item.value || "").toLowerCase();
		return label.includes(query) || value.includes(query);
	});
});

watch(selectedItem, (item) => {
	if (item) {
		searchText.value = item.label;
	}
});

watch(
	() => props.modelValue,
	(val) => {
		if (val && selectedItem.value) {
			searchText.value = selectedItem.value.label;
		} else if (!val) {
			searchText.value = "";
		}
	},
	{ immediate: true },
);

function handleInput() {
	selectedIdx.value = 0;
	if (!showDropdown.value) {
		showDropdown.value = true;
	}
}

function handleFocus() {
	if (props.disabled) return;
	showDropdown.value = true;
	if (inputRef.value) {
		inputRef.value.select();
	}
}

function handleBlur(e: FocusEvent) {
	const relatedTarget = e.relatedTarget as HTMLElement;
	if (containerRef.value?.contains(relatedTarget)) {
		return;
	}

	setTimeout(() => {
		showDropdown.value = false;
		if (selectedItem.value) {
			searchText.value = selectedItem.value.label;
		} else {
			searchText.value = "";
		}
	}, 150);
}

function toggleDropdown() {
	if (props.disabled) return;
	showDropdown.value = !showDropdown.value;
	if (showDropdown.value) {
		inputRef.value?.focus();
	}
}

function selectItem(item: AutocompleteItem) {
	searchText.value = item.label;
	emit("update:modelValue", item.value);
	showDropdown.value = false;
}

function clearSelection() {
	searchText.value = "";
	emit("update:modelValue", "");
	inputRef.value?.focus();
}

function handleClickOutside(e: MouseEvent) {
	if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
		showDropdown.value = false;
	}
}

onMounted(() => {
	document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
	document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
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
