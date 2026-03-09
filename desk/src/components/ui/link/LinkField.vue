<script setup lang="ts">
import { resource } from "@/utils/resource";
import { __, cn } from "@/lib/utils";
import { ChevronDown, Loader2, X, Check } from "lucide-vue-next";
import { PopoverRoot, PopoverPortal, PopoverContent, PopoverAnchor } from "radix-vue";
import { computed, ref, watch, type HTMLAttributes } from "vue";

export interface LinkFieldOption {
	value: string;
	description?: string;
}

const props = withDefaults(
	defineProps<{
		modelValue?: string;
		doctype: string;
		disabled?: boolean;
		clearable?: boolean;
		minChars?: number;
		pageLength?: number;
		filters?: Record<string, unknown>;
		referenceDoctype?: string;
		ignoreUserPermissions?: boolean;
		labelField?: string;
		emptyText?: string;
		class?: HTMLAttributes["class"];
	}>(),
	{
		disabled: false,
		clearable: true,
		minChars: 0,
		pageLength: 20,
		labelField: "name",
		emptyText: __("No matches found"),
		filters: () => ({}),
		ignoreUserPermissions: false,
	},
);

const emit = defineEmits<{
	(e: "update:modelValue", value: string): void;
	(e: "select", option: LinkFieldOption): void;
	(e: "clear"): void;
	(e: "search", query: string): void;
}>();

const open = ref(false);
const loading = ref(false);
const query = ref("");
const options = ref<LinkFieldOption[]>([]);
const highlightedIndex = ref(-1);
const selectedLabel = ref("");
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const hasSelection = computed(() => !!props.modelValue);

watch(
	() => props.modelValue,
	async (value) => {
		if (!value) {
			selectedLabel.value = "";
			if (!open.value) query.value = "";
			return;
		}

		if (value === selectedLabel.value) {
			if (!open.value) query.value = selectedLabel.value;
			return;
		}

		await resolveSelectedLabel(value);
		if (!open.value) query.value = selectedLabel.value;
	},
	{ immediate: true },
);

watch(open, (isOpen) => {
	if (isOpen) {
		query.value = selectedLabel.value;
		highlightedIndex.value = -1;
		void searchOptions(query.value);
		return;
	}

	query.value = selectedLabel.value;
	highlightedIndex.value = -1;
});

async function resolveSelectedLabel(value: string) {
	try {
		const response = await resource.call({
			method: "frappe.client.get_value",
			args: {
				doctype: props.doctype,
				name: value,
				fieldname: props.labelField,
			},
		});
		const row = response?.message ?? {};
		const label = String(row?.[props.labelField] ?? value);
		selectedLabel.value = label;
	} catch {
		selectedLabel.value = value;
	}
}

async function searchOptions(text: string) {
	if (!open.value) return;

	const trimmed = text.trim();
	if (trimmed.length < props.minChars) {
		options.value = [];
		return;
	}

	loading.value = true;
	emit("search", trimmed);

	try {
		const response = await resource.call({
			method: "frappe.desk.search.search_link",
			args: {
				doctype: props.doctype,
				txt: trimmed,
				page_length: props.pageLength,
				filters: props.filters,
				reference_doctype: props.referenceDoctype,
				ignore_user_permissions: props.ignoreUserPermissions,
			},
		});
		options.value = normalizeLinkResponse(response?.message ?? response ?? []);
	} catch {
		options.value = [];
	} finally {
		loading.value = false;
	}
}

function normalizeLinkResponse(rows: unknown[]): LinkFieldOption[] {
	return rows
		.map((row): LinkFieldOption | null => {
			if (Array.isArray(row)) {
				const value = String(row[0] ?? "");
				if (!value) return null;
				const description = row[1] ? String(row[1]) : undefined;
				return {
					value,
					description,
				};
			}

			if (row && typeof row === "object") {
				const record = row as Record<string, unknown>;
				return {
					value: record.value as string,
					description: record.description as string,
				};
			}

			return null;
		})
		.filter((row): row is LinkFieldOption => !!row);
}

