const loadedScripts = new Set<string>();

/**
 * Script Loader - Injects doctype scripts into the page
 *
 * Scripts are provided by the backend in the metadata response:
 * - __form_js: Form view scripts (string content)
 * - __list__js: List view scripts (string content)
 */

/**
 * Inject script content into the page
 * @param scriptId Unique identifier for the script (used for tracking)
 * @param content Script content (JavaScript)
 * @param attributes Additional script attributes (e.g., type, defer, async)
 */
export function injectScript(
  scriptId: string,
  content: string,
  attributes?: Record<string, string>,
): void {
  if (!content) return;

  if (loadedScripts.has(scriptId)) {
    return;
  }

  try {
    const wrappedContent = `(function(){\n${content}\n})();\n//# sourceURL=${scriptId}.js`;
    const script = document.createElement("script");
    script.type = attributes?.type || "text/javascript";
    script.textContent = wrappedContent;

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (key !== "type") {
          script.setAttribute(key, value);
        }
      });
    }

    script.setAttribute("data-script-id", scriptId);

    const target = document.head || document.body;
    target.appendChild(script);

    loadedScripts.add(scriptId);
  } catch (e) {
    console.error(`Failed to load script ${scriptId}:`, e);
  }
}

/**
 * Load doctype scripts from metadata response
 *
 * The scripts are already loaded as content in __ts_scripts and __ts_list_scripts
 *
 * @param metadata DocType metadata
 * @param context 'form' or 'list'
 */
export function loadScript(
  metadata: any,
  context: "form" | "list" = "form",
): void {
  if (!metadata) {
    return;
  }

  const doctype = metadata.name || "Unknown";

  let scriptContent: string | null = null;
  let scriptId: string;

  if (context === "form") {
    scriptContent = metadata.__form_js;
    scriptId = `doctype-form-scripts-${doctype}`;
  } else if (context === "list") {
    scriptContent = metadata.__list__js;
    scriptId = `doctype-list-scripts-${doctype}`;
  } else {
    console.warn(`Unknown context: ${context}`);
    return;
  }

  if (!scriptContent) {
    return;
  }
  injectScript(scriptId, scriptContent);
}

/**
 * Check if a script has been loaded
 * @param scriptId Script identifier
 */
export function isScriptLoaded(scriptId: string): boolean {
  return loadedScripts.has(scriptId);
}

/**
 * Get all loaded script IDs
 */
export function getLoadedScripts(): string[] {
  return Array.from(loadedScripts);
}

/**
 * Clear script cache (for testing or page reloads)
 */
export function clearScriptCache(): void {
  loadedScripts.clear();

  // Also remove all injected scripts from DOM
  document.querySelectorAll("script[data-script-id]").forEach((script) => {
    script.remove();
  });
}

/**
 * Remove a specific script from the page
 * @param scriptId Script identifier
 */
export function removeScript(scriptId: string): void {
  const script = document.querySelector(`script[data-script-id="${scriptId}"]`);
  if (script) {
    script.remove();
    loadedScripts.delete(scriptId);
    console.debug(`Removed script: ${scriptId}`);
  }
}
