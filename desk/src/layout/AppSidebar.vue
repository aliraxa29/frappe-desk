<template>
    <aside class="fixed left-0 top-14 bottom-0 w-64 flex flex-col bg-white dark:bg-gray-950 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 z-30">
        <!-- Sidebar Header -->
        <div class="px-6 py-4 border-b border-slate-200 dark:border-gray-800 shrink-0">
            <h2 class="text-lg font-semibold text-slate-800 dark:text-white truncate">
                {{ route.params.app }}
            </h2>
        </div>

        <!-- Search -->
        <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <input v-model="searchQuery" type="text" placeholder="Search…" class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm
               text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
               focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900" />
        </div>

        <!-- Sidebar Content - Scrollable -->
        <div ref="sidebarContentRef" class="flex-1 overflow-y-auto px-2 py-3 dark:bg-gray-950">
            <!-- Empty -->
            <div v-if="allSidebarEmpty" class="py-10 text-center text-sm text-slate-400">
                No sidebar items
            </div>

            <div v-else class="space-y-6">
                <!-- DocTypes -->
                <div v-if="groupedSidebar.doctypes.length">
                    <h4 class="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        DocTypes
                    </h4>

                    <div v-for="item in groupedSidebar.doctypes" :key="`doctype-${item.name}`"
                        @click="handleDoctypeClick(item)" :class="['group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition cursor-pointer', isItemActive(item) ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"><span class="text-base">
                            {{ item.icon || '📄' }}
                        </span>
                        <span class="truncate">
                            {{ item.label || item.name }}
                        </span>
                    </div>
                </div>

                <!-- Pages -->
                <div v-if="groupedSidebar.pages.length">
                    <h4 class="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Pages
                    </h4>

                    <router-link v-for="item in groupedSidebar.pages" :key="`page-${item.name}`" :to="getRoute(item)"
                        :class="['group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition', isPageActive(item) ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"><span class="text-base">
                            {{ item.icon || '📄' }}
                        </span>
                        <span class="truncate">
                            {{ item.label || item.name }}
                        </span>
                    </router-link>
                </div>

                <!-- Reports -->
                <div v-if="groupedSidebar.reports.length">
                    <h4 class="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Reports
                    </h4>

                    <router-link v-for="item in groupedSidebar.reports" :key="`report-${item.name}`"
                        :to="getRoute(item)" :class="['group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition', isPageActive(item) ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"><span class="text-base">
                            {{ item.icon || '�' }}
                        </span>
                        <span class="truncate">
                            {{ item.label || item.name }}
                        </span>
                    </router-link>
                </div>
                
                <!-- Dashboards -->
                <div v-if="groupedSidebar.dashboards.length">
                    <h4 class="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Dashboards
                    </h4>

                    <router-link v-for="item in groupedSidebar.dashboards" :key="`dashboard-${item.name}`"
                        :to="getRoute(item)" :class="['group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition', isPageActive(item) ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800']"><span class="text-base">
                            {{ item.icon || '📈' }}
                        </span>
                        <span class="truncate">
                            {{ item.label || item.name }}
                        </span>
                    </router-link>
                </div>
            </div>
        </div>
    </aside>
</template>


<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import type { SidebarItem } from '../data/app_sidebar';
import { computed, onMounted, ref, watch } from 'vue';
import { desktopAPI } from '../api/desktop';
import { model } from '../data/model';

const searchQuery = ref('')
const loading = ref(true)
const doctypes = ref<string[]>([])
const sidebarItems = ref<SidebarItem[]>([])
const route = useRoute();
const router = useRouter();
const sidebarContentRef = ref<HTMLElement | null>(null);

