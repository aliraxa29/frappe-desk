<template>
	<AppLayout :hideSidebar="!selectedModule">
		<template #header>
			<div class="flex items-center justify-between gap-4 w-full py-4">
				<div class="flex items-center gap-3">
					<!-- Back button when viewing workspace -->
					<button
						v-if="selectedModule"
						@click="selectedModule = null"
						class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					>
						<svg
							class="w-5 h-5 text-slate-600 dark:text-slate-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<h2 class="text-lg font-semibold text-slate-800 dark:text-white">
						{{
							selectedModule
								? formatLabel(selectedModule.label || selectedModule.name)
								: formatLabel(moduleName)
						}}
					</h2>
				</div>
				<!-- Refresh button -->
				<button
					v-if="selectedModule"
					@click="refreshWorkspace"
					:disabled="workspaceLoading"
					class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
					title="Refresh workspace data"
				>
					<svg
						class="w-5 h-5 text-slate-600 dark:text-slate-400"
						:class="{ 'animate-spin': workspaceLoading }"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
				</button>
			</div>
		</template>

		<template #content>
			<!-- Loading State -->
			<div v-if="loading" class="flex items-center justify-center h-[calc(100vh-200px)]">
				<div class="flex flex-col items-center gap-4">
					<div
						class="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"
					></div>
					<div class="text-sm text-slate-500 dark:text-slate-400">
						Loading modules...
					</div>
				</div>
			</div>

			<!-- Module Icons Grid (Odoo-style centered view) -->
			<div
				v-else-if="!selectedModule"
				class="flex items-center justify-center min-h-[calc(100vh-200px)] p-8"
			>
				<div class="w-full max-w-5xl">
					<!-- App Title -->
					<div class="text-center mb-12">
						<h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">
							{{ formatLabel(moduleName) }}
						</h1>
						<p class="text-slate-500 dark:text-slate-400">
							Select a module to view its workspace
						</p>
					</div>

					<!-- Empty State -->
					<div
						v-if="modules.length === 0"
						class="flex flex-col items-center justify-center text-center text-slate-900 dark:text-slate-100"
					>
						<div class="text-6xl mb-6">📦</div>
						<h3 class="text-xl font-semibold text-slate-700 dark:text-slate-100">
							No Modules Found
						</h3>
						<p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
							This app has no modules available. Try installing some modules or check
							your permissions.
						</p>
					</div>

					<!-- Modules Grid -->
					<div
						v-else
						class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center"
					>
						<div
							v-for="module in modules"
							:key="module.name"
							@click="() => selectModule(module, false)"
							class="group flex flex-col items-center gap-4 p-6 w-full max-w-40 rounded-2xl cursor-pointer bg-white dark:bg-slate-900 border-2 border-transparent hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1"
						>
							<!-- Module Icon -->
							<div class="relative">
								<div
									class="w-20 h-20 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-violet-500/40 transition-all duration-300 overflow-hidden p-2"
								>
									<component
										:is="getModuleIconComponent(module.name)"
										v-if="getModuleIconComponent(module.name)"
										class="w-10 h-10 text-white"
									/>
									<span v-else class="text-white font-semibold text-lg">
										{{ getModuleInitials(module.label || module.name) }}
									</span>
								</div>
								<!-- Hover ring effect -->
								<div
									class="absolute inset-0 rounded-2xl border-2 border-violet-400 opacity-0 group-hover:opacity-100 scale-105 transition-all duration-300"
								></div>
							</div>
							<!-- Module Label -->
							<span
								class="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
							>
								{{ module.label || module.name }}
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Workspace Content (shown when module is selected) -->
			<div v-else class="p-6 space-y-10">
				<!-- Workspace Loading -->
				<div v-if="workspaceLoading" class="flex items-center justify-center h-64">
					<div class="flex flex-col items-center gap-4">
						<div
							class="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"
						></div>
						<div class="text-sm text-slate-500">Loading workspace...</div>
					</div>
				</div>

				<template v-else>
					<!-- Shortcuts Section - Prominent action buttons -->
					<div
						v-if="workspaceContent.shortcuts && workspaceContent.shortcuts.length > 0"
						class="space-y-4"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<h3 class="text-base font-semibold text-slate-800 dark:text-white">
								Quick Actions
							</h3>
						</div>
						<div
							class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
						>
							<div
								v-for="shortcut in workspaceContent.shortcuts"
								:key="shortcut.name"
								@click="handleShortcutClick(shortcut)"
								class="group relative overflow-hidden rounded-xl cursor-pointer bg-linear-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-400 transition-all duration-300 hover:-translate-y-0.5"
							>
								<div class="p-4 flex flex-col items-center gap-3">
									<div
										class="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110"
										:style="{
											background: `linear-gradient(135deg, ${
												shortcut.color || '#8B5CF6'
											}15, ${shortcut.color || '#8B5CF6'}30)`,
											border: `1px solid ${shortcut.color || '#8B5CF6'}40`,
										}"
									>
										<span class="text-2xl">{{ shortcut.icon || "⚡" }}</span>
									</div>
									<span
										class="text-sm font-medium text-slate-700 dark:text-slate-200 text-center leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
									>
										{{ shortcut.label || shortcut.name }}
									</span>
								</div>
								<!-- Subtle gradient overlay on hover -->
								<div
									class="absolute inset-0 bg-linear-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 transition-all duration-300"
								></div>
							</div>
						</div>
					</div>

					<!-- Number Cards Section - KPI Stats -->
					<div
						v-if="
							workspaceContent.number_cards &&
							workspaceContent.number_cards.length > 0
						"
						class="space-y-4"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<h3 class="text-base font-semibold text-slate-800 dark:text-white">
								Key Metrics
							</h3>
						</div>
						<div
							class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
						>
							<div
								v-for="(card, index) in workspaceContent.number_cards"
								:key="card.name"
								class="relative overflow-hidden rounded-xl p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300"
							>
								<div class="flex flex-col">
									<span
										class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
									>
										{{ card.label || card.name }}
									</span>
									<span
										class="text-2xl font-bold text-slate-800 dark:text-white mt-1"
										>--</span
									>
								</div>
								<!-- Decorative gradient corner -->
								<div
									class="absolute -top-8 -right-8 w-16 h-16 rounded-full opacity-20"
									:style="{
										background: `linear-gradient(135deg, ${getNumberCardColor(
											index,
										)})`,
									}"
								></div>
							</div>
						</div>
					</div>

					<!-- Cards Section - Grouped Links -->
					<div
						v-if="workspaceContent.cards && workspaceContent.cards.length > 0"
						class="space-y-6"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
									/>
								</svg>
							</div>
							<h3 class="text-base font-semibold text-slate-800 dark:text-white">
								Modules
							</h3>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<div
								v-for="card in workspaceContent.cards"
								:key="card.label"
								class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300"
							>
								<!-- Card Header -->
								<div
									class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
								>
									<div class="flex items-center gap-3">
										<span class="text-xl">{{ card.icon || "📁" }}</span>
										<h4 class="font-semibold text-slate-800 dark:text-white">
											{{ card.label }}
										</h4>
									</div>
								</div>
								<!-- Card Links -->
								<div class="p-3">
									<div class="space-y-1">
										<div
											v-for="link in card.links"
											:key="link.name"
											@click="handleCardLinkClick(link)"
											class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
										>
											<span class="text-base">{{ link.icon || "📄" }}</span>
											<span
												class="text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
											>
												{{ link.label || link.name }}
											</span>
											<svg
												class="w-4 h-4 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
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
						</div>
					</div>

					<!-- Charts Section -->
					<div
						v-if="workspaceContent.charts && workspaceContent.charts.length > 0"
						class="space-y-4"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
									/>
								</svg>
							</div>
							<h3 class="text-base font-semibold text-slate-800 dark:text-white">
								Charts & Analytics
							</h3>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div
								v-for="chart in workspaceContent.charts"
								:key="chart.name"
								class="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-300"
							>
								<div class="flex items-center justify-between mb-4">
									<h4 class="font-medium text-slate-800 dark:text-white">
										{{ chart.label || chart.name }}
									</h4>
									<span
										class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded"
										>{{ chart.chart_name }}</span
									>
								</div>
								<!-- Chart Placeholder -->
								<div
									class="h-40 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700"
								>
									<span class="text-sm text-slate-400"
										>Chart: {{ chart.chart_name }}</span
									>
								</div>
							</div>
						</div>
					</div>

					<!-- Quick Lists Section -->
					<div
						v-if="
							workspaceContent.quick_lists && workspaceContent.quick_lists.length > 0
						"
						class="space-y-4"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-linear-to-br from-pink-500 to-rose-600 flex items-center justify-center"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 6h16M4 10h16M4 14h16M4 18h16"
									/>
								</svg>
							</div>
							<h3 class="text-base font-semibold text-slate-800 dark:text-white">
								Quick Lists
							</h3>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div
								v-for="list in workspaceContent.quick_lists"
								:key="list.name"
								@click="navigateToQuickList(list)"
								class="group rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 hover:border-pink-400 hover:shadow-md transition-all duration-300 cursor-pointer"
							>
								<div class="flex items-center gap-3">
									<div
										class="w-10 h-10 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center"
									>
										<svg
											class="w-5 h-5 text-pink-600 dark:text-pink-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
											/>
										</svg>
									</div>
									<div class="flex-1 min-w-0">
										<h4
											class="font-medium text-slate-800 dark:text-white truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors"
										>
											{{ list.label || list.name }}
										</h4>
										<p
											class="text-xs text-slate-500 dark:text-slate-400 truncate"
										>
											{{ list.document_type }}
										</p>
									</div>
									<svg
										class="w-5 h-5 text-slate-400 group-hover:text-pink-500 transition-colors"
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

					<!-- DocTypes Section -->
					<div v-if="filteredDoctypes.length > 0" class="space-y-4">
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<h3 class="text-base font-semibold text-slate-800 dark:text-white">
								Document Types
							</h3>
						</div>
						<div class="space-y-2">
							<div
								v-for="item in filteredDoctypes"
								:key="item.name"
								@click="navigateToDoctype(item)"
								class="group flex items-center gap-4 p-4 rounded-lg cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700/50 hover:shadow-sm transition-all duration-200"
							>
								<div
									class="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0"
								>
									<span class="text-lg">{{ item.icon || "📄" }}</span>
								</div>
								<div class="flex-1 min-w-0">
									<span
										class="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors"
									>
										{{ item.label || item.name }}
									</span>
								</div>
								<svg
									class="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors flex-shrink-0"
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

					<!-- Reports Section -->
					<div v-if="filteredReports.length > 0" class="space-y-4">
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<h3 class="text-base font-semibold text-slate-800 dark:text-white">
								Reports
							</h3>
						</div>
						<div class="space-y-2">
							<router-link
								v-for="item in filteredReports"
								:key="item.name"
								:to="getReportRoute(item)"
								class="group flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700/50 hover:shadow-sm transition-all duration-200"
							>
								<div
									class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0"
								>
									<span class="text-lg">{{ item.icon || "📊" }}</span>
								</div>
								<div class="flex-1 min-w-0">
									<span
										class="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
									>
										{{ item.label || item.name }}
									</span>
								</div>
								<svg
									class="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors flex-shrink-0"
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
							</router-link>
						</div>
					</div>

					<!-- Pages Section -->
					<div v-if="filteredPages.length > 0" class="space-y-4">
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
									/>
								</svg>
							</div>
							<h3 class="text-base font-semibold text-slate-800 dark:text-white">
								Pages
							</h3>
						</div>
						<div class="space-y-2">
							<router-link
								v-for="item in filteredPages"
								:key="item.name"
								:to="getPageRoute(item)"
								class="group flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-slate-700/50 hover:shadow-sm transition-all duration-200"
							>
								<div
									class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0"
								>
									<span class="text-lg">{{ item.icon || "📑" }}</span>
								</div>
								<div class="flex-1 min-w-0">
									<span
										class="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
									>
										{{ item.label || item.name }}
									</span>
								</div>
								<svg
									class="w-4 h-4 text-slate-400 group-hover:text-green-500 transition-colors flex-shrink-0"
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
							</router-link>
						</div>
					</div>

					<!-- Dashboards Section -->
					<div v-if="filteredDashboards.length > 0" class="space-y-4">
						<div class="flex items-center gap-3">
							<div
								class="w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center"
							>
								<svg
									class="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
									/>
								</svg>
							</div>
							<h3 class="text-base font-semibold text-slate-800 dark:text-white">
								Dashboards
							</h3>
						</div>
						<div class="space-y-2">
							<router-link
								v-for="item in filteredDashboards"
								:key="item.name"
								:to="getDashboardRoute(item)"
								class="group flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700/50 hover:shadow-sm transition-all duration-200"
							>
								<div
									class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0"
								>
									<span class="text-lg">{{ item.icon || "📈" }}</span>
								</div>
								<div class="flex-1 min-w-0">
									<span
										class="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
									>
										{{ item.label || item.name }}
									</span>
								</div>
								<svg
									class="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors flex-shrink-0"
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
							</router-link>
						</div>
					</div>

					<!-- Empty Workspace State -->
					<div
						v-if="isWorkspaceEmpty"
						class="flex flex-col items-center justify-center h-64 text-center"
					>
						<div
							class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4"
						>
							<svg
								class="w-10 h-10 text-slate-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
								/>
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-slate-700 dark:text-slate-100">
							Empty Workspace
						</h3>
						<p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
							This module has no items configured yet. Add shortcuts, doctypes, or
							reports to get started.
						</p>
					</div>
				</template>
			</div>
		</template>
	</AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, type Component } from "vue";
