<template>
	<div
		v-if="ctx"
		:class="[
			'flex flex-col md:flex-row gap-6',
			section.columns.length === 1 ? 'md:gap-8' : 'md:gap-6',
		]"
	>
		<div
			v-for="(column, colIdx) in section.columns"
			:key="colIdx"
			:class="[
				'flex-1 flex flex-col gap-4 min-w-0',
				shouldUse2ColumnLayout && section.columns.length === 1
					? 'md:flex-none md:w-1/2'
					: '',
			]"
		>
			<div
				v-for="field in column.fields"
				:key="field.fieldname"
				v-show="isFieldVisible(field)"
				:class="[
					'field-wrapper',
					isFullWidthField(field) ? 'col-span-full md:col-span-2' : 'col-span-1',
				]"
			>
				<FieldRenderer
					:field="getEffectiveField(field)"
					:ctx="ctx"
					@field-change="$emit('fieldChange', $event)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field, FormContext, ParsedSection } from "../types";
import FieldRenderer from "../fields/FieldRenderer.vue";
import { evaluateDependsOn } from "../utils/dependsOn";

interface Props {
	section: ParsedSection;
	ctx: FormContext | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	fieldChange: [field: Field];
}>();

// Check if field is full-width (text editor, textarea, etc)
function isFullWidthField(field: Field): boolean {
	const fullWidthTypes = ["Text Editor", "Text", "Code", "Table", "HTML", "Description"];
	return fullWidthTypes.includes(field.fieldtype);
}

// Determine if we should use 2-column layout (when section has no explicit column breaks)
const shouldUse2ColumnLayout = computed(() => {
	return props.section.columns.length === 1;
});

/**
 * Evaluate depends_on expression to determine field visibility.
 * Returns true if the field should be visible.
 */
function isFieldVisible(field: Field): boolean {
	if (!field.depends_on) return true;
	return evaluateDependsOn(field.depends_on, props.ctx?.doc ?? null);
}

/**
 * Build an effective field with read_only_depends_on and mandatory_depends_on applied.
 * Returns a shallow copy with overridden read_only / reqd when relevant.
 */
function getEffectiveField(field: Field): Field {
	const hasReadOnlyDep = !!field.read_only_depends_on;
	const hasMandatoryDep = !!field.mandatory_depends_on;

	if (!hasReadOnlyDep && !hasMandatoryDep) return field;

	const doc = props.ctx?.doc ?? null;
	const effective = { ...field };

	if (hasReadOnlyDep) {
		effective.read_only = evaluateDependsOn(field.read_only_depends_on, doc) ? 1 : 0;
	}

	if (hasMandatoryDep) {
		effective.reqd = evaluateDependsOn(field.mandatory_depends_on, doc) ? 1 : 0;
	}

	return effective;
}
</script>