function onInput(event: Event) {
	const target = event.target as HTMLInputElement;
	query.value = target.value;

	if (!open.value) open.value = true;

	if (searchTimer) clearTimeout(searchTimer);
	searchTimer = setTimeout(() => {
		void searchOptions(query.value);
	}, 250);
}

function onFocus() {
	if (!props.disabled) {
		open.value = true;
	}
}

function onKeydown(event: KeyboardEvent) {
	const total = options.value.length;

	switch (event.key) {
		case "ArrowDown":
			event.preventDefault();
			if (!open.value) open.value = true;
			highlightedIndex.value = Math.min(highlightedIndex.value + 1, Math.max(total - 1, 0));
			break;
		case "ArrowUp":
			event.preventDefault();
			highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
			break;
		case "Enter":
			event.preventDefault();
			if (highlightedIndex.value >= 0 && highlightedIndex.value < total) {
				selectOption(options.value[highlightedIndex.value]);
			}
			break;
		case "Escape":
			event.preventDefault();
			open.value = false;
			break;
		case "Tab":
			open.value = false;
			break;
	}
}

function selectOption(option: LinkFieldOption) {
	selectedLabel.value = option.description ?? option.value;
	query.value = option.description ?? option.value;
	emit("update:modelValue", option.value);
	emit("select", option);
	open.value = false;
}

function clearSelection() {
	selectedLabel.value = "";
	query.value = "";
	options.value = [];
	emit("update:modelValue", "");
	emit("clear");
}
</script>

<template>
	<div :class="cn('w-full', props.class)">
		<PopoverRoot v-model:open="open">
			<PopoverAnchor as-child>
				<div class="relative">
					<input
						:value="query"
						type="text"
						autocomplete="off"
						:placeholder="`Search ${doctype}`"
						:disabled="disabled"
						:class="
							cn(
								'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
								clearable && hasSelection ? 'pr-14' : 'pr-8',
							)
						"
						@input="onInput"
						@focus="onFocus"
						@keydown="onKeydown"
					/>

					<div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
						<button
							v-if="clearable && hasSelection"
							type="button"
							tabindex="-1"
							class="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
							@mousedown.prevent="clearSelection"
						>
							<X class="h-3.5 w-3.5" />
						</button>
						<Loader2
							v-if="loading"
							class="h-4 w-4 text-muted-foreground animate-spin"
						/>
						<ChevronDown
							v-else
							class="h-4 w-4 text-muted-foreground"
							:class="{ 'rotate-180': open }"
						/>
					</div>
				</div>
			</PopoverAnchor>

			<PopoverPortal to="body">
				<PopoverContent
					align="start"
					side="bottom"
					:side-offset="4"
					class="z-[10010] w-[var(--radix-popover-trigger-width)] max-h-[280px] overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none"
					@open-auto-focus.prevent
				>
					<div
						v-if="loading"
						class="flex items-center justify-center py-4 text-sm text-muted-foreground"
					>
						<Loader2 class="h-4 w-4 animate-spin" />
						<span class="ml-2">{{ __("Searching...") }}</span>
					</div>

					<div
						v-else-if="options.length === 0"
						class="py-3 px-2 text-sm text-muted-foreground"
					>
						{{ emptyText }}
					</div>

					<button
						v-for="(option, index) in options"
						:key="option.value"
						type="button"
						class="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors"
						:class="[
							index === highlightedIndex
								? 'bg-accent text-accent-foreground'
								: 'hover:bg-accent/50',
							option.value === modelValue ? 'font-medium' : '',
						]"
						@mouseenter="highlightedIndex = index"
						@mousedown.prevent="selectOption(option)"
					>
						<div class="min-w-0 flex-1">
							<div class="truncate">{{ option.value }}</div>
							<div
								v-if="option.description"
								class="truncate text-xs text-muted-foreground"
							>
								{{ option.description }}
							</div>
						</div>
						<Check
							v-if="option.value === modelValue"
							class="h-4 w-4 shrink-0 text-primary"
						/>
					</button>
				</PopoverContent>
			</PopoverPortal>
		</PopoverRoot>
	</div>
</template>