import { useRoute, useRouter } from "vue-router";
import { desktopAPI } from "../api/desktop";
import type { WorkspaceContent } from "../data/app_sidebar";
import { useBreadcrumbStore } from "../stores/breadcrumbs";
import { useSidebarStore } from "../stores/sidebar";
import { model } from "../data/model";
import type { SidebarItem } from "../data/app_sidebar";
import AppLayout from "../layout/AppLayout.vue";
import AccountsIcon from "../assets/icons/Accounts.vue";
import AgricultureIcon from "../assets/icons/Agriculture.vue";
import BuyingIcon from "../assets/icons/Buying.vue";
import CrmIcon from "../assets/icons/CRM.vue";
import DefaultIcon from "../assets/icons/Default.vue";
import DeskIcon from "../assets/icons/Desk.vue";
import HrIcon from "../assets/icons/HR.vue";
import LoanIcon from "../assets/icons/Loan.vue";
import ManufacturingIcon from "../assets/icons/Manufacturing.vue";
import ProjectsIcon from "../assets/icons/Projects.vue";
import QualityIcon from "../assets/icons/Quality.vue";
import SellingIcon from "../assets/icons/Selling.vue";
import SetupIcon from "../assets/icons/Setup.vue";
import StockIcon from "../assets/icons/Stock.vue";
import ToolsIcon from "../assets/icons/Tools.vue";
import WebsiteIcon from "../assets/icons/Website.vue";

