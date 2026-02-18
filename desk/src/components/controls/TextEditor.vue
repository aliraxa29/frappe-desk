<template>
	<div class="mb-4 flex flex-col relative">
		<label
			v-if="field.label"
			class="font-medium mb-1 text-sm text-slate-700 dark:text-slate-200"
		>
			{{ field.label }}
			<span v-if="field.reqd" class="text-red-500 ml-1">*</span>
		</label>

		<div
			class="border border-[#ddd] dark:border-slate-700 rounded bg-white dark:bg-slate-800 overflow-hidden"
		>
			<div
				ref="toolbarRef"
				class="ql-toolbar ql-snow border-b border-[#ddd] dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
			>
				<span class="ql-formats">
					<select class="ql-font" title="Font Family">
						<option selected value="">Default</option>
						<option value="georgia">Georgia</option>
						<option value="inter">Inter</option>
						<option value="poppins">Poppins</option>
						<option value="roboto-mono">Roboto Mono</option>
						<option value="playfair">Playfair Display</option>
						<option value="lora">Lora</option>
						<option value="ubuntu">Ubuntu</option>
						<option value="source-code">Source Code Pro</option>
					</select>
					<select class="ql-size" title="Font Size">
						<option selected></option>
						<option v-for="s in fontSizes" :key="s" :value="s">{{ s }}</option>
					</select>
				</span>
				<span class="ql-formats">
					<button class="ql-bold" title="Bold"></button>
					<button class="ql-italic" title="Italic"></button>
					<button class="ql-underline" title="Underline"></button>
					<button class="ql-strike" title="Strikethrough"></button>
				</span>
				<span class="ql-formats">
					<select class="ql-header" title="Heading">
						<option value="1">Heading 1</option>
						<option value="2">Heading 2</option>
						<option value="3">Heading 3</option>
						<option value="4">Heading 4</option>
						<option value="5">Heading 5</option>
						<option value="6">Heading 6</option>
						<option selected></option>
					</select>
				</span>
				<span class="ql-formats">
					<button class="ql-list" value="ordered" title="Numbered List"></button>
					<button class="ql-list" value="bullet" title="Bullet List"></button>
					<button class="ql-indent" value="-1" title="Outdent"></button>
					<button class="ql-indent" value="+1" title="Indent"></button>
				</span>
				<span class="ql-formats">
					<select class="ql-align" title="Align">
						<option selected></option>
						<option value="center"></option>
						<option value="right"></option>
						<option value="justify"></option>
					</select>
					<button class="ql-direction" value="rtl" title="Direction"></button>
				</span>
				<span class="ql-formats">
					<select class="ql-color" title="Font Color"></select>
					<select class="ql-background" title="Highlight"></select>
				</span>
				<span class="ql-formats">
					<button class="ql-blockquote" title="Quote"></button>
					<button class="ql-code-block" title="Code Block"></button>
				</span>
				<span class="ql-formats">
					<button class="ql-link" title="Insert Link"></button>
					<button class="ql-image" title="Insert Image"></button>
				</span>
				<span class="ql-formats">
					<button class="ql-table" value="insert-table" title="Insert Table"></button>
				</span>
				<span class="ql-formats">
					<button class="ql-clean" title="Clear Formatting"></button>
				</span>
			</div>

			<div
				ref="editorRef"
				class="min-h-75 text-[0.95rem] leading-relaxed text-slate-900 dark:text-slate-100"
			></div>
		</div>

		<small v-if="field.description" class="block text-gray-600 mt-1 text-[0.85rem]">{{
			field.description
		}}</small>
		<small v-if="error" class="text-red-500 block text-[0.85rem]">{{ error }}</small>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import type { Field } from "../../types";

// Load Google Fonts
if (typeof document !== "undefined") {
	const fontHref =
		"https://fonts.googleapis.com/css2?family=Georgia&family=Inter:wght@400;500;600;700&family=Poppins:wght@400;600;700&family=Roboto+Mono:wght@400;700&family=Playfair+Display:wght@400;600;700&family=Lora:wght@400;600;700&family=Ubuntu:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap";
	const existing = document.querySelector(`link[href="${fontHref}"]`);
	if (!existing) {
		const link = document.createElement("link");
		link.href = fontHref;
		link.rel = "stylesheet";
		document.head.appendChild(link);
	}
}

