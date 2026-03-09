<script setup lang="ts">
import { computed, ref, watch, type HTMLAttributes } from "vue";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContentStyled } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateTimeMode = "date" | "time" | "datetime";

const props = withDefaults(
	defineProps<{
		/** Bound value in ISO-like format: YYYY-MM-DD / HH:mm:ss / YYYY-MM-DD HH:mm:ss */
		modelValue?: string;
		/** Picker mode */
		mode?: DateTimeMode;
		/** Placeholder when empty */
		placeholder?: string;
		/** Disabled state */
		disabled?: boolean;
		/** Minimum selectable date (YYYY-MM-DD) */
		minDate?: string;
		/** Maximum selectable date (YYYY-MM-DD) */
		maxDate?: string;
		/** Use 12-hour clock display */
		use12Hour?: boolean;
		/** First day of week: 0 = Sun, 1 = Mon */
		firstDayOfWeek?: 0 | 1;
		/** Show "Today" shortcut */
		showToday?: boolean;
		/** Show "Now" shortcut (datetime/time modes) */
		showNow?: boolean;
		/** Show "Clear" button */
		clearable?: boolean;
		/** Label above the field */
		label?: string;
		/** CSS class overrides */
		class?: HTMLAttributes["class"];
	}>(),
	{
		mode: "datetime",
		placeholder: "Pick date & time",
		disabled: false,
		use12Hour: false,
		firstDayOfWeek: 1,
		showToday: true,
		showNow: true,
		clearable: true,
	},
);

const emit = defineEmits<{
	(e: "update:modelValue", value: string): void;
	(e: "change", value: string): void;
}>();

const open = ref(false);

// Internal state
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth()); // 0-indexed

// Parse incoming value
const selectedDate = ref(""); // YYYY-MM-DD
const selectedTime = ref("00:00:00"); // HH:mm:ss

function parseValue(val: string | undefined) {
	if (!val) {
		selectedDate.value = "";
		selectedTime.value = "00:00:00";
		return;
	}
	if (props.mode === "time") {
		selectedDate.value = "";
		selectedTime.value = normalizeTime(val);
		return;
	}
	const parts = val.includes(" ") ? val.split(" ") : val.includes("T") ? val.split("T") : [val];
	selectedDate.value = parts[0] ?? "";
	selectedTime.value = parts[1] ? normalizeTime(parts[1]) : "00:00:00";

	// Sync calendar view to selected date
	if (selectedDate.value) {
		const [y, m] = selectedDate.value.split("-").map(Number);
		if (y && m) {
			viewYear.value = y;
			viewMonth.value = m - 1;
		}
	}
}

function normalizeTime(t: string): string {
	const parts = t.split(":");
	const hh = (parts[0] ?? "00").padStart(2, "0");
	const mm = (parts[1] ?? "00").padStart(2, "0");
	const ss = (parts[2] ?? "00").padStart(2, "0");
	return `${hh}:${mm}:${ss}`;
}

watch(() => props.modelValue, parseValue, { immediate: true });

// Calendar helpers
const DAYS_SHORT_MON = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const DAYS_SHORT_SUN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
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
];

const dayHeaders = computed(() => (props.firstDayOfWeek === 1 ? DAYS_SHORT_MON : DAYS_SHORT_SUN));

interface CalendarDay {
	date: string; // YYYY-MM-DD
	day: number;
	isCurrentMonth: boolean;
	isToday: boolean;
	isSelected: boolean;
	isDisabled: boolean;
}