declare const locals: any;

interface ModuleInfo {
	name: string;
	label?: string;
	icon?: string;
	link_type?: string;
	link_to?: string;
	type?: string;
}

// LocalStorage Cache Utilities
const CACHE_PREFIX = "desk_workspace_";
const CACHE_VERSION = "v1_";

function getCacheKey(key: string): string {
	return `${CACHE_PREFIX}${CACHE_VERSION}${key}`;
}

function getFromCache<T>(key: string): T | null {
	try {
		const cached = localStorage.getItem(getCacheKey(key));
		if (cached) {
			const data = JSON.parse(cached);
			return data as T;
		}
	} catch (error) {
		console.warn("Failed to read from cache:", error);
	}
	return null;
}

function setCache<T>(key: string, data: T): void {
	try {
		localStorage.setItem(getCacheKey(key), JSON.stringify(data));
	} catch (error) {
		console.warn("Failed to write to cache:", error);
	}
}

function clearCache(key: string): void {
	try {
		localStorage.removeItem(getCacheKey(key));
	} catch (error) {
		console.warn("Failed to clear cache:", error);
	}
}

function clearAllWorkspaceCache(): void {
	try {
		const keys = Object.keys(localStorage);
		for (const key of keys) {
			if (key.startsWith(CACHE_PREFIX)) {
				localStorage.removeItem(key);
			}
		}
	} catch (error) {
		console.warn("Failed to clear workspace cache:", error);
	}
}

