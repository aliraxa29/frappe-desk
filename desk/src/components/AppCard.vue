<template>
	<div @click="handleSelect" :class="containerClass">
		<!-- Cover / Image -->
		<div
			class="relative h-28 bg-linear-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-950"
		>
			<img
				:src="app.image || '/assets/desktop/images/no-image.png'"
				alt=""
				class="h-full w-full object-cover opacity-70"
			/>

			<!-- Floating Icon -->
			<div
				class="absolute -bottom-5 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
			>
				<Icon :icon="app.icon || 'mdi:cube-outline'" class="h-6 w-6" />
			</div>
		</div>

		<!-- Content -->
		<div class="flex h-[calc(100%-7rem)] flex-col px-5 pb-5 pt-8">
			<h3
				class="truncate text-base font-semibold text-slate-900 dark:text-slate-100"
				:title="app.title"
			>
				{{ app.title }}
			</h3>

			<p
				class="mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-400"
				:title="app.description || __('No description available')"
			>
				{{ app.description || __("No description available") }}
			</p>

			<div v-if="showActions" class="mt-auto pt-4 flex gap-2">
				<button
					v-if="installed"
					@click.stop="emit('uninstall', app.name)"
					class="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold transition hover:bg-red-500 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200 hover:text-white text-red-600 cursor-pointer"
				>
					{{ __("Uninstall") }}
				</button>
				<button
					v-else
					@click.stop="emit('install', app.name)"
					class="flex-1 rounded-lg border border-violet-600 bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 cursor-pointer"
				>
					{{ __("Install") }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed } from "vue";
import { __ } from "../utils/translate";
import type { AppInfo } from "../types";

type Props = {
	app: AppInfo;
	showActions?: boolean;
	installed?: boolean;
	selectable?: boolean;
};
const props = withDefaults(defineProps<Props>(), {
	showActions: false,
	installed: true,
	selectable: true,
});

const emit = defineEmits<{
	(e: "select", app: typeof props.app.name): void;
	(e: "install", app: typeof props.app.name): void;
	(e: "uninstall", app: typeof props.app.name): void;
}>();

const containerClass = computed(() => [
	"group h-[300px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 flex flex-col",
	props.selectable
		? "cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:border-violet-500 hover:shadow-2xl hover:shadow-violet-500/20"
		: "cursor-default",
]);

const handleSelect = () => {
	if (props.selectable) {
		emit("select", props.app.name);
	}
};
</script>
