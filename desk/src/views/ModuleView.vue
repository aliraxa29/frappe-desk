<template>
	<div class="flex flex-col min-h-full bg-secondary ml-64">
		<!-- Header -->
		<header class="bg-background">
			<div class="flex items-center gap-3">
				<span v-if="moduleContent.icon" class="text-2xl">{{
					getIcon(moduleContent.icon)
				}}</span>
				<div>
					<h1 class="text-xl font-semibold text-foreground">
						{{ moduleContent.label || moduleContent.name || route.params.module }}
					</h1>
				</div>
			</div>
		</header>

		<!-- Loading State -->
		<div v-if="loading" class="flex-1 flex items-center justify-center">
			<div class="text-muted-foreground">Loading module...</div>
		</div>

		<!-- Module Content -->
		<div v-else class="flex-1 p-6 space-y-8">
			<!-- Shortcuts Section -->
			<section v-if="moduleContent.shortcuts && moduleContent.shortcuts.length > 0">
				<h2
					class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
				>
					Shortcuts
				</h2>
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
					<div
						v-for="shortcut in moduleContent.shortcuts"
						:key="`shortcut-${shortcut.name}`"
						@click="handleShortcutClick(shortcut)"
						class="group cursor-pointer rounded-xl bg-background"
					>
						<div class="flex items-center gap-3">
							<span class="text-xl text-muted-foreground">
								{{ getIcon(shortcut.icon) || "📄" }}
							</span>
							<span class="font-medium text-foreground truncate">
								{{ shortcut.label }}
							</span>
						</div>
						<p v-if="shortcut.type" class="mt-2 text-xs text-muted-foreground">
							{{ shortcut.type }}
						</p>
					</div>
				</div>
			</section>

			<!-- DocTypes Section -->
			<section v-if="moduleContent.doctypes && moduleContent.doctypes.length > 0">
				<h2
					class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
				>
					DocTypes
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div
						v-for="dt in moduleContent.doctypes"
						:key="`dt-${dt.name}`"
						@click="handleDoctypeClick(dt)"
						class="group cursor-pointer rounded-xl bg-background"
					>
						<div class="flex items-center gap-3">
							<span class="text-xl text-muted-foreground">📄</span>
							<div class="flex-1 min-w-0">
								<span class="font-medium text-foreground truncate block">
									{{ dt.label }}
								</span>
								<span
									v-if="dt.description"
									class="text-xs text-muted-foreground truncate block mt-1"
								>
									{{ dt.description }}
								</span>
							</div>
							<svg
								class="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition"
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
			</section>

			<!-- Reports Section -->
			<section v-if="moduleContent.reports && moduleContent.reports.length > 0">
				<h2
					class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
				>
					Reports
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div
						v-for="report in moduleContent.reports"
						:key="`report-${report.name}`"
						@click="handleReportClick(report)"
						class="group cursor-pointer rounded-xl bg-background"
					>
						<div class="flex items-center gap-3">
							<span class="text-xl text-muted-foreground">📊</span>
							<div class="flex-1 min-w-0">
								<span class="font-medium text-foreground truncate block">
									{{ report.label }}
								</span>
								<span
									v-if="report.report_type"
									class="text-xs text-muted-foreground truncate block mt-1"
								>
									{{ report.report_type }}
								</span>
							</div>
							<svg
								class="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition"
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
			</section>

			<!-- Cards/Links Section -->
			<section v-if="moduleContent.cards && moduleContent.cards.length > 0">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<div
						v-for="card in moduleContent.cards"
						:key="`card-${card.label}`"
						class="bg-background"
					>
						<!-- Card Header -->
						<div
							class="px-4 py-3 border-b border-border bg-secondary dark:bg-secondary"
						>
							<div class="flex items-center gap-2">
								<span v-if="card.icon" class="text-lg">{{
									getIcon(card.icon)
								}}</span>
								<h3 class="font-semibold text-foreground">
									{{ card.label }}
								</h3>
							</div>
						</div>

						<!-- Card Links -->
						<div class="divide-y divide-border dark:divide-border">
							<div
								v-for="link in card.links"
								:key="`link-${link.name}`"
								@click="handleLinkClick(link)"
								class="px-4 py-3 flex items-center gap-3 hover:bg-secondary dark:hover:bg-accent cursor-pointer transition"
							>
								<span class="text-base text-muted-foreground">{{
									getIcon(link.icon) || "📄"
								}}</span>
								<div class="flex-1 min-w-0">
									<span
										class="text-sm font-medium text-foreground truncate block"
									>
										{{ link.label }}
									</span>
								</div>
								<svg
									class="w-4 h-4 text-muted-foreground"
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

			<!-- Empty State -->
			<div v-if="isEmpty" class="flex-1 flex items-center justify-center py-20">
				<div class="text-center text-muted-foreground">
					<div class="text-4xl mb-4">📭</div>
					<p>This module is empty</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { desktopAPI, type ModuleContent } from "../api/desktop";
