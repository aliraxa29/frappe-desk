<template>
	<teleport to="body">
		<transition name="modal">
			<div v-if="isOpen" class="command-overlay" @click="close">
				<div class="command-modal" @click.stop>
					<!-- Search Input -->
					<div class="command-header">
						<svg
							class="command-search-icon"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							v-model="searchQuery"
							type="text"
							:placeholder="__('Search or type a command...')"
							class="command-input"
							@input="handleSearch"
							@keydown.down.prevent="selectNext"
							@keydown.up.prevent="selectPrev"
							@keydown.enter.prevent="selectCurrent"
							@keydown.esc="close"
							ref="inputRef"
							autofocus
						/>
						<kbd class="command-shortcut">ESC</kbd>
					</div>

					<!-- Results -->
					<div class="command-results" ref="resultsRef">
						<!-- Loading state -->
						<div v-if="loading" class="command-loading">
							<div class="command-spinner"></div>
							<span>{{ __("Searching...") }}</span>
						</div>

						<!-- Empty state (no query) -->
						<div v-else-if="!searchQuery && !loading" class="command-empty">
							<div class="command-empty-icon">⌘</div>
							<p class="command-empty-text">{{ __("Start typing to search") }}</p>
							<div class="command-hints-grid">
								<div class="command-hint-item">
									<kbd>new</kbd>
									<span>{{ __("Create new") }}</span>
								</div>
								<div class="command-hint-item">
									<kbd>in</kbd>
									<span>{{ __("Search in") }}</span>
								</div>
								<div class="command-hint-item">
									<kbd>=</kbd>
									<span>{{ __("Calculate") }}</span>
								</div>
								<div class="command-hint-item">
									<kbd>?</kbd>
									<span>{{ __("Help") }}</span>
								</div>
							</div>
						</div>

						<!-- No results -->
						<div
							v-else-if="!loading && searchQuery && totalResults === 0"
							class="command-no-results"
						>
							<div class="command-no-results-icon">🔍</div>
							<p>{{ __('No results found for "{0}"', [searchQuery]) }}</p>
						</div>

						<!-- Results groups -->
						<div v-else-if="totalResults > 0" class="command-results-container">
							<!-- Recent Group -->
							<div
								v-if="groupedResults.recent.length > 0 && !searchQuery"
								class="command-group"
							>
								<div class="command-group-label">
									<span class="command-group-icon">⏱️</span>
									{{ __("Recent") }}
								</div>
								<button
									v-for="(item, index) in groupedResults.recent"
									:key="`recent-${item.name}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex === getItemIndex('recent', index),
										},
									]"
									@click="selectItem(item)"
									@mouseenter="selectedIndex = getItemIndex('recent', index)"
									:ref="(el) => setItemRef(el, getItemIndex('recent', index))"
								>
									<div class="command-item-icon">
										{{ getTypeIcon(item.type) }}
									</div>
									<div class="command-item-content">
										<div class="command-item-label">{{ item.label }}</div>
										<div v-if="item.description" class="command-item-desc">
											{{ item.description }}
										</div>
									</div>
								</button>
							</div>

							<!-- New/Create Group -->
							<div v-if="groupedResults.new.length > 0" class="command-group">
								<div class="command-group-label">
									<span class="command-group-icon">➕</span>
									{{ __("Create New") }}
								</div>
								<button
									v-for="(item, index) in groupedResults.new"
									:key="`new-${item.name}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex === getItemIndex('new', index),
										},
									]"
									@click="selectItem(item)"
									@mouseenter="selectedIndex = getItemIndex('new', index)"
									:ref="(el) => setItemRef(el, getItemIndex('new', index))"
								>
									<div class="command-item-icon command-item-icon-new">+</div>
									<div class="command-item-content">
										<div
											class="command-item-label"
											v-html="item.markedLabel || item.label"
										></div>
										<div v-if="item.module" class="command-item-desc">
											{{ item.module }}
										</div>
									</div>
								</button>
							</div>

							<!-- Calculator Group -->
							<div v-if="groupedResults.calculator.length > 0" class="command-group">
								<div class="command-group-label">
									<span class="command-group-icon">🔢</span>
									{{ __("Calculator") }}
								</div>
								<button
									v-for="(item, index) in groupedResults.calculator"
									:key="`calc-${index}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex ===
												getItemIndex('calculator', index),
										},
									]"
									@click="selectItem(item)"
									@mouseenter="selectedIndex = getItemIndex('calculator', index)"
									:ref="
										(el) => setItemRef(el, getItemIndex('calculator', index))
									"
								>
									<div class="command-item-icon command-item-icon-calc">=</div>
									<div class="command-item-content">
										<div
											class="command-item-label"
											v-html="item.markedLabel || item.label"
										></div>
										<div class="command-item-desc">
											{{ __("Click to copy result") }}
										</div>
									</div>
								</button>
							</div>

							<!-- Search In Group -->
							<div
								v-if="groupedResults['search-in'].length > 0"
								class="command-group"
							>
								<div class="command-group-label">
									<span class="command-group-icon">🔎</span>
									{{ __("Search In") }}
								</div>
								<button
									v-for="(item, index) in groupedResults['search-in']"
									:key="`searchin-${item.name}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex === getItemIndex('search-in', index),
										},
									]"
									@click="selectItem(item)"
									@mouseenter="selectedIndex = getItemIndex('search-in', index)"
									:ref="(el) => setItemRef(el, getItemIndex('search-in', index))"
								>
									<div class="command-item-icon">🔍</div>
									<div class="command-item-content">
										<div
											class="command-item-label"
											v-html="item.markedLabel || item.label"
										></div>
									</div>
								</button>
							</div>

							<!-- DocTypes Group -->
							<div v-if="groupedResults.doctype.length > 0" class="command-group">
								<div class="command-group-label">
									<span class="command-group-icon">📄</span>
									{{ __("DocTypes") }}
								</div>
								<button
									v-for="(item, index) in groupedResults.doctype"
									:key="`dt-${item.name}-${index}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex === getItemIndex('doctype', index),
										},
									]"
									@click="selectItem(item)"
									@mouseenter="selectedIndex = getItemIndex('doctype', index)"
									:ref="(el) => setItemRef(el, getItemIndex('doctype', index))"
								>
									<div class="command-item-icon">📄</div>
									<div class="command-item-content">
										<div
											class="command-item-label"
											v-html="item.markedLabel || item.label"
										></div>
										<div v-if="item.module" class="command-item-desc">
											{{ item.module }}
										</div>
									</div>
									<div v-if="searchQuery" class="command-item-score">
										{{ Math.round(item.score) }}
									</div>
								</button>
							</div>

							<!-- Reports Group -->
							<div v-if="groupedResults.report.length > 0" class="command-group">
								<div class="command-group-label">
									<span class="command-group-icon">📊</span>
									{{ __("Reports") }}
								</div>
								<button
									v-for="(item, index) in groupedResults.report"
									:key="`report-${item.name}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex === getItemIndex('report', index),
										},
									]"
									@click="selectItem(item)"
									@mouseenter="selectedIndex = getItemIndex('report', index)"
									:ref="(el) => setItemRef(el, getItemIndex('report', index))"
								>
									<div class="command-item-icon">📊</div>
									<div class="command-item-content">
										<div
											class="command-item-label"
											v-html="item.markedLabel || item.label"
										></div>
										<div v-if="item.module" class="command-item-desc">
											{{ item.module }}
										</div>
									</div>
								</button>
							</div>

							<!-- Workspaces Group -->
							<div v-if="groupedResults.workspace.length > 0" class="command-group">
								<div class="command-group-label">
									<span class="command-group-icon">📋</span>
									{{ __("Workspaces") }}
								</div>
								<button
									v-for="(item, index) in groupedResults.workspace"
									:key="`ws-${item.name}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex === getItemIndex('workspace', index),
										},
									]"
									@click="selectItem(item)"
									@mouseenter="selectedIndex = getItemIndex('workspace', index)"
									:ref="(el) => setItemRef(el, getItemIndex('workspace', index))"
								>
									<div class="command-item-icon">📋</div>
									<div class="command-item-content">
										<div
											class="command-item-label"
											v-html="item.markedLabel || item.label"
										></div>
										<div v-if="item.module" class="command-item-desc">
											{{ item.module }}
										</div>
									</div>
								</button>
							</div>

							<!-- Pages Group -->
							<div v-if="groupedResults.page.length > 0" class="command-group">
								<div class="command-group-label">
									<span class="command-group-icon">📑</span>
									{{ __("Pages") }}
								</div>
								<button
									v-for="(item, index) in groupedResults.page"
									:key="`page-${item.name}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex === getItemIndex('page', index),
										},
									]"
									@click="selectItem(item)"
									@mouseenter="selectedIndex = getItemIndex('page', index)"
									:ref="(el) => setItemRef(el, getItemIndex('page', index))"
								>
									<div class="command-item-icon">📑</div>
									<div class="command-item-content">
										<div
											class="command-item-label"
											v-html="item.markedLabel || item.label"
										></div>
									</div>
								</button>
							</div>

							<!-- Dashboards Group -->
							<div v-if="groupedResults.dashboard.length > 0" class="command-group">
								<div class="command-group-label">
									<span class="command-group-icon">📈</span>
									{{ __("Dashboards") }}
								</div>
								<button
									v-for="(item, index) in groupedResults.dashboard"
									:key="`dash-${item.name}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex === getItemIndex('dashboard', index),
										},
									]"
									@click="selectItem(item)"
									@mouseenter="selectedIndex = getItemIndex('dashboard', index)"
									:ref="(el) => setItemRef(el, getItemIndex('dashboard', index))"
								>
									<div class="command-item-icon">📈</div>
									<div class="command-item-content">
										<div
											class="command-item-label"
											v-html="item.markedLabel || item.label"
										></div>
										<div v-if="item.module" class="command-item-desc">
											{{ item.module }}
										</div>
									</div>
								</button>
							</div>

							<!-- Global Search Group -->
							<div v-if="groupedResults.global.length > 0" class="command-group">
								<div class="command-group-label">
									<span class="command-group-icon">🌐</span>
									{{ __("Global Search") }}
								</div>
								<button
									v-for="(item, index) in groupedResults.global"
									:key="`global-${item.name}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex === getItemIndex('global', index),
										},
									]"
									@click="selectItem(item)"
									@mouseenter="selectedIndex = getItemIndex('global', index)"
									:ref="(el) => setItemRef(el, getItemIndex('global', index))"
								>
									<div class="command-item-icon">🔗</div>
									<div class="command-item-content">
										<div
											class="command-item-label"
											v-html="item.markedLabel || item.label"
										></div>
										<div v-if="item.description" class="command-item-desc">
											{{ item.description }}
										</div>
									</div>
								</button>
							</div>

							<!-- Help Group -->
							<div v-if="groupedResults.help.length > 0" class="command-group">
								<div class="command-group-label">
									<span class="command-group-icon">❓</span>
									{{ __("Help") }}
								</div>
								<button
									v-for="(item, index) in groupedResults.help"
									:key="`help-${index}`"
									:class="[
										'command-item',
										{
											'command-item-active':
												selectedIndex === getItemIndex('help', index),
										},
									]"
									@click="showHelpDialog"
									@mouseenter="selectedIndex = getItemIndex('help', index)"
									:ref="(el) => setItemRef(el, getItemIndex('help', index))"
								>
									<div class="command-item-icon">❓</div>
									<div class="command-item-content">
										<div class="command-item-label">{{ item.label }}</div>
										<div class="command-item-desc">
											{{ __("View search shortcuts and tips") }}
										</div>
									</div>
								</button>
							</div>
						</div>
					</div>

					<!-- Footer -->
					<div class="command-footer">
						<div class="command-footer-hint">
							<kbd>↑</kbd><kbd>↓</kbd>
							<span>{{ __("Navigate") }}</span>
						</div>
						<div class="command-footer-hint">
							<kbd>↵</kbd>
							<span>{{ __("Select") }}</span>
						</div>
						<div class="command-footer-hint">
							<kbd>esc</kbd>
							<span>{{ __("Close") }}</span>
						</div>
					</div>
				</div>

				<!-- Help Dialog -->
				<div v-if="showHelp" class="help-dialog" @click.stop>
					<div class="help-dialog-header">
						<h3>{{ __("Search Help") }}</h3>
						<button @click="showHelp = false" class="help-close-btn">×</button>
					</div>
					<div class="help-dialog-content">
						<table class="help-table">
							<tbody>
								<tr>
									<td>
										<strong>{{ __("Create a new record") }}</strong>
									</td>
									<td>
										<code>new {{ __("[doctype name]") }}</code>
									</td>
								</tr>
								<tr>
									<td>
										<strong>{{ __("List a document type") }}</strong>
									</td>
									<td>
										<code>{{ __("[doctype name]") }}</code>
									</td>
								</tr>
								<tr>
									<td>
										<strong>{{ __("Search in a document type") }}</strong>
									</td>
									<td>
										<code>{{ __("[text] in [doctype]") }}</code>
									</td>
								</tr>
								<tr>
									<td>
										<strong>{{ __("Open a report") }}</strong>
									</td>
									<td>
										<code>{{ __("[report name]") }}</code>
									</td>
								</tr>
								<tr>
									<td>
										<strong>{{ __("Open a workspace") }}</strong>
									</td>
									<td>
										<code>{{ __("[workspace name]") }}</code>
									</td>
								</tr>
								<tr>
									<td>
										<strong>{{ __("Calculate") }}</strong>
									</td>
									<td>
										<code>(55 + 434) / 4</code> {{ __("or") }}
										<code>=Math.sin(Math.PI/2)</code>
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

