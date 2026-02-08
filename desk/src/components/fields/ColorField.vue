<template>
	<div class="mb-4 flex flex-col relative">
		<label v-if="field.label" class="font-medium mb-1 text-sm text-slate-700 dark:text-white">
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-500 ml-1">*</span>
		</label>

		<div class="relative">
			<input
				ref="inputRef"
				v-model="hexInput"
				type="text"
				:placeholder="field.description || 'Choose a color'"
				:disabled="field.read_only"
				:required="field.reqd && !field.read_only"
				class="w-full pl-8 pr-3 py-2 border border-[#ddd] dark:border-slate-700 rounded focus:outline-none focus:border-[#0066cc] focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] disabled:bg-gray-100 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-[0.95rem] transition-colors duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
				@focus="showPicker = true"
				@input="handleHexInput"
			/>

			<!-- Color preview circle -->
			<div
				class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded cursor-pointer border border-gray-300"
				:class="{
					'bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==)] bg-contain':
						!modelValue,
				}"
				:style="{ backgroundColor: modelValue || 'transparent' }"
				@click="showPicker = !showPicker"
			/>
		</div>

		<small v-if="field.description" class="block text-gray-600 mt-1 text-[0.85rem]">{{
			field.description
		}}</small>

		<Transition name="picker">
			<div
				v-if="showPicker"
				ref="pickerRef"
				class="absolute top-full left-0 mt-2 w-52.5 bg-white dark:bg-slate-800 dark:text-white border border-gray-300 dark:border-slate-700 rounded-lg shadow-lg p-3 z-18"
			>
				<!-- Swatches Section -->
				<div>
					<div class="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
						Swatches
					</div>
					<div class="flex flex-wrap gap-2 mt-2 mb-2">
						<div
							v-for="(swatch, idx) in swatches"
							:key="idx"
							class="h-5 w-5 rounded-full cursor-pointer hover:scale-110 transition-transform"
							:style="{ backgroundColor: swatch }"
							tabindex="0"
							@click="selectSwatch(swatch)"
							@keydown.enter.space.prevent="selectSwatch(swatch)"
						/>
					</div>
				</div>

				<!-- Color Picker Section -->
				<div class="text-xs text-gray-500 font-medium mb-2 mt-2 uppercase tracking-wide">
					Color Picker
				</div>

				<!-- 2D Saturation/Brightness Picker -->
				<div
					ref="colorMapRef"
					class="relative w-full h-35 rounded-md mb-2 cursor-crosshair color-map-gradient"
					:style="{ background: colorMapBackground, color: modelValue || 'transparent' }"
					@mousedown="startSaturationPick"
					@touchstart="startSaturationPick"
					@click="clickSaturationPick"
				>
					<div
						class="color-selector absolute pointer-events-none"
						:style="colorSelectorStyle"
					/>
				</div>

				<div
					ref="hueSliderRef"
					class="relative w-full h-3.5 rounded-full cursor-pointer border border-gray-200 hue-gradient"
					:style="{ color: `hsl(${hue}, 100%, 50%)` }"
					@mousedown="startHuePick"
					@touchstart="startHuePick"
					@click="clickHuePick"
				>
					<div
						class="hue-selector absolute pointer-events-none"
						:style="hueSelectorStyle"
					/>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { Field, FormContext } from "../../types";

interface Props {
	field: Field;
	ctx: FormContext;
}

const props = defineProps<Props>();
const emit = defineEmits<{
	fieldChange: [value: any];
}>();

// Color state
const modelValue = computed({
	get: () => (props.ctx.doc?.[props.field.fieldname] as string) || "",
	set: (val) => {
		props.ctx.set_value(props.field.fieldname, val);
		emit("fieldChange", val);
	},
});

const hexInput = ref(modelValue.value);
const showPicker = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const pickerRef = ref<HTMLElement | null>(null);
const colorMapRef = ref<HTMLElement | null>(null);
const hueSliderRef = ref<HTMLElement | null>(null);

// HSV color space values
const hue = ref(0);
const saturation = ref(100);
const brightness = ref(100);

// Picker positions
const colorSelectorPos = ref({ x: 0, y: 0 });
const hueSelectorPos = ref({ x: 0, y: 0 });

// Dragging state
let isDraggingColor = false;
let isDraggingHue = false;

