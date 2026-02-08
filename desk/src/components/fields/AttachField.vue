<template>
	<div class="field-wrapper">
		<label v-if="field.label" :for="`field-${field.fieldname}`" class="field-label">
			{{ field.label }}
			<span v-if="field.reqd" class="required">*</span>
		</label>
		<input
			:id="`field-${field.fieldname}`"
			:value="ctx.doc[field.fieldname]"
			:readonly="field.read_only"
			:required="field.reqd"
			type="file"
			class="field-input"
			@change="updateValue"
		/>
		<small v-if="field.description" class="field-description">{{ field.description }}</small>
	</div>
</template>

<script setup lang="ts">
import type { Field, FormContext } from "@/types";

defineProps<{ field: Field; ctx: FormContext }>();

const emit = defineEmits<{
	fieldChange: [value: any];
}>();

function updateValue(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0];
	if (file) {
		ctx.set_value(field.fieldname, file.name);
		emit("fieldChange", file.name);
	}
}
</script>

<style scoped>
.field-wrapper {
	margin-bottom: 1rem;
	display: flex;
	flex-direction: column;
}

.field-label {
	font-weight: 500;
	margin-bottom: 0.25rem;
	font-size: 0.95rem;
}

.required {
	color: #dc3545;
	margin-left: 0.25rem;
}

.field-input::file-selector-button {
	padding: 0.5rem 1rem;
	background-color: #f5f5f5;
	border: 1px solid #ddd;
	border-radius: 4px;
	cursor: pointer;
	margin-right: 0.5rem;
}

.field-input::file-selector-button:hover {
	background-color: #e8e8e8;
}

.field-description {
	display: block;
	color: #666;
	margin-top: 0.25rem;
	font-size: 0.85rem;
}
</style>
