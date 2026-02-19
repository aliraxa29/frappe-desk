<template>
	<div class="flex flex-col relative">
		<label
			v-if="field.label"
			:for="`field-${field.fieldname}`"
			class="font-medium mb-2 text-sm text-slate-700 dark:text-slate-200"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-500 ml-1">*</span>
		</label>

		<input
			ref="inputRef"
			:id="`field-${field.fieldname}`"
			:value="displayTime"
			:placeholder="'HH:MM:SS'"
			:disabled="field.read_only"
			type="text"
			readonly
			class="w-full px-3 py-2.5 border border-[#ddd] dark:border-slate-700 rounded focus:outline-none focus:border-[#0066cc] focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] disabled:bg-gray-100 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-sm transition-colors duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
			@focus="showPicker = true"
		/>

		<Transition name="picker">
			<div
				v-if="showPicker"
				ref="pickerRef"
				class="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg p-4 z-200"
				style="width: 260px"
			>
				<div class="space-y-3">
					<div>
						<label class="text-xs text-slate-500 dark:text-slate-400">{{
							__("Hour")
						}}</label>
						<input
							type="range"
							min="0"
							max="23"
							v-model.number="hour"
							class="w-full"
						/>
						<div class="text-center text-sm font-mono">{{ pad(hour) }}</div>
					</div>
					<div>
						<label class="text-xs text-slate-500 dark:text-slate-400">{{
							__("Minute")
						}}</label>
						<input
							type="range"
							min="0"
							max="59"
							v-model.number="minute"
							class="w-full"
						/>
						<div class="text-center text-sm font-mono">{{ pad(minute) }}</div>
					</div>
					<div>
						<label class="text-xs text-slate-500 dark:text-slate-400">{{
							__("Second")
						}}</label>
						<input
							type="range"
							min="0"
							max="59"
							v-model.number="second"
							class="w-full"
						/>
						<div class="text-center text-sm font-mono">{{ pad(second) }}</div>
					</div>
				</div>
				<div class="border-t border-gray-200 dark:border-slate-700 pt-3 mt-3 flex gap-2">
					<button
						@click="setNow"
						class="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700"
					>
						{{ __("Now") }}
					</button>
					<button
						@click="applyTime"
						class="flex-1 px-3 py-1.5 bg-green-600 text-white rounded font-medium text-xs hover:bg-green-700"
					>
						{{ __("Apply") }}
					</button>
					<button
						@click="clearTime"
						class="flex-1 px-3 py-1.5 bg-gray-400 text-white rounded font-medium text-xs hover:bg-gray-500"
					>
						{{ __("Clear") }}
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

const hour = ref(0);
const minute = ref(0);
const second = ref(0);
const showPicker = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const pickerRef = ref<HTMLElement | null>(null);

const displayTime = computed(() => props.modelValue || "");

function pad(n: number): string {
	return n.toString().padStart(2, "0");
}

function applyTime() {
	emit("update:modelValue", `${pad(hour.value)}:${pad(minute.value)}:${pad(second.value)}`);
	showPicker.value = false;
}

function setNow() {
	const now = new Date();
	hour.value = now.getHours();
	minute.value = now.getMinutes();
	second.value = now.getSeconds();
	applyTime();
}

function clearTime() {
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
		if (val) {
			const parts = val.split(":");
			hour.value = parseInt(parts[0]) || 0;
			minute.value = parseInt(parts[1]) || 0;
			second.value = parseInt(parts[2]) || 0;
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
