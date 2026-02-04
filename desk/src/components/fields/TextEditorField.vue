<template>
  <div class="mb-4 flex flex-col relative">
    <label v-if="field.label" class="font-medium mb-1 text-sm text-slate-700 dark:text-slate-200">
      {{ field.label }}
      <span v-if="field.reqd" class="text-red-500 ml-1">*</span>
    </label>

    <div class="border border-[#ddd] dark:border-slate-700 rounded bg-white dark:bg-slate-800 overflow-hidden">
      <div
        ref="toolbarRef"
        class="ql-toolbar ql-snow border-b border-[#ddd] dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
      >
        <!-- Font and Size -->
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
            <option value="8px">8px</option>
            <option value="9px">9px</option>
            <option value="10px">10px</option>
            <option value="11px">11px</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
            <option value="36px">36px</option>
            <option value="40px">40px</option>
            <option value="48px">48px</option>
            <option value="56px">56px</option>
            <option value="64px">64px</option>
            <option value="72px">72px</option>
            <option value="96px">96px</option>
            <option value="128px">128px</option>
          </select>
        </span>

        <!-- Text Formatting -->
        <span class="ql-formats">
          <button class="ql-bold" title="Bold"></button>
          <button class="ql-italic" title="Italic"></button>
          <button class="ql-underline" title="Underline"></button>
          <button class="ql-strike" title="Strikethrough"></button>
        </span>

        <!-- Heading -->
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

        <!-- Lists and Indentation -->
        <span class="ql-formats">
          <button class="ql-list" value="ordered" title="Numbered List"></button>
          <button class="ql-list" value="bullet" title="Bullet List"></button>
          <button class="ql-indent" value="-1" title="Outdent"></button>
          <button class="ql-indent" value="+1" title="Indent"></button>
        </span>

        <!-- Alignment -->
        <span class="ql-formats">
          <select class="ql-align" title="Align">
            <option selected></option>
            <option value="center"></option>
            <option value="right"></option>
            <option value="justify"></option>
          </select>
          <button class="ql-direction" value="rtl" title="Direction"></button>
        </span>

        <!-- Colors -->
        <span class="ql-formats">
          <select class="ql-color" title="Font Color"></select>
          <select class="ql-background" title="Highlight"></select>
        </span>

        <!-- Content -->
        <span class="ql-formats">
          <button class="ql-blockquote" title="Quote"></button>
          <button class="ql-code-block" title="Code Block"></button>
        </span>

        <!-- Media and Links -->
        <span class="ql-formats">
          <button class="ql-link" title="Insert Link"></button>
          <button class="ql-image" title="Insert Image"></button>
        </span>

        <!-- Tables -->
        <span class="ql-formats">
          <button class="ql-table" value="insert-table" title="Insert Table"></button>
        </span>

        <!-- Clear Formatting -->
        <span class="ql-formats">
          <button class="ql-clean" title="Clear Formatting"></button>
        </span>
      </div>

      <div ref="editorRef" class="min-h-[300px] text-[0.95rem] leading-relaxed text-slate-900 dark:text-slate-100"></div>
    </div>

    <small v-if="field.description" class="block text-gray-600 mt-1 text-[0.85rem]">{{ field.description }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import type { Field, FormContext } from '../../types'

// Load Google Fonts
if (typeof document !== 'undefined') {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Georgia&family=Inter:wght@400;500;600;700&family=Poppins:wght@400;600;700&family=Roboto+Mono:wght@400;700&family=Playfair+Display:wght@400;600;700&family=Lora:wght@400;600;700&family=Ubuntu:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

interface Props {
  field: Field
  ctx: FormContext
}

const props = defineProps<Props>()
const emit = defineEmits<{
  fieldChange: [value: any]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const toolbarRef = ref<HTMLDivElement | null>(null)
const quill = ref<Quill | null>(null)
const isSettingContent = ref(false)

// ============================================================================
// CUSTOM BLOTS & MODULES - Based on Frappe Implementation
// ============================================================================

// Custom Break Blot (for tables)
class BreakBlot extends Quill.import('blots/block') {
  static blotName = 'Break'
  static tagName = 'br'
}
Quill.register(BreakBlot, true)

// Custom Image with alignment support
class MyImage extends Quill.import('formats/image') {
  static create(value: any) {
    const node = super.create(value)
    if (typeof value === 'object') {
      const { src, alt, width, height, style } = value
      node.setAttribute('src', src)
      if (alt) node.setAttribute('alt', alt)
      if (width) node.setAttribute('width', width)
      if (height) node.setAttribute('height', height)
      if (style) node.setAttribute('style', style)
    }
    return node
  }

  static formats(domNode: Element) {
    return {
      src: domNode.getAttribute('src'),
      alt: domNode.getAttribute('alt'),
      width: domNode.getAttribute('width'),
      height: domNode.getAttribute('height'),
      style: domNode.getAttribute('style')
    }
  }
}
Quill.register(MyImage, true)

// Custom Link with internal link support
class MyLink extends Quill.import('formats/link') {
  static create(value: any) {
    const node = super.create(value)
    if (typeof value === 'object') {
      const { href, target, title } = value
      node.setAttribute('href', href)
      if (target) node.setAttribute('target', target)
      if (title) node.setAttribute('title', title)
    } else {
      node.setAttribute('href', value)
    }
    return node
  }

  static formats(domNode: Element) {
    return {
      href: domNode.getAttribute('href'),
      target: domNode.getAttribute('target'),
      title: domNode.getAttribute('title')
    }
  }
}
Quill.register(MyLink, true)

// Use Quill's built-in color support (no custom color needed)

// ============================================================================
// FONT & SIZE CONFIGURATION - Frappe's 21 font sizes
// ============================================================================

const Font = Quill.import('formats/font') as { whitelist?: string[] }
Font.whitelist = ['georgia', 'inter', 'poppins', 'roboto-mono', 'playfair', 'lora', 'ubuntu', 'source-code']
Quill.register(Font, true)

const Size = Quill.import('formats/size') as { whitelist?: (string | boolean)[] }
Size.whitelist = [false, '8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px', '48px', '56px', '64px', '72px', '96px', '128px']
Quill.register(Size, true)

// ============================================================================
// TABLE SUPPORT - Custom Quill table module
// ============================================================================

try {
  // Register table module if available
  const TableModule = Quill.import('modules/table')
  if (!Quill.imports['modules/table']) {
    Quill.register('modules/table', TableModule)
  }
} catch (e) {
  console.debug('Table module not available')
}

// ============================================================================
// KEYBOARD BINDINGS - From Frappe
// ============================================================================

function getKeyboardBindings() {
  const Delta = Quill.import('delta')
  return {
    'table enter': {
      key: 'Enter',
      formats: ['table'],
      handler: function (this: any, range: any) {
        this.quill.updateContents(
          new Delta()
            .retain(range.index)
            .delete(range.length)
            .insert({ Break: true })
        )

        if (!this.quill.getLeaf(range.index + 1)[0].next) {
          this.quill.updateContents(
            new Delta()
              .retain(range.index + 1)
              .delete(0)
              .insert({ Break: true }),
            'user'
          )
        }

        this.quill.setSelection(range.index + 1, Quill.sources.SILENT)
        return false // don't call other handlers
      }
    }
  }
}

// Use DOM-based toolbar configuration (defined in template)

// ============================================================================
// HELPER FUNCTIONS - Parse and format content
// ============================================================================

function parseValue(value: any): string {
  if (value == null) {
    return ''
  }
  // Remove script and style tags for security
  const temp = document.createElement('div')
  temp.innerHTML = value
  const scripts = temp.querySelectorAll('script, style')
  scripts.forEach(s => s.remove())
  return temp.innerHTML
}

function getValue(): string {
  return (props.ctx.doc?.[props.field.fieldname] as string) || ''
}

function setQuillContent(html: string) {
  if (!quill.value) return
  isSettingContent.value = true
  
  const parsed = parseValue(html)
  if (parsed) {
    const Delta = Quill.import('delta')
    const delta = quill.value.clipboard.convert(
      { html: parsed, text: '' },
      { image: MyImage }
    )
    quill.value.setContents(delta)
  } else {
    quill.value.setText('')
  }
  
  isSettingContent.value = false
}

function getQuillHtml(): string {
  if (!quill.value) return ''
  let value = quill.value.root.innerHTML || ''
  
  // Hack to retain space sequence
  value = value.replace(/(\s)(\s)/g, ' &nbsp;')

  try {
    if (!value.includes('ql-editor')) {
      value = `<div class="ql-editor read-mode">${value}</div>`
    }
  } catch (e) {
    value = `<div class="ql-editor read-mode">${value}</div>`
  }

  return value
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  if (!editorRef.value) return

  // Debounce text-change events (300ms like Frappe)
  let textChangeTimeout: NodeJS.Timeout | null = null

  quill.value = new Quill(editorRef.value, {
    theme: 'snow',
    modules: {
      toolbar: toolbarRef.value,
      keyboard: getKeyboardBindings(),
      clipboard: {
        matchers: [
          [Node.ELEMENT_NODE, () => true],
          ['BR', () => ({ insert: { Break: true } })]
        ]
      }
    },
    placeholder: props.field.description || 'Write your description…',
    readOnly: !!props.field.read_only
  })

  
  setTimeout(() => {
    const selects = toolbarRef.value?.querySelectorAll('select.ql-size, select.ql-font, select.ql-header') || []
    selects.forEach((select: any) => {
      const pickers = select.parentElement?.querySelectorAll('.ql-picker') || []
      pickers.forEach((picker: any) => {
        picker.classList.remove('ql-expanded')
        const options = picker.querySelector('.ql-picker-options')
        if (options) {
          options.style.maxHeight = '300px'
          options.style.overflowY = 'auto'
        }
      })
    })
  }, 100)

  const initial = getValue()
  if (initial) {
    setQuillContent(initial)
  }

  quill.value.on('text-change', () => {
    if (isSettingContent.value) return
    
    // Debounce updates (300ms)
    if (textChangeTimeout) clearTimeout(textChangeTimeout)
    textChangeTimeout = setTimeout(() => {
      const html = getQuillHtml()
      props.ctx.set_value(props.field.fieldname, html)
      emit('fieldChange', html)
    }, 300)
  })

  return () => {
    if (textChangeTimeout) clearTimeout(textChangeTimeout)
  }
})

watch(
  () => props.ctx.doc?.[props.field.fieldname],
  (next) => {
    if (!quill.value) return
    const nextHtml = (next as string) || ''
    const currentHtml = getQuillHtml()
    if (nextHtml !== currentHtml) {
      setQuillContent(nextHtml)
    }
  }
)

watch(
  () => props.field.read_only,
  (isReadOnly) => {
    quill.value?.enable(!isReadOnly)
  }
)

onBeforeUnmount(() => {
  if (quill.value) {
    quill.value.off('text-change')
    quill.value = null
  }
})
</script>

<style scoped>
:deep(.ql-toolbar) {
  border: none;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #ddd;
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

/* Font Family Styles */
:deep(.ql-font-georgia) {
  font-family: 'Georgia', serif;
}

:deep(.ql-font-inter) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

:deep(.ql-font-poppins) {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
}

:deep(.ql-font-roboto-mono) {
  font-family: 'Roboto Mono', 'Courier New', monospace;
}

:deep(.ql-font-playfair) {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
}

:deep(.ql-font-lora) {
  font-family: 'Lora', serif;
}

:deep(.ql-font-ubuntu) {
  font-family: 'Ubuntu', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

:deep(.ql-font-source-code) {
  font-family: 'Source Code Pro', 'Courier New', monospace;
}

/* Font Size Styles - All 21 Frappe sizes */
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

/* Toolbar Font Options - Display Font Names in Dropdown */
:deep(.ql-snow .ql-formats select.ql-font) {
  font-family: 'Inter', sans-serif;
}

:deep(.ql-snow .ql-formats select.ql-font option[value="georgia"]) {
  font-family: 'Georgia', serif;
}

:deep(.ql-snow .ql-formats select.ql-font option[value="inter"]) {
  font-family: 'Inter', sans-serif;
}

:deep(.ql-snow .ql-formats select.ql-font option[value="poppins"]) {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
}

:deep(.ql-snow .ql-formats select.ql-font option[value="roboto-mono"]) {
  font-family: 'Roboto Mono', monospace;
}

:deep(.ql-snow .ql-formats select.ql-font option[value="playfair"]) {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
}

:deep(.ql-snow .ql-formats select.ql-font option[value="lora"]) {
  font-family: 'Lora', serif;
}

:deep(.ql-snow .ql-formats select.ql-font option[value="ubuntu"]) {
  font-family: 'Ubuntu', sans-serif;
}

:deep(.ql-snow .ql-formats select.ql-font option[value="source-code"]) {
  font-family: 'Source Code Pro', monospace;
}

/* Table styling */
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

/* Code block styling */
:deep(.ql-code-block) {
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-family: 'Source Code Pro', monospace;
}

/* Blockquote styling */
:deep(.ql-blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #6b7280;
}

/* Custom dropdown styling for Quill selects */
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
</style>
