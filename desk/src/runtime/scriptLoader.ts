import ts from 'typescript'

const loadedScripts = new Set<string>()

function transpileScriptContent(content: string, scriptId: string): string {
  try {
    const result = ts.transpileModule(content, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2017,
        module: ts.ModuleKind.None,
        removeComments: false,
        sourceMap: false
      }
    })

    if (result.diagnostics?.length) {
      console.warn(`TypeScript diagnostics for ${scriptId}:`, result.diagnostics)
    }

    return result.outputText || content
  } catch (e) {
    console.error(`Failed to transpile script ${scriptId}:`, e)
    return content
  }
}

/**
 * Script Loader - Injects doctype scripts into the page
 * 
 * Scripts are provided by the backend in the metadata response:
 * - __ts_scripts: Form view scripts (string content)
 * - __ts_list_scripts: List view scripts (string content)
 * 
 * Similar to Frappe's approach where __js is injected into the page
 */

/**
 * Inject script content into the page
 * @param scriptId Unique identifier for the script (used for tracking)
 * @param content Script content (JavaScript/TypeScript)
 * @param attributes Additional script attributes (e.g., type, defer, async)
 */
export function injectScript(
  scriptId: string,
  content: string,
  attributes?: Record<string, string>
): void {
  if (!content) return

  // Avoid injecting the same script twice
  if (loadedScripts.has(scriptId)) {
    console.debug(`Script already loaded: ${scriptId}`)
    return
  }

  try {
    const jsContent = transpileScriptContent(content, scriptId)
    const wrappedContent = `(function(){\n${jsContent}\n})();\n//# sourceURL=${scriptId}.js`
    const script = document.createElement('script')
    script.type = attributes?.type || 'text/javascript'
    script.textContent = wrappedContent

    // Add any additional attributes
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (key !== 'type') {
          script.setAttribute(key, value)
        }
      })
    }

    // Add data attribute for tracking
    script.setAttribute('data-script-id', scriptId)

    // Inject into document head or body
    const target = document.head || document.body
    target.appendChild(script)

    loadedScripts.add(scriptId)
    console.debug(`✓ Injected script: ${scriptId}`)
  } catch (e) {
    console.error(`Failed to inject script ${scriptId}:`, e)
  }
}

/**
 * Load doctype scripts from metadata response
 * 
 * This is called with the metadata returned from get_doctype_with_scripts()
 * The scripts are already loaded as content in __ts_scripts and __ts_list_scripts
 * 
 * @param metadata DocType metadata from getdoctype() response
 * @param context 'form' or 'list'
 */
export function loadDoctypeScriptsFromMetadata(
  metadata: any,
  context: 'form' | 'list' = 'form'
): void {
  if (!metadata) {
    console.warn('No metadata provided to loadDoctypeScriptsFromMetadata')
    return
  }

  const doctype = metadata.name || 'Unknown'

  // Get the appropriate scripts from metadata
  let scriptContent: string | null = null
  let scriptId: string

  if (context === 'form') {
    scriptContent = metadata.__form_ts
    scriptId = `doctype-form-scripts-${doctype}`
  } else if (context === 'list') {
    scriptContent = metadata.__list_ts
    scriptId = `doctype-list-scripts-${doctype}`
  } else {
    console.warn(`Unknown context: ${context}`)
    return
  }

  if (!scriptContent) {
    console.debug(`No scripts found in metadata for ${doctype} (${context})`)
    return
  }

  console.log(`Loading scripts for ${doctype} (${context} context)`)
  injectScript(scriptId, scriptContent)
}

/**
 * Check if a script has been loaded
 * @param scriptId Script identifier
 */
export function isScriptLoaded(scriptId: string): boolean {
  return loadedScripts.has(scriptId)
}

/**
 * Get all loaded script IDs
 */
export function getLoadedScripts(): string[] {
  return Array.from(loadedScripts)
}

/**
 * Clear script cache (for testing or page reloads)
 */
export function clearScriptCache(): void {
  loadedScripts.clear()

  // Also remove all injected scripts from DOM
  document.querySelectorAll('script[data-script-id]').forEach((script) => {
    script.remove()
  })
}

/**
 * Remove a specific script from the page
 * @param scriptId Script identifier
 */
export function removeScript(scriptId: string): void {
  const script = document.querySelector(`script[data-script-id="${scriptId}"]`)
  if (script) {
    script.remove()
    loadedScripts.delete(scriptId)
    console.debug(`Removed script: ${scriptId}`)
  }
}