<template>
	<div
		class="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col overflow-hidden h-full shrink-0"
	>
		<!-- Header -->
		<div
			class="flex items-center justify-between px-4 py-5 border-b border-slate-200 dark:border-slate-700 shrink-0"
		>
			<span class="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-wide">{{
				__("Document Info")
			}}</span>
			<button
				@click="closeSidebar"
				class="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
				:aria-label="__('Close sidebar')"
			>
				<X class="h-4 w-4" />
			</button>
		</div>

		<!-- Tab Bar -->
		<div class="flex border-b border-slate-200 dark:border-slate-700 shrink-0">
			<button
				v-for="tab in tabs"
				:key="tab.key"
				@click="activeTab = tab.key"
				:class="[
					'flex-1 py-2.5 text-xs font-medium transition-colors',
					activeTab === tab.key
						? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
						: 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
				]"
			>
				{{ tab.label }}
			</button>
		</div>

		<!-- Tab Content -->
		<div class="flex-1 overflow-y-auto">
			<SidebarTimeline v-if="activeTab === 'timeline'" :doc="doc" :doctype="doctype" />
			<SidebarAssignments
				v-else-if="activeTab === 'assignments'"
				:doc="doc"
				:doctype="doctype"
			/>
			<SidebarTags v-else-if="activeTab === 'tags'" :doc="doc" :doctype="doctype" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Document } from "../types";
import SidebarAssignments from "./sidebar/SidebarAssignments.vue";
import SidebarTags from "./sidebar/SidebarTags.vue";
import SidebarTimeline from "./sidebar/SidebarTimeline.vue";
import X from "../icons/X.vue";
import { __ } from "../utils/translate";

interface Props {
	doc: Document | null;
	doctype: string;
	isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
	"update:isOpen": [value: boolean];
}>();

const tabs = [
	{ key: "timeline", label: __("Timeline") },
	{ key: "assignments", label: __("Assigned") },
	{ key: "tags", label: __("Tags") },
];

const activeTab = ref("timeline");

function closeSidebar() {
	emit("update:isOpen", false);
}
</script>