import { model } from "../data/model";

declare const locals: any;

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const moduleContent = ref<ModuleContent>({
	name: "",
	shortcuts: [],
	cards: [],
	charts: [],
	number_cards: [],
	quick_lists: [],
	doctypes: [],
	reports: [],
});

const isEmpty = computed(() => {
	return (
		(!moduleContent.value.shortcuts || moduleContent.value.shortcuts.length === 0) &&
		(!moduleContent.value.cards || moduleContent.value.cards.length === 0) &&
		(!moduleContent.value.doctypes || moduleContent.value.doctypes.length === 0) &&
		(!moduleContent.value.reports || moduleContent.value.reports.length === 0)
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
	if (!icon) return iconMap["default"] ?? "📄";
	if (icon.length <= 2) return icon; // Already emoji
	return iconMap[icon.toLowerCase()] ?? iconMap["default"] ?? "📄";
}

async function loadModule() {
	const moduleName = route.params.module as string;
	if (!moduleName) return;

	loading.value = true;
	try {
		moduleContent.value = await desktopAPI.getModuleContent(decodeURIComponent(moduleName));
	} catch (error) {
		console.error("Failed to load module:", error);
	} finally {
		loading.value = false;
	}
}

async function handleShortcutClick(shortcut: any) {
	const type = shortcut.type?.toLowerCase() || shortcut.link_type?.toLowerCase();
	const linkTo = shortcut.link_to;
	const appName = route.params.app as string;

	if (type === "doctype" && linkTo) {
		await navigateToDoctype(linkTo);
	} else if (type === "report" && linkTo) {
		router.push(`/${appName}/report/${encodeURIComponent(linkTo)}`);
	} else if (type === "page" && linkTo) {
		router.push(`/${appName}/page/${encodeURIComponent(linkTo)}`);
	} else if (type === "dashboard" && linkTo) {
		router.push(`/${appName}/dashboard/${encodeURIComponent(linkTo)}`);
	}
}

async function handleDoctypeClick(dt: any) {
	await navigateToDoctype(dt.name);
}

function handleReportClick(report: any) {
	const appName = route.params.app as string;
	router.push(`/${appName}/report/${encodeURIComponent(report.name)}`);
}

async function handleLinkClick(link: any) {
	const type = link.type?.toLowerCase() || link.link_type?.toLowerCase();
	const linkTo = link.link_to || link.name;
	const appName = route.params.app as string;

	if (type === "doctype" && linkTo) {
		await navigateToDoctype(linkTo);
	} else if (type === "report" && linkTo) {
		router.push(`/${appName}/report/${encodeURIComponent(linkTo)}`);
	} else if (type === "page" && linkTo) {
		router.push(`/${appName}/page/${encodeURIComponent(linkTo)}`);
	} else if (type === "dashboard" && linkTo) {
		router.push(`/${appName}/dashboard/${encodeURIComponent(linkTo)}`);
	}
}

async function navigateToDoctype(doctypeName: string) {
	const appName = route.params.app as string;

	// Check if single doctype
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
			params: { app: appName, doctype: doctypeName, name: doctypeName },
		});
	} else {
		router.push({ name: "ListView", params: { app: appName, doctype: doctypeName } });
	}
}

onMounted(() => {
	loadModule();
});

watch(
	() => route.params.module,
	() => {
		loadModule();
	},
);
</script>

<style scoped></style>
