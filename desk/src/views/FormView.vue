<template>
	<AppLayout :custom-sidebar="!isNewDocument">
		<template #header>
			<div class="flex flex-wrap items-center justify-between gap-4 w-full py-2">
				<div class="flex flex-col gap-1 flex-1">
					<h2 class="text-lg font-semibold text-slate-800 dark:text-white">
						{{ doctype }}
					</h2>
					<p
						v-if="!currentMeta?.issingle"
						class="text-sm text-slate-600 dark:text-slate-400"
					>
						{{ isNewDocument ? __("New document") : documentName }}
					</p>
				</div>

				<div class="flex items-center gap-2">
					<FormButtons :buttons="customButtons" @execute="handleButtonExecute" />
					<FormActionsMenu :actions="menuActions" @select="handleMenuAction" />
					<div class="flex items-center gap-2">
						<Button
							variant="secondary"
							size="sm"
							class="disabled:cursor-not-allowed"
							:disabled="!navigation.prev"
							@click="goPrev"
							aria-label="Previous document"
							title="Previous (Shift+ArrowUp)"
						>
							<ChevronLeft
								class="h-6 w-4 text-gray-800 dark:text-white"
								aria-hidden="true"
							/>
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
							<ChevronRight
								class="h-6 w-4 text-gray-800 dark:text-white"
								aria-hidden="true"
							/>
						</Button>
						<Button
							v-if="!isNewDocument"
							variant="secondary"
							size="sm"
							@click="sidebarOpen = !sidebarOpen"
							:aria-label="__('Toggle sidebar')"
							:title="sidebarOpen ? __('Hide details') : __('Show details')"
						>
							<Menu
								class="h-5 w-5 text-gray-800 dark:text-white"
								aria-hidden="true"
							/>
						</Button>
					</div>
				</div>
			</div>
		</template>

		<template #content>
			<div class="relative" :class="{ 'pb-12': isDirty }">
				<FormRenderer
					ref="formContext"
					:doctype="doctype"
					:docname="documentName"
					@loading="loading = $event"
				/>

				<BottomActionBar
					:show="isDirty"
					:loading="loading"
					@save="handleSave"
					@discard="handleDiscard"
				/>
			</div>
		</template>
		<template #sidebar>
			<FormSidebar
				v-if="sidebarOpen && !isNewDocument"
				:doc="currentDoc"
				:doctype="doctype"
				:is-open="true"
				@update:is-open="sidebarOpen = $event"
			/>
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
import FormSidebar from "../components/FormSidebar.vue";
import { __ } from "../utils/translate";
import ChevronLeft from "../icons/ChevronLeft.vue";
import ChevronRight from "../icons/ChevronRight.vue";
import Menu from "../icons/Menu.vue";

const formContext = ref();
const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();
const loading = ref(false);
const toast = useToastStore();

const SIDEBAR_STORAGE_KEY = "form_sidebar_open";

function getSidebarStoredState(): boolean {
	try {
		const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
		return stored === null ? true : stored === "true";
	} catch {
		return true;
	}
}

const sidebarOpen = ref<boolean>(getSidebarStoredState());

watch(sidebarOpen, (val) => {
	try {
		localStorage.setItem(SIDEBAR_STORAGE_KEY, String(val));
	} catch {
		/* ignore */
	}
});

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
	if (currentMeta.value?.issingle) {
		return [
			{ name: "email", label: __("Email"), shortcut: "Ctrl+E", disabled: !hasDoc },
			{ name: "jump", label: __("Jump to field"), shortcut: "Ctrl+J" },
			{ name: "copy", label: __("Copy to Clipboard"), disabled: !hasDoc },
			{ name: "reload", label: __("Reload") },
			{ name: "remind", label: __("Remind Me"), shortcut: "Shift+R" },
			{ name: "undo", label: __("Undo"), shortcut: "Ctrl+Z", disabled: !canUndo },
			{ name: "redo", label: __("Redo"), shortcut: "Ctrl+Y", disabled: true },
			{ name: "customize", label: __("Customize Form") },
			{ name: "edit_doctype", label: __("Edit DocType") },
		];
	} else {
		return [
			{ name: "print", label: __("Print"), shortcut: "Ctrl+P", disabled: !hasDoc },
			{ name: "email", label: __("Email"), shortcut: "Ctrl+E", disabled: !hasDoc },
			{ name: "jump", label: __("Jump to field"), shortcut: "Ctrl+J" },
			{ name: "links", label: __("Links"), disabled: !hasDoc },
			{ name: "duplicate", label: __("Duplicate"), shortcut: "Shift+D", disabled: !hasDoc },
			{ name: "copy", label: __("Copy to Clipboard"), disabled: !hasDoc },
			{ name: "rename", label: __("Rename"), disabled: !hasDoc || !allowRename },
			{ name: "reload", label: __("Reload") },
			{
				name: "delete",
				label: __("Delete"),
				shortcut: "Ctrl+Shift+D",
				disabled: !canEdit,
				destructive: true,
			},
			{ name: "remind", label: __("Remind Me"), shortcut: "Shift+R" },
			{ name: "undo", label: __("Undo"), shortcut: "Ctrl+Z", disabled: !canUndo },
			{ name: "redo", label: __("Redo"), shortcut: "Ctrl+Y", disabled: true },
			{ name: "new", label: `New ${doctype.value}`, shortcut: "Ctrl+B" },
		];
	}
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
			await printDocument(doc);
			break;
		case "email":
			if (!doc?.name) return;
			await emailDocument(doc);
			break;
		case "jump":
			await jumpToField();
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
			await setReminder(doc);
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

