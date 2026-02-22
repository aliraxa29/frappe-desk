<template>
	<div class="inline-editor" ref="containerRef">
		<!-- Check -->
		<template v-if="field.fieldtype === 'Check'">
			<input
				type="checkbox"
				:checked="!!value"
				@change="emit('update', ($event.target as HTMLInputElement).checked ? 1 : 0)"
				@blur="emit('blur')"
				class="check-input"
				ref="inputRef"
			/>
		</template>

		<!-- Select -->
		<template v-else-if="field.fieldtype === 'Select'">
			<select
				:value="value"
				@change="emit('update', ($event.target as HTMLSelectElement).value)"
				@blur="emit('blur')"
				class="select-input"
				ref="inputRef"
			>
				<option value="">Select...</option>
				<option v-for="opt in selectOptions" :key="opt" :value="opt">{{ opt }}</option>
			</select>
		</template>

		<!-- Link with autocomplete -->
		<template v-else-if="field.fieldtype === 'Link'">
			<div class="link-wrapper">
				<input
					type="text"
					:value="linkSearchText"
					@input="onLinkInput(($event.target as HTMLInputElement).value)"
					@blur="onLinkBlur"
					@keydown.enter.prevent="selectHighlightedLink"
					@keydown.escape="emit('cancel')"
					@keydown.down.prevent="moveHighlight(1)"
					@keydown.up.prevent="moveHighlight(-1)"
					:placeholder="`Search ${field.options || field.label}...`"
					class="text-input"
					ref="inputRef"
					autocomplete="off"
				/>
				<!-- Link dropdown -->
				<div
					v-if="showLinkDropdown && linkResults.length > 0"
					class="link-dropdown scroll-area"
				>
					<div
						v-for="(item, idx) in linkResults"
						:key="item.value"
						class="link-option"
						:class="{ 'link-option-active': idx === highlightedIndex }"
						@mousedown.prevent="selectLinkResult(item)"
					>
						<span class="link-value">{{ item.value }}</span>
						<span v-if="item.description" class="link-desc">{{
							item.description
						}}</span>
					</div>
				</div>
				<div v-else-if="showLinkDropdown && linkSearching" class="link-dropdown">
					<div class="link-loading">Searching...</div>
				</div>
			</div>
		</template>

		<!-- Int -->
		<template v-else-if="field.fieldtype === 'Int'">
			<input
				type="number"
				:value="value"
				@input="emit('update', parseInt(($event.target as HTMLInputElement).value) || 0)"
				@blur="emit('blur')"
				@keydown.enter="emit('blur')"
				@keydown.escape="emit('cancel')"
				step="1"
				class="number-input"
				ref="inputRef"
			/>
		</template>

		<!-- Float/Currency/Percent -->
		<template v-else-if="['Float', 'Currency', 'Percent'].includes(field.fieldtype)">
			<input
				type="number"
				:value="value"
				@input="emit('update', parseFloat(($event.target as HTMLInputElement).value) || 0)"
				@blur="emit('blur')"
				@keydown.enter="emit('blur')"
				@keydown.escape="emit('cancel')"
				:step="field.precision ? Math.pow(10, -field.precision) : 0.01"
				class="number-input"
				ref="inputRef"
			/>
		</template>

		<!-- Date -->
		<template v-else-if="field.fieldtype === 'Date'">
			<input
				type="date"
				:value="value"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				@keydown.escape="emit('cancel')"
				class="date-input"
				ref="inputRef"
			/>
		</template>

		<!-- Time -->
		<template v-else-if="field.fieldtype === 'Time'">
			<input
				type="time"
				:value="value"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				@keydown.escape="emit('cancel')"
				class="time-input"
				ref="inputRef"
			/>
		</template>

		<!-- DateTime -->
		<template v-else-if="field.fieldtype === 'DateTime'">
			<input
				type="datetime-local"
				:value="formatDateTimeLocal(value)"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				@keydown.escape="emit('cancel')"
				class="datetime-input"
				ref="inputRef"
			/>
		</template>

		<!-- Color -->
		<template v-else-if="field.fieldtype === 'Color'">
			<input
				type="color"
				:value="value || '#000000'"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				class="color-input"
				ref="inputRef"
			/>
		</template>

		<!-- Default Text Input (Data, Small Text, etc.) -->
		<template v-else>
			<input
				type="text"
				:value="value"
				@input="emit('update', ($event.target as HTMLInputElement).value)"
				@blur="emit('blur')"
				@keydown.enter="emit('blur')"
				@keydown.escape="emit('cancel')"
				class="text-input"
				ref="inputRef"
			/>
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import type { Field, DocTypeMeta } from "../../types";
import { desk } from "../../utils/resource";

const props = defineProps<{
	field: Field;
	value: any;
	meta?: DocTypeMeta | null;
}>();

const emit = defineEmits<{
	update: [value: any];
	blur: [];
	cancel: [];
}>();

const inputRef = ref<HTMLInputElement | HTMLSelectElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