const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();
const sidebarStore = useSidebarStore();
const loading = ref(true);
const workspaceLoading = ref(false);
const sidebarItems = ref<SidebarItem[]>([]);
const modules = ref<ModuleInfo[]>([]);
const selectedModule = ref<ModuleInfo | null>(null);
const workspaceContent = ref<WorkspaceContent>({
	name: "",
	shortcuts: [],
	cards: [],
	charts: [],
	number_cards: [],
	quick_lists: [],
});

// Get module name from route
const moduleName = computed(() => (route.params.app as string) || "");

// Check if workspace is empty
const isWorkspaceEmpty = computed(() => {
	return (
		filteredDoctypes.value.length === 0 &&
		filteredPages.value.length === 0 &&
		filteredReports.value.length === 0 &&
		filteredDashboards.value.length === 0 &&
		(!workspaceContent.value.shortcuts || workspaceContent.value.shortcuts.length === 0) &&
		(!workspaceContent.value.cards || workspaceContent.value.cards.length === 0) &&
		(!workspaceContent.value.charts || workspaceContent.value.charts.length === 0) &&
		(!workspaceContent.value.number_cards ||
			workspaceContent.value.number_cards.length === 0) &&
		(!workspaceContent.value.quick_lists || workspaceContent.value.quick_lists.length === 0)
	);
});