const props = defineProps<{
	field: Field;
	modelValue: any;
	error?: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: any];
	blur: [];
}>();

const fontSizes = [
	"8px",
	"9px",
	"10px",
	"11px",
	"12px",
	"14px",
	"16px",
	"18px",
	"20px",
	"24px",
	"28px",
	"32px",
	"36px",
	"40px",
	"48px",
	"56px",
	"64px",
	"72px",
	"96px",
	"128px",
];

const editorRef = ref<HTMLDivElement | null>(null);
const toolbarRef = ref<HTMLDivElement | null>(null);
const quill = ref<Quill | null>(null);
const isSettingContent = ref(false);

// Custom Blots
class BreakBlot extends (Quill.import("blots/block") as any) {
	static blotName = "Break";
	static tagName = "br";
}
Quill.register(BreakBlot, true);

class MyImage extends (Quill.import("formats/image") as any) {
	static create(value: any) {
		const node = super.create(value);
		if (typeof value === "object") {
			const { src, alt, width, height, style } = value;
			node.setAttribute("src", src);
			if (alt) node.setAttribute("alt", alt);
			if (width) node.setAttribute("width", width);
			if (height) node.setAttribute("height", height);
			if (style) node.setAttribute("style", style);
		}
		return node;
	}
	static formats(domNode: Element) {
		return {
			src: domNode.getAttribute("src"),
			alt: domNode.getAttribute("alt"),
			width: domNode.getAttribute("width"),
			height: domNode.getAttribute("height"),
			style: domNode.getAttribute("style"),
		};
	}
}
Quill.register(MyImage, true);

class MyLink extends (Quill.import("formats/link") as any) {
	static create(value: any) {
		const node = super.create(value);
		if (typeof value === "object") {
			node.setAttribute("href", value.href);
			if (value.target) node.setAttribute("target", value.target);
			if (value.title) node.setAttribute("title", value.title);
		} else {
			node.setAttribute("href", value);
		}
		return node;
	}
	static formats(domNode: Element) {
		return {
			href: domNode.getAttribute("href"),
			target: domNode.getAttribute("target"),
			title: domNode.getAttribute("title"),
		};
	}
}
Quill.register(MyLink, true);

const Font = Quill.import("formats/font") as any;
Font.whitelist = [
	"georgia",
	"inter",
	"poppins",
	"roboto-mono",
	"playfair",
	"lora",
	"ubuntu",
	"source-code",
];
Quill.register(Font, true);

const Size = Quill.import("formats/size") as any;
Size.whitelist = [false, ...fontSizes];
Quill.register(Size, true);

try {
	const TableModule = Quill.import("modules/table");
	if (!Quill.imports["modules/table"]) Quill.register("modules/table", TableModule);
} catch {
	/* noop */
}

function getKeyboardBindings() {
	const CustomDelta = Quill.import("delta");
	return {
		"table enter": {
			key: "Enter",
			formats: ["table"],
			handler: function (this: any, range: any) {
				this.quill.updateContents(
					new CustomDelta()
						.retain(range.index)
						.delete(range.length)
						.insert({ Break: true }),
				);
				if (!this.quill.getLeaf(range.index + 1)[0].next) {
					this.quill.updateContents(
						new CustomDelta()
							.retain(range.index + 1)
							.delete(0)
							.insert({ Break: true }),
						"user",
					);
				}
				this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
				return false;
			},
		},
	};
}

function parseValue(value: any): string {
	if (value == null) return "";
	const temp = document.createElement("div");
	temp.innerHTML = value;
	temp.querySelectorAll("script, style").forEach((s) => s.remove());
	return temp.innerHTML;
}