// Group order for display
const groupOrder = [
	"recent",
	"new",
	"calculator",
	"search-in",
	"doctype",
	"report",
	"workspace",
	"page",
	"dashboard",
	"global",
	"help",
] as const;

type GroupKey = (typeof groupOrder)[number] | "module";

// Group results by type
const groupedResults = computed((): Record<GroupKey, SearchResult[]> => {
	const groups: Record<GroupKey, SearchResult[]> = {
		recent: [],
		new: [],
		calculator: [],
		"search-in": [],
		doctype: [],
		report: [],
		workspace: [],
		page: [],
		dashboard: [],
		global: [],
		help: [],
		module: [],
	};

	for (const item of allResults.value) {
		const type = item.type || "page";
		if (type in groups) {
			groups[type as GroupKey].push(item);
		}
	}

	return groups;
});

// Compute flat list of items in display order for keyboard navigation
const flatItems = computed(() => {
	const items: SearchResult[] = [];
	for (const group of groupOrder) {
		items.push(...(groupedResults.value[group] || []));
	}
	return items;
});

const totalResults = computed(() => flatItems.value.length);

// Get item index in flat list
const getItemIndex = (type: string, indexInGroup: number): number => {
	let index = 0;
	for (const group of groupOrder) {
		if (group === type) {
			return index + indexInGroup;
		}
		index += (groupedResults.value[group] || []).length;
	}
	return index;
};

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
	searchManager.clearCache();
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