// Group sidebar items by type
const groupedSidebar = computed(() => {
	const groups = {
		doctypes: [] as SidebarItem[],
		pages: [] as SidebarItem[],
		reports: [] as SidebarItem[],
		dashboards: [] as SidebarItem[],
	};

	for (const item of sidebarItems.value) {
		// Skip child doctypes
		if (item.istable) continue;

		const t = (item.link_type || item.type || "").toLowerCase();
		if (t === "doctype") groups.doctypes.push(item);
		else if (t === "report") groups.reports.push(item);
		else if (t === "dashboard") groups.dashboards.push(item);
		else if (t === "page") groups.pages.push(item);
	}

	return groups;
});

// Filter for only valid items present in workspace content
const filteredDoctypes = computed(() => {
	return groupedSidebar.value.doctypes.filter((item) => item.name && item.link_to);
});

const filteredReports = computed(() => {
	return groupedSidebar.value.reports.filter((item) => item.name && item.link_to);
});

const filteredPages = computed(() => {
	return groupedSidebar.value.pages.filter((item) => item.name && item.link_to);
});

const filteredDashboards = computed(() => {
	return groupedSidebar.value.dashboards.filter((item) => item.name && item.link_to);
});

// Format label from slug
function formatLabel(str: string): string {
	if (!str) return "";
	return str.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

const MODULE_ICON_COMPONENTS: Record<string, Component> = {
	// Core modules
	selling: SellingIcon,
	buying: BuyingIcon,
	stock: StockIcon,
	accounts: AccountsIcon,
	crm: CrmIcon,
	hr: HrIcon,
	projects: ProjectsIcon,
	manufacturing: ManufacturingIcon,
	website: WebsiteIcon,
	setup: SetupIcon,
	quality: QualityIcon,
	agriculture: AgricultureIcon,
	loan: LoanIcon,
	tools: ToolsIcon,
	desk: DeskIcon,

	// Aliases
	erpnext: DefaultIcon,
	desktop: DeskIcon,
};

function getModuleIconComponent(moduleName: string): Component | null {
	const normalizedName = moduleName.toLowerCase().replace(/[-_\s]/g, "");

	const exactMatch = Object.entries(MODULE_ICON_COMPONENTS).find(
		([key]) => key.toLowerCase() === normalizedName,
	);
	if (exactMatch) {
		return exactMatch[1];
	}

	const partialMatch = Object.entries(MODULE_ICON_COMPONENTS).find(
		([key]) =>
			normalizedName.includes(key.toLowerCase()) ||
			key.toLowerCase().includes(normalizedName),
	);
	if (partialMatch) {
		return partialMatch[1];
	}

	return null;
}

function getModuleInitials(label: string): string {
	const cleaned = label.trim();
	if (!cleaned) return "";

	const parts = cleaned.split(/\s+/).filter(Boolean);
	if (parts.length === 1) {
		return parts[0].slice(0, 2).toUpperCase();
	}

	return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

// Navigate to doctype (handle single vs regular)
async function navigateToDoctype(item: SidebarItem) {
	const doctypeName = item.link_to || item.name;
	let isSingle = item.issingle || false;

	// Check if we have metadata cached
	if (typeof locals !== "undefined" && locals?.DocType?.[doctypeName]) {
		isSingle = locals.DocType[doctypeName].issingle === 1;
	} else {
		// Load doctype metadata
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
				app: moduleName.value,
				doctype: doctypeName,
				name: doctypeName,
			},
		});
	} else {
		router.push({
			name: "ListView",
			params: { app: moduleName.value, doctype: doctypeName },
		});
	}
}

