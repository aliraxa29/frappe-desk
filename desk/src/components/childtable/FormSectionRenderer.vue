<template>
	<div
		class="mb-6 last:mb-0"
		:class="{
			'border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden':
				section.collapsible,
		}"
	>
		<!-- Collapsible section -->
		<div v-if="section.collapsible" class="bg-white dark:bg-slate-900">
			<button
				type="button"
				class="flex items-center gap-2 w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-left transition-colors duration-200"
				:class="{ 'border-b border-slate-200 dark:border-slate-700': isOpen }"
				@click="toggleSection"
			>
				<svg
					class="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200"
					:class="{ 'rotate-90': isOpen }"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5l7 7-7 7"
					/>
				</svg>
				<span class="text-[0.9375rem] font-semibold text-slate-800 dark:text-slate-200">{{
					section.label || "Section"
				}}</span>
			</button>

			<div v-if="isOpen" class="p-4">
				<p
					v-if="section.description"
					class="text-[0.8125rem] text-slate-500 dark:text-slate-400 mb-4"
				>
					{{ section.description }}
				</p>
				<div class="flex gap-6 max-md:flex-col max-md:gap-4">
					<div
						v-for="(column, colIdx) in section.columns"
						:key="colIdx"
						class="flex-1 flex flex-col gap-4 min-w-0"
					>
						<div v-for="field in column.fields" :key="field.fieldname">
							<ModalFieldEditor
								:field="field"
								:value="rowData[field.fieldname]"
								:meta="childMeta"
								@update="$emit('update', field.fieldname, $event)"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Non-collapsible section -->
		<template v-else>
			<div
				v-if="section.label"
				class="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700"
			>
				<h3 class="text-[0.9375rem] font-semibold text-slate-800 dark:text-slate-200 m-0">
					{{ section.label }}
				</h3>
				<p
					v-if="section.description"
					class="text-[0.8125rem] text-slate-500 dark:text-slate-400 mt-1 mb-0"
				>
					{{ section.description }}
				</p>
			</div>

			<div class="flex gap-6 max-md:flex-col max-md:gap-4">
				<div
					v-for="(column, colIdx) in section.columns"
					:key="colIdx"
					class="flex-1 flex flex-col gap-4 min-w-0"
				>
					<div v-for="field in column.fields" :key="field.fieldname">
						<ModalFieldEditor
							:field="field"
							:value="rowData[field.fieldname]"
							:meta="childMeta"
							@update="$emit('update', field.fieldname, $event)"
						/>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Field, DocTypeMeta } from "../../types";
import ModalFieldEditor from "./ModalFieldEditor.vue";

interface FormColumn {
	fields: Field[];
}

interface FormSection {
	label?: string;
	description?: string;
	collapsible?: boolean;
	collapsed?: boolean;
	columns: FormColumn[];
}

const props = defineProps<{
	section: FormSection;
	rowData: Record<string, any>;
	childMeta: DocTypeMeta | null;
}>();

defineEmits<{
	update: [fieldname: string, value: any];
}>();

// Section open/closed state
const isOpen = ref(!props.section.collapsed);

// Watch for changes to collapsed prop
watch(
	() => props.section.collapsed,
	(newVal) => {
		isOpen.value = !newVal;
	},
);

function toggleSection() {
	isOpen.value = !isOpen.value;
}
</script>
