<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-sm text-foreground"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-500 ml-1">*</span>
		</label>
		<div class="relative">
			<input
				:id="`field-${field.fieldname}`"
				:value="modelValue"
				:readonly="field.read_only"
				:required="field.reqd"
				:type="showPassword ? 'text' : 'password'"
				autocomplete="off"
				class="w-full px-3 py-2.5 pr-10 border border-input rounded focus:outline-none focus:border-ring focus-visible:ring-2 focus-visible:ring-ring read-only:bg-muted read-only:cursor-not-allowed text-[0.95rem] transition-colors duration-200"
				@input="onInput"
				@blur="$emit('blur')"
			/>
			<button
				type="button"
				class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground p-1"
				@click="showPassword = !showPassword"
				tabindex="-1"
			>
				<Eye v-if="!showPassword" class="w-4 h-4" />
				<EyeOff v-else class="w-4 h-4" />
			</button>
		</div>
		<small
			v-if="field.description"
			class="block text-muted-foreground text-[0.85rem] leading-relaxed"
			>{{ field.description }}</small
		>
		<small v-if="error" class="text-red-500 block text-[0.85rem]">{{ error }}</small>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Field } from "../../types";
import Eye from "../../icons/Eye.vue";
import EyeOff from "../../icons/EyeOff.vue";

defineProps<{
	field: Field;
	modelValue: any;
	error?: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
	blur: [];
}>();

const showPassword = ref(false);

function onInput(e: Event) {
	emit("update:modelValue", (e.target as HTMLInputElement).value);
}
</script>