// ── Link autocomplete state ──
const linkSearchText = ref(props.value ?? "");
const linkResults = ref<Array<{ value: string; description?: string }>>([]);
const showLinkDropdown = ref(false);
const linkSearching = ref(false);
const highlightedIndex = ref(-1);
let linkSearchTimer: ReturnType<typeof setTimeout> | null = null;

// Keep linkSearchText in sync with prop value
watch(
	() => props.value,
	(v) => {
		linkSearchText.value = v ?? "";
	},
);

// Parse select options from field.options
const selectOptions = computed<string[]>(() => {
	if (!props.field.options) return [];
	return props.field.options.split("\n").filter(Boolean);
});

// Format datetime for datetime-local input
function formatDateTimeLocal(value: any): string {
	if (!value) return "";
	try {
		const date = new Date(value);
		return date.toISOString().slice(0, 16);
	} catch {
		return "";
	}
}

// ── Link autocomplete methods ──
async function searchLink(txt: string) {
	if (!props.field.options) return;
	linkSearching.value = true;
	try {
		const resp = await desk.call({
			method: "frappe.client.get_list",
			args: {
				doctype: props.field.options,
				filters: txt ? { name: ["like", `%${txt}%`] } : {},
				fields: ["name"],
				limit_page_length: 20,
				order_by: "modified desc",
			},
		});
		const list: any[] = resp?.message ?? [];
		linkResults.value = list.map((r: any) => ({
			value: r.name,
			description: r.description || r.title || "",
		}));
	} catch {
		linkResults.value = [];
	} finally {
		linkSearching.value = false;
	}
}

function onLinkInput(txt: string) {
	linkSearchText.value = txt;
	emit("update", txt);
	highlightedIndex.value = -1;
	showLinkDropdown.value = true;

	if (linkSearchTimer) clearTimeout(linkSearchTimer);
	linkSearchTimer = setTimeout(() => searchLink(txt), 250);
}

function onLinkBlur() {
	// Delay so mousedown on dropdown can fire first
	setTimeout(() => {
		showLinkDropdown.value = false;
		emit("blur");
	}, 200);
}

function selectLinkResult(item: { value: string; description?: string }) {
	linkSearchText.value = item.value;
	emit("update", item.value);
	showLinkDropdown.value = false;
	emit("blur");
}

function selectHighlightedLink() {
	if (highlightedIndex.value >= 0 && highlightedIndex.value < linkResults.value.length) {
		selectLinkResult(linkResults.value[highlightedIndex.value]);
	} else {
		emit("blur");
	}
}

function moveHighlight(dir: number) {
	if (!showLinkDropdown.value || linkResults.value.length === 0) return;
	highlightedIndex.value = Math.max(
		-1,
		Math.min(linkResults.value.length - 1, highlightedIndex.value + dir),
	);
}

// Auto-focus on mount
onMounted(() => {
	setTimeout(() => {
		if (inputRef.value) {
			inputRef.value.focus();
			if ("select" in inputRef.value && props.field.fieldtype !== "Select") {
				inputRef.value.select();
			}
		}
	}, 0);

	// For Link fields, load initial results on focus
	if (props.field.fieldtype === "Link") {
		searchLink(props.value ?? "");
	}
});

onBeforeUnmount(() => {
	if (linkSearchTimer) clearTimeout(linkSearchTimer);
});
</script>

<style scoped>
.inline-editor {
	width: 100%;
}

.text-input,
.number-input,
.date-input,
.time-input,
.datetime-input,
.select-input {
	width: 100%;
	padding: 0.25rem 0.5rem;
	font-size: 0.8125rem;
	border: 1px solid #3b82f6;
	border-radius: 0.25rem;
	outline: none;
	background: #fff;
	color: #1e293b;
}

.text-input:focus,
.number-input:focus,
.date-input:focus,
.time-input:focus,
.datetime-input:focus,
.select-input:focus {
	box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.check-input {
	width: 1rem;
	height: 1rem;
	cursor: pointer;
}

.color-input {
	width: 2.5rem;
	height: 1.5rem;
	padding: 0;
	border: 1px solid #e2e8f0;
	border-radius: 0.25rem;
	cursor: pointer;
}

.number-input {
	text-align: right;
}

/* ── Link autocomplete styles ── */
.link-wrapper {
	position: relative;
	width: 100%;
}

.link-dropdown {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	z-index: 100;
	max-height: 200px;
	overflow-y: auto;
	background: #fff;
	border: 1px solid #e2e8f0;
	border-top: none;
	border-radius: 0 0 0.25rem 0.25rem;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.link-option {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.375rem 0.5rem;
	font-size: 0.8125rem;
	cursor: pointer;
	transition: background-color 0.1s;
}

.link-option:hover,
.link-option-active {
	background-color: #eff6ff;
}

.link-value {
	color: #1e293b;
	font-weight: 500;
}

.link-desc {
	color: #94a3b8;
	font-size: 0.75rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.link-loading {
	padding: 0.5rem;
	text-align: center;
	font-size: 0.75rem;
	color: #94a3b8;
}
</style>
