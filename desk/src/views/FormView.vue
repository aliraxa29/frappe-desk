<template>
	<AppLayout>
		<!-- Header -->
		<template #header>
			<div class="flex flex-wrap items-center justify-between gap-4 w-full py-3">
				<h2 class="text-lg font-semibold text-slate-800 dark:text-white">
					{{ doctype
					}}<span class="font-normal text-slate-600 dark:text-slate-400 ml-2">{{
						isNewDocument ? "(New)" : documentName
					}}</span>
				</h2>

				<div class="flex items-center gap-2">
					<FormButtons :buttons="customButtons" @execute="handleButtonExecute" />
					<FormActionsMenu :actions="menuActions" @select="handleMenuAction" />
					<div class="flex items-center gap-1">
						<Button
							variant="secondary"
							size="sm"
							class="disabled:cursor-not-allowed"
							:disabled="!navigation.prev"
							@click="goPrev"
							aria-label="Previous document"
							title="Previous (Shift+ArrowUp)"
						>
							<svg
								class="h-6 w-4 text-gray-800"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									d="M12.78 4.22a.75.75 0 010 1.06L8.56 9.5l4.22 4.22a.75.75 0 11-1.06 1.06L6.97 10.03a.75.75 0 010-1.06l4.75-4.75a.75.75 0 011.06 0z"
								/>
							</svg>
						</Button>
						<Button
							variant="secondary"
							size="sm"
							class="disabled:cursor-not-allowed"
							:disabled="!navigation.next"
							@click="goNext"
							aria-label="Next document"
							title="Next (Shift+ArrowDown)"
						>
							<svg
								class="h-6 w-4 text-gray-800"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									d="M7.22 15.78a.75.75 0 010-1.06L11.44 10 7.22 5.78a.75.75 0 111.06-1.06l4.75 4.75c.3.3.3.77 0 1.06l-4.75 4.75a.75.75 0 01-1.06 0z"
								/>
							</svg>
						</Button>
					</div>
				</div>
			</div>
		</template>

		<!-- Content -->
		<template #content>
			<div class="relative">
				<FormRenderer
					ref="formContext"
					:doctype="doctype"
					:docname="documentName"
					@loading="loading = $event"
				/>

				<!-- Bottom Action Bar -->
				<BottomActionBar
					:show="isDirty"
					:loading="loading"
					@save="handleSave"
					@discard="handleDiscard"
				/>
			</div>
		</template>
	</AppLayout>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import AppLayout from "../layout/AppLayout.vue";
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import FormRenderer from "./FormRenderer.vue";
import FormButtons from "../components/FormButtons.vue";
import BottomActionBar from "../components/BottomActionBar.vue";
import { useBreadcrumbStore } from "../stores/breadcrumbs";
import type { FormButton } from "../composables/useFormButtons";
import FormActionsMenu, { type MenuAction } from "../components/FormActionsMenu.vue";
import { frappeClient } from "../api/resource";
import { desk } from "../utils/desk";
import { dialog } from "../stores/dialog";
import { useToastStore } from "../stores/toast";
import Button from "../components/Button.vue";

const formContext = ref();
const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();
const loading = ref(false);
const toast = useToastStore();

const app = computed(() => route.params.app as string);
const doctype = computed(() => route.params.doctype as string);

// Determine if this is a new document or existing document
// New documents use the /new route path
const documentName = computed(() => {
	const param = route.params.name;

	// If route name is explicitly 'NewForm' or param is 'new', it's a new document
	if (route.name === "NewForm" || param === "new") {
		return null;
	}

	// Otherwise, it's an existing document name
	return param as string;
});

const isNewDocument = computed(() => {
	return route.name === "NewForm" || documentName.value === null;
});

const customButtons = computed(() => {
	return formContext.value?.customButtons || [];
});

const isDirty = computed(() => formContext.value?.isDirty ?? false);

const currentDoc = computed(() => formContext.value?.ctx?.doc || null);
const currentMeta = computed(() => formContext.value?.ctx?.meta || null);

const navigation = ref<{ prev: string | null; next: string | null }>({
	prev: null,
	next: null,
});

const menuActions = computed<MenuAction[]>(() => {
	const docName = currentDoc.value?.name;
	const canEdit = !isNewDocument.value;
	const allowRename = currentMeta.value?.allow_rename !== 0;
	const hasDoc = !!docName && !isNewDocument.value;
	const canUndo = isDirty.value;

	return [
		{ name: "print", label: "Print", shortcut: "Ctrl+P", disabled: !hasDoc },
		{ name: "email", label: "Email", shortcut: "Ctrl+E", disabled: !hasDoc },
		{ name: "jump", label: "Jump to field", shortcut: "Ctrl+J" },
		{ name: "links", label: "Links", disabled: !hasDoc },
		{ name: "duplicate", label: "Duplicate", shortcut: "Shift+D", disabled: !hasDoc },
		{ name: "copy", label: "Copy to Clipboard", disabled: !hasDoc },
		{ name: "rename", label: "Rename", disabled: !hasDoc || !allowRename },
		{ name: "reload", label: "Reload" },
		{
			name: "delete",
			label: "Delete",
			shortcut: "Ctrl+Shift+D",
			disabled: !canEdit,
			destructive: true,
		},
		{ name: "remind", label: "Remind Me", shortcut: "Shift+R" },
		{ name: "undo", label: "Undo", shortcut: "Ctrl+Z", disabled: !canUndo },
		{ name: "redo", label: "Redo", shortcut: "Ctrl+Y", disabled: true },
		{ name: "new", label: `New ${doctype.value}`, shortcut: "Ctrl+B" },
	];
});

