<template>
	<div class="flex items-center gap-1.5">
		<span class="inline-block w-2 h-2 rounded-full shrink-0" :class="dotClass" />
		<span class="text-sm" :class="textClass">{{ __(displayStatus) }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Document } from "../../../types";

const props = defineProps<{
	value: any;
	row?: Document;
}>();

const displayStatus = computed(() => {
	if (props.value) return String(props.value);
	if (!props.row) return "Draft";
	const ds = props.row.docstatus;
	if (ds === 1) return "Submitted";
	if (ds === 2) return "Cancelled";
	return "Draft";
});

const statusColorMap: Record<string, { dot: string; text: string }> = {
	draft: { dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" },
	open: { dot: "bg-orange-500", text: "text-orange-700 dark:text-orange-300" },
	pending: { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-300" },
	submitted: { dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
	completed: { dot: "bg-green-500", text: "text-green-700 dark:text-green-300" },
	paid: { dot: "bg-green-500", text: "text-green-700 dark:text-green-300" },
	unpaid: { dot: "bg-orange-500", text: "text-orange-700 dark:text-orange-300" },
	overdue: { dot: "bg-red-500", text: "text-red-700 dark:text-red-300" },
	cancelled: { dot: "bg-red-500", text: "text-red-700 dark:text-red-300" },
	closed: { dot: "bg-slate-500", text: "text-slate-600 dark:text-slate-400" },
	active: { dot: "bg-green-500", text: "text-green-700 dark:text-green-300" },
	inactive: { dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" },
	enabled: { dot: "bg-green-500", text: "text-green-700 dark:text-green-300" },
	disabled: { dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" },
	working: { dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
	queued: { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-300" },
	error: { dot: "bg-red-500", text: "text-red-700 dark:text-red-300" },
	rejected: { dot: "bg-red-500", text: "text-red-700 dark:text-red-300" },
	approved: { dot: "bg-green-500", text: "text-green-700 dark:text-green-300" },
	"not started": { dot: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" },
	"in progress": { dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
	"on hold": { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-300" },
	"partially paid": { dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-300" },
	"return issued": { dot: "bg-purple-500", text: "text-purple-700 dark:text-purple-300" },
};

const dotClass = computed(() => {
	const s = displayStatus.value.toLowerCase();
	return statusColorMap[s]?.dot || "bg-slate-400";
});

const textClass = computed(() => {
	const s = displayStatus.value.toLowerCase();
	return statusColorMap[s]?.text || "text-slate-600 dark:text-slate-400";
});
</script>