function setQuillContent(html: string) {
	if (!quill.value) return;
	isSettingContent.value = true;
	const parsed = parseValue(html);
	if (parsed) {
		const delta = quill.value.clipboard.convert(
			{ html: parsed, text: "" },
			{ image: MyImage },
		);
		quill.value.setContents(delta);
	} else {
		quill.value.setText("");
	}
	isSettingContent.value = false;
}

function getQuillHtml(): string {
	if (!quill.value) return "";
	let value = quill.value.root.innerHTML || "";
	value = value.replace(/(\s)(\s)/g, " &nbsp;");
	if (!value.includes("ql-editor")) value = `<div class="ql-editor read-mode">${value}</div>`;
	return value;
}

let textChangeTimeout: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
	if (!editorRef.value) return;

	const Delta = Quill.import("delta");

	quill.value = new Quill(editorRef.value, {
		theme: "snow",
		modules: {
			toolbar: toolbarRef.value,
			keyboard: getKeyboardBindings(),
			clipboard: {
				matchers: [
					[Node.ELEMENT_NODE, (_node: HTMLElement, delta: any) => delta],
					["BR", () => new Delta().insert({ Break: true })],
				],
			},
		},
		placeholder: props.field.description || "Write your description…",
		readOnly: !!props.field.read_only,
	});

	setTimeout(() => {
		const selects =
			toolbarRef.value?.querySelectorAll(
				"select.ql-size, select.ql-font, select.ql-header",
			) || [];
		selects.forEach((select: any) => {
			const pickers = select.parentElement?.querySelectorAll(".ql-picker") || [];
			pickers.forEach((picker: any) => {
				picker.classList.remove("ql-expanded");
				const options = picker.querySelector(".ql-picker-options");
				if (options) {
					options.style.maxHeight = "300px";
					options.style.overflowY = "auto";
				}
			});
		});
	}, 100);

	const initial = (props.modelValue as string) || "";
	if (initial) setQuillContent(initial);

	quill.value.on("text-change", () => {
		if (isSettingContent.value) return;
		if (textChangeTimeout) clearTimeout(textChangeTimeout);
		textChangeTimeout = setTimeout(() => {
			emit("update:modelValue", getQuillHtml());
		}, 300);
	});
});

watch(
	() => props.modelValue,
	(next) => {
		if (!quill.value) return;
		const nextHtml = (next as string) || "";
		const currentHtml = getQuillHtml();
		if (nextHtml !== currentHtml) setQuillContent(nextHtml);
	},
);

watch(
	() => props.field.read_only,
	(isReadOnly) => {
		quill.value?.enable(!isReadOnly);
	},
);

onBeforeUnmount(() => {
	if (textChangeTimeout) clearTimeout(textChangeTimeout);
	if (quill.value) {
		quill.value.off("text-change");
		quill.value = null;
	}
});
</script>

