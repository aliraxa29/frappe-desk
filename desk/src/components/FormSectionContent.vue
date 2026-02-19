<template>
	<div
		v-if="ctx"
		:class="['flex flex-col gap-6', section.columns.length > 1 ? 'md:flex-row' : '']"
	>
		<template v-for="(column, colIdx) in section.columns" :key="colIdx">
			<template v-if="section.columns.length > 1">
				<div class="flex-1 flex flex-col gap-4 min-w-0">
					<div
						v-for="field in column.fields"
						:key="field.fieldname"
						v-show="isFieldVisible(field)"
						:class="['field-wrapper', isFullWidthField(field) ? 'md:col-span-2' : '']"
					>
						<FieldRenderer
							:field="getEffectiveField(field)"
							:ctx="ctx"
							@field-change="$emit('fieldChange', $event)"
						/>
					</div>
				</div>
			</template>

			<template v-else>
				<div class="w-full">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div
							v-for="field in column.fields"
							:key="field.fieldname"
							v-show="isFieldVisible(field)"
							:class="[
								'field-wrapper',
								isFullWidthField(field) ? 'md:col-span-2' : '',
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
		</template>
	</div>
</template>

<script setup lang="ts">
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

function isFullWidthField(field: Field): boolean {
	const fullWidthTypes = [
		"Text Editor",
		"Text",
		"Small Text",
		"Code",
		"Table",
		"HTML",
		"Description",
		"Long Text",
	];
	return fullWidthTypes.includes(field.fieldtype);
}

function isFieldVisible(field: Field): boolean {
	if (!field.depends_on) return true;
	return evaluateDependsOn(field.depends_on, props.ctx?.doc ?? null);
}

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
