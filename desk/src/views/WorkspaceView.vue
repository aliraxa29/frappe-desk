<template>
	<div class="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900 ml-64">
		<!-- Header -->
		<header
			class="bg-white dark:bg-gray-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4"
		>
			<div class="flex items-center gap-3">
				<span v-if="workspaceContent.icon" class="text-2xl">{{
					getIcon(workspaceContent.icon)
				}}</span>
				<div>
					<h1 class="text-xl font-semibold text-slate-900 dark:text-white">
						{{
							workspaceContent.label ||
							workspaceContent.name ||
							route.params.workspace
						}}
					</h1>
				</div>
			</div>
		</header>

		<!-- Loading State -->
		<div v-if="loading" class="flex-1 flex items-center justify-center">
			<div class="text-slate-400 dark:text-slate-500">Loading workspace...</div>
		</div>

		<!-- Workspace Content -->
		<div v-else class="flex-1 p-6 space-y-8">
			<!-- Shortcuts Section -->
			<section v-if="workspaceContent.shortcuts.length > 0">
				<h2
					class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4"
				>
					Shortcuts
				</h2>
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
					<div
						v-for="shortcut in workspaceContent.shortcuts"
						:key="`shortcut-${shortcut.name}`"
						@click="handleShortcutClick(shortcut)"
						class="group cursor-pointer rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all"
					>
						<div class="flex items-center gap-3">
							<span
								class="text-xl"
								:class="
									shortcut.color
										? `text-${shortcut.color}-500`
										: 'text-slate-600 dark:text-slate-400'
								"
							>
								{{ getIcon(shortcut.icon) || "📄" }}
							</span>
							<span class="font-medium text-slate-800 dark:text-slate-200 truncate">
								{{ shortcut.label }}
							</span>
						</div>
						<p
							v-if="shortcut.type"
							class="mt-2 text-xs text-slate-500 dark:text-slate-400"
						>
							{{ shortcut.type }}
						</p>
					</div>
				</div>
			</section>

			<!-- Cards/Links Section -->
			<section v-if="workspaceContent.cards.length > 0">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<div
						v-for="card in workspaceContent.cards"
						:key="`card-${card.label}`"
						class="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
					>
						<!-- Card Header -->
						<div
							class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-gray-850"
						>
							<div class="flex items-center gap-2">
								<span v-if="card.icon" class="text-lg">{{
									getIcon(card.icon)
								}}</span>
								<h3 class="font-semibold text-slate-800 dark:text-slate-200">
									{{ card.label }}
								</h3>
							</div>
						</div>

						<!-- Card Links -->
						<div class="divide-y divide-slate-100 dark:divide-slate-700">
							<div
								v-for="link in card.links"
								:key="`link-${link.name}`"
								@click="handleLinkClick(link)"
								class="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-gray-750 cursor-pointer transition"
							>
								<span class="text-base text-slate-500">{{
									getIcon(link.icon) || "📄"
								}}</span>
								<div class="flex-1 min-w-0">
									<span
										class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate block"
									>
										{{ link.label }}
									</span>
									<span
										v-if="link.description"
										class="text-xs text-slate-500 dark:text-slate-400 truncate block"
									>
										{{ link.description }}
									</span>
								</div>
								<svg
									class="w-4 h-4 text-slate-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Charts Section -->
			<section v-if="workspaceContent.charts.length > 0">
				<h2
					class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4"
				>
					Charts
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div
						v-for="chart in workspaceContent.charts"
						:key="`chart-${chart.name}`"
						class="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
					>
						<h3 class="font-medium text-slate-800 dark:text-slate-200 mb-3">
							{{ chart.label }}
						</h3>
						<div
							class="h-40 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-slate-400"
						>
							<span>📊 {{ chart.chart_name }}</span>
						</div>
					</div>
				</div>
			</section>

			<!-- Number Cards Section -->
			<section v-if="workspaceContent.number_cards.length > 0">
				<h2
					class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4"
				>
					Stats
				</h2>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div
						v-for="nc in workspaceContent.number_cards"
						:key="`nc-${nc.name}`"
						class="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
					>
						<div class="text-sm text-slate-500 dark:text-slate-400">
							{{ nc.label }}
						</div>
						<div class="text-2xl font-bold text-slate-800 dark:text-white mt-1">
							--
						</div>
					</div>
				</div>
			</section>

			<!-- Quick Lists Section -->
			<section v-if="workspaceContent.quick_lists.length > 0">
				<h2
					class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4"
				>
					Quick Lists
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div
						v-for="ql in workspaceContent.quick_lists"
						:key="`ql-${ql.name}`"
						@click="handleQuickListClick(ql)"
						class="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm cursor-pointer hover:shadow-md transition"
					>
						<h3 class="font-medium text-slate-800 dark:text-slate-200">
							{{ ql.label }}
						</h3>
						<p class="text-sm text-slate-500 mt-1">{{ ql.document_type }}</p>
					</div>
				</div>
			</section>

			<!-- Empty State -->
			<div v-if="isEmpty" class="flex-1 flex items-center justify-center py-20">
				<div class="text-center text-slate-400 dark:text-slate-500">
					<div class="text-4xl mb-4">📭</div>
					<p>This workspace is empty</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { desktopAPI } from "../api/desktop";
