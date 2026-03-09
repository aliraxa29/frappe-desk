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
			:value="modelValue || ''"
			:placeholder="field.description || 'YYYY-MM-DD'"
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

		<Transition name="picker">
			<div
				v-if="showPicker"
				ref="pickerRef"
				class="absolute top-full left-0 mt-2 z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-4"
				style="width: 320px"
			>
				<div class="text-center mb-3 pb-2 border-b border-border">
					<div class="text-sm font-semibold text-foreground font-mono">
						{{ formatDate(year, month, day) }}
					</div>
				</div>

				<div class="mb-3">
					<div class="flex justify-between items-center mb-3">
						<button
							@click="prevMonth"
							class="px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors duration-200"
						>
							← Prev
						</button>
						<span class="text-xs font-semibold text-foreground">
							{{ getMonthName(month) }} {{ year }}
						</span>
						<button
							@click="nextMonth"
							class="px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors duration-200"
						>
							Next →
						</button>
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
							:disabled="d === 0"
							:class="getDayButtonClass(d)"
							@click="selectDay(d)"
							class="text-xs py-1 cursor-pointer rounded transition-colors disabled:cursor-default hover:bg-muted dark:hover:bg-secondary"
						>
							{{ d || "" }}
						</button>
					</div>
				</div>

				<div class="border-t border-border pt-3 flex gap-2">
					<button
						@click="setToday"
						class="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 transition-colors duration-200"
					>
						Today
					</button>
					<button
						@click="clearDate"
						class="flex-1 px-3 py-1.5 bg-muted text-white rounded font-medium text-xs hover:bg-muted transition-colors duration-200"
					>
						Clear
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import type { Field } from "../../types";

const props = defineProps<{
	field: Field;
	modelValue: any;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
}>();

const year = ref(new Date().getFullYear());
const month = ref(new Date().getMonth());
const day = ref(new Date().getDate());
const showPicker = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const pickerRef = ref<HTMLElement | null>(null);

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
	const currentVal = props.modelValue || "";
	const isSelected =
		d === day.value &&
		month.value === new Date(currentVal || Date.now()).getMonth() &&
		year.value === new Date(currentVal || Date.now()).getFullYear();
	const isCurrentDay =
		d === new Date().getDate() &&
		month.value === new Date().getMonth() &&
		year.value === new Date().getFullYear();

	if (isSelected) return "bg-blue-600 text-white font-semibold";
	if (isCurrentDay) return "border border-blue-400 text-foreground font-medium";
	return "bg-background";
}

function selectDay(d: number) {
	if (d === 0) return;
	day.value = d;
	const formatted = formatDate(year.value, month.value, day.value);
	emit("update:modelValue", formatted);
	showPicker.value = false;
}

function prevMonth() {
	if (month.value === 0) {
		month.value = 11;
		year.value--;
	} else month.value--;
}

function nextMonth() {
	if (month.value === 11) {
		month.value = 0;
		year.value++;
	} else month.value++;
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

function padTime(value: number): string {
	return value.toString().padStart(2, "0");
}

function formatDate(y: number, m: number, d: number): string {
	return `${y}-${padTime(m + 1)}-${padTime(d)}`;
}

function setToday() {
	const today = new Date();
	year.value = today.getFullYear();
	month.value = today.getMonth();
	day.value = today.getDate();
	emit("update:modelValue", formatDate(year.value, month.value, day.value));
	showPicker.value = false;
}

function clearDate() {
	emit("update:modelValue", "");
	showPicker.value = false;
}

function handleClickOutside(event: MouseEvent) {
	if (
		pickerRef.value &&
		inputRef.value &&
		!pickerRef.value.contains(event.target as Node) &&
		!inputRef.value.contains(event.target as Node)
	) {
		showPicker.value = false;
	}
}

watch(
	() => props.modelValue,
	(val) => {
		if (val && typeof val === "string") {
			if (val.toLowerCase() === "now") {
				const today = new Date();
				year.value = today.getFullYear();
				month.value = today.getMonth();
				day.value = today.getDate();
				return;
			}
			const date = new Date(val);
			if (!isNaN(date.getTime())) {
				year.value = date.getFullYear();
				month.value = date.getMonth();
				day.value = date.getDate();
			}
		}
	},
	{ immediate: true },
);

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));
</script>

<style scoped>
.picker-enter-active,
.picker-leave-active {
	transition:
		opacity 0.2s ease,
		transform 0.2s ease;
}
.picker-enter-from,
.picker-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}
</style>
