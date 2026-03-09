<template>
	<aside
		:class="[
			'relative flex flex-col bg-background border-r border-border text-foreground h-full shrink-0 transition-all duration-200',
			sidebarStore.collapsed ? 'w-0 overflow-hidden border-r-0' : 'w-64',
		]"
	>
		<!-- Sidebar Header -->
		<div
			class="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between gap-2"
		>
			<h2
				class="text-sm font-bold text-foreground truncate flex-1"
				:title="appInfoStore.currentAppTitle || String(route.params.app || '')"
			>
				{{ appInfoStore.currentAppTitle || route.params.app }}
			</h2>
			<button
				@click="sidebarStore.toggleCollapsed()"
				class="p-1 rounded-md text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground hover:bg-muted dark:hover:bg-secondary transition-colors shrink-0"
				:title="__('Collapse sidebar')"
			>
				<svg
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
					/>
				</svg>
			</button>
		</div>

		<!-- Search -->
		<div class="px-3 py-2 border-b border-border shrink-0">
			<div class="relative">
				<svg
					class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<input
					v-model="searchQuery"
					type="text"
					:placeholder="__('Search...')"
					class="w-full rounded-md border border-border bg-secondary/60 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-slate-400 dark:placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-blue-500 transition-colors"
				/>
			</div>
		</div>

		<!-- Sidebar Content - Scrollable -->
		<div ref="sidebarContentRef" class="scroll-area flex-1 overflow-y-auto px-2 py-2">
			<!-- Loading -->
			<div v-if="loading" class="py-8 flex justify-center">
				<svg
					class="animate-spin h-5 w-5 text-muted-foreground"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
				</svg>
			</div>

			<!-- Empty -->
			<div v-else-if="allSidebarEmpty" class="py-8 text-center">
				<svg
					class="mx-auto h-8 w-8 text-muted-foreground mb-2"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
					/>
				</svg>
				<p class="text-xs text-muted-foreground">{{ __("No items") }}</p>
			</div>

			<!-- Workspace Mode: Show workspaces as sidebar items -->
			<div v-else-if="sidebarSource === 'workspaces'" class="space-y-0.5">
				<div
					v-for="item in filteredWorkspaces"
					:key="`ws-${item.name}`"
					@click="handleWorkspaceClick(item)"
					:class="[
						'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all cursor-pointer',
						isWorkspaceActive(item)
							? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
							: 'text-muted-foreground hover:bg-secondary dark:hover:bg-secondary/60 hover:text-foreground dark:hover:text-muted-foreground',
					]"
				>
					<span class="text-sm shrink-0">{{ getWorkspaceIcon(item.icon) }}</span>
					<span class="truncate">{{ item.label || item.name }}</span>
				</div>
			</div>

			<!-- Module Mode: Show modules as sidebar items -->
			<div v-else-if="sidebarSource === 'modules'" class="space-y-0.5">
				<div
					v-for="item in filteredModules"
					:key="`mod-${item.name}`"
					@click="handleModuleClick(item)"
					:class="[
						'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all cursor-pointer',
						isModuleActive(item)
							? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
							: 'text-muted-foreground hover:bg-secondary dark:hover:bg-secondary/60 hover:text-foreground dark:hover:text-muted-foreground',
					]"
				>
					<span class="text-sm shrink-0">{{ getWorkspaceIcon(item.icon) }}</span>
					<span class="truncate">{{ item.label || item.name }}</span>
				</div>
			</div>

			<!-- App Sidebar Mode: Show grouped items (DocTypes, Pages, Reports, Dashboards) -->
			<div v-else class="space-y-5">
				<!-- DocTypes -->
				<div v-if="groupedSidebar.doctypes.length">
					<h4
						class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
					>
						{{ __("DocTypes") }}
					</h4>

					<div class="space-y-0.5">
						<div
							v-for="item in groupedSidebar.doctypes"
							:key="`doctype-${item.name}`"
							@click="handleDoctypeClick(item)"
							:class="[
								'group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition-all cursor-pointer',
								isItemActive(item)
									? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
									: 'text-muted-foreground hover:bg-secondary dark:hover:bg-secondary/60 hover:text-foreground dark:hover:text-muted-foreground',
							]"
						>
							<span class="text-sm shrink-0">{{ getWorkspaceIcon(item.icon) }}</span>
							<span class="truncate">{{ item.label || item.name }}</span>
						</div>
					</div>
				</div>

				<!-- Pages -->
				<div v-if="groupedSidebar.pages.length">
					<h4
						class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
					>
						{{ __("Pages") }}
					</h4>

					<div class="space-y-0.5">
						<router-link
							v-for="item in groupedSidebar.pages"
							:key="`page-${item.name}`"
							:to="getRoute(item)"
							:class="[
								'group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition-all',
								isPageActive(item)
									? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
									: 'text-muted-foreground hover:bg-secondary dark:hover:bg-secondary/60 hover:text-foreground dark:hover:text-muted-foreground',
							]"
						>
							<span class="text-sm shrink-0">{{ getWorkspaceIcon(item.icon) }}</span>
							<span class="truncate">{{ item.label || item.name }}</span>
						</router-link>
					</div>
				</div>

				<!-- Reports -->
				<div v-if="groupedSidebar.reports.length">
					<h4
						class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
					>
						{{ __("Reports") }}
					</h4>

					<div class="space-y-0.5">
						<router-link
							v-for="item in groupedSidebar.reports"
							:key="`report-${item.name}`"
							:to="getRoute(item)"
							:class="[
								'group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition-all',
								isPageActive(item)
									? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
									: 'text-muted-foreground hover:bg-secondary dark:hover:bg-secondary/60 hover:text-foreground dark:hover:text-muted-foreground',
							]"
						>
							<span class="text-sm shrink-0">{{
								getWorkspaceIcon(item.icon) || "📊"
							}}</span>
							<span class="truncate">{{ item.label || item.name }}</span>
						</router-link>
					</div>
				</div>

				<!-- Dashboards -->
				<div v-if="groupedSidebar.dashboards.length">
					<h4
						class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
					>
						{{ __("Dashboards") }}
					</h4>

					<div class="space-y-0.5">
						<router-link
							v-for="item in groupedSidebar.dashboards"
							:key="`dashboard-${item.name}`"
							:to="getRoute(item)"
							:class="[
								'group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition-all',
								isPageActive(item)
									? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
									: 'text-muted-foreground hover:bg-secondary dark:hover:bg-secondary/60 hover:text-foreground dark:hover:text-muted-foreground',
							]"
						>
							<span class="text-sm shrink-0">{{
								getWorkspaceIcon(item.icon) || "📈"
							}}</span>
							<span class="truncate">{{ item.label || item.name }}</span>
						</router-link>
					</div>
				</div>
			</div>
		</div>
	</aside>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import type { SidebarItem } from "../data/app_sidebar";
