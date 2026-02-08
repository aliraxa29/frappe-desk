<template>
	<div class="inline-editor">
		<!-- Check -->
		<template v-if="field.fieldtype === 'Check'">
			<input
				type="checkbox"
				:checked="!!value"
				@change="emit('update', ($event.target as HTMLInputElement).checked ? 1 : 0)"
				@blur="emit('blur')"
				class="check-input"
				ref="inputRef"
			/>
		</template>

		<!-- Select -->
		<template v-else-if="field.fieldtype === 'Select'">
			<select
				:value="value"
				@change="emit('update', ($event.target as HTMLSelectElement).value)"
				@blur="emit('blur')"
				class="select-input"
				ref="inputRef"
			>
				<option value="">Select...</option>
				<option v-for="opt in selectOptions" :key="opt" :value="opt">{{ opt }}</option>
			</select>
		</template>

		<!-- Link -->
		<template v-else-if="field.fieldtype === 'Link'">
			<input
				type="text"
				:value="value"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				@keydown.enter="emit('blur')"
				@keydown.escape="emit('cancel')"
				:placeholder="`Select ${field.options || field.label}`"
				class="text-input"
				ref="inputRef"
			/>
			<!-- TODO: Add Link autocomplete dropdown -->
		</template>

		<!-- Int -->
		<template v-else-if="field.fieldtype === 'Int'">
			<input
				type="number"
				:value="value"
				@input="emit('update', parseInt(($event.target as HTMLInputElement).value) || 0)"
				@blur="emit('blur')"
				@keydown.enter="emit('blur')"
				@keydown.escape="emit('cancel')"
				step="1"
				class="number-input"
				ref="inputRef"
			/>
		</template>

		<!-- Float/Currency/Percent -->
		<template v-else-if="['Float', 'Currency', 'Percent'].includes(field.fieldtype)">
			<input
				type="number"
				:value="value"
				@input="emit('update', parseFloat(($event.target as HTMLInputElement).value) || 0)"
				@blur="emit('blur')"
				@keydown.enter="emit('blur')"
				@keydown.escape="emit('cancel')"
				:step="field.precision ? Math.pow(10, -field.precision) : 0.01"
				class="number-input"
				ref="inputRef"
			/>
		</template>

		<!-- Date -->
		<template v-else-if="field.fieldtype === 'Date'">
			<input
				type="date"
				:value="value"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				@keydown.escape="emit('cancel')"
				class="date-input"
				ref="inputRef"
			/>
		</template>

		<!-- Time -->
		<template v-else-if="field.fieldtype === 'Time'">
			<input
				type="time"
				:value="value"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				@keydown.escape="emit('cancel')"
				class="time-input"
				ref="inputRef"
			/>
		</template>

		<!-- DateTime -->
		<template v-else-if="field.fieldtype === 'DateTime'">
			<input
				type="datetime-local"
				:value="formatDateTimeLocal(value)"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				@keydown.escape="emit('cancel')"
				class="datetime-input"
				ref="inputRef"
			/>
		</template>

		<!-- Color -->
		<template v-else-if="field.fieldtype === 'Color'">
			<input
				type="color"
				:value="value || '#000000'"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				class="color-input"
				ref="inputRef"
			/>
		</template>

		<!-- Default Text Input -->
		<template v-else>
			<input
				type="text"
				:value="value"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				@keydown.enter="emit('blur')"
				@keydown.escape="emit('cancel')"
				class="text-input"
				ref="inputRef"
			/>
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Field, DocTypeMeta } from "../../types";

const props = defineProps<{
	field: Field;
	value: any;
	meta?: DocTypeMeta | null;
}>();

const emit = defineEmits<{
	update: [value: any];
	blur: [];
	cancel: [];
}>();

const inputRef = ref<HTMLInputElement | HTMLSelectElement | null>(null);

// Parse select options from field.options
const selectOptions = computed<string[]>(() => {
	if (!props.field.options) return [];
	return props.field.options.split("\n").filter(Boolean);
});

// Format datetime for datetime-local input
function formatDateTimeLocal(value: any): string {
	if (!value) return "";
	try {
		const date = new Date(value);
		return date.toISOString().slice(0, 16);
	} catch {
		return "";
	}
}

// Auto-focus on mount
onMounted(() => {
	setTimeout(() => {
		if (inputRef.value) {
			inputRef.value.focus();
			if ("select" in inputRef.value && props.field.fieldtype !== "Select") {
				inputRef.value.select();
			}
		}
	}, 0);
});
</script>

<style scoped>
.inline-editor {
	width: 100%;
}

.text-input,
.number-input,
.date-input,
.time-input,
.datetime-input,
.select-input {
	width: 100%;
	padding: 0.25rem 0.5rem;
	font-size: 0.8125rem;
	border: 1px solid #3b82f6;
	border-radius: 0.25rem;
	outline: none;
	background: #fff;
	color: #1e293b;
}

.text-input:focus,
.number-input:focus,
.date-input:focus,
.time-input:focus,
.datetime-input:focus,
.select-input:focus {
	box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.check-input {
	width: 1rem;
	height: 1rem;
	cursor: pointer;
}

.color-input {
	width: 2.5rem;
	height: 1.5rem;
	padding: 0;
	border: 1px solid #e2e8f0;
	border-radius: 0.25rem;
	cursor: pointer;
}

.number-input {
	text-align: right;
}
</style>
