<template>
	<div class="flex flex-col relative">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium mb-2 text-sm text-foreground"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-500 ml-1">*</span>
		</label>

		<input
			ref="inputRef"
			:id="`field-${field.fieldname}`"
			:value="displayDateTime"
			:placeholder="field.description || 'YYYY-MM-DD HH:MM:SS'"
			:disabled="field.read_only"
			:required="field.reqd && !field.read_only"
			type="text"
			class="w-full px-3 py-2.5 border border-input rounded focus:outline-none focus:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:bg-muted disabled:disabled:cursor-not-allowed text-[0.95rem] transition-colors duration-200 bg-background"
			readonly
			@focus="showPicker = true"
		/>
		<small v-if="field.description" class="block text-muted-foreground mt-1 text-[0.85rem]">{{
			field.description
		}}</small>
		<small v-if="error" class="text-red-500 block text-[0.85rem]">{{ error }}</small>

		<Transition name="picker">
			<div
				v-if="showPicker"
				ref="pickerRef"
				class="absolute top-full left-0 mt-2 z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-4"
				style="width: 320px"
			>
				<div class="text-center mb-3 pb-2 border-b border-border">
					<div class="text-sm font-semibold text-foreground">
						{{ formatDate(year, month, day) }} {{ padTime(hour) }}:{{
							padTime(minute)
						}}:{{ padTime(second) }}
					</div>
				</div>

				<div class="mb-3">
					<div class="flex justify-between items-center mb-3">
						<Button variant="primary" size="sm" @click="prevMonth" class="px-3 py-1.5">
							← Prev
						</Button>
						<span class="text-xs font-semibold text-foreground"
							>{{ getMonthName(month) }} {{ year }}</span
						>
						<Button variant="primary" size="sm" @click="nextMonth" class="px-3 py-1.5">
							Next →
						</Button>
					</div>

					<div class="grid grid-cols-7 gap-1 mb-2">
						<div
							v-for="dayLabel in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
							:key="dayLabel"
							class="text-center text-xs font-semibold text-muted-foreground"
						>
							{{ dayLabel }}
						</div>
					</div>

					<div class="grid grid-cols-7 gap-1">
						<button
							v-for="d in calendarDays"
							:key="d"
							type="button"
							:disabled="d === 0"
							:class="getDayButtonClass(d)"
							@click="selectDay(d)"
							class="text-xs py-1 cursor-pointer rounded transition-colors disabled:cursor-default hover:bg-muted dark:hover:bg-secondary"
						>
							{{ d || "" }}
						</button>
					</div>
				</div>

				<div class="border-t border-border pt-3">
					<div class="mb-2">
						<div class="flex justify-between items-center mb-1">
							<label
								class="text-xs font-medium text-muted-foreground uppercase tracking-wide text-[11px]"
								>{{ __("Hour") }}</label
							>
							<span class="text-xs font-semibold text-foreground">
								{{ padTime(hour) }}
							</span>
						</div>
						<input
							v-model.number="hour"
							type="range"
							min="0"
							max="23"
							class="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer slider dark-slider-bg"
							@input="emitValue"
						/>
					</div>
					<div class="mb-2">
						<div class="flex justify-between items-center mb-1">
							<label
								class="text-xs font-medium text-muted-foreground uppercase tracking-wide text-[11px]"
							>
								{{ __("Minute") }}</label
							>
							<span class="text-xs font-semibold text-foreground">{{
								padTime(minute)
							}}</span>
						</div>
						<input
							v-model.number="minute"
							type="range"
							min="0"
							max="59"
							class="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer slider"
							@input="emitValue"
						/>
					</div>
					<div class="mb-3">
						<div class="flex justify-between items-center mb-1">
							<label
								class="text-xs font-medium text-muted-foreground uppercase tracking-wide text-[11px]"
							>
								{{ __("Second") }}
							</label>
							<span class="text-xs font-semibold text-foreground">
								{{ padTime(second) }}
							</span>
						</div>
						<input
							v-model.number="second"
							type="range"
							min="0"
							max="59"
							class="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer slider"
							@input="emitValue"
						/>
					</div>

					<Button variant="primary" @click="setNow" class="w-full px-3 py-1.5">
						{{ __("Now") }}
					</Button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import type { Field } from "../../types";
import Button from "../Button.vue";
import { __ } from "../../utils/translate";

const props = defineProps<{
	field: Field;
	modelValue: any;
	error?: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
}>();

const year = ref(new Date().getFullYear());
const month = ref(new Date().getMonth());
const day = ref(new Date().getDate());
const hour = ref(0);
const minute = ref(0);
const second = ref(0);
const showPicker = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const pickerRef = ref<HTMLElement | null>(null);

