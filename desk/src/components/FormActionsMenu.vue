<template>
	<div class="relative" ref="menuRef">
		<button
			ref="triggerRef"
			type="button"
			class="inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
			:aria-expanded="isOpen"
			aria-haspopup="menu"
			aria-label="More actions"
			@click="toggleMenu"
			@keydown="onTriggerKeydown"
		>
			<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<circle cx="10" cy="4" r="1.6" />
				<circle cx="10" cy="10" r="1.6" />
				<circle cx="10" cy="16" r="1.6" />
			</svg>
		</button>

		<Transition
			enter-active-class="transition ease-out duration-100"
			enter-from-class="transform opacity-0 scale-95"
			enter-to-class="transform opacity-100 scale-100"
			leave-active-class="transition ease-in duration-75"
			leave-from-class="transform opacity-100 scale-100"
			leave-to-class="transform opacity-0 scale-95"
		>
			<div
				v-if="isOpen"
				class="absolute right-0 top-full mt-2 w-64 max-h-96 rounded-lg border border-slate-200 bg-white shadow-lg ring-1 ring-black/5 z-50 py-1 overflow-y-auto dark:border-slate-700 dark:bg-slate-900"
				role="menu"
				@keydown="onMenuKeydown"
			>
				<button
					v-for="(action, idx) in actions"
					:key="action.name"
					:ref="(el) => setItemRef(el, idx)"
					class="flex w-full items-center justify-between gap-4 px-4 py-2 text-sm text-slate-700 transition focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 cursor-pointer"
					:class="
						action.destructive
							? 'hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40'
							: 'hover:bg-slate-100 dark:hover:bg-slate-800'
					"
					role="menuitem"
					:type="'button'"
					:disabled="action.disabled"
					@mouseenter="focusIndex = idx"
					@click="handleSelect(action)"
				>
					<span class="truncate">{{ action.label }}</span>
					<kbd
						v-if="action.shortcut"
						class="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
					>
						{{ action.shortcut }}
					</kbd>
				</button>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";

export interface MenuAction {
	name: string;
	label: string;
	shortcut?: string;
	disabled?: boolean;
	destructive?: boolean;
}

interface Props {
	actions: MenuAction[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
	select: [action: MenuAction];
}>();

const isOpen = ref(false);
const focusIndex = ref(-1);
const itemRefs = ref<HTMLElement[]>([]);
const menuRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);

function setItemRef(el: Element | null, idx: number) {
	if (!el) return;
	itemRefs.value[idx] = el as HTMLElement;
}

function toggleMenu() {
	if (isOpen.value) {
		closeMenu();
		return;
	}
	openMenu();
}

function openMenu() {
	isOpen.value = true;
	nextTick(() => focusFirstEnabled());
}

function closeMenu(restoreFocus = true) {
	const wasOpen = isOpen.value;
	isOpen.value = false;
	focusIndex.value = -1;
	if (wasOpen && restoreFocus) {
		triggerRef.value?.focus();
	}
}

function focusFirstEnabled() {
	const idx = props.actions.findIndex((action) => !action.disabled);
	if (idx >= 0) {
		focusIndex.value = idx;
		itemRefs.value[idx]?.focus();
	}
}

function focusRelative(step: number) {
	if (!props.actions.length) return;
	let next = focusIndex.value;
	for (let i = 0; i < props.actions.length; i += 1) {
		next = (next + step + props.actions.length) % props.actions.length;
		if (!props.actions[next]?.disabled) {
			focusIndex.value = next;
			itemRefs.value[next]?.focus();
			return;
		}
	}
}

function handleSelect(action: MenuAction) {
	if (action.disabled) return;
	emit("select", action);
	closeMenu();
}

function onTriggerKeydown(event: KeyboardEvent) {
	if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		openMenu();
	}
}

function onMenuKeydown(event: KeyboardEvent) {
	switch (event.key) {
		case "Escape":
			event.preventDefault();
			closeMenu();
			break;
		case "ArrowDown":
			event.preventDefault();
			focusRelative(1);
			break;
		case "ArrowUp":
			event.preventDefault();
			focusRelative(-1);
			break;
		case "Home":
			event.preventDefault();
			focusFirstEnabled();
			break;
		case "End":
			event.preventDefault();
			focusIndex.value = props.actions.length - 1;
			itemRefs.value[focusIndex.value]?.focus();
			break;
		case "Tab":
			closeMenu();
			break;
		default:
			break;
	}
}

function handleClickOutside(event: MouseEvent) {
	if (!menuRef.value) return;
	if (menuRef.value.contains(event.target as Node)) return;
	if (triggerRef.value?.contains(event.target as Node)) return;
	closeMenu(false);
}

watch(
	() => props.actions,
	() => {
		itemRefs.value = [];
	},
);

onMounted(() => {
	document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener("click", handleClickOutside);
});
</script>
