<template>
  <div v-if="loading" class="loading">
    Loading form...
  </div>
  
  <div v-else-if="error" class="error">
    {{ error }}
  </div>
  
  <div v-else-if="ctx" class="form-body">
    <!-- If we have tabs, render with FormTabs -->
    <FormTabs v-if="hasTabs" :tabs="parsedTabs">
      <template v-for="(tab, tabIdx) in parsedTabs" :key="tab.fieldname" #[`tab-${tabIdx}`]>
        <div class="tab-content">
          <template v-for="section in tab.sections" :key="section.fieldname || section.label">
            <!-- Section with accordion if collapsible -->
            <Accordion
              v-if="section.collapsible"
              :label="section.label || 'Details'"
              :default-open="!section.collapsed"
              class="form-section-accordion"
            >
              <div class="section-columns">
                <div
                  v-for="(column, colIdx) in section.columns"
                  :key="colIdx"
                  class="section-column"
                >
                  <FieldRenderer
                    v-for="field in column.fields"
                    :key="field.fieldname"
                    :field="field"
                    :ctx="ctx"
                    @field-change="onFieldChange"
                  />
                </div>
              </div>
            </Accordion>

            <!-- Regular section without accordion -->
            <div v-else class="form-section">
              <div v-if="section.label" class="section-header">
                <h3 class="section-title">{{ section.label }}</h3>
                <p v-if="section.description" class="section-description">{{ section.description }}</p>
              </div>
              <div class="section-columns">
                <div
                  v-for="(column, colIdx) in section.columns"
                  :key="colIdx"
                  class="section-column"
                >
                  <FieldRenderer
                    v-for="field in column.fields"
                    :key="field.fieldname"
                    :field="field"
                    :ctx="ctx"
                    @field-change="onFieldChange"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </FormTabs>

    <!-- No tabs - render sections directly -->
    <template v-else>
      <template v-for="section in parsedSections" :key="section.fieldname || section.label">
        <!-- Section with accordion if collapsible -->
        <Accordion
          v-if="section.collapsible"
          :label="section.label || 'Details'"
          :default-open="!section.collapsed"
          class="form-section-accordion"
        >
          <div class="section-columns">
            <div
              v-for="(column, colIdx) in section.columns"
              :key="colIdx"
              class="section-column"
            >
              <FieldRenderer
                v-for="field in column.fields"
                :key="field.fieldname"
                :field="field"
                :ctx="ctx"
                @field-change="onFieldChange"
              />
            </div>
          </div>
        </Accordion>

        <!-- Regular section without accordion -->
        <div v-else class="form-section">
          <div v-if="section.label" class="section-header">
            <h3 class="section-title">{{ section.label }}</h3>
            <p v-if="section.description" class="section-description">{{ section.description }}</p>
          </div>
          <div class="section-columns">
            <div
              v-for="(column, colIdx) in section.columns"
              :key="colIdx"
              class="section-column"
            >
              <FieldRenderer
                v-for="field in column.fields"
                :key="field.fieldname"
                :field="field"
                :ctx="ctx"
                @field-change="onFieldChange"
              />
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { DocTypeMeta, Document, FormContext, Field } from '../types'
import { createFormContext, formRegistry } from '../runtime/formContext'
import { loadDoctypeScriptsFromMetadata } from '../runtime/scriptLoader'
import FieldRenderer from '../fields/FieldRenderer.vue'
import Accordion from '../components/Accordion.vue'
import FormTabs from '../components/FormTabs.vue'
import { frappeClient } from '../api/resource'
import { model } from '../data/model'
import { useRoute } from 'vue-router'
import { router } from '../router'

// Types for parsed layout
interface ParsedColumn {
  fields: Field[]
}

interface ParsedSection {
  fieldname?: string
  label?: string
  description?: string
  collapsible?: boolean
  collapsed?: boolean
  columns: ParsedColumn[]
}

interface ParsedTab {
  fieldname?: string
  label?: string
  fields: Field[]
  sections: ParsedSection[]
  hidden?: boolean
}

const props = defineProps<{
  doctype: string
  doc?: Document
  docname?: string | null
}>()

const emit = defineEmits<{
  close: []
  save: [doc: Document]
  loading: [value: boolean]
}>()

const loading = ref(true)
const error = ref('')
const meta = ref<DocTypeMeta | null>(null)
const ctx = ref<FormContext>()
const originalDoc = ref<Document | null>(null)
const route = useRoute()

// Check if form has tabs
const hasTabs = computed(() => {
  if (!meta.value?.fields) return false
  return meta.value.fields.some(f => f.fieldtype === 'Tab Break')
})