// Update breadcrumbs
watch(
	[app, doctype, documentName],
	() => {
		breadcrumbStore.setForForm(app.value, doctype.value, documentName.value);
	},
	{ immediate: true },
);

const handleSave = () => {
	if (formContext.value?.handleSave) {
		formContext.value.handleSave();
	}
};

const handleDiscard = () => {
	if (formContext.value?.handleDiscard) {
		formContext.value.handleDiscard();
	}
};

const handleButtonExecute = (button: FormButton) => {
	console.log("Button executed:", button.name);
	// Additional logic can be added here if needed
};

async function loadNeighbors() {
	const doc = currentDoc.value;
	if (!doc?.name || isNewDocument.value || currentMeta.value?.issingle) {
		navigation.value = { prev: null, next: null };
		return;
	}
	if (!doc.modified) {
		navigation.value = { prev: null, next: null };
		return;
	}

	try {
		const [prevResult, nextResult] = await Promise.all([
			desk.call({
				method: "frappe.client.get_list",
				args: {
					doctype: doctype.value,
					fields: ["name"],
					filters: [["modified", ">", doc.modified]],
					order_by: "modified asc",
					limit_page_length: 1,
				},
			}),
			desk.call({
				method: "frappe.client.get_list",
				args: {
					doctype: doctype.value,
					fields: ["name"],
					filters: [["modified", "<", doc.modified]],
					order_by: "modified desc",
					limit_page_length: 1,
				},
			}),
		]);

		const prevName = prevResult.message?.[0]?.name || null;
		const nextName = nextResult.message?.[0]?.name || null;
		navigation.value = { prev: prevName, next: nextName };
	} catch (error) {
		console.error("Failed to load neighbors:", error);
		navigation.value = { prev: null, next: null };
	}
}

async function goPrev() {
	if (!navigation.value.prev) return;
	await router.push({
		name: "EditForm",
		params: {
			app: app.value,
			doctype: doctype.value,
			name: navigation.value.prev,
		},
	});
}

async function goNext() {
	if (!navigation.value.next) return;
	await router.push({
		name: "EditForm",
		params: {
			app: app.value,
			doctype: doctype.value,
			name: navigation.value.next,
		},
	});
}

function isEditableTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function normalizeShortcut(event: KeyboardEvent): string | null {
	const key = event.key;
	// Ignore bare modifier presses
	if (["Shift", "Control", "Alt", "Meta"].includes(key)) return null;

	const parts: string[] = [];
	if (event.ctrlKey || event.metaKey) parts.push("Ctrl");
	if (event.shiftKey) parts.push("Shift");
	if (event.altKey) parts.push("Alt");

	// Normalize the key name: single chars uppercase, special keys as-is
	parts.push(key.length === 1 ? key.toUpperCase() : key);
	return parts.join("+");
}

// Map of normalized shortcut strings to action names
const shortcutMap: Record<string, string> = {
	"Ctrl+P": "print",
	"Ctrl+E": "email",
	"Ctrl+J": "jump",
	"Shift+D": "duplicate",
	"Ctrl+Shift+D": "delete",
	"Shift+R": "remind",
	"Ctrl+Z": "undo",
	"Ctrl+Y": "redo",
	"Ctrl+B": "new",
	"Shift+ArrowUp": "prev",
	"Shift+ArrowDown": "next",
};

function handleGlobalShortcut(event: KeyboardEvent) {
	const shortcut = normalizeShortcut(event);
	if (!shortcut) return;

	const actionName = shortcutMap[shortcut];
	if (!actionName) return;

	// For shortcuts without Ctrl/Meta, skip if user is typing in a field
	const hasModifier = event.ctrlKey || event.metaKey;
	if (!hasModifier && isEditableTarget(event.target)) return;

	// Navigation shortcuts
	if (actionName === "prev") {
		event.preventDefault();
		goPrev();
		return;
	}
	if (actionName === "next") {
		event.preventDefault();
		goNext();
		return;
	}

	// Menu action shortcuts
	const action = menuActions.value.find((item) => item.name === actionName);
	if (!action || action.disabled) return;
	event.preventDefault();
	handleMenuAction(action);
}

