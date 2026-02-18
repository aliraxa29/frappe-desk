<template>
	<Link
		:field="field"
		:model-value="ctx.doc?.[field.fieldname] ?? ''"
		@update:model-value="onUpdate"
	/>
</template>

<script setup lang="ts">
import type { Field, FormContext } from "../../types";
import Link from "../controls/Link.vue";

const props = defineProps<{ field: Field; ctx: FormContext }>();
const emit = defineEmits<{ fieldChange: [value: any] }>();

function onUpdate(value: any) {
	props.ctx.set_value(props.field.fieldname, value);
	emit("fieldChange", value);
}
</script>
