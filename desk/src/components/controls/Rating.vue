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
		<div class="flex items-center gap-1">
			<button
				v-for="star in maxStars"
				:key="star"
				type="button"
				:disabled="field.read_only"
				class="text-2xl transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed"
				:class="
					star <= currentRating
						? 'text-yellow-400'
						: 'text-gray-300 dark:text-slate-600 hover:text-yellow-300'
				"
				@click="setRating(star)"
				@mouseenter="hoveredStar = star"
				@mouseleave="hoveredStar = 0"
			>
				<svg
					class="w-6 h-6"
					:class="
						star <= (hoveredStar || currentRating)
							? 'fill-current'
							: 'fill-none stroke-current'
					"
					viewBox="0 0 24 24"
					stroke-width="1.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
					/>
				</svg>
			</button>
			<span v-if="currentRating > 0" class="text-sm text-slate-500 dark:text-slate-400 ml-2">
				{{ currentRating }}/{{ maxStars }}
			</span>
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
import { ref, computed } from "vue";
import type { Field } from "../../types";

const props = defineProps<{
	field: Field;
	modelValue: any;
	error?: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
	blur: [];
}>();

const maxStars = 5;
const hoveredStar = ref(0);

const currentRating = computed(() => {
	const val = Number(props.modelValue);
	return isNaN(val) ? 0 : Math.round(val * maxStars);
});

function setRating(star: number) {
	if (props.field.read_only) return;
	const fraction = star / maxStars;
	// Toggle off if clicking the same rating
	if (currentRating.value === star) {
		emit("update:modelValue", 0);
	} else {
		emit("update:modelValue", fraction);
	}
}
</script>