async function handleMenuAction(action: MenuAction) {
	const doc = currentDoc.value;
	if (!doc && ["jump", "new", "customize", "edit_doctype"].includes(action.name) === false) {
		return;
	}

	switch (action.name) {
		case "print":
			if (!doc?.name) return;
			window.open(
				`/printview?doctype=${encodeURIComponent(doctype.value)}&name=${encodeURIComponent(
					doc.name,
				)}&format=Standard&no_letterhead=0`,
				"_blank",
			);
			break;
		case "email":
			if (!doc?.name) return;
			window.location.href = `mailto:?subject=${encodeURIComponent(
				`${doctype.value} ${doc.name}`,
			)}&body=${encodeURIComponent(`Link: ${window.location.href}`)}`;
			break;
		case "jump":
			if (formContext.value?.focusFirstField) {
				formContext.value.focusFirstField();
			}
			break;
		case "links":
			if (!doc?.name) return;
			try {
				const response = await desk.call({
					method: "frappe.desk.form.linked_with.get_linked_docs",
					args: {
						doctype: doctype.value,
						name: doc.name,
					},
				});
				const linked = response.message || {};
				const items = Object.keys(linked)
					.filter((key) => Array.isArray(linked[key]) && linked[key].length)
					.map((key) => `${key}: ${linked[key].length}`);
				const message = items.length
					? `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`
					: "No linked records found.";
				await dialog.alert("Linked Records", message, { isHtml: true });
			} catch (error) {
				console.error("Failed to load linked docs:", error);
				toast.error("Links failed", "Unable to load linked records.");
			}
			break;
		case "duplicate":
			if (!doc) return;
			await duplicateDocument(doc);
			break;
		case "copy":
			if (!doc?.name) return;
			try {
				await navigator.clipboard.writeText(doc.name);
				toast.success("Copied", "Document name copied to clipboard.");
			} catch (error) {
				console.error("Clipboard copy failed:", error);
				toast.error("Copy failed", "Unable to copy to clipboard.");
			}
			break;
		case "rename":
			if (!doc?.name) return;
			{
				const newName = await dialog.prompt("Rename Document", {
					label: "New Name",
					defaultValue: doc.name,
				});
				if (!newName || newName === doc.name) return;
				await frappeClient.callMethod("frappe.client.rename_doc", {
					doctype: doctype.value,
					old_name: doc.name,
					new_name: newName,
				});
				await router.push({
					name: "EditForm",
					params: {
						app: app.value,
						doctype: doctype.value,
						name: newName,
					},
				});
			}
			break;
		case "reload":
			if (formContext.value?.reload) {
				await formContext.value.reload();
			}
			break;
		case "delete":
			if (!doc?.name) return;
			{
				const confirmed = await dialog.confirmDelete(doc.name);
				if (!confirmed) return;
				await frappeClient.deleteDocument(doctype.value, doc.name);
				await router.push({
					name: "ListView",
					params: {
						app: app.value,
						doctype: doctype.value,
					},
				});
			}
			break;
		case "remind":
			{
				const reminder = await dialog.prompt("Set Reminder", {
					label: "Reminder Note",
					required: false,
				});
				if (reminder === null) return;
				toast.success("Reminder saved", reminder || "Reminder added.");
			}
			break;
		case "undo":
			handleDiscard();
			break;
		case "redo":
			toast.info("Redo unavailable", "Redo is not supported yet.");
			break;
		case "customize":
			window.open(`/app/customize-form/${encodeURIComponent(doctype.value)}`, "_blank");
			break;
		case "edit_doctype":
			window.open(`/app/doctype/DocType/${encodeURIComponent(doctype.value)}`, "_blank");
			break;
		case "new":
			await router.push({
				name: "NewForm",
				params: {
					app: app.value,
					doctype: doctype.value,
				},
			});
			break;
		default:
			break;
	}
}

function stripSystemFields(row: Record<string, any>) {
	const excluded = new Set([
		"name",
		"owner",
		"creation",
		"modified",
		"modified_by",
		"docstatus",
		"idx",
		"parent",
		"parenttype",
		"parentfield",
		"__islocal",
		"__unsaved",
	]);
	const cleaned: Record<string, any> = {};
	Object.keys(row || {}).forEach((key) => {
		if (excluded.has(key)) return;
		cleaned[key] = row[key];
	});
	return cleaned;
}

async function duplicateDocument(doc: Record<string, any>) {
	const meta = currentMeta.value;
	if (!meta) return;
	const payload: Record<string, any> = {};

	meta.fields.forEach((field) => {
		const value = doc[field.fieldname];
		if (value === undefined) return;
		if (field.fieldtype === "Table" && Array.isArray(value)) {
			payload[field.fieldname] = value.map((row: Record<string, any>) =>
				stripSystemFields(row),
			);
			return;
		}
		payload[field.fieldname] = value;
	});

	try {
		const newDoc = await frappeClient.createDocument(doctype.value, payload);
		await router.push({
			name: "EditForm",
			params: {
				app: app.value,
				doctype: doctype.value,
				name: newDoc.name,
			},
		});
	} catch (error) {
		console.error("Duplicate failed:", error);
		toast.error("Duplicate failed", "Unable to duplicate this document.");
	}
}

watch(
	[doctype, documentName, () => currentDoc.value?.modified],
	() => {
		loadNeighbors();
	},
	{ immediate: true },
);

onMounted(() => {
	window.addEventListener("keydown", handleGlobalShortcut);
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleGlobalShortcut);
});
</script>

<style scoped></style>