// Parse fields into tabs structure
const parsedTabs = computed<ParsedTab[]>(() => {
  if (!meta.value?.fields) return []
  
  const fields = meta.value.fields.filter(f => !f.hidden)
  const tabs: ParsedTab[] = []
  let currentTab: ParsedTab | null = null
  
  for (const field of fields) {
    if (field.fieldtype === 'Tab Break') {
      // Start new tab
      currentTab = {
        fieldname: field.fieldname,
        label: field.label,
        fields: [],
        sections: [],
        hidden: !!field.hidden
      }
      tabs.push(currentTab)
    } else if (currentTab) {
      currentTab.fields.push(field)
    }
  }
  
  // Parse sections within each tab
  for (const tab of tabs) {
    tab.sections = parseFieldsIntoSections(tab.fields)
  }
  
  return tabs.filter(t => !t.hidden)
})

// Parse fields into sections (for non-tabbed forms)
const parsedSections = computed<ParsedSection[]>(() => {
  if (!meta.value?.fields || hasTabs.value) return []
  
  const fields = meta.value.fields.filter(f => !f.hidden)
  return parseFieldsIntoSections(fields)
})

// Helper to parse fields into sections with columns
function parseFieldsIntoSections(fields: Field[]): ParsedSection[] {
  const sections: ParsedSection[] = []
  let currentSection: ParsedSection | null = null
  let currentColumn: ParsedColumn | null = null
  
  // Create default section if first field is not a section break
  const firstNonLayoutField = fields.find(f => 
    !['Tab Break', 'Section Break', 'Column Break'].includes(f.fieldtype)
  )
  
  if (firstNonLayoutField && fields[0]?.fieldtype !== 'Section Break') {
    currentSection = {
      label: '',
      columns: [{ fields: [] }]
    }
    currentColumn = currentSection.columns[0]
    sections.push(currentSection)
  }
  
  for (const field of fields) {
    if (field.fieldtype === 'Tab Break') {
      // Skip tab breaks in section parsing
      continue
    }
    
    if (field.fieldtype === 'Section Break') {
      // Start new section
      currentSection = {
        fieldname: field.fieldname,
        label: field.label,
        description: field.description,
        collapsible: !!field.collapsible,
        collapsed: !!field.collapsible && !!field.collapsible_depends_on,
        columns: [{ fields: [] }]
      }
      currentColumn = currentSection.columns[0]
      sections.push(currentSection)
    } else if (field.fieldtype === 'Column Break') {
      // Start new column in current section
      if (currentSection) {
        currentColumn = { fields: [] }
        currentSection.columns.push(currentColumn)
      }
    } else {
      // Regular field - add to current column
      if (currentColumn) {
        currentColumn.fields.push(field)
      } else if (currentSection) {
        // Fallback: add to first column
        if (!currentSection.columns[0]) {
          currentSection.columns.push({ fields: [] })
        }
        currentSection.columns[0].fields.push(field)
      }
    }
  }
  
  // Filter out empty sections
  return sections.filter(s => s.columns.some(c => c.fields.length > 0))
}

onMounted(async () => {
  await onLoad()
})

/**
 * Create a new document with default values from the DocType meta
 */
function createNewDocument(doctype: string, meta: DocTypeMeta): Document {
  const doc: Document = {
    doctype: doctype,
    name: 'new-' + doctype + '-' + Date.now(),
    __islocal: 1,
    docstatus: 0,
  }

  // Apply default values from fields
  for (const field of meta.fields) {
    if (field.default) {
      doc[field.fieldname] = field.default
    } else if (field.fieldtype === 'Table') {
      // Initialize empty child tables
      doc[field.fieldname] = []
    } else if (field.fieldtype === 'Check') {
      // Initialize checkboxes to 0
      doc[field.fieldname] = 0
    }
  }

  return doc
}

function triggerFormEvent(doctype: string, event: string, context: any) {
  const handlers = formRegistry.forms[doctype] || []
  for (const handler of handlers) {
    if (typeof handler[event] === 'function') {
      try {
        handler[event](context)
      } catch (e) {
        console.error(`Error in ${doctype}.${event}:`, e)
      }
    }
  }
}

function onFieldChange(value: any) {
  // Field change is handled by formContext
}

async function handleSave() {
  if (!ctx.value) return
  if (!ctx.value.validate()) return

  emit('loading', true)
  
  try {
    let savedDoc: Document
    const isNewDoc = ctx.value.doc.__islocal || !ctx.value.doc.name || ctx.value.doc.name.startsWith('new-')

    if (isNewDoc) {
      savedDoc = await frappeClient.createDocument(props.doctype, ctx.value.doc)
      router.push({
        name: 'EditForm',
        params: {
          app: route.params.app,
          doctype: props.doctype,
          name: savedDoc.name
        }
      })
    } else {
      savedDoc = await frappeClient.updateDocument(props.doctype, ctx.value.doc.name, ctx.value.doc)
      
      ctx.value.notify('Document updated successfully', 'success')
      ctx.value.doc = savedDoc
      ctx.value.dirty = false
    }

    emit('save', savedDoc)
  } catch (err: any) {
    console.error('Save failed:', err)
    ctx.value.throw(`Failed to save: ${err.message || err}`)
  } finally {
    emit('loading', false)
  }
}

