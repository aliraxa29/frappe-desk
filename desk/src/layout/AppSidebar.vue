<template>
	<aside
		class="fixed left-0 top-14 bottom-0 w-64 flex flex-col bg-white dark:bg-gray-950 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 z-30"
	>
		<!-- Sidebar Header -->
		<div class="px-6 py-4 border-b border-slate-200 dark:border-gray-800 shrink-0">
			<h2 class="text-lg font-semibold text-slate-800 dark:text-white truncate">
				{{ route.params.app }}
			</h2>
		</div>

		<!-- Search -->
		<div class="px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
			<input
				v-model="searchQuery"
				type="text"
				placeholder="Search…"
				class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
			/>
		</div>

		<!-- Sidebar Content - Scrollable -->
		<div ref="sidebarContentRef" class="flex-1 overflow-y-auto px-2 py-3 dark:bg-gray-950">
			<!-- Loading -->
			<div v-if="loading" class="py-10 text-center text-sm text-slate-400">Loading...</div>

			<!-- Empty -->
			<div v-else-if="allSidebarEmpty" class="py-10 text-center text-sm text-slate-400">
				No sidebar items
			</div>

			<!-- Workspace Mode: Show workspaces as sidebar items -->
			<div v-else-if="sidebarSource === 'workspaces'" class="space-y-1">
				<div
					v-for="item in filteredWorkspaces"
					:key="`ws-${item.name}`"
					@click="handleWorkspaceClick(item)"
					:class="[
						'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition cursor-pointer',
						isWorkspaceActive(item)
							? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
							: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
					]"
				>
					<span class="text-base">{{ getWorkspaceIcon(item.icon) }}</span>
					<span class="truncate">{{ item.label || item.name }}</span>
				</div>
			</div>

			<!-- Module Mode: Show modules as sidebar items -->
			<div v-else-if="sidebarSource === 'modules'" class="space-y-1">
				<div
					v-for="item in filteredModules"
					:key="`mod-${item.name}`"
					@click="handleModuleClick(item)"
					:class="[
						'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition cursor-pointer',
						isModuleActive(item)
							? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
							: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
					]"
				>
					<span class="text-base">{{ getWorkspaceIcon(item.icon) }}</span>
					<span class="truncate">{{ item.label || item.name }}</span>
				</div>
			</div>

			<!-- App Sidebar Mode: Show grouped items (DocTypes, Pages, Reports, Dashboards) -->
			<div v-else class="space-y-6">
				<!-- DocTypes -->
				<div v-if="groupedSidebar.doctypes.length">
					<h4
						class="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
					>
						DocTypes
					</h4>

					<div
						v-for="item in groupedSidebar.doctypes"
						:key="`doctype-${item.name}`"
						@click="handleDoctypeClick(item)"
						:class="[
							'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition cursor-pointer',
							isItemActive(item)
								? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
								: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
						]"
					>
						<span class="text-base">{{ getWorkspaceIcon(item.icon) }}</span>
						<span class="truncate">{{ item.label || item.name }}</span>
					</div>
				</div>

				<!-- Pages -->
				<div v-if="groupedSidebar.pages.length">
					<h4
						class="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
					>
						Pages
					</h4>

					<router-link
						v-for="item in groupedSidebar.pages"
						:key="`page-${item.name}`"
						:to="getRoute(item)"
						:class="[
							'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
							isPageActive(item)
								? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
								: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
						]"
					>
						<span class="text-base">{{ getWorkspaceIcon(item.icon) }}</span>
						<span class="truncate">{{ item.label || item.name }}</span>
					</router-link>
				</div>

				<!-- Reports -->
				<div v-if="groupedSidebar.reports.length">
					<h4
						class="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
					>
						Reports
					</h4>

					<router-link
						v-for="item in groupedSidebar.reports"
						:key="`report-${item.name}`"
						:to="getRoute(item)"
						:class="[
							'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
							isPageActive(item)
								? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
								: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
						]"
					>
						<span class="text-base">{{ getWorkspaceIcon(item.icon) || "📊" }}</span>
						<span class="truncate">{{ item.label || item.name }}</span>
					</router-link>
				</div>

				<!-- Dashboards -->
				<div v-if="groupedSidebar.dashboards.length">
					<h4
						class="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
					>
						Dashboards
					</h4>

					<router-link
						v-for="item in groupedSidebar.dashboards"
						:key="`dashboard-${item.name}`"
						:to="getRoute(item)"
						:class="[
							'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
							isPageActive(item)
								? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
								: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
						]"
					>
						<span class="text-base">{{ getWorkspaceIcon(item.icon) || "📈" }}</span>
						<span class="truncate">{{ item.label || item.name }}</span>
					</router-link>
				</div>
			</div>
		</div>
	</aside>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import type { SidebarItem } from "../data/app_sidebar";
import { computed, onMounted, ref, watch } from "vue";
import { desktopAPI } from "../api/desktop";
import { model } from "../data/model";
import { useSidebarStore } from "../stores/sidebar";

declare const locals: any;

const searchQuery = ref("");
const sidebarStore = useSidebarStore();
const route = useRoute();
const router = useRouter();
const sidebarContentRef = ref<HTMLElement | null>(null);

// Use store items instead of local state
const sidebarItems = computed(() => sidebarStore.items);
const sidebarSource = computed(() => sidebarStore.source);
const loading = computed(() => sidebarStore.loading);

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
// Just scroll to top when route changes
watch(
	() => route.params.app,
	() => {
		if (sidebarContentRef.value) {
			sidebarContentRef.value.scrollTop = 0;
		}
	},
);
</script>

<style scoped></style>
