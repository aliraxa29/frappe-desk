<template>
	<Check
		:field="field"
		:model-value="ctx.doc?.[field.fieldname] ? 1 : 0"
		@update:model-value="onUpdate"
	/>
</template>

<script setup lang="ts">
import type { Field, FormContext } from "../../types";
import Check from "../controls/Check.vue";

const props = defineProps<{ field: Field; ctx: FormContext }>();
const emit = defineEmits<{ fieldChange: [value: any] }>();

function onUpdate(value: any) {
	props.ctx.set_value(props.field.fieldname, value);
	emit("fieldChange", value);
}
</script>