const calendarDays = computed((): CalendarDay[] => {
	const year = viewYear.value;
	const month = viewMonth.value;
	const firstOfMonth = new Date(year, month, 1);
	const lastOfMonth = new Date(year, month + 1, 0);

	let startDow = firstOfMonth.getDay(); // 0=Sun
	if (props.firstDayOfWeek === 1) {
		startDow = startDow === 0 ? 6 : startDow - 1;
	}

	const today = new Date().toISOString().slice(0, 10);
	const days: CalendarDay[] = [];

	// Leading days from previous month
	const prevMonthLast = new Date(year, month, 0).getDate();
	for (let i = startDow - 1; i >= 0; i--) {
		const d = prevMonthLast - i;
		const dt = formatDateStr(year, month - 1, d);
		days.push({
			date: dt,
			day: d,
			isCurrentMonth: false,
			isToday: dt === today,
			isSelected: dt === selectedDate.value,
			isDisabled: isDateDisabled(dt),
		});
	}

	// Current month days
	for (let d = 1; d <= lastOfMonth.getDate(); d++) {
		const dt = formatDateStr(year, month, d);
		days.push({
			date: dt,
			day: d,
			isCurrentMonth: true,
			isToday: dt === today,
			isSelected: dt === selectedDate.value,
			isDisabled: isDateDisabled(dt),
		});
	}

	// Trailing days
	const remaining = 42 - days.length;
	for (let d = 1; d <= remaining; d++) {
		const dt = formatDateStr(year, month + 1, d);
		days.push({
			date: dt,
			day: d,
			isCurrentMonth: false,
			isToday: dt === today,
			isSelected: dt === selectedDate.value,
			isDisabled: isDateDisabled(dt),
		});
	}

	return days;
});

function formatDateStr(year: number, month: number, day: number): string {
	const d = new Date(year, month, day);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${dd}`;
}

function isDateDisabled(dateStr: string): boolean {
	if (props.minDate && dateStr < props.minDate) return true;
	if (props.maxDate && dateStr > props.maxDate) return true;
	return false;
}

// Navigation
function prevMonth() {
	if (viewMonth.value === 0) {
		viewMonth.value = 11;
		viewYear.value--;
	} else {
		viewMonth.value--;
	}
}

function nextMonth() {
	if (viewMonth.value === 11) {
		viewMonth.value = 0;
		viewYear.value++;
	} else {
		viewMonth.value++;
	}
}

function goToday() {
	const now = new Date();
	viewYear.value = now.getFullYear();
	viewMonth.value = now.getMonth();
}

// Selection
function selectDay(day: CalendarDay) {
	if (day.isDisabled) return;
	selectedDate.value = day.date;

	// Sync view
	const [y, m] = day.date.split("-").map(Number);
	viewYear.value = y;
	viewMonth.value = m - 1;

	emitValue();

	if (props.mode === "date") {
		open.value = false;
	}
}

// Time parsing
const hours = computed({
	get: () => parseInt(selectedTime.value.split(":")[0] ?? "0", 10),
	set: (v: number) => updateTimePart(v, minutes.value, seconds.value),
});

const minutes = computed({
	get: () => parseInt(selectedTime.value.split(":")[1] ?? "0", 10),
	set: (v: number) => updateTimePart(hours.value, v, seconds.value),
});

const seconds = computed({
	get: () => parseInt(selectedTime.value.split(":")[2] ?? "0", 10),
	set: (v: number) => updateTimePart(hours.value, minutes.value, v),
});

function updateTimePart(h: number, m: number, s: number) {
	selectedTime.value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
		s,
	).padStart(2, "0")}`;
	emitValue();
}

function incrementHour(delta: number) {
	hours.value = (hours.value + delta + 24) % 24;
}

function incrementMinute(delta: number) {
	minutes.value = (minutes.value + delta + 60) % 60;
}

function incrementSecond(delta: number) {
	seconds.value = (seconds.value + delta + 60) % 60;
}

// Display values for 12h
const displayHour = computed(() => {
	if (!props.use12Hour) return String(hours.value).padStart(2, "0");
	const h12 = hours.value % 12 || 12;
	return String(h12).padStart(2, "0");
});

const amPm = computed(() => (hours.value >= 12 ? "PM" : "AM"));

function toggleAmPm() {
	hours.value = (hours.value + 12) % 24;
}

// Emit
function emitValue() {
	let val = "";
	if (props.mode === "date") {
		val = selectedDate.value;
	} else if (props.mode === "time") {
		val = selectedTime.value;
	} else {
		val = selectedDate.value ? `${selectedDate.value} ${selectedTime.value}` : "";
	}
	emit("update:modelValue", val);
	emit("change", val);
}

