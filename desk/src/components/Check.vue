<template>
	<div class="flex flex-col gap-1.5">
		<!-- Checkbox + Label -->
		<label
			class="inline-flex items-center gap-3 cursor-pointer select-none"
			:class="{ 'cursor-not-allowed opacity-60': readonly }"
		>
			<input
				type="checkbox"
				class="sr-only"
				:checked="modelValue"
				:disabled="readonly"
				:required="required"
				@change="onChange"
			/>

			<!-- Custom checkbox -->
			<div
				class="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow ring-offset-background transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
				:class="modelValue ? 'bg-primary text-primary-foreground' : 'bg-background'"
			>
				<svg
					v-if="modelValue"
					xmlns="http://www.w3.org/2000/svg"
					class="h-3 w-3"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>

			<!-- Label text -->
			<span v-if="label" class="text-sm font-medium text-foreground">
				{{ label }}
				<span v-if="required" class="text-destructive ml-0.5">*</span>
			</span>
		</label>

		<!-- Description -->
		<p v-if="description" class="text-xs text-muted-foreground leading-relaxed">
			{{ description }}
		</p>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	modelValue?: boolean;
	label?: string;
	description?: string;
	readonly?: boolean;
	required?: boolean;
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void;
	(e: "change", value: boolean): void;
}>();

function onChange(e: Event) {
	if (props.readonly) return;

	const value = (e.target as HTMLInputElement).checked;
	emit("update:modelValue", value);
	emit("change", value);
}
</script>