import { computed, ref, watch, onMounted } from "vue";
import { model } from "../data/model";
import { useSidebarStore } from "../stores/sidebar";
import { useAppInfoStore } from "../stores/appInfo";
import { desktopAPI } from "../api/desktop";
import { __ } from "../utils/translate";

declare const locals: any;

const searchQuery = ref("");
const sidebarStore = useSidebarStore();
const appInfoStore = useAppInfoStore();
const route = useRoute();
const router = useRouter();
const sidebarContentRef = ref<HTMLElement | null>(null);

// Use store items instead of local state
const sidebarItems = computed(() => sidebarStore.items);
const sidebarSource = computed(() => sidebarStore.source);
const loading = computed(() => sidebarStore.loading);

/**
 * Auto-fetch sidebar items when store is empty but app param exists.
 * This handles direct URL navigation (e.g. /:app/:doctype/:name) where
 * AppView never mounts to populate the sidebar store.
 */
async function ensureSidebarLoaded() {
	const app = route.params.app as string;
	if (!app || sidebarStore.items.length > 0 || sidebarStore.loading) return;

	sidebarStore.loading = true;
	try {
		const sb = await desktopAPI.getModuleSidebar(app);
		if (sb.source === "modules") {
			// For multi-module apps, we show modules themselves as sidebar items
			sidebarStore.setSidebarItems(sb.items, "modules");
		} else {
			sidebarStore.setSidebarItems(
				sb.items,
				sb.source as "app_sidebar" | "modules" | "workspaces",
			);
		}
	} catch (error) {
		console.error("Failed to auto-fetch sidebar for", app, error);
	} finally {
		sidebarStore.loading = false;
	}
}

onMounted(() => {
	ensureSidebarLoaded();
});

// Icon mapping for workspace icons (Frappe icon names to emoji)
const iconMap: Record<string, string> = {
	home: "🏠",
	file: "📄",
	folder: "📁",
	chart: "📊",
	users: "👥",
	settings: "⚙️",
	"shopping-cart": "🛒",
	"dollar-sign": "💵",
	briefcase: "💼",
	calendar: "📅",
	clipboard: "📋",
	database: "🗄️",
	tool: "🔧",
	truck: "🚚",
	package: "📦",
	"credit-card": "💳",
	star: "⭐",
	heart: "❤️",
	book: "📚",
	education: "🎓",
	hammer: "🔨",
	default: "📁",
};

function getWorkspaceIcon(icon?: string): string {
	if (!icon) return iconMap["default"] ?? "📁";
	if (icon.length <= 2) return icon;
	return iconMap[icon.toLowerCase()] ?? iconMap["default"] ?? "📁";
}

const filteredWorkspaces = computed(() => {
	if (!searchQuery.value) return sidebarItems.value;
	const q = searchQuery.value.toLowerCase();
	return sidebarItems.value.filter((item) =>
		(item.label || item.name).toLowerCase().includes(q),
	);
});

const filteredModules = computed(() => {
	if (!searchQuery.value) return sidebarItems.value;
	const q = searchQuery.value.toLowerCase();
	return sidebarItems.value.filter((item) =>
		(item.label || item.name).toLowerCase().includes(q),
	);
});

function handleWorkspaceClick(item: SidebarItem) {
	const appName = route.params.app as string;
	const workspaceName = item.link_to || item.name;
	router.push(`/${appName}/workspace/${encodeURIComponent(workspaceName)}`);
}