// Frappe color swatches (same as Frappe)
const swatches = [
	"#449CF0",
	"#ECAD4B",
	"#29CD42",
	"#761ACB",
	"#CB2929",
	"#ED6396",
	"#29CD42",
	"#4463F0",
	"#EC864B",
	"#4F9DD9",
	"#39E4A5",
	"#B4CD29",
];

// Color conversion utilities (matching Frappe's utils.js)
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0,
		s,
		v = max;

	const d = max - min;
	s = max === 0 ? 0 : d / max;

	if (max === min) {
		h = 0;
	} else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

function hsvToHex(h: number, s: number, v: number): string {
	s /= 100;
	v /= 100;
	h /= 360;

	let r, g, b;
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);

	switch (i % 6) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		case 5:
			r = v;
			g = p;
			b = q;
			break;
		default:
			r = 0;
			g = 0;
			b = 0;
	}

	const toHex = (c: number) => {
		const hex = Math.round(c * 255).toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	};

	return "#" + toHex(r) + toHex(g) + toHex(b);
}

function hexToRgb(hex: string): [number, number, number] | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
		: null;
}

function clamp(min: number, val: number, max: number): number {
	return Math.min(Math.max(val, min), max);
}

// Computed styles
const colorMapBackground = computed(() => {
	return `
    linear-gradient(0deg, black, transparent),
    linear-gradient(90deg, white, transparent),
    hsl(${hue.value}, 100%, 50%)
  `;
});

const colorSelectorStyle = computed(() => {
	const x = colorSelectorPos.value.x;
	const y = colorSelectorPos.value.y;
	return {
		top: `${y - 6}px`,
		left: `${x - 6}px`,
	};
});

const hueSelectorStyle = computed(() => {
	const x = hueSelectorPos.value.x - 1;
	const element = hueSliderRef.value;
	const y = element ? element.offsetHeight / 2 - 1 : 0;
	return {
		top: `${y - 7}px`,
		left: `${x - 7}px`,
	};
});

// Initialize HSV from current color
function initializeFromColor(color: string) {
	if (!color || !isValidHex(color)) {
		hue.value = 0;
		saturation.value = 100;
		brightness.value = 100;
		return;
	}

	const rgb = hexToRgb(color);
	if (rgb) {
		const [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
		hue.value = h;
		saturation.value = s;
		brightness.value = v;
	}
}

// Set selector positions based on HSV
function setSelectorPositions() {
	if (!colorMapRef.value || !hueSliderRef.value) return;

	const w = colorMapRef.value.offsetWidth;
	const h = colorMapRef.value.offsetHeight;
	const x = clamp(0, (saturation.value * w) / 100, w);
	const y = clamp(0, (1 - brightness.value / 100) * h, h);

	colorSelectorPos.value = { x, y };

	const hueW = hueSliderRef.value.offsetWidth;
	const hueX = (hue.value * hueW) / 360;
	const hueY = hueSliderRef.value.offsetHeight / 2;

	hueSelectorPos.value = { x: hueX, y: hueY };
}

// Update color from HSV
function updateColorFromHSV() {
	const newColor = hsvToHex(hue.value, saturation.value, brightness.value);
	hexInput.value = newColor.toUpperCase();
	modelValue.value = newColor;
}

// Handle hex input change
function handleHexInput(event: Event) {
	const input = (event.target as HTMLInputElement).value;
	if (isValidHex(input)) {
		modelValue.value = input;
		initializeFromColor(input);
		setSelectorPositions();
	}
}

function isValidHex(hex: string): boolean {
	return /^#[0-9A-F]{6}$/i.test(hex);
}

// Swatch selection
function selectSwatch(color: string) {
	modelValue.value = color;
	hexInput.value = color;
	initializeFromColor(color);
	setSelectorPositions();
}

// Saturation/Brightness picker
function startSaturationPick(event: MouseEvent | TouchEvent) {
	event.preventDefault();
	isDraggingColor = true;
	updateSaturationBrightness(event);
}

function clickSaturationPick(event: MouseEvent) {
	updateSaturationBrightness(event);
}

function updateSaturationBrightness(event: MouseEvent | TouchEvent) {
	if (!colorMapRef.value) return;

	const clientEvent = "touches" in event ? event.touches[0] : (event as MouseEvent);
	if (!clientEvent) return;
	const rect = colorMapRef.value.getBoundingClientRect();
	const x = clamp(0, clientEvent.clientX - rect.left, rect.width);
	const y = clamp(0, clientEvent.clientY - rect.top, rect.height);

	colorSelectorPos.value = { x, y };
	saturation.value = Math.round((x / rect.width) * 100);
	brightness.value = Math.round((1 - y / rect.height) * 100);

	updateColorFromHSV();
}

// Hue picker
function startHuePick(event: MouseEvent | TouchEvent) {
	event.preventDefault();
	isDraggingHue = true;
	updateHue(event);
}

function clickHuePick(event: MouseEvent) {
	updateHue(event);
}

function updateHue(event: MouseEvent | TouchEvent) {
	if (!hueSliderRef.value) return;

	const clientEvent = "touches" in event ? event.touches[0] : (event as MouseEvent);
	if (!clientEvent) return;
	const rect = hueSliderRef.value.getBoundingClientRect();
	const x = clamp(0, clientEvent.clientX - rect.left, rect.width);

	hueSelectorPos.value.x = x;
	hue.value = Math.round((x * 360) / rect.width);

	updateColorFromHSV();
	setSelectorPositions();
}

// Mouse/touch event handlers
function handleMouseMove(event: MouseEvent) {
	if (isDraggingColor) {
		updateSaturationBrightness(event);
	} else if (isDraggingHue) {
		updateHue(event);
	}
}

function handleTouchMove(event: TouchEvent) {
	if (event.touches.length === 1) {
		if (isDraggingColor) {
			updateSaturationBrightness(event);
		} else if (isDraggingHue) {
			updateHue(event);
		}
	}
}

function stopDragging() {
	isDraggingColor = false;
	isDraggingHue = false;
}

// Watch for color changes
watch(
	() => modelValue.value,
	(newColor) => {
		if (newColor && newColor !== hexInput.value) {
			hexInput.value = newColor;
			initializeFromColor(newColor);
			setSelectorPositions();
		}
	},
);

onMounted(() => {
	// Initialize from current value
	if (modelValue.value) {
		initializeFromColor(modelValue.value);
	}
	setSelectorPositions();

	// Add global event listeners for dragging
	document.addEventListener("mousemove", handleMouseMove);
	document.addEventListener("mouseup", stopDragging);
	document.addEventListener("touchmove", handleTouchMove);
	document.addEventListener("touchend", stopDragging);
	document.addEventListener("touchcancel", stopDragging);

	// Click outside handler
	const handleClickOutside = (event: Event) => {
		if (
			showPicker.value &&
			pickerRef.value &&
			!pickerRef.value.contains(event.target as Node) &&
			!inputRef.value?.contains(event.target as Node)
		) {
			showPicker.value = false;
		}
	};

	document.addEventListener("click", handleClickOutside);

	// Cleanup on unmount
	return () => {
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", stopDragging);
		document.removeEventListener("touchmove", handleTouchMove);
		document.removeEventListener("touchend", stopDragging);
		document.removeEventListener("touchcancel", stopDragging);
		document.removeEventListener("click", handleClickOutside);
	};
});
</script>

<style scoped>
.color-selector,
.hue-selector {
	width: 12px;
	height: 12px;
	background: transparent;
	border-radius: 9999px;
	border: 1px solid rgba(0, 0, 0, 0.2);
}

.color-selector::before,
.color-selector::after,
.hue-selector::before,
.hue-selector::after {
	position: absolute;
	background-color: transparent;
	border: 1px solid rgba(0, 0, 0, 0.2);
	content: " ";
	border-radius: 9999px;
}

.color-selector::before,
.hue-selector::before {
	width: 100%;
	height: 100%;
	background-color: currentColor;
	border: 2px solid white;
}

.color-selector::after,
.hue-selector::after {
	width: calc(100% - 4px);
	height: calc(100% - 4px);
	border: 1px solid rgba(0, 0, 0, 0.2);
	top: 2px;
	left: 2px;
}

.hue-selector {
	width: 14px;
	height: 14px;
}

/* Gradients that need to be in CSS */
.hue-gradient {
	background: linear-gradient(
		90deg,
		hsl(0, 100%, 50%),
		hsl(60, 100%, 50%),
		hsl(120, 100%, 50%),
		hsl(180, 100%, 50%),
		hsl(240, 100%, 50%),
		hsl(300, 100%, 50%),
		hsl(360, 100%, 50%)
	);
}

/* Transition animations */
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
