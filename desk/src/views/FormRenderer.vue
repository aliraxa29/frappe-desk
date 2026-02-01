<!-- src/core/views/FormRenderer.vue -->
<template>
  <div v-if="loading" class="loading">Loading...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else class="form-container">
    <div class="form-header">
      <h2>{{ meta.name }}</h2>
      <div class="form-actions">
        <button class="btn btn-primary" @click="handleSave">Save</button>
        <button class="btn btn-secondary" @click="handleClose">Close</button>
      </div>
    </div>

    <div class="form-body">
      <FieldRenderer
        v-for="field in formFields"
        :key="field.fieldname"
        :field="field"
        :ctx="ctx"
        @field-change="onFieldChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { DocTypeMeta, Document, FormContext } from '../types'
import { useDoctypeStore } from '../metadata/doctypeStore'
import { createFormContext, formRegistry } from '../runtime/formContext'
import { loadDoctypeScriptsFromMetadata } from '../runtime/scriptLoader'
import FieldRenderer from '../fields/FieldRenderer.vue'
import { frappeClient } from '../api/resource'

const props = defineProps<{
  doctype: string
  doc?: Document
  docname?: string
}>()

const emit = defineEmits<{
  close: []
  save: [doc: Document]
}>()

const doctypeStore = useDoctypeStore()
const loading = ref(true)
const error = ref('')
const meta = ref<DocTypeMeta | null>(null)
const ctx = ref<FormContext | null>(null)

const formFields = computed(() => {
  if (!meta.value) return []
  return meta.value.fields.filter(
    (f) => f.fieldtype !== 'Column Break' && !f.hidden
  )
})

onMounted(async () => {
  try {
    const result = await frappeClient.getDocTypeMeta(props.doctype)
    meta.value = result.docs[0] || null
    loadDoctypeScriptsFromMetadata(meta.value, 'form')

    let doc: Document = props.doc || {}
    
    // Check if this is a new document
    const isNewDocument = !props.docname || props.docname === 'new'
    
    if (!isNewDocument && props.docname) {
      // Load existing document
      doc = await frappeClient.getDocument(props.doctype, props.docname)
    } else if (isNewDocument && meta.value) {
      // Create new document with default values
      doc = createNewDocument(props.doctype, meta.value)
    }

    // Create form context
    if (meta.value) {
      ctx.value = createFormContext(props.doctype, doc, meta.value)

      // Trigger setup event
      triggerFormEvent(props.doctype, 'setup', ctx.value)
      triggerFormEvent(props.doctype, 'load', ctx.value)
    }

    loading.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to load form'
    loading.value = false
  }
})

/**
 * Create a new document with default values from the DocType meta
 */
function createNewDocument(doctype: string, meta: DocTypeMeta): Document {
  const doc: Document = {
    doctype: doctype,
    name: '',
    __islocal: 1,
  }

  // Apply default values from fields
  for (const field of meta.fields) {
    if (field.default) {
      doc[field.fieldname] = field.default
    } else if (field.fieldtype === 'Table') {
      // Initialize empty child tables
      doc[field.fieldname] = []
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

  try {
    let savedDoc: Document
    
    if (ctx.value.doc.name) {
      // Update existing document
      savedDoc = await frappeClient.updateDocument(props.doctype, ctx.value.doc.name, ctx.value.doc)
    } else {
      // Create new document
      savedDoc = await frappeClient.createDocument(props.doctype, ctx.value.doc)
    }
    
    ctx.value.notify('Document saved successfully', 'success')
    
    // Update the doc with the response (which includes the name for new documents)
    ctx.value.doc = savedDoc
    
    emit('save', savedDoc)
  } catch (err: any) {
    ctx.value.throw(`Failed to save: ${err.message}`)
  }
}

function handleClose() {
  emit('close')
}
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

.form-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.form-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #0066cc;
  color: white;
}

.btn-primary:hover {
  background-color: #0052a3;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e8e8e8;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