async function handleDoctypeClick(item: SidebarItem) {
    const doctypeName = item.link_to || item.name
    
    // Check if we already have the doctype metadata in locals
    let isSingle = false
    
    if (locals?.DocType?.[doctypeName]) {
        isSingle = locals.DocType[doctypeName].issingle === 1
    } else {
        // Load the doctype metadata if not available
        try {
            await new Promise((resolve) => {
                model.with_doctype(doctypeName, (result: any) => {
                    if (result?.docs) {
                        const metaDoc = result.docs.find((doc: any) => doc.name === doctypeName)
                        if (metaDoc) {
                            isSingle = metaDoc.issingle === 1
                        }
                    }
                    resolve(true)
                })
            })
        } catch (error) {
            console.error('Failed to load doctype metadata:', error)
        }
    }
    
    // Navigate based on whether it's a single doctype or not
    if (isSingle) {
        router.push({
            name: "EditForm",
            params: { 
                app: route.params.app, 
                doctype: doctypeName,
                name: doctypeName // Single doctypes use doctype name as document name
            }
        })
    } else {
        router.push({
            name: "ListView",
            params: { app: route.params.app, doctype: doctypeName }
        })
    }
}

function getRoute(item: SidebarItem) {
    const type = (item.link_type || item.type || '').toLowerCase()
    
    // Pages
    if (type === 'page') {
        return {
            name: "PageView",
            params: { app: route.params.app, page: item.link_to || item.name },
        }
    }

    // Reports
    if (type === 'report') {
        return {
            name: "ReportView",
            params: { app: route.params.app, report: item.link_to || item.name },
        }
    }
    
    // Dashboards
    if (type === 'dashboard') {
        return {
            name: "DashboardView",
            params: { app: route.params.app, dashboard: item.link_to || item.name },
        }
    }
    
    return "#"
}

function isItemActive(item: SidebarItem): boolean {
    const doctypeName = item.link_to || item.name
    return route.params.doctype === doctypeName
}

function isPageActive(item: SidebarItem): boolean {
    const itemName = item.link_to || item.name
    const type = (item.link_type || item.type || '').toLowerCase()
    
    if (type === 'page') {
        return route.params.page === itemName
    } else if (type === 'report') {
        return route.params.report === itemName
    } else if (type === 'dashboard') {
        return route.params.dashboard === itemName
    }
    
    return false
}

const filteredDoctypes = computed(() => {
    if (!searchQuery.value) return doctypes.value
    const query = searchQuery.value.toLowerCase()
    return doctypes.value.filter(dt => dt.toLowerCase().includes(query))
})

const groupedSidebar = computed(() => {
    const q = (searchQuery.value || '').toLowerCase()

    const filtered = q
        ? sidebarItems.value.filter(si => (si.label || si.name).toLowerCase().includes(q))
        : sidebarItems.value

    const groups = {
        doctypes: [] as SidebarItem[],
        pages: [] as SidebarItem[],
        reports: [] as SidebarItem[],
        dashboards: [] as SidebarItem[],
    }

    for (const item of filtered) {
        // Skip child doctypes (istable = true)
        if (item.istable) continue

        const t = (item.link_type || item.type || '').toLowerCase()
        if (t === 'doctype') groups.doctypes.push(item)
        else if (t === 'report') groups.reports.push(item)
        else if (t === 'dashboard') groups.dashboards.push(item)
        else if (t === 'page') groups.pages.push(item)
    }

    return groups
})

const allSidebarEmpty = computed(() => {
    const g = groupedSidebar.value
    return g.doctypes.length === 0 && g.pages.length === 0 && g.reports.length === 0 && g.dashboards.length === 0
})


onMounted(async () => {
    await fetchSidebar()
})

async function fetchSidebar() {
    try {
        loading.value = true
        const module = (route.params.app as string) || 'desktop'

        const dtResult = await desktopAPI.getModuleDoctypes(module)
        doctypes.value = dtResult

        const sb = await desktopAPI.getModuleSidebar(module)
        sidebarItems.value = sb
        
        // Reset scroll position to top
        if (sidebarContentRef.value) {
            sidebarContentRef.value.scrollTop = 0
        }
    } catch (error) {
        console.error('Failed to load module data:', error)
        doctypes.value = []
        sidebarItems.value = []
    } finally {
        loading.value = false
    }
}

watch(
    () => route.fullPath,
    async () => {
        await fetchSidebar()
    }
)
</script>

<style scoped>
</style>