<style scoped>
:deep(.ql-toolbar) {
	border: none;
	padding: 0.5rem;
	background-color: #f9fafb;
	border-bottom: 1px solid #ddd;
}
:deep(.dark .ql-toolbar),
.dark :deep(.ql-toolbar) {
	background-color: #1e293b;
	border-bottom-color: #334155;
}
:deep(.dark .ql-toolbar button .ql-stroke),
.dark :deep(.ql-toolbar button .ql-stroke) {
	stroke: #94a3b8;
}
:deep(.dark .ql-toolbar button:hover .ql-stroke),
.dark :deep(.ql-toolbar button:hover .ql-stroke) {
	stroke: #e2e8f0;
}
:deep(.dark .ql-toolbar .ql-picker-label),
.dark :deep(.ql-toolbar .ql-picker-label) {
	color: #94a3b8;
}
:deep(.dark .ql-toolbar .ql-picker-options),
.dark :deep(.ql-toolbar .ql-picker-options) {
	background-color: #1e293b;
	border-color: #334155;
}
:deep(.ql-container) {
	border: none;
	font-size: 1rem;
}
:deep(.ql-editor) {
	min-height: 100px;
	padding: 12px;
	font-size: 0.95rem;
	line-height: 1.6;
}
:deep(.ql-editor.ql-blank::before) {
	color: #d1d5db;
	font-style: normal;
}
:deep(.ql-font-georgia) {
	font-family: "Georgia", serif;
}
:deep(.ql-font-inter) {
	font-family:
		"Inter",
		-apple-system,
		BlinkMacSystemFont,
		"Segoe UI",
		sans-serif;
}
:deep(.ql-font-poppins) {
	font-family:
		"Poppins",
		-apple-system,
		BlinkMacSystemFont,
		"Segoe UI",
		sans-serif;
	font-weight: 500;
}
:deep(.ql-font-roboto-mono) {
	font-family: "Roboto Mono", "Courier New", monospace;
}
:deep(.ql-font-playfair) {
	font-family: "Playfair Display", serif;
	font-weight: 600;
}
:deep(.ql-font-lora) {
	font-family: "Lora", serif;
}
:deep(.ql-font-ubuntu) {
	font-family:
		"Ubuntu",
		-apple-system,
		BlinkMacSystemFont,
		"Segoe UI",
		sans-serif;
}
:deep(.ql-font-source-code) {
	font-family: "Source Code Pro", "Courier New", monospace;
}
:deep(.ql-size-8px) {
	font-size: 8px;
}
:deep(.ql-size-9px) {
	font-size: 9px;
}
:deep(.ql-size-10px) {
	font-size: 10px;
}
:deep(.ql-size-11px) {
	font-size: 11px;
}
:deep(.ql-size-12px) {
	font-size: 12px;
}
:deep(.ql-size-14px) {
	font-size: 14px;
}
:deep(.ql-size-16px) {
	font-size: 16px;
}
:deep(.ql-size-18px) {
	font-size: 18px;
}
:deep(.ql-size-20px) {
	font-size: 20px;
}
:deep(.ql-size-24px) {
	font-size: 24px;
}
:deep(.ql-size-28px) {
	font-size: 28px;
}
:deep(.ql-size-32px) {
	font-size: 32px;
}
:deep(.ql-size-36px) {
	font-size: 36px;
}
:deep(.ql-size-40px) {
	font-size: 40px;
}
:deep(.ql-size-48px) {
	font-size: 48px;
}
:deep(.ql-size-56px) {
	font-size: 56px;
}
:deep(.ql-size-64px) {
	font-size: 64px;
}
:deep(.ql-size-72px) {
	font-size: 72px;
}
:deep(.ql-size-96px) {
	font-size: 96px;
}
:deep(.ql-size-128px) {
	font-size: 128px;
}
:deep(.ql-snow .ql-picker-label) {
	cursor: pointer;
	padding: 4px 8px;
	border: 1px solid transparent;
	border-radius: 3px;
}
:deep(.ql-snow .ql-picker-label:hover) {
	background-color: #e2e8f0;
	border-color: #cbd5e1;
}
:deep(.ql-snow .ql-picker-options) {
	padding: 4px;
	max-height: 300px;
	overflow-y: auto;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	border: 1px solid #e2e8f0;
	border-radius: 4px;
}
:deep(.ql-snow .ql-picker-item) {
	padding: 6px 8px;
	cursor: pointer;
}
:deep(.ql-snow .ql-picker-item:hover) {
	background-color: #e0e7ff;
	border-radius: 2px;
}
:deep(.ql-snow .ql-picker-item.ql-selected) {
	background-color: #818cf8;
	color: white;
}
:deep(table) {
	border-collapse: collapse;
	width: 100%;
	margin: 1rem 0;
}
:deep(table td) {
	border: 1px solid #ddd;
	padding: 8px;
}
:deep(table tr:hover td) {
	background-color: #f9fafb;
}
:deep(.ql-code-block) {
	background-color: #f3f4f6;
	border-radius: 0.375rem;
	padding: 0.5rem;
	font-family: "Source Code Pro", monospace;
}
:deep(.ql-blockquote) {
	border-left: 4px solid #d1d5db;
	padding-left: 1rem;
	margin: 1rem 0;
	color: #6b7280;
}
</style>
