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
					class="h-5 w-9 rounded-full transition-colors duration-200 bg-muted peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-ring/50"
				></div>
				<div
					class="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-transform duration-200 peer-checked:translate-x-4"
				></div>
			</div>
			<div class="flex flex-col">
				<span class="text-[0.95rem] font-medium text-foreground">
					{{ field.label }}
					<span v-if="field.reqd" class="text-red-600 dark:text-red-500 ml-1">*</span>
				</span>
				<span v-if="field.description" class="text-[0.85rem] text-muted-foreground mt-0.5">
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
