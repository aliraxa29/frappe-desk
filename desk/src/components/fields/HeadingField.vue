<template>
	<div class="heading-field">
		<h4 class="heading-title">{{ field.label }}</h4>
	</div>
</template>

<script setup lang="ts">
import type { Field, FormContext } from "@/types";

defineProps<{ field: Field; ctx: FormContext }>();
</script>

<style scoped>
.heading-field {
	margin: 1rem 0 0.5rem 0;
}

.heading-title {
	font-size: 1rem;
	font-weight: 600;
	color: #333;
	margin: 0;
}
</style>
