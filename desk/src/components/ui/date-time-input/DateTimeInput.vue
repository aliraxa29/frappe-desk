<script setup lang="ts">
import { computed, ref, watch, type HTMLAttributes } from "vue";
import { CalendarClock } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContentStyled } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateTimeMode = "date" | "datetime-local";
type OutputFormat = "native" | "frappe";

const props = withDefaults(
	defineProps<{
		modelValue?: string;
		defaultValue?: string;
		mode?: DateTimeMode;
		outputFormat?: OutputFormat;
		placeholder?: string;
		disabled?: boolean;
		class?: HTMLAttributes["class"];
	}>(),
	{
		mode: "datetime-local",
		outputFormat: "native",
		placeholder: "Select date & time",
		disabled: false,
	},
);

const emit = defineEmits<{
	(e: "update:modelValue", value: string): void;
	(e: "change", value: string): void;
}>();

const open = ref(false);
const localValue = ref(toNativeValue(props.modelValue ?? props.defaultValue ?? ""));

watch(
	() => props.modelValue,
	(value) => {
		localValue.value = toNativeValue(value ?? "");
	},
);

const displayValue = computed(() => {
	const value = localValue.value;
	if (!value) return props.placeholder;

	if (props.mode === "date") {
		const [year, month, day] = value.split("-");
		if (!year || !month || !day) return value;
		return `${day}/${month}/${year}`;
	}

	return value.replace("T", " ");
});

const inputClass = computed(() => {
	return cn("h-8 w-full text-sm", props.class);
});

function toNativeValue(value: string): string {
	if (!value) return "";

	if (props.mode === "date") {
		return value.slice(0, 10);
	}

	const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
	return normalized.slice(0, 19);
}

function toOutputValue(value: string): string {
	if (!value) return "";

	if (props.mode === "date") {
		return value.slice(0, 10);
	}

	if (props.outputFormat === "frappe") {
		const normalized = value.replace("T", " ");
		return normalized.length === 16 ? `${normalized}:00` : normalized;
	}

	return value;
}

function onValueChange(value: string) {
	localValue.value = value;
	const nextValue = toOutputValue(value);
	emit("update:modelValue", nextValue);
	emit("change", nextValue);
}

function clearValue() {
	onValueChange("");
}

function setNow() {
	if (props.mode === "date") {
		onValueChange(new Date().toISOString().slice(0, 10));
	} else {
		onValueChange(new Date().toISOString().slice(0, 19));
	}
	open.value = false;
}
</script>

<template>
	<Popover v-model:open="open">
		<PopoverTrigger as-child>
			<Button
				type="button"
				variant="outline"
				:disabled="disabled"
				:class="
					cn(
						'h-8 w-full justify-start gap-2 px-2 text-left font-normal',
						!localValue && 'text-muted-foreground',
						props.class,
					)
				"
			>
				<CalendarClock class="h-3.5 w-3.5" />
				<span class="truncate">{{ displayValue }}</span>
			</Button>
		</PopoverTrigger>

		<PopoverContentStyled class="w-[260px] p-3" align="start">
			<div class="space-y-2">
				<Input
					:model-value="localValue"
					:type="mode"
					step="1"
					:class="inputClass"
					@update:model-value="(value) => onValueChange(String(value))"
				/>

				<div class="flex items-center justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="h-7"
						@click="clearValue"
					>
						Clear
					</Button>
					<Button type="button" variant="outline" size="sm" class="h-7" @click="setNow">
						Now
					</Button>
				</div>
			</div>
		</PopoverContentStyled>
	</Popover>
</template>
