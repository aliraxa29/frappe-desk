<template>
        <div @click="selectApp(app.name)" class="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300
            hover:-translate-y-1 hover:scale-[1.02] hover:border-violet-500 hover:shadow-2xl hover:shadow-violet-500/20">
        <!-- Cover / Image -->
        <div class="relative h-28 bg-linear-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-950">
            <img :src="app.image || '/assets/desktop/images/no-image.png'" alt=""
                class="h-full w-full object-cover opacity-70" />

            <!-- Floating Icon -->
            <div class="absolute -bottom-5 left-4 flex h-11 w-11 items-center justify-center rounded-xl
             bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg
             transition-transform duration-300 group-hover:scale-110">
                <Icon :icon="app.icon || 'mdi:cube-outline'" class="h-6 w-6" />
            </div>
        </div>

        <!-- Content -->
        <div class="px-5 pb-5 pt-8">
            <h3 class="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                {{ app.title }}
            </h3>

            <p class="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                {{ app.description || 'No description available' }}
            </p>
        </div>
    </div>
</template>


<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { AppInfo } from '../types';

type Props = {
    app: AppInfo
}
const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'select', app: typeof props.app.name): void
}>()

const selectApp = (app: typeof props.app.name) => {
    emit('select', app)
}
</script>