<template>
	<div data-form-content class="flex flex-col gap-6 p-4">
		<div v-if="imageField && ctx" class="mb-4">
			<div
				class="rounded-2xl border border-slate-200 bg-white dark:bg-slate-800/50 dark:border-slate-600 shadow-sm p-6"
			>
				<div v-if="imageValue" class="mb-4 flex justify-center">
					<div class="relative group">
						<img
							:src="imageValue"
							:alt="imageField.label"
							class="max-h-64 rounded-lg shadow-md"
						/>
						<button
							@click="removeImage"
							class="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
							:aria-label="__('Remove image')"
						>
							<X class="h-4 w-4" />
						</button>
					</div>
				</div>

				<FieldRenderer :field="imageField" :ctx="ctx" @field-change="onFieldChange" />
			</div>
		</div>

		<template v-for="section in sections" :key="section.fieldname || section.label">
			<Accordion
				v-if="section.collapsible && isSectionVisible(section)"
				:label="section.label || __('Details')"
				:default-open="getSectionDefaultOpen(section)"
				class="rounded-2xl"
			>
				<div class="mx-2">
					<FormSectionContent
						:section="section"
						:ctx="ctx"
						@field-change="onFieldChange"
					/>
				</div>
			</Accordion>

			<div v-else-if="isSectionVisible(section)" class="mb-4">
				<div
					class="rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/70 shadow-sm p-6"
				>
					<div v-if="section.label" class="mb-4 flex items-center gap-2">
						<div class="h-6 w-1 rounded bg-blue-500/70 mr-2"></div>
						<h3 class="text-base font-semibold text-slate-800 dark:text-white m-0">
							{{ section.label }}
						</h3>
					</div>
					<p v-if="section.description" class="text-xs text-slate-500 mt-1 mb-4 m-0">
						{{ section.description }}
					</p>
					<FormSectionContent
						:section="section"
						:ctx="ctx"
						@field-change="onFieldChange"
					/>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field, FormContext, ParsedSection } from "../types";
import FieldRenderer from "../fields/FieldRenderer.vue";
import FormSectionContent from "./FormSectionContent.vue";
import Accordion from "./Accordion.vue";
import X from "../icons/X.vue";
import { __ } from "../utils/translate";
import { evaluateDependsOn } from "../utils/dependsOn";

interface Props {
	sections: ParsedSection[];
	ctx: FormContext | null;
	imageFieldname?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	fieldChange: [field: Field];
}>();

const imageField = computed(() => {
	if (!props.imageFieldname || !props.ctx) return null;
	const field = props.ctx.meta?.fields.find((f) => f.fieldname === props.imageFieldname);
	return field && field.fieldtype === "Attach Image" ? field : null;
});

const imageValue = computed(() => {
	return props.ctx?.doc?.[props.imageFieldname || ""] || null;
});

function removeImage() {
	if (props.imageFieldname && props.ctx) {
		props.ctx.set_value(props.imageFieldname, "");
	}
}

function onFieldChange(field: Field) {
	emit("fieldChange", field);
}

/**
 * Evaluate section depends_on to determine visibility.
 */
function isSectionVisible(section: ParsedSection): boolean {
	if (!section.depends_on) return true;
	return evaluateDependsOn(section.depends_on, props.ctx?.doc ?? null);
}

/**
 * Determine if collapsible section should default to open.
 * Evaluates collapsible_depends_on if present.
 */
function getSectionDefaultOpen(section: ParsedSection): boolean {
	if (section.collapsible_depends_on) {
		return evaluateDependsOn(section.collapsible_depends_on, props.ctx?.doc ?? null);
	}
	return !section.collapsed;
}
</script>
