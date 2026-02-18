<template>
	<TextArea
		:field="field"
		:model-value="ctx.doc?.[field.fieldname] ?? ''"
		:error="fieldError"
		@update:model-value="onUpdate"
		@blur="onBlur"
	/>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field, FormContext } from "../../types";
import TextArea from "../controls/TextArea.vue";

const props = defineProps<{ field: Field; ctx: FormContext }>();
const emit = defineEmits<{ fieldChange: [value: any] }>();

const fieldError = computed(() => (props.ctx as any).fieldErrors?.[props.field.fieldname]);

function onUpdate(value: any) {
	props.ctx.set_value(props.field.fieldname, value);
	emit("fieldChange", value);
}

function onBlur() {}
</script>
