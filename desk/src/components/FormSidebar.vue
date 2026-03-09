<template>
	<div class="w-64 border-r border-border bg-background">
		<div class="flex items-center justify-between px-4 py-5 border-b border-border shrink-0">
			<span class="text-sm font-semibold text-foreground tracking-wide">
				{{ __("Document Info") }}
			</span>
			<button
				@click="closeSidebar"
				class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:text-muted-foreground dark:hover:bg-secondary transition-colors"
				:aria-label="__('Close sidebar')"
			>
				<X class="h-4 w-4" />
			</button>
		</div>

		<div class="flex border-b border-border shrink-0">
			<button
				v-for="tab in tabs"
				:key="tab.key"
				@click="activeTab = tab.key"
				:class="[
					'flex-1 py-2.5 text-xs font-medium transition-colors',
					activeTab === tab.key
						? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
						: 'text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground',
				]"
			>
				{{ tab.label }}
			</button>
		</div>

		<div class="flex-1 overflow-y-auto">
			<SidebarTimeline
				v-if="activeTab === 'timeline'"
				:doc="doc"
				:doctype="doctype"
				:docinfo="docinfo"
				:frm="frm"
			/>
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
	docinfo?: Record<string, any> | null;
	frm?: any;
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
