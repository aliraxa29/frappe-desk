<template>
	<DateTime
		:field="field"
		:model-value="ctx.doc?.[field.fieldname] ?? ''"
		:error="fieldError"
		@update:model-value="onUpdate"
		@blur="onBlur"
	/>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field } from "../../types";
import DateTime from "../controls/DateTime.vue";
import type { Form } from "../../metadata/form";

const props = defineProps<{ field: Field; ctx: Form }>();
const emit = defineEmits<{ fieldChange: [value: any] }>();

const fieldError = computed(() => (props.ctx as any).fieldErrors?.[props.field.fieldname]);

function onUpdate(value: any) {
	props.ctx.set_value(props.field.fieldname, value);
	emit("fieldChange", value);
}
</script>