function getPageRoute(item: SidebarItem) {
	// Pages typically use ListView or custom routes
	return `/${moduleName.value}/page/${encodeURIComponent(item.link_to || item.name)}`;
}

function getReportRoute(item: SidebarItem) {
	// Reports use a report builder route
	return `/${moduleName.value}/report/${encodeURIComponent(item.link_to || item.name)}`;
}

function getDashboardRoute(item: SidebarItem) {
	return `/${moduleName.value}/dashboard/${encodeURIComponent(item.link_to || item.name)}`;
}

// Set breadcrumbs for app view
watch(
	moduleName,
	() => {
		breadcrumbStore.setForApp(moduleName.value, formatLabel(moduleName.value));
	},
	{ immediate: true },
);

// Select a module and load its workspace content
async function selectModule(module: ModuleInfo, forceRefresh = false) {
	selectedModule.value = module;
	workspaceLoading.value = true;

	try {
		const moduleLinkTo = module.link_to || module.name;
		const cacheKey = `module_content_${moduleName.value}_${moduleLinkTo}`;

		// Try to get from cache first
		if (!forceRefresh) {
			const cached = getFromCache<{
				content: WorkspaceContent;
				items: SidebarItem[];
			}>(cacheKey);

			if (cached) {
				console.log("Loading workspace from cache:", moduleLinkTo);
				workspaceContent.value = cached.content;
				sidebarItems.value = cached.items;

				// Update sidebar store
				sidebarStore.setSidebarItems(cached.items, "app_sidebar");
				sidebarStore.setSelectedModule(moduleLinkTo);

				// Update breadcrumbs
				breadcrumbStore.setForApp(moduleName.value, formatLabel(moduleName.value));
				breadcrumbStore.push({ label: module.label || module.name, type: "doctype" });

				workspaceLoading.value = false;
				return;
			}
		}

		// Load workspace content from API
		console.log("Fetching workspace from API:", moduleLinkTo);
		const content = await desktopAPI.getModuleContent(moduleLinkTo);

		// Update workspace content
		workspaceContent.value = {
			name: content.name || moduleLinkTo,
			label: content.label,
			icon: content.icon,
			shortcuts: content.shortcuts || [],
			cards: content.cards || [],
			charts: content.charts || [],
			number_cards: content.number_cards || [],
			quick_lists: content.quick_lists || [],
		};

		// Convert doctypes and reports to sidebar items
		const items: SidebarItem[] = [];

		if (content.doctypes) {
			for (const dt of content.doctypes) {
				items.push({
					name: dt.name,
					label: dt.label || dt.name,
					link_type: "DocType",
					link_to: dt.name,
					type: "DocType",
				});
			}
		}

		if (content.reports) {
			for (const report of content.reports) {
				items.push({
					name: report.name,
					label: report.label || report.name,
					link_type: "Report",
					link_to: report.name,
					type: "Report",
				});
			}
		}

		sidebarItems.value = items;

		// Update sidebar store
		sidebarStore.setSidebarItems(items, "app_sidebar");
		sidebarStore.setSelectedModule(moduleLinkTo);

		// Cache the result
		setCache(cacheKey, {
			content: workspaceContent.value,
			items: sidebarItems.value,
		});

		// Update breadcrumbs
		breadcrumbStore.setForApp(moduleName.value, formatLabel(moduleName.value));
		breadcrumbStore.push({ label: module.label || module.name, type: "doctype" });
	} catch (error) {
		console.error("Failed to load workspace content:", error);
		sidebarItems.value = [];
		sidebarStore.clearSidebar();
		workspaceContent.value = {
			name: module.name,
			shortcuts: [],
			cards: [],
			charts: [],
			number_cards: [],
			quick_lists: [],
		};
	} finally {
		workspaceLoading.value = false;
	}
}