// Formatting for display
const formattedDisplay = computed(() => {
	if (props.mode === "time") {
		if (!selectedTime.value || selectedTime.value === "00:00:00") return "";
		if (props.use12Hour) {
			return `${displayHour.value}:${String(minutes.value).padStart(2, "0")} ${amPm.value}`;
		}
		return selectedTime.value.slice(0, 5);
	}

	if (!selectedDate.value) return "";
	const [y, m, d] = selectedDate.value.split("-");
	const dateStr = `${d}/${m}/${y}`;

	if (props.mode === "date") return dateStr;

	const timeStr = props.use12Hour
		? `${displayHour.value}:${String(minutes.value).padStart(2, "0")} ${amPm.value}`
		: selectedTime.value.slice(0, 5);
	return `${dateStr}  ${timeStr}`;
});

// Shortcuts
function setNow() {
	const now = new Date();
	if (props.mode !== "time") {
		selectedDate.value = now.toISOString().slice(0, 10);
		viewYear.value = now.getFullYear();
		viewMonth.value = now.getMonth();
	}
	selectedTime.value = `${String(now.getHours()).padStart(2, "0")}:${String(
		now.getMinutes(),
	).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
	emitValue();
	open.value = false;
}

function clearValue() {
	selectedDate.value = "";
	selectedTime.value = "00:00:00";
	emit("update:modelValue", "");
	emit("change", "");
}
</script>

<template>
	<div :class="cn('relative', props.class)">
		<!-- Label -->
		<label v-if="label" class="block text-sm font-medium text-foreground mb-1.5">
			{{ label }}
		</label>

		<Popover v-model:open="open">
			<PopoverTrigger as-child>
				<Button
					type="button"
					variant="outline"
					:disabled="disabled"
					:class="
						cn(
							'h-9 w-full justify-start gap-2 px-3 text-left font-normal',
							!formattedDisplay && 'text-muted-foreground',
							props.class,
						)
					"
				>
					<CalendarDays v-if="mode !== 'time'" class="h-4 w-4 shrink-0" />
					<Clock v-else class="h-4 w-4 shrink-0" />
					<span class="truncate flex-1">{{ formattedDisplay || placeholder }}</span>
					<button
						v-if="clearable && formattedDisplay"
						type="button"
						tabindex="-1"
						class="ml-auto p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
						@click.stop="clearValue"
					>
						<X class="h-3.5 w-3.5" />
					</button>
				</Button>
			</PopoverTrigger>

			<PopoverContentStyled
				:class="cn('p-0 w-auto', mode === 'time' ? 'w-[200px]' : 'w-[300px]')"
				align="start"
			>
				<!-- Calendar (date & datetime modes) -->
				<div v-if="mode !== 'time'" class="p-3">
					<!-- Month/Year Nav -->
					<div class="flex items-center justify-between mb-3">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="h-7 w-7"
							@click="prevMonth"
						>
							<ChevronLeft class="h-4 w-4" />
						</Button>
						<button
							type="button"
							class="text-sm font-semibold text-foreground hover:text-primary transition-colors"
							@click="goToday"
						>
							{{ MONTHS[viewMonth] }} {{ viewYear }}
						</button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="h-7 w-7"
							@click="nextMonth"
						>
							<ChevronRight class="h-4 w-4" />
						</Button>
					</div>

					<!-- Day Headers -->
					<div class="grid grid-cols-7 mb-1">
						<div
							v-for="dh in dayHeaders"
							:key="dh"
							class="text-center text-[11px] font-medium text-muted-foreground py-1"
						>
							{{ dh }}
						</div>
					</div>

					<!-- Day Grid -->
					<div class="grid grid-cols-7 gap-0.5">
						<button
							v-for="(day, idx) in calendarDays"
							:key="idx"
							type="button"
							:disabled="day.isDisabled"
							class="relative h-8 w-8 mx-auto rounded-md text-sm transition-colors flex items-center justify-center"
							:class="[
								day.isSelected
									? 'bg-primary text-primary-foreground font-semibold'
									: day.isToday
									  ? 'bg-accent text-accent-foreground font-medium'
									  : day.isCurrentMonth
									    ? 'text-foreground hover:bg-accent/50'
									    : 'text-muted-foreground/40 hover:bg-accent/30',
								day.isDisabled && 'opacity-30 cursor-not-allowed',
							]"
							@click="selectDay(day)"
						>
							{{ day.day }}
							<span
								v-if="day.isToday && !day.isSelected"
								class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
							></span>
						</button>
					</div>
				</div>

				<!-- Time Picker (time & datetime modes) -->
				<div
					v-if="mode !== 'date'"
					:class="
						cn(
							'px-3 pb-3',
							mode === 'datetime' && 'border-t border-border pt-3',
							mode === 'time' && 'pt-3',
						)
					"
				>
					<div class="flex items-center justify-center gap-1">
						<!-- Hours -->
						<div class="flex flex-col items-center">
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground p-0.5"
								@click="incrementHour(1)"
							>
								<ChevronLeft class="h-3.5 w-3.5 rotate-90" />
							</button>
							<div
								class="w-10 h-8 flex items-center justify-center text-lg font-mono font-semibold text-foreground bg-muted rounded"
							>
								{{ displayHour }}
							</div>
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground p-0.5"
								@click="incrementHour(-1)"
							>
								<ChevronRight class="h-3.5 w-3.5 rotate-90" />
							</button>
						</div>

						<span class="text-lg font-mono font-bold text-muted-foreground">:</span>

						<!-- Minutes -->
						<div class="flex flex-col items-center">
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground p-0.5"
								@click="incrementMinute(1)"
							>
								<ChevronLeft class="h-3.5 w-3.5 rotate-90" />
							</button>
							<div
								class="w-10 h-8 flex items-center justify-center text-lg font-mono font-semibold text-foreground bg-muted rounded"
							>
								{{ String(minutes).padStart(2, "0") }}
							</div>
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground p-0.5"
								@click="incrementMinute(-1)"
							>
								<ChevronRight class="h-3.5 w-3.5 rotate-90" />
							</button>
						</div>

						<span class="text-lg font-mono font-bold text-muted-foreground">:</span>

						<!-- Seconds -->
						<div class="flex flex-col items-center">
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground p-0.5"
								@click="incrementSecond(1)"
							>
								<ChevronLeft class="h-3.5 w-3.5 rotate-90" />
							</button>
							<div
								class="w-10 h-8 flex items-center justify-center text-lg font-mono font-semibold text-foreground bg-muted rounded"
							>
								{{ String(seconds).padStart(2, "0") }}
							</div>
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground p-0.5"
								@click="incrementSecond(-1)"
							>
								<ChevronRight class="h-3.5 w-3.5 rotate-90" />
							</button>
						</div>

						<!-- AM/PM toggle -->
						<button
							v-if="use12Hour"
							type="button"
							class="ml-2 px-2 h-8 rounded bg-muted text-sm font-semibold text-foreground hover:bg-accent transition-colors"
							@click="toggleAmPm"
						>
							{{ amPm }}
						</button>
					</div>
				</div>

				<!-- Footer Actions -->
				<div
					class="flex items-center justify-between px-3 pb-3 pt-1 border-t border-border"
				>
					<div class="flex items-center gap-1">
						<Button
							v-if="clearable"
							type="button"
							variant="ghost"
							size="sm"
							class="h-7 text-xs"
							@click="clearValue"
						>
							Clear
						</Button>
					</div>
					<div class="flex items-center gap-1">
						<Button
							v-if="showToday && mode !== 'time'"
							type="button"
							variant="ghost"
							size="sm"
							class="h-7 text-xs"
							@click="goToday"
						>
							Today
						</Button>
						<Button
							v-if="showNow"
							type="button"
							variant="outline"
							size="sm"
							class="h-7 text-xs"
							@click="setNow"
						>
							Now
						</Button>
					</div>
				</div>
			</PopoverContentStyled>
		</Popover>
	</div>
</template>
