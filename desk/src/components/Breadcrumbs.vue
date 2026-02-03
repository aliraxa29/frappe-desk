<template>
    <div v-if="breadcrumbs.length > 0" class="flex items-center min-w-0 gap-1.5 text-sm">
        <!-- Collapsed breadcrumbs (shown when there are many items) -->
        <template v-if="shouldCollapse">
            <!-- First item (App) - always show -->
            <router-link v-if="breadcrumbs[0]?.route" :to="breadcrumbs[0].route"
                class="text-gray-400 hover:text-white transition-colors truncate max-w-24"
                :title="breadcrumbs[0].label">
                {{ breadcrumbs[0].label }}
            </router-link>

            <!-- Separator -->
            <span class="text-gray-600 shrink-0">/</span>

            <!-- Ellipsis dropdown for middle items -->
            <div class="relative" v-if="middleItems.length > 0">
                <button @click.stop="showMiddleDropdown = !showMiddleDropdown"
                    class="text-gray-500 hover:text-white px-1 transition-colors" title="Show more">
                    ...
                </button>

                <!-- Dropdown menu -->
                <div v-if="showMiddleDropdown"
                    class="absolute left-0 top-full mt-1 py-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-40">
                    <router-link v-for="(item, idx) in middleItems" :key="idx" :to="item.route || '#'"
                        class="block px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 truncate"
                        @click="showMiddleDropdown = false">
                        {{ item.label }}
                    </router-link>
                </div>
            </div>

            <!-- Separator before last item -->
            <span v-if="middleItems.length > 0" class="text-gray-600 shrink-0">/</span>
        </template>

        <!-- Normal breadcrumbs (not collapsed) -->
        <template v-else>
            <template v-for="(crumb, index) in breadcrumbs.slice(0, -1)" :key="index">
                <router-link v-if="crumb.route" :to="crumb.route"
                    class="text-gray-400 hover:text-white transition-colors truncate max-w-28" :title="crumb.label">
                    {{ crumb.label }}
                </router-link>
                <span v-else class="text-gray-400 truncate max-w-28" :title="crumb.label">
                    {{ crumb.label }}
                </span>

                <!-- Separator -->
                <span class="text-gray-600 shrink-0">/</span>
            </template>
        </template>

        <!-- Last item (current page) - always visible, copyable -->
        <button v-if="lastItem" @click="copyToClipboard"
            class="text-gray-200 font-medium truncate max-w-48 hover:text-white transition-colors cursor-pointer group flex items-center gap-1"
            :title="`${lastItem.label} (Click to copy)`">
            <span class="truncate">{{ lastItem.label }}</span>
            <svg class="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBreadcrumbStore } from '../stores/breadcrumbs'
import { storeToRefs } from 'pinia'
import { toast } from '../stores/toast'

const route = useRoute()
const breadcrumbStore = useBreadcrumbStore()
const { items: breadcrumbs } = storeToRefs(breadcrumbStore)

const showMiddleDropdown = ref(false)

// Collapse breadcrumbs when there are more than 2 items
const shouldCollapse = computed(() => breadcrumbs.value.length > 3)

// Get middle items (everything except first and last)
const middleItems = computed(() => {
    if (breadcrumbs.value.length <= 2) return []
    return breadcrumbs.value.slice(1, -1)
})

// Get last item
const lastItem = computed(() => {
    if (breadcrumbs.value.length === 0) return null
    return breadcrumbs.value[breadcrumbs.value.length - 1]
})

// Copy last item label to clipboard
async function copyToClipboard() {
    if (!lastItem.value) return

    try {
        await navigator.clipboard.writeText(lastItem.value.label)
        toast.success('Copied to clipboard')
    } catch (err) {
        console.error('Failed to copy:', err)
    }
}

// Close dropdown when clicking outside
function handleClickOutside(e: Event) {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
        showMiddleDropdown.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

// Close dropdown on route change
watch(() => route.fullPath, () => {
    showMiddleDropdown.value = false
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