<style scoped>
/* Overlay */
.command-overlay {
	position: fixed;
	inset: 0;
	z-index: 9999;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	padding-top: 10vh;
	background-color: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(4px);
}

/* Modal */
.command-modal {
	width: 100%;
	max-width: 640px;
	max-height: 70vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border-radius: 12px;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	animation: command-slide-up 0.2s ease-out;

	/* Light mode */
	background-color: #ffffff;
	border: 1px solid #e2e8f0;
}

:global(html.dark) .command-modal {
	background-color: #1e293b;
	border-color: #334155;
}

@keyframes command-slide-up {
	from {
		opacity: 0;
		transform: translateY(-20px) scale(0.95);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

/* Header */
.command-header {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 16px;
	border-bottom: 1px solid #e2e8f0;
}

:global(html.dark) .command-header {
	border-bottom-color: #334155;
}

.command-search-icon {
	width: 20px;
	height: 20px;
	flex-shrink: 0;
	color: #94a3b8;
}

.command-input {
	flex: 1;
	border: none;
	outline: none;
	font-size: 16px;
	background: transparent;
	color: #0f172a;
}

:global(html.dark) .command-input {
	color: #f1f5f9;
}

.command-input::placeholder {
	color: #94a3b8;
}

.command-shortcut {
	padding: 4px 8px;
	font-size: 12px;
	font-family: monospace;
	border-radius: 4px;
	background-color: #f1f5f9;
	border: 1px solid #e2e8f0;
	color: #64748b;
}

:global(html.dark) .command-shortcut {
	background-color: #334155;
	border-color: #475569;
	color: #94a3b8;
}

/* Results */
.command-results {
	flex: 1;
	overflow-y: auto;
	padding: 8px 0;
}

.command-results::-webkit-scrollbar {
	width: 6px;
}

.command-results::-webkit-scrollbar-track {
	background: transparent;
}

.command-results::-webkit-scrollbar-thumb {
	background-color: #cbd5e1;
	border-radius: 3px;
}

:global(html.dark) .command-results::-webkit-scrollbar-thumb {
	background-color: #475569;
}

/* Loading */
.command-loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48px;
	gap: 12px;
	color: #64748b;
}

.command-spinner {
	width: 24px;
	height: 24px;
	border: 2px solid #e2e8f0;
	border-top-color: #3b82f6;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

:global(html.dark) .command-spinner {
	border-color: #475569;
	border-top-color: #3b82f6;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* Empty state */
.command-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 32px;
	text-align: center;
}

.command-empty-icon {
	font-size: 48px;
	margin-bottom: 12px;
	opacity: 0.5;
}

.command-empty-text {
	margin: 0 0 24px;
	color: #64748b;
	font-size: 14px;
}

.command-hints-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px;
	width: 100%;
	max-width: 300px;
}

.command-hint-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	border-radius: 6px;
	font-size: 13px;
	color: #64748b;
	background-color: #f8fafc;
}

:global(html.dark) .command-hint-item {
	background-color: #334155;
	color: #94a3b8;
}

.command-hint-item kbd {
	padding: 2px 6px;
	font-size: 11px;
	font-family: monospace;
	border-radius: 3px;
	background-color: #e2e8f0;
	border: 1px solid #cbd5e1;
	color: #475569;
}

:global(html.dark) .command-hint-item kbd {
	background-color: #475569;
	border-color: #64748b;
	color: #e2e8f0;
}

/* No results */
.command-no-results {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 48px;
	text-align: center;
	color: #64748b;
}

.command-no-results-icon {
	font-size: 32px;
	margin-bottom: 12px;
}

/* Results container */
.command-results-container {
	display: flex;
	flex-direction: column;
}

/* Group */
.command-group {
	padding: 4px 0;
}

.command-group-label {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 16px 4px;
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: #64748b;
}

:global(html.dark) .command-group-label {
	color: #94a3b8;
}

.command-group-icon {
	font-size: 12px;
}

/* Item */
.command-item {
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	padding: 10px 16px;
	border: none;
	background: transparent;
	text-align: left;
	cursor: pointer;
	transition: background-color 0.1s;
	color: #0f172a;
}

:global(html.dark) .command-item {
	color: #f1f5f9;
}

.command-item:hover,
.command-item-active {
	background-color: #f1f5f9;
}

