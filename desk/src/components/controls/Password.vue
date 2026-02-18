<template>
	<div class="flex flex-col gap-2">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium text-sm text-slate-700 dark:text-white"
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
				class="w-full px-3 py-2.5 pr-10 border border-[#ddd] dark:border-none dark:bg-gray-800 rounded focus:outline-none focus:border-[#0066cc] dark:focus:border-gray-500 focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] read-only:bg-gray-100 read-only:cursor-not-allowed text-[0.95rem] transition-colors duration-200 dark:text-white"
				@input="onInput"
				@blur="$emit('blur')"
			/>
			<button
				type="button"
				class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
				@click="showPassword = !showPassword"
				tabindex="-1"
			>
				<Eye v-if="!showPassword" class="w-4 h-4" />
				<EyeOff v-else class="w-4 h-4" />
			</button>
		</div>
		<small
			v-if="field.description"
			class="block text-gray-600 text-[0.85rem] leading-relaxed"
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
