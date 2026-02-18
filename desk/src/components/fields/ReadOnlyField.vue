<template>
	<ReadOnly :field="field" :model-value="ctx.doc?.[field.fieldname] ?? ''" />
</template>

<script setup lang="ts">
import type { Field, FormContext } from "../../types";
import ReadOnly from "../controls/ReadOnly.vue";

defineProps<{ field: Field; ctx: FormContext }>();
</script>
