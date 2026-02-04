<template>
    <div class="min-h-screen flex flex-col">
        <!-- Top Navbar -->
        <Navbar class="sticky top-0 z-50" />

        <!-- Sidebar (Fixed) -->
        <AppSidebar />

        <!-- Main Layout with margin for sidebar -->
        <div class="flex flex-1 overflow-hidden flex-col ml-64">
            <!-- Main Content -->
            <main class="flex-1 flex flex-col overflow-hidden">
                <!-- Page Header - Fixed Position -->
                <div class="fixed left-64 right-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-20" style="top: 64px;">
                    <!-- Header slot -->
                    <div class="px-6 flex items-center justify-between">
                        <slot name="header" />
                    </div>
                </div>

                <!-- Page Content - Scrollable with margin for fixed header -->
                <div class="flex-1 overflow-y-auto p-2 bg-transparent text-slate-900 dark:text-slate-100" style="margin-top: 60px;">
                    <slot name="content" />
                </div>
            </main>
        </div>
    </div>
</template>


<script setup lang="ts">
import { computed } from 'vue';
import AppSidebar from './AppSidebar.vue';
import Navbar from './Navbar.vue';

</script>

<style scoped>
.app-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #e0e0e0;
}

.app-layout {
    display: flex;
    flex: 1;
    overflow: visible;
}
</style>