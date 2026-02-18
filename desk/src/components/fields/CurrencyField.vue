<template>
	<Currency
		:field="field"
		:model-value="ctx.doc?.[field.fieldname] ?? ''"
		:currency="resolvedCurrency"
		:error="fieldError"
		@update:model-value="onUpdate"
	/>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field, FormContext } from "../../types";
import Currency from "../controls/Currency.vue";

const props = defineProps<{ field: Field; ctx: FormContext }>();
const emit = defineEmits<{ fieldChange: [value: any] }>();

const fieldError = computed(() => (props.ctx as any).fieldErrors?.[props.field.fieldname]);

const resolvedCurrency = computed(() => {
	const options = props.field.options;
	if (options && typeof options === "string") {
		const docValue = props.ctx.doc?.[options];
		if (typeof docValue === "string" && docValue.trim()) return docValue;
		if (options.length <= 5) return options;
	}
	const desk = (window as any)?.desk;
	return desk?.boot?.sysdefaults?.currency || "USD";
});

function onUpdate(value: any) {
	props.ctx.set_value(props.field.fieldname, value);
	emit("fieldChange", value);
}
</script>