const displayDateTime = computed(() => {
	return (props.modelValue as string) || "0000-00-00 00:00:00";
});

const calendarDays = computed(() => {
	const firstDay = new Date(year.value, month.value, 1).getDay();
	const daysInMonth = new Date(year.value, month.value + 1, 0).getDate();
	const days: number[] = [];
	for (let i = 0; i < firstDay; i++) days.push(0);
	for (let i = 1; i <= daysInMonth; i++) days.push(i);
	return days;
});

function getDayButtonClass(d: number): string {
	if (d === 0) return "bg-transparent";
	const isSelected = d === day.value;
	const now = new Date();
	const isToday =
		d === now.getDate() && month.value === now.getMonth() && year.value === now.getFullYear();
	if (isSelected) return "bg-blue-600 text-white font-semibold";
	if (isToday) return "border border-blue-400 text-foreground font-medium";
	return "bg-background";
}

function selectDay(d: number) {
	if (d === 0) return;
	day.value = d;
	emitValue();
}

function prevMonth() {
	if (month.value === 0) {
		month.value = 11;
		year.value--;
	} else {
		month.value--;
	}
}

function nextMonth() {
	if (month.value === 11) {
		month.value = 0;
		year.value++;
	} else {
		month.value++;
	}
}

function getMonthName(m: number): string {
	return (
		[
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		][m] ?? ""
	);
}

function formatDate(y: number, m: number, d: number): string {
	return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function padTime(value: number): string {
	return String(value).padStart(2, "0");
}

function formatDateTime(): string {
	return `${formatDate(year.value, month.value, day.value)} ${padTime(hour.value)}:${padTime(
		minute.value,
	)}:${padTime(second.value)}`;
}

function parseDateTime(dateTimeStr: string) {
	if (
		!dateTimeStr ||
		typeof dateTimeStr !== "string" ||
		dateTimeStr === "0000-00-00 00:00:00" ||
		dateTimeStr.toLowerCase() === "now"
	) {
		const now = new Date();
		year.value = now.getFullYear();
		month.value = now.getMonth();
		day.value = now.getDate();
		hour.value = now.getHours();
		minute.value = now.getMinutes();
		second.value = now.getSeconds();
		setNow();
		return;
	}
	const [datePart, timePart] = dateTimeStr.split(" ");
	if (!datePart) return;
	const [y, m, d] = datePart.split("-").map(Number);
	year.value = y || new Date().getFullYear();
	month.value = (m || 1) - 1;
	day.value = d || new Date().getDate();
	if (timePart) {
		const [h, min, s] = timePart.split(":").map(Number);
		hour.value = h || 0;
		minute.value = min || 0;
		second.value = s || 0;
	}
}

function emitValue() {
	emit("update:modelValue", formatDateTime());
}

function setNow() {
	const now = new Date();
	year.value = now.getFullYear();
	month.value = now.getMonth();
	day.value = now.getDate();
	hour.value = now.getHours();
	minute.value = now.getMinutes();
	second.value = now.getSeconds();
	emitValue();
}

watch(
	() => props.modelValue,
	(newVal) => {
		if (newVal !== undefined && newVal !== null) parseDateTime(newVal as string);
	},
);

let clickOutsideHandler: ((e: Event) => void) | null = null;

onMounted(() => {
	parseDateTime(displayDateTime.value);
	clickOutsideHandler = (event: Event) => {
		if (
			showPicker.value &&
			pickerRef.value &&
			!pickerRef.value.contains(event.target as Node) &&
			!inputRef.value?.contains(event.target as Node)
		) {
			showPicker.value = false;
		}
	};
	document.addEventListener("click", clickOutsideHandler);
});

onBeforeUnmount(() => {
	if (clickOutsideHandler) document.removeEventListener("click", clickOutsideHandler);
});
</script>

<style scoped>
.slider {
	-webkit-appearance: none;
	appearance: none;
}

.slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 16px;
	height: 16px;
	border-radius: 9999px;
	background: var(--color-gray-900);
	cursor: pointer;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	margin-top: -2.25px;
}

.slider::-webkit-slider-thumb:hover {
	background: var(--color-gray-900);
	transform: scale(1.15);
}

.slider::-moz-range-thumb {
	width: 16px;
	height: 16px;
	border-radius: 9999px;
	background: var(--color-gray-900);
	cursor: pointer;
	border: none;
}

.dark-slider-bg {
	&:where(.dark, .dark *) {
		background: var(--color-gray-500);
	}
}

.picker-enter-active,
.picker-leave-active {
	transition:
		opacity 0.2s,
		transform 0.2s;
}

.picker-enter-from,
.picker-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}
</style>