import type { WorkspaceContent, WorkspaceShortcut, SidebarItem } from "../data/app_sidebar";
import { model } from "../data/model";

declare const locals: any;

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const workspaceContent = ref<WorkspaceContent>({
	name: "",
	shortcuts: [],
	cards: [],
	charts: [],
	number_cards: [],
	quick_lists: [],
});

const isEmpty = computed(() => {
	return (
		workspaceContent.value.shortcuts.length === 0 &&
		workspaceContent.value.cards.length === 0 &&
		workspaceContent.value.charts.length === 0 &&
		workspaceContent.value.number_cards.length === 0 &&
		workspaceContent.value.quick_lists.length === 0
	);
});

// Icon mapping
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
	list: "📝",
	grid: "⊞",
	"pie-chart": "🥧",
	"bar-chart": "📊",
	"trending-up": "📈",
	mail: "📧",
	phone: "📞",
	map: "🗺️",
	globe: "🌐",
	default: "📄",
};

function getIcon(icon?: string): string {
	if (!icon) return iconMap["default"];
	if (icon.length <= 2) return icon; // Already emoji
	return iconMap[icon.toLowerCase()] || iconMap["default"];
}

async function loadWorkspace() {
	const workspaceName = route.params.workspace as string;
	if (!workspaceName) return;

	loading.value = true;
	try {
		workspaceContent.value = await desktopAPI.getWorkspaceContent(
			decodeURIComponent(workspaceName),
		);
	} catch (error) {
		console.error("Failed to load workspace:", error);
	} finally {
		loading.value = false;
	}
}

async function handleShortcutClick(shortcut: WorkspaceShortcut) {
	const type = shortcut.type?.toLowerCase() || shortcut.link_type?.toLowerCase();
	const linkTo = shortcut.link_to;
	const appName = route.params.app as string;
	const docView = shortcut.doc_view?.toLowerCase();

	if (type === "doctype" && linkTo) {
		// Handle doc_view
		if (docView === "new") {
			router.push({ name: "NewForm", params: { app: appName, doctype: linkTo } });
			return;
		}

		// Check if single doctype
		let isSingle = false;
		if (locals?.DocType?.[linkTo]) {
			isSingle = locals.DocType[linkTo].issingle === 1;
		} else {
			try {
				await new Promise((resolve) => {
					model.with_doctype(linkTo, (result: any) => {
						if (result?.docs) {
							const metaDoc = result.docs.find((doc: any) => doc.name === linkTo);
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
				params: { app: appName, doctype: linkTo, name: linkTo },
			});
		} else {
			router.push({ name: "ListView", params: { app: appName, doctype: linkTo } });
		}
	} else if (type === "report" && linkTo) {
		router.push(`/${appName}/report/${encodeURIComponent(linkTo)}`);
	} else if (type === "page" && linkTo) {
		router.push(`/${appName}/page/${encodeURIComponent(linkTo)}`);
	} else if (type === "dashboard" && linkTo) {
		router.push(`/${appName}/dashboard/${encodeURIComponent(linkTo)}`);
	}
}

async function handleLinkClick(link: SidebarItem) {
	const type = link.type?.toLowerCase() || link.link_type?.toLowerCase();
	const linkTo = link.link_to || link.name;
	const appName = route.params.app as string;

	if (type === "doctype" && linkTo) {
		// Check if single doctype
		let isSingle = false;
		if (locals?.DocType?.[linkTo]) {
			isSingle = locals.DocType[linkTo].issingle === 1;
		} else {
			try {
				await new Promise((resolve) => {
					model.with_doctype(linkTo, (result: any) => {
						if (result?.docs) {
							const metaDoc = result.docs.find((doc: any) => doc.name === linkTo);
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
				params: { app: appName, doctype: linkTo, name: linkTo },
			});
		} else {
			router.push({ name: "ListView", params: { app: appName, doctype: linkTo } });
		}
	} else if (type === "report" && linkTo) {
		router.push(`/${appName}/report/${encodeURIComponent(linkTo)}`);
	} else if (type === "page" && linkTo) {
		router.push(`/${appName}/page/${encodeURIComponent(linkTo)}`);
	} else if (type === "dashboard" && linkTo) {
		router.push(`/${appName}/dashboard/${encodeURIComponent(linkTo)}`);
	}
}

function handleQuickListClick(ql: { name: string; document_type: string }) {
	const appName = route.params.app as string;
	router.push({ name: "ListView", params: { app: appName, doctype: ql.document_type } });
}

onMounted(() => {
	loadWorkspace();
});

watch(
	() => route.params.workspace,
	() => {
		loadWorkspace();
	},
);
</script>

<style scoped></style>
