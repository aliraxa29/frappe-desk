import { useTranslationStore } from "../stores/translation";
import { provide } from "./provide";

provide("dash");

export function __(
  txt: string,
  replace?: string | Record<string, any>,
  context: string | null = null,
): string {
  if (!txt) return txt;
  if (typeof txt != "string") return txt;

  let translated_text = "";

  // Try to get from store first, fallback to dash._messages
  try {
    const translationStore = useTranslationStore();
    translated_text = translationStore.getTranslation(
      txt,
      context || undefined,
    );
  } catch (e) {
    // Store not initialized, use window fallback
    let key = txt;
    if (context) {
      translated_text = dash?._messages?.[`${key}:${context}`] || "";
    }
    if (!translated_text) {
      if (dash?._messages?.[key]) {
        translated_text = dash._messages[key];
      } else {
        translated_text = txt;
      }
    }
  }

  // If still not found, use original text
  if (!translated_text) {
    translated_text = txt;
  }

  // Handle replacements
  if (replace && typeof replace === "object") {
    // Support both {{key}} and {key} formats
    translated_text = translated_text.replace(
      /\{\{(\w+)\}\}/g,
      function (match, p1) {
        return replace[p1] || match;
      },
    );
    translated_text = translated_text.replace(
      /\{(\w+)\}/g,
      function (match, p1) {
        return replace[p1] || match;
      },
    );
  }

  return translated_text;
}

/**
 * Plural translation function
 * Usage:
 *   __n('{0} item', '{0} items', count)
 */
export function __n(
  singular: string,
  plural: string,
  count: number,
  replace?: Record<string, any>,
): string {
  const message = count === 1 ? singular : plural;
  const replaceObj = { ...replace, 0: count };
  return __(message, replaceObj, null);
}

/**
 * Format string with placeholders
 * Usage:
 *   format('Hello {0}, you have {1} messages', 'John', 5)
 *   format('Hello {name}', { name: 'John' })
 */
export function format(message: string, ...args: any[]): string {
  if (args.length === 1 && typeof args[0] === "object") {
    // Named placeholders: {name}, {count}, etc.
    const replace = args[0];
    Object.keys(replace).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g");
      message = message.replace(regex, String(replace[key]));
    });
    return message;
  }

  // Positional placeholders: {0}, {1}, etc.
  args.forEach((arg, index) => {
    const regex = new RegExp(`{${index}}`, "g");
    message = message.replace(regex, String(arg));
  });
  return message;
}

export function get_languages() {
  if (!dash.languages) {
    dash.languages = [];
    const langDict =
      (window as any).dash?.boot?.lang_dict || dash.boot?.lang_dict;

    if (langDict) {
      if (Array.isArray(langDict)) {
        // Array format: [{ label, value }, ...]
        langDict.forEach((element: any) => {
          dash.languages.push({
            label: element.label,
            value: element.value,
          });
        });
      } else if (langDict.array && Array.isArray(langDict.array)) {
        // Nested array format: { array: [{ label, value }, ...] }
        langDict.array.forEach((element: any) => {
          dash.languages.push({
            label: element.label,
            value: element.value,
          });
        });
      } else if (typeof langDict === "object") {
        // Flat object format: { "Afrikaans": "af", "Arabic": "ar", ... }
        Object.entries(langDict).forEach(([label, value]) => {
          dash.languages.push({ label, value });
        });
      }
    }

    dash.languages = dash.languages.sort(function (a: any, b: any) {
      return a.value < b.value ? -1 : 1;
    });
  }
  return dash.languages;
}