function handleModuleClick(item: SidebarItem) {
	const appName = route.params.app as string;
	const moduleName = item.link_to || item.name;
	router.push(`/${appName}/module/${encodeURIComponent(moduleName)}`);
}

function isWorkspaceActive(item: SidebarItem): boolean {
	const workspaceName = item.link_to || item.name;
	return route.params.workspace === workspaceName;
}

function isModuleActive(item: SidebarItem): boolean {
	const moduleName = item.link_to || item.name;
	return route.params.module === moduleName;
}

async function handleDoctypeClick(item: SidebarItem) {
	const doctypeName = item.link_to || item.name;
	const docView = item.doc_view?.toLowerCase();

	if (docView) {
		switch (docView) {
			case "new":
				router.push({
					name: "NewForm",
					params: { app: route.params.app, doctype: doctypeName },
				});
				return;
			case "kanban":
			case "calendar":
			case "tree":
			case "report builder":
			case "dashboard":
				router.push({
					name: "ListView",
					params: { app: route.params.app, doctype: doctypeName },
				});
				return;
		}
	}

	let isSingle = false;

	if (locals?.DocType?.[doctypeName]) {
		isSingle = locals.DocType[doctypeName].issingle === 1;
	} else {
		try {
			await new Promise((resolve) => {
				model.with_doctype(doctypeName, (result: any) => {
					if (result?.docs) {
						const metaDoc = result.docs.find((doc: any) => doc.name === doctypeName);
						if (metaDoc) {
							isSingle = metaDoc.issingle === 1;
						}
					}
					resolve(true);
				});
			});
		} catch (error) {
			console.error("Failed to load doctype metadata:", error);
		}
	}

	if (isSingle) {
		router.push({
			name: "EditForm",
			params: {
				app: route.params.app,
				doctype: doctypeName,
				name: doctypeName,
			},
		});
	} else {
		router.push({
			name: "ListView",
			params: { app: route.params.app, doctype: doctypeName },
		});
	}
}

function getRoute(item: SidebarItem) {
	const type = (item.link_type || item.type || "").toLowerCase();
	const appName = route.params.app as string;
	const itemName = item.link_to || item.name;

	if (type === "page") {
		return `/${appName}/page/${encodeURIComponent(itemName)}`;
	}
	if (type === "report") {
		return `/${appName}/report/${encodeURIComponent(itemName)}`;
	}
	if (type === "dashboard") {
		return `/${appName}/dashboard/${encodeURIComponent(itemName)}`;
	}

	return "#";
}

function isItemActive(item: SidebarItem): boolean {
	const doctypeName = item.link_to || item.name;
	return route.params.doctype === doctypeName;
}

function isPageActive(item: SidebarItem): boolean {
	const itemName = item.link_to || item.name;
	const type = (item.link_type || item.type || "").toLowerCase();
	const currentPath = route.path;
	const appName = route.params.app as string;

	if (type === "page") {
		return currentPath === `/${appName}/page/${encodeURIComponent(itemName)}`;
	} else if (type === "report") {
		return currentPath === `/${appName}/report/${encodeURIComponent(itemName)}`;
	} else if (type === "dashboard") {
		return currentPath === `/${appName}/dashboard/${encodeURIComponent(itemName)}`;
	}

	return false;
}

const groupedSidebar = computed(() => {
	const q = (searchQuery.value || "").toLowerCase();

	const filtered = q
		? sidebarItems.value.filter((si) => (si.label || si.name).toLowerCase().includes(q))
		: sidebarItems.value;

	const groups = {
		doctypes: [] as SidebarItem[],
		pages: [] as SidebarItem[],
		reports: [] as SidebarItem[],
		dashboards: [] as SidebarItem[],
	};

	for (const item of filtered) {
		if (item.istable) continue;

		const t = (item.link_type || item.type || "").toLowerCase();
		if (t === "doctype") groups.doctypes.push(item);
		else if (t === "report") groups.reports.push(item);
		else if (t === "dashboard") groups.dashboards.push(item);
		else if (t === "page") groups.pages.push(item);
	}

	return groups;
});

const allSidebarEmpty = computed(() => {
	if (sidebarSource.value === "workspaces") {
		return filteredWorkspaces.value.length === 0;
	}
	if (sidebarSource.value === "modules") {
		return filteredModules.value.length === 0;
	}
	const g = groupedSidebar.value;
	return (
		g.doctypes.length === 0 &&
		g.pages.length === 0 &&
		g.reports.length === 0 &&
		g.dashboards.length === 0
	);
});

// Removed fetchSidebar - AppView now manages sidebar state via store
// Just scroll to top when route changes, and auto-fetch if empty
watch(
	() => route.params.app,
	(newApp, oldApp) => {
		if (sidebarContentRef.value) {
			sidebarContentRef.value.scrollTop = 0;
		}
		// If the app changed and sidebar is empty, auto-fetch
		if (newApp && newApp !== oldApp && sidebarStore.items.length === 0) {
			ensureSidebarLoaded();
		}
	},
);
</script>

<style scoped></style>
