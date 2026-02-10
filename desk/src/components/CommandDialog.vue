<template>
	<teleport to="body">
		<transition
			enter-active-class="transition-opacity duration-200"
			leave-active-class="transition-opacity duration-200"
			enter-from-class="opacity-0"
			leave-to-class="opacity-0"
		>
			<div
				v-if="isOpen"
				class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] max-sm:pt-[5vh] bg-black/50 backdrop-blur-sm"
				@click="close"
			>
				<div
					class="w-full max-w-xl max-h-[70vh] max-sm:max-h-[80vh] mx-4 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:bg-slate-800 dark:border-slate-700"
					@click.stop
				>
					<!-- Search Input -->
					<div
						class="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700"
					>
						<Search class="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
						<input
							v-model="searchQuery"
							type="text"
							:placeholder="__('Search or type a command...')"
							class="flex-1 bg-transparent text-base text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-400"
							@input="handleSearch"
							@keydown.down.prevent="selectNext"
							@keydown.up.prevent="selectPrev"
							@keydown.enter.prevent="selectCurrent"
							@keydown.esc="close"
							ref="inputRef"
							autofocus
						/>
						<kbd
							class="px-2 py-1 text-xs font-mono rounded border border-slate-200 bg-slate-100 text-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
						>
							ESC
						</kbd>
					</div>

					<!-- Results -->
					<div class="flex-1 overflow-y-auto py-2" ref="resultsRef">
						<!-- Loading state -->
						<div
							v-if="loading"
							class="flex flex-col items-center justify-center gap-3 p-12 text-slate-500 dark:text-slate-400"
						>
							<div
								class="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin dark:border-slate-600"
							></div>
							<span>{{ __("Searching...") }}</span>
						</div>

						<!-- Empty state (no query) -->
						<div
							v-else-if="!searchQuery && !loading"
							class="flex flex-col items-center p-8 text-center"
						>
							<div class="text-5xl mb-3 opacity-50">⌘</div>
							<p class="mb-6 text-sm text-slate-500 dark:text-slate-400">
								{{ __("Start typing to search") }}
							</p>
							<div class="grid grid-cols-2 max-sm:grid-cols-1 gap-3 w-full max-w-xs">
								<div
									class="flex items-center gap-2 px-3 py-2 rounded text-xs text-slate-500 bg-slate-50 dark:bg-slate-700 dark:text-slate-300"
								>
									<kbd
										class="px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-300 bg-slate-200 text-slate-600 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-100"
									>
										new
									</kbd>
									<span>{{ __("Create new") }}</span>
								</div>
								<div
									class="flex items-center gap-2 px-3 py-2 rounded text-xs text-slate-500 bg-slate-50 dark:bg-slate-700 dark:text-slate-300"
								>
									<kbd
										class="px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-300 bg-slate-200 text-slate-600 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-100"
									>
										in
									</kbd>
									<span>{{ __("Search in") }}</span>
								</div>
								<div
									class="flex items-center gap-2 px-3 py-2 rounded text-xs text-slate-500 bg-slate-50 dark:bg-slate-700 dark:text-slate-300"
								>
									<kbd
										class="px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-300 bg-slate-200 text-slate-600 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-100"
									>
										=
									</kbd>
									<span>{{ __("Calculate") }}</span>
								</div>
								<div
									class="flex items-center gap-2 px-3 py-2 rounded text-xs text-slate-500 bg-slate-50 dark:bg-slate-700 dark:text-slate-300"
								>
									<kbd
										class="px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-300 bg-slate-200 text-slate-600 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-100"
									>
										?
									</kbd>
									<span>{{ __("Help") }}</span>
								</div>
							</div>
						</div>

						<!-- No results -->
						<div
							v-else-if="!loading && searchQuery && totalResults === 0"
							class="flex flex-col items-center p-12 text-center text-slate-500 dark:text-slate-400"
						>
							<div class="text-3xl mb-3">🔍</div>
							<p>{{ __('No results found for "{0}"', [searchQuery]) }}</p>
						</div>

						<!-- Results list (no grouping) -->
						<div v-else-if="totalResults > 0" class="flex flex-col">
							<button
								v-for="(item, index) in flatItems"
								:key="`${item.type}-${item.name}-${index}`"
								:class="[
									'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer',
									{ 'bg-slate-100 dark:bg-slate-700': selectedIndex === index },
								]"
								@click="item.type === 'help' ? showHelpDialog() : selectItem(item)"
								@mouseenter="selectedIndex = index"
								:ref="(el) => setItemRef(el, index)"
							>
								<div
									:class="[
										'w-8 h-8 flex items-center justify-center rounded-md text-base bg-slate-100 dark:bg-slate-600',
										item.type === 'new' &&
											'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
										item.type === 'calculator' &&
											'bg-blue-100 text-blue-600 font-mono font-semibold dark:bg-blue-900/40 dark:text-blue-300',
									]"
								>
									<span v-if="item.type === 'new'">+</span>
									<span v-else-if="item.type === 'calculator'">=</span>
									<span v-else>{{ getTypeIcon(item.type) }}</span>
								</div>
								<div class="min-w-0 flex-1">
									<div
										class="text-sm font-medium truncate [&_mark]:bg-yellow-200 [&_mark]:text-amber-900 [&_mark]:px-0.5 [&_mark]:rounded-sm [&_mark]:font-semibold dark:[&_mark]:bg-amber-900 dark:[&_mark]:text-yellow-200"
										v-html="item.markedLabel || item.label"
									></div>
									<div
										v-if="item.description"
										class="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate"
									>
										{{ item.description }}
									</div>
								</div>
								<div
									v-if="searchQuery"
									class="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
								>
									{{ Math.round(item.score) }}
								</div>
							</button>
						</div>
					</div>

					<!-- Footer -->
					<div
						class="flex items-center justify-center gap-6 max-sm:gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
					>
						<div
							class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
						>
							<kbd
								class="px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-300 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
							>
								↑
							</kbd>
							<kbd
								class="px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-300 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
							>
								↓
							</kbd>
							<span>{{ __("Navigate") }}</span>
						</div>
						<div
							class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
						>
							<kbd
								class="px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-300 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
							>
								↵
							</kbd>
							<span>{{ __("Select") }}</span>
						</div>
						<div
							class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
						>
							<kbd
								class="px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-300 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
							>
								esc
							</kbd>
							<span>{{ __("Close") }}</span>
						</div>
					</div>
				</div>

				<!-- Help Dialog -->
				<div
					v-if="showHelp"
					class="absolute top-1/2 left-1/2 w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white shadow-2xl dark:bg-slate-800 dark:border-slate-700"
					@click.stop
				>
					<div
						class="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700"
					>
						<h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
							{{ __("Search Help") }}
						</h3>
						<button
							@click="showHelp = false"
							class="w-7 h-7 flex items-center justify-center text-slate-500 rounded hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
						>
							×
						</button>
					</div>
					<div class="p-5">
						<table class="w-full text-sm">
							<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
								<tr>
									<td class="py-2 text-slate-900 dark:text-slate-100 w-[45%]">
										<strong>{{ __("Create a new record") }}</strong>
									</td>
									<td class="py-2 text-slate-900 dark:text-slate-100">
										<code
											class="px-1.5 py-0.5 text-[13px] font-mono rounded bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
										>
											new {{ __("[doctype name]") }}
										</code>
									</td>
								</tr>
								<tr>
									<td class="py-2 text-slate-900 dark:text-slate-100 w-[45%]">
										<strong>{{ __("List a document type") }}</strong>
									</td>
									<td class="py-2 text-slate-900 dark:text-slate-100">
										<code
											class="px-1.5 py-0.5 text-[13px] font-mono rounded bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
										>
											{{ __("[doctype name]") }}
										</code>
									</td>
								</tr>
								<tr>
									<td class="py-2 text-slate-900 dark:text-slate-100 w-[45%]">
										<strong>{{ __("Search in a document type") }}</strong>
									</td>
									<td class="py-2 text-slate-900 dark:text-slate-100">
										<code
											class="px-1.5 py-0.5 text-[13px] font-mono rounded bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
										>
											{{ __("[text] in [doctype]") }}
										</code>
									</td>
								</tr>
								<tr>
									<td class="py-2 text-slate-900 dark:text-slate-100 w-[45%]">
										<strong>{{ __("Open a report") }}</strong>
									</td>
									<td class="py-2 text-slate-900 dark:text-slate-100">
										<code
											class="px-1.5 py-0.5 text-[13px] font-mono rounded bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
										>
											{{ __("[report name]") }}
										</code>
									</td>
								</tr>
								<tr>
									<td class="py-2 text-slate-900 dark:text-slate-100 w-[45%]">
										<strong>{{ __("Open a workspace") }}</strong>
									</td>
									<td class="py-2 text-slate-900 dark:text-slate-100">
										<code
											class="px-1.5 py-0.5 text-[13px] font-mono rounded bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
										>
											{{ __("[workspace name]") }}
										</code>
									</td>
								</tr>
								<tr>
									<td class="py-2 text-slate-900 dark:text-slate-100 w-[45%]">
										<strong>{{ __("Calculate") }}</strong>
									</td>
									<td class="py-2 text-slate-900 dark:text-slate-100">
										<code
											class="px-1.5 py-0.5 text-[13px] font-mono rounded bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
										>
											(55 + 434) / 4
										</code>
										{{ __("or") }}
										<code
											class="px-1.5 py-0.5 text-[13px] font-mono rounded bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
										>
											=Math.sin(Math.PI/2)
										</code>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</transition>
	</teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { searchManager, type SearchResult } from "../utils/searchManager";