// Handle shortcut click
function handleShortcutClick(shortcut: any) {
	const linkType = (shortcut.link_type || shortcut.type || "").toLowerCase();
	const linkTo = shortcut.link_to || shortcut.name;

	if (linkType === "doctype") {
		// Navigate to list or form based on doc_view
		const docView = (shortcut.doc_view || "List").toLowerCase();

		if (docView === "new") {
			router.push({
				name: "NewForm",
				params: { app: moduleName.value, doctype: linkTo },
			});
		} else {
			router.push({
				name: "ListView",
				params: { app: moduleName.value, doctype: linkTo },
			});
		}
	} else if (linkType === "report") {
		router.push(`/${moduleName.value}/report/${encodeURIComponent(linkTo)}`);
	} else if (linkType === "page") {
		router.push(`/${moduleName.value}/page/${encodeURIComponent(linkTo)}`);
	} else if (linkType === "dashboard") {
		router.push(`/${moduleName.value}/dashboard/${encodeURIComponent(linkTo)}`);
	}
}

// Get color gradient for number cards based on index
function getNumberCardColor(index: number): string {
	const colors = [
		"#10B981, #059669", // emerald
		"#3B82F6, #2563EB", // blue
		"#8B5CF6, #7C3AED", // violet
		"#F59E0B, #D97706", // amber
		"#EC4899, #DB2777", // pink
		"#06B6D4, #0891B2", // cyan
	] as const;
	return colors[index % colors.length] ?? "#10B981, #059669";
}

