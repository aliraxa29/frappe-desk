<template>
	<div class="mb-4">
		<label
			:for="id"
			class="flex items-start gap-3 cursor-pointer select-none transition-opacity"
			:class="field.read_only ? 'cursor-not-allowed opacity-50' : 'hover:opacity-80'"
		>
			<div class="relative mt-1">
				<input
					:id="id"
					type="checkbox"
					class="sr-only peer"
					:checked="!!modelValue"
					:required="field.reqd"
					:disabled="field.read_only"
					@change="onToggle"
				/>
				<div
					class="h-5 w-9 rounded-full transition-all bg-slate-300 dark:bg-slate-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-600/50 dark:peer-focus:ring-blue-500/50"
				></div>
				<div
					class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white dark:bg-slate-100 shadow-sm transition-transform peer-checked:translate-x-4 peer-disabled:opacity-50"
				></div>
			</div>
			<div class="flex flex-col">
				<span class="text-[0.95rem] font-medium text-slate-700 dark:text-slate-300">
					{{ field.label }}
					<span v-if="field.reqd" class="text-red-600 dark:text-red-500 ml-1">*</span>
				</span>
				<span
					v-if="field.description"
					class="text-[0.85rem] text-slate-600 dark:text-slate-400 mt-0.5"
				>
					{{ field.description }}
				</span>
			</div>
		</label>
	</div>
</template>

<script setup lang="ts">
import type { Field } from "../../types";

const props = defineProps<{
	field: Field;
	modelValue: any;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: number];
}>();

const id = `field-${props.field.fieldname}`;

function onToggle(e: Event) {
	emit("update:modelValue", (e.target as HTMLInputElement).checked ? 1 : 0);
}
</script>