import { __ } from "../utils/translate";
import Search from "../assets/icons/Search.vue";

const emit = defineEmits<{
	close: [];
}>();

const router = useRouter();
const isOpen = ref(false);
const searchQuery = ref("");
const loading = ref(false);
const selectedIndex = ref(0);
const inputRef = ref<HTMLInputElement>();
const resultsRef = ref<HTMLDivElement>();
const showHelp = ref(false);

const allResults = ref<SearchResult[]>([]);
const itemRefs = ref<Map<number, HTMLElement>>(new Map());

// Flat list of items in display order for keyboard navigation
const flatItems = computed(() => allResults.value);

const totalResults = computed(() => flatItems.value.length);

// Set ref for item
const setItemRef = (el: any, index: number) => {
	if (el) {
		itemRefs.value.set(index, el);
	}
};

// Scroll selected item into view
const scrollToSelected = () => {
	nextTick(() => {
		const el = itemRefs.value.get(selectedIndex.value);
		if (el && resultsRef.value) {
			el.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	});
};

// Watch selected index changes
watch(selectedIndex, () => {
	scrollToSelected();
});

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const handleSearch = async () => {
	// Debounce search
	if (searchTimeout) {
		clearTimeout(searchTimeout);
	}

	searchTimeout = setTimeout(async () => {
		selectedIndex.value = 0;
		itemRefs.value.clear();

		if (!searchQuery.value.trim()) {
			allResults.value = [];
			loading.value = true;
			try {
				const recent = await searchManager.search("");
				allResults.value = recent;
			} finally {
				loading.value = false;
			}
			return;
		}

		loading.value = true;
		try {
			const results = await searchManager.search(searchQuery.value);
			allResults.value = results;
		} catch (error) {
			console.error("Search failed:", error);
			allResults.value = [];
		} finally {
			loading.value = false;
		}
	}, 150);
};

const selectNext = () => {
	if (selectedIndex.value < totalResults.value - 1) {
		selectedIndex.value++;
	}
};

const selectPrev = () => {
	if (selectedIndex.value > 0) {
		selectedIndex.value--;
	}
};

const selectCurrent = () => {
	const item = flatItems.value[selectedIndex.value];
	if (!item) return;

	if (item.type === "help") {
		showHelpDialog();
	} else {
		selectItem(item);
	}
};

const selectItem = (item: SearchResult) => {
	// Handle onclick if defined
	if (item.onclick) {
		item.onclick();
		close();
		return;
	}

	// Add to recent
	searchManager.addRecent(item.type, item.name, item.label, item.route);

	// Navigate based on route
	if (item.route) {
		const [first, ...rest] = item.route;

		if (first === "List" && rest[0]) {
			// Find app from module or use default
			const app = item.module?.toLowerCase().replace(/\s+/g, "_") || "core";
			router.push({
				name: "ListView",
				params: { app, doctype: rest[0] },
			});
		} else if (first === "Form" && rest[0] && rest[1]) {
			const app = item.module?.toLowerCase().replace(/\s+/g, "_") || "core";
			router.push({
				name: "EditForm",
				params: { app, doctype: rest[0], name: rest[1] },
			});
		} else if (first === "query-report" && rest[0]) {
			// Navigate to report
			router.push(`/reports/${rest[0]}`);
		} else if (first === "Workspaces" && rest[0]) {
			router.push({
				name: "App",
				params: { app: rest[0].toLowerCase().replace(/\s+/g, "_") },
			});
		} else if (first === "dashboard-view" && rest[0]) {
			router.push(`/dashboards/${rest[0]}`);
		} else {
			// Fallback - try to navigate directly
			router.push(`/${item.route.join("/")}`);
		}
	} else if (item.type === "doctype") {
		const app = item.module?.toLowerCase().replace(/\s+/g, "_") || "core";
		router.push({
			name: "ListView",
			params: { app, doctype: item.name },
		});
	}

	close();
};

const getTypeIcon = (type: string): string => {
	const icons: Record<string, string> = {
		doctype: "📄",
		module: "📦",
		workspace: "📋",
		report: "📊",
		page: "📑",
		dashboard: "📈",
		recent: "⏱️",
		new: "➕",
		calculator: "🔢",
		"search-in": "🔍",
		global: "🔗",
		help: "❓",
	};
	return icons[type] || "📝";
};

const showHelpDialog = () => {
	showHelp.value = true;
};

const open = () => {
	isOpen.value = true;
	searchQuery.value = "";
	selectedIndex.value = 0;
	showHelp.value = false;
	itemRefs.value.clear();
	// Load recent items on open
	handleSearch();
	nextTick(() => inputRef.value?.focus());
};

const close = () => {
	isOpen.value = false;
	showHelp.value = false;
	emit("close");
};

// Expose open method
defineExpose({
	open,
	close,
});

// Global keyboard handler
const handleGlobalKeydown = (event: KeyboardEvent) => {
	// Cmd+K or Ctrl+K to open
	if ((event.ctrlKey || event.metaKey) && event.key === "k") {
		event.preventDefault();
		if (isOpen.value) {
			close();
		} else {
			open();
		}
	}
};

onMounted(() => {
	window.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleGlobalKeydown);
	if (searchTimeout) {
		clearTimeout(searchTimeout);
	}
});
</script>
