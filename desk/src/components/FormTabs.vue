<template>
	<div class="flex flex-col">
		<div
			class="sticky top-0 z-25 flex gap-1 border-b border-slate-200 dark:border-slate-700 px-2 bg-slate-50 dark:bg-slate-800 overflow-x-auto scroll-area scrollbar-hide"
			role="tablist"
		>
			<button
				v-for="(tab, idx) in tabs"
				v-show="isTabVisible(tab)"
				:key="tab.fieldname || idx"
				class="px-5 py-3 border-0 bg-transparent text-sm font-medium cursor-pointer whitespace-nowrap relative transition-colors duration-200"
				:class="[
					activeTab === idx
						? 'text-blue-600 dark:text-blue-400 after:absolute after:-bottom-px after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:rounded-t'
						: 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
				]"
				role="tab"
				:aria-selected="activeTab === idx"
				@click="activeTab = idx"
			>
				{{ tab.label || `Tab ${idx + 1}` }}
			</button>
		</div>

		<div class="py-6 mx-2">
			<div
				v-for="(tab, idx) in tabs"
				v-show="activeTab === idx && isTabVisible(tab)"
				:key="tab.fieldname || idx"
				class="animate-fadeIn"
				role="tabpanel"
			>
				<slot :name="`tab-${idx}`" :tab="tab" :fields="tab.fields"> </slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Field } from "../types";
import { evaluateDependsOn } from "../utils/dependsOn";
import type { Form } from "../metadata/form";

export interface TabDefinition {
	fieldname?: string;
	label?: string;
	fields: Field[];
	hidden?: boolean;
	depends_on?: string;
}

const props = withDefaults(
	defineProps<{
		tabs: TabDefinition[];
		defaultTab?: number;
		ctx?: Form | null;
	}>(),
	{
		defaultTab: 0,
		ctx: null,
	},
);

const activeTab = ref(props.defaultTab);

function isTabVisible(tab: TabDefinition): boolean {
	if (tab.hidden) return false;
	if (!tab.depends_on) return true;
	return evaluateDependsOn(tab.depends_on, props.ctx?.doc ?? null);
}
</script>

<style scoped>
.scrollbar-hide {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
	display: none;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-4px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-fadeIn {
	animation: fadeIn 0.2s ease;
}
</style>
