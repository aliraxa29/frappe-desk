<template>
	<div class="mb-6" :class="{ 'mb-4': collapsible }">
		<Accordion
			v-if="collapsible"
			:label="label || 'Section'"
			:default-open="!collapsed"
			:collapsible="true"
		>
			<div class="flex gap-6 max-md:flex-col max-md:gap-4">
				<div
					v-for="(column, colIdx) in columns"
					:key="colIdx"
					class="flex flex-col gap-4 min-w-0 max-md:flex-1"
					:style="{ flex: column.flex || 1 }"
				>
					<slot :name="`column-${colIdx}`" :fields="column.fields">
						<div v-for="field in column.fields" :key="field.fieldname">
							<slot name="field" :field="field">
								<!-- Default field slot -->
							</slot>
						</div>
					</slot>
				</div>
			</div>
		</Accordion>

		<template v-else>
			<div v-if="label" class="mb-4 pb-3 border-b border-border">
				<h3 class="text-[0.9375rem] font-semibold text-foreground m-0">
					{{ label }}
				</h3>
				<p v-if="description" class="text-[0.8125rem] text-muted-foreground mt-1 mb-0">
					{{ description }}
				</p>
			</div>

			<div class="flex gap-6 max-md:flex-col max-md:gap-4">
				<div
					v-for="(column, colIdx) in columns"
					:key="colIdx"
					class="flex flex-col gap-4 min-w-0 max-md:flex-1"
					:style="{ flex: column.flex || 1 }"
				>
					<slot :name="`column-${colIdx}`" :fields="column.fields">
						<div v-for="field in column.fields" :key="field.fieldname">
							<slot name="field" :field="field">
								<!-- Default field slot -->
							</slot>
						</div>
					</slot>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { Field } from "../types";
import Accordion from "./Accordion.vue";

export interface SectionColumn {
	fields: Field[];
	flex?: number;
}

withDefaults(
	defineProps<{
		label?: string;
		description?: string;
		collapsible?: boolean;
		collapsed?: boolean;
		columns?: SectionColumn[];
	}>(),
	{
		collapsible: false,
		collapsed: false,
		columns: () => [],
	},
);
</script>