// Handle card link click
function handleCardLinkClick(link: SidebarItem) {
	const linkType = (link.link_type || link.type || "").toLowerCase();
	const linkTo = link.link_to || link.name;

	if (linkType === "doctype") {
		navigateToDoctype(link);
	} else if (linkType === "report") {
		router.push(`/${moduleName.value}/report/${encodeURIComponent(linkTo)}`);
	} else if (linkType === "page") {
		router.push(`/${moduleName.value}/page/${encodeURIComponent(linkTo)}`);
	} else if (linkType === "dashboard") {
		router.push(`/${moduleName.value}/dashboard/${encodeURIComponent(linkTo)}`);
	} else {
		// Default to doctype navigation
		navigateToDoctype(link);
	}
}

// Navigate to quick list
function navigateToQuickList(list: {
	name: string;
	label: string;
	document_type: string;
	quick_list_filter?: string;
}) {
	router.push({
		name: "ListView",
		params: { app: moduleName.value, doctype: list.document_type },
	});
}

// Fetch modules for the app
async function fetchModules(forceRefresh = false) {
	loading.value = true;
	selectedModule.value = null;
	sidebarItems.value = [];
	sidebarStore.clearSidebar();

	try {
		const app = moduleName.value || "desktop";
		const cacheKey = `modules_${app}`;

		let sb: any = null;

		// Try to get from cache first
		if (!forceRefresh) {
			const cached = getFromCache<{
				modules: ModuleInfo[];
				source: string;
			}>(cacheKey);

			if (cached) {
				console.log("Loading modules from cache:", app);

				// If source is 'modules', show modules grid only (no auto-select)
				if (cached.source === "modules") {
					modules.value = cached.modules;
					sidebarItems.value = [];
					sidebarStore.clearSidebar();
					loading.value = false;
					return;
				} else {
					// Single module app, auto-select it
					modules.value = cached.modules;
					if (modules.value[0]) {
						await selectModule(modules.value[0], false);
					}
					loading.value = false;
					return;
				}
			}
		}

		// Fetch from API
		console.log("Fetching modules from API:", app);
		sb = await desktopAPI.getModuleSidebar(app);

		// If source is 'modules', use items as modules list
		if (sb.source === "modules") {
			modules.value = sb.items.map((item) => ({
				name: item.name,
				label: item.label,
				icon: item.icon,
				link_type: item.link_type,
				link_to: item.link_to,
				type: item.type,
			}));
			sidebarItems.value = [];
			sidebarStore.clearSidebar();
			// Do NOT auto-select - show modules grid
		} else {
			// If source is 'app_sidebar', show sidebar items directly
			// Create a single "module" for this app
			modules.value = [
				{
					name: app,
					label: formatLabel(app),
					icon: "📱",
					link_type: "Module",
					link_to: app,
				},
			];
			// Auto-select the single module
			if (modules.value[0]) {
				await selectModule(modules.value[0], forceRefresh);
			}
		}

		// Cache the result
		setCache(cacheKey, {
			modules: modules.value,
			source: sb.source,
		});
	} catch (error) {
		console.error("Failed to load modules:", error);
		modules.value = [];
		sidebarItems.value = [];
		sidebarStore.clearSidebar();
	} finally {
		loading.value = false;
	}
}

// Refresh workspace data (force fetch from API)
async function refreshWorkspace() {
	if (selectedModule.value) {
		await selectModule(selectedModule.value, true);
	}
}

onMounted(async () => {
	breadcrumbStore.setForApp(moduleName.value, formatLabel(moduleName.value));
	await fetchModules(false);
});

// Refetch on route change (use cache)
watch(
	() => route.params.app,
	async () => {
		selectedModule.value = null;
		sidebarItems.value = [];
		sidebarStore.clearSidebar();
		await fetchModules(false);
	},
);

// Optional: Clear cache on component unmount or window beforeunload for fresh data on actual page refresh
// Uncomment if you want cache to persist only during session
// onBeforeUnmount(() => {
//   clearAllWorkspaceCache()
// })
</script>