function handleClose() {
  emit('close')
}

function loadMeta(doctype: string): Promise<DocTypeMeta> {
  return new Promise((resolve) => {
    model.with_doctype(doctype, (result: any) => {
      const metaDoc = result.message as DocTypeMeta
      resolve(metaDoc)
    })
  })
}

async function onLoad() {
  loading.value = true
  emit('loading', true)
  error.value = ''
  
  try {
    // Load DocType metadata
    if (!locals.DocType[props.doctype]) {
      meta.value = await loadMeta(props.doctype)
    } else {
      meta.value = locals.DocType[props.doctype]
    }
    loadDoctypeScriptsFromMetadata(meta.value, 'form')

    // Check if this is a single doctype - redirect if necessary
    if (meta.value.issingle && props.docname !== props.doctype) {
      router.push({
        name: 'EditForm',
        params: {
          app: route.params.app,
          doctype: props.doctype,
          name: props.doctype
        }
      })
      return
    }

    let doc: Document

    // Determine if this is a new or existing document
    const isNewDocument = !props.docname || props.docname === 'new' || props.docname === null

    if (!isNewDocument && props.docname) {
      doc = await frappeClient.getDocument(props.doctype, props.docname)
      
      // Validate document was loaded
      if (!doc || typeof doc !== 'object') {
        throw new Error('Failed to load document: Invalid response')
      }
      
      // Store a deep copy of the original document for discard functionality
      try {
        originalDoc.value = JSON.parse(JSON.stringify(doc))
      } catch (e) {
        console.error('Failed to clone document:', e)
        originalDoc.value = { ...doc }
      }
    } else {
      doc = props.doc || createNewDocument(props.doctype, meta.value)
      
      // Store a deep copy for discard
      try {
        originalDoc.value = JSON.parse(JSON.stringify(doc))
      } catch (e) {
        console.error('Failed to clone document:', e)
        originalDoc.value = { ...doc }
      }
    }

    // Create form context
    if (meta.value) {
      ctx.value = createFormContext(props.doctype, doc, meta.value)

      // Trigger setup and load events
      triggerFormEvent(props.doctype, 'setup', ctx.value)
      triggerFormEvent(props.doctype, 'load', ctx.value)
    }

    loading.value = false
    emit('loading', false)
  } catch (err: any) {
    console.error('Failed to load form:', err)
    error.value = err.message || 'Failed to load form'
    loading.value = false
    emit('loading', false)
  }
}


// Watch for route changes to reload the form
watch(
  () => [route.params.doctype, route.params.name],
  async (newParams, oldParams) => {
    // Only reload if doctype or name actually changed
    if (JSON.stringify(newParams) !== JSON.stringify(oldParams)) {
      await onLoad()
    }
  }
)

const formStatus = computed(() => {
  if (!ctx.value) return null
  
  if (ctx.value.dirty) {
    return {
      label: "Not Saved",
      value: "orange"
    }
  }
  if (ctx.value.doc.docstatus === 1) {
    return {
      label: "Submitted",
      value: "primary"
    }
  }
  if (ctx.value.doc.docstatus === 2) {
    return {
      label: "Cancelled",
      value: "danger"
    }
  }
  if (ctx.value.doc.docstatus === 0) {
    return {
      label: "Draft",
      value: "secondary"
    }
  }
  return {
    label: "Saved",
    value: "success"
  }
})

const isDirty = computed(() => {
  return ctx.value?.dirty || false
})

function handleDiscard() {
  if (!ctx.value || !originalDoc.value) return
  
  // Reset to original document
  ctx.value.doc = JSON.parse(JSON.stringify(originalDoc.value))
  ctx.value.dirty = false
}

defineExpose({
  handleSave,
  handleDiscard,
  formStatus,
  isDirty
})
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.1rem;
  color: #666;
}

.error {
  padding: 1rem;
  background-color: #ffe6e6;
  color: #dc3545;
  border-radius: 4px;
  margin: 1rem 0;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Section Styles */
.form-section {
  margin-bottom: 1.5rem;
}

.form-section-accordion {
  margin-bottom: 1rem;
}

.section-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-description {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

/* Column Layout */
.section-columns {
  display: flex;
  gap: 1.5rem;
}

.section-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

@media (max-width: 768px) {
  .section-columns {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