:global(html.dark) .command-item:hover,
:global(html.dark) .command-item-active {
	background-color: #334155;
}

.command-item-icon {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 6px;
	font-size: 16px;
	flex-shrink: 0;
	background-color: #f1f5f9;
}

:global(html.dark) .command-item-icon {
	background-color: #475569;
}

.command-item-icon-new {
	background-color: #dcfce7;
	color: #16a34a;
}

:global(html.dark) .command-item-icon-new {
	background-color: #166534;
	color: #4ade80;
}

.command-item-icon-calc {
	background-color: #dbeafe;
	color: #2563eb;
	font-family: monospace;
	font-weight: bold;
}

:global(html.dark) .command-item-icon-calc {
	background-color: #1e40af;
	color: #60a5fa;
}

.command-item-content {
	flex: 1;
	min-width: 0;
}

.command-item-label {
	font-size: 14px;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.command-item-label :deep(mark),
.command-item-label :deep(strong) {
	background-color: #fef08a;
	color: #854d0e;
	padding: 0 2px;
	border-radius: 2px;
	font-weight: 600;
}

:global(html.dark) .command-item-label :deep(mark),
:global(html.dark) .command-item-label :deep(strong) {
	background-color: #854d0e;
	color: #fef08a;
}

.command-item-desc {
	font-size: 12px;
	color: #64748b;
	margin-top: 2px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

:global(html.dark) .command-item-desc {
	color: #94a3b8;
}

.command-item-score {
	font-size: 11px;
	padding: 2px 6px;
	border-radius: 4px;
	background-color: #f1f5f9;
	color: #64748b;
	flex-shrink: 0;
}

:global(html.dark) .command-item-score {
	background-color: #475569;
	color: #94a3b8;
}

/* Footer */
.command-footer {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 24px;
	padding: 12px 16px;
	border-top: 1px solid #e2e8f0;
	background-color: #f8fafc;
}

:global(html.dark) .command-footer {
	border-top-color: #334155;
	background-color: #0f172a;
}

.command-footer-hint {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12px;
	color: #64748b;
}

:global(html.dark) .command-footer-hint {
	color: #94a3b8;
}

.command-footer-hint kbd {
	padding: 2px 6px;
	font-size: 11px;
	font-family: monospace;
	border-radius: 3px;
	background-color: #e2e8f0;
	border: 1px solid #cbd5e1;
	color: #475569;
}

:global(html.dark) .command-footer-hint kbd {
	background-color: #334155;
	border-color: #475569;
	color: #94a3b8;
}

/* Help Dialog */
.help-dialog {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 90%;
	max-width: 500px;
	border-radius: 12px;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	background-color: #ffffff;
	border: 1px solid #e2e8f0;
}

:global(html.dark) .help-dialog {
	background-color: #1e293b;
	border-color: #334155;
}

.help-dialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid #e2e8f0;
}

:global(html.dark) .help-dialog-header {
	border-bottom-color: #334155;
}

.help-dialog-header h3 {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: #0f172a;
}

:global(html.dark) .help-dialog-header h3 {
	color: #f1f5f9;
}

.help-close-btn {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	font-size: 20px;
	color: #64748b;
	cursor: pointer;
	border-radius: 4px;
}

.help-close-btn:hover {
	background-color: #f1f5f9;
}

:global(html.dark) .help-close-btn:hover {
	background-color: #334155;
}

.help-dialog-content {
	padding: 20px;
}

.help-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 14px;
}

.help-table td {
	padding: 10px 0;
	border-bottom: 1px solid #e2e8f0;
	color: #0f172a;
}

:global(html.dark) .help-table td {
	border-bottom-color: #334155;
	color: #f1f5f9;
}

.help-table tr:last-child td {
	border-bottom: none;
}

.help-table td:first-child {
	width: 45%;
}

.help-table code {
	padding: 2px 6px;
	font-size: 13px;
	font-family: monospace;
	border-radius: 4px;
	background-color: #f1f5f9;
	color: #0f172a;
}

:global(html.dark) .help-table code {
	background-color: #334155;
	color: #f1f5f9;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
	transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
	.command-overlay {
		padding-top: 5vh;
	}

	.command-modal {
		margin: 0 16px;
		max-height: 80vh;
	}

	.command-footer {
		gap: 12px;
	}

	.command-hints-grid {
		grid-template-columns: 1fr;
	}
}
</style>
