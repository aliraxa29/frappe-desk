<template>
	<Heading :field="field" />
</template>

<script setup lang="ts">
import type { Field, FormContext } from "../../types";
import Heading from "../controls/Heading.vue";

defineProps<{ field: Field; ctx: FormContext }>();
</script>