async function printDocument(doc: Record<string, any>) {
	try {
		// Fetch available print formats for this doctype
		const response = await desk.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Print Format",
				filters: { doc_type: doctype.value, disabled: 0 },
				fields: ["name"],
				limit_page_length: 0,
			},
		});
		const formats = (response.message || []).map((f: any) => f.name);
		formats.unshift("Standard");

		let selectedFormat = "Standard";
		if (formats.length > 1) {
			const chosen = await dialog.prompt("Print", {
				label: `Print Format (${formats.join(", ")})`,
				defaultValue: "Standard",
			});
			if (chosen === null) return;
			selectedFormat = formats.includes(chosen) ? chosen : "Standard";
		}

		window.open(
			`/printview?doctype=${encodeURIComponent(doctype.value)}&name=${encodeURIComponent(
				doc.name,
			)}&format=${encodeURIComponent(selectedFormat)}&no_letterhead=0`,
			"_blank",
		);
	} catch (error) {
		// Fallback to standard format
		window.open(
			`/printview?doctype=${encodeURIComponent(doctype.value)}&name=${encodeURIComponent(
				doc.name,
			)}&format=Standard&no_letterhead=0`,
			"_blank",
		);
	}
}

async function emailDocument(doc: Record<string, any>) {
	try {
		const recipient = await dialog.prompt("Email Document", {
			label: "Recipient Email",
			defaultValue: "",
		});
		if (recipient === null || !recipient) return;

		await desk.call({
			method: "frappe.core.doctype.communication.email.make",
			args: {
				recipients: recipient,
				subject: `${doctype.value}: ${doc.name}`,
				content: `Please see the attached ${doctype.value}: ${doc.name}\n\nLink: ${window.location.href}`,
				doctype: doctype.value,
				name: doc.name,
				send_email: 1,
			},
		});
		toast.success("Email sent", `Email sent to ${recipient}`);
	} catch (error: any) {
		// Fallback to mailto
		window.location.href = `mailto:?subject=${encodeURIComponent(
			`${doctype.value} ${doc.name}`,
		)}&body=${encodeURIComponent(`Link: ${window.location.href}`)}`;
	}
}

async function jumpToField() {
	const meta = currentMeta.value;
	if (!meta?.fields?.length) {
		if (formContext.value?.focusFirstField) {
			formContext.value.focusFirstField();
		}
		return;
	}

	const fieldNames = meta.fields
		.filter(
			(f: any) =>
				!f.hidden &&
				!f.is_system_generated &&
				!["Section Break", "Column Break", "Tab Break"].includes(f.fieldtype),
		)
		.map((f: any) => f.label || f.fieldname);

	if (!fieldNames.length) return;

	const selected = await dialog.prompt("Jump to Field", {
		label: `Field (${fieldNames.slice(0, 5).join(", ")}${fieldNames.length > 5 ? "..." : ""})`,
		defaultValue: "",
	});
	if (selected === null || !selected) return;

	// Find matching field
	const matchedField = meta.fields.find(
		(f: any) =>
			(f.label || f.fieldname).toLowerCase() === selected.toLowerCase() ||
			f.fieldname.toLowerCase() === selected.toLowerCase(),
	);
	const fieldname = matchedField?.fieldname || selected;

	// Focus the field element
	const formEl = document.querySelector("[data-form-content]") || document;
	const fieldEl =
		formEl.querySelector(`[data-fieldname="${fieldname}"] input`) ||
		formEl.querySelector(`[data-fieldname="${fieldname}"] select`) ||
		formEl.querySelector(`[data-fieldname="${fieldname}"] textarea`) ||
		formEl.querySelector(`[data-fieldname="${fieldname}"]`);

	if (fieldEl instanceof HTMLElement) {
		fieldEl.focus({ preventScroll: true });
		setTimeout(() => fieldEl.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
	}
}

async function setReminder(doc: Record<string, any> | null) {
	const reminderDate = await dialog.prompt("Set Reminder", {
		label: "Reminder Date",
		defaultValue: "",
	});
	if (reminderDate === null || !reminderDate) return;

	try {
		await desk.call({
			method: "frappe.desk.doctype.event.event.create_event",
			args: {
				subject: `Reminder: ${doctype.value} ${doc?.name || "(New)"}`,
				starts_on: reminderDate,
				event_type: "Private",
				reference_doctype: doctype.value,
				reference_docname: doc?.name,
			},
		});
		toast.success("Reminder set", `Reminder scheduled for ${reminderDate}`);
	} catch {
		toast.info("Reminder", "Reminder noted locally.");
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

	meta.fields.forEach((field: any) => {
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
