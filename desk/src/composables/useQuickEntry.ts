import { useDialogStore } from "../stores/dialog";
import QuickEntry from "../components/QuickEntry.vue";
import { ref } from "vue";
import type { Field } from "../types";

export interface QuickEntryOptions {
  doctype: string;
  fields?: Field[];
  autoname?: string;
  title?: string;
  onSuccess?: (doc: any) => void;
  onError?: (error: string) => void;
}

/**
 * Open a quick entry dialog for creating a new document
 */
export async function openQuickEntry(options: QuickEntryOptions) {
  const dialogStore = useDialogStore();
  const quickEntryRef = ref<any>(null);

  return new Promise((resolve, reject) => {
    dialogStore
      .open({
        type: "custom",
        title: options.title || `New ${options.doctype}`,
        size: "md",
        component: QuickEntry,
        componentProps: {
          doctype: options.doctype,
          fields: options.fields,
          autoname: options.autoname,
        },
        primaryButton: {
          label: "Create",
          variant: "primary",
          onClick: async () => {
            await quickEntryRef.value?.submitForm();
          },
        },
        secondaryButton: {
          label: "Cancel",
          variant: "secondary",
        },
        showClose: true,
      })
      .then((result) => {
        if (result) {
          options.onSuccess?.(result);
          resolve(result);
        } else {
          reject("Dialog closed without creating document");
        }
      })
      .catch((err) => {
        options.onError?.(err);
        reject(err);
      });
  });
}

/**
 * Open a quick entry dialog for a specific doctype with keyboard shortcut
 * Usage: In your form or list view, bind Ctrl+Shift+N to trigger this
 */
export function setupQuickEntryShortcut(doctype: string) {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ctrl+Shift+N for new document
    if (event.ctrlKey && event.shiftKey && event.key === "N") {
      event.preventDefault();
      openQuickEntry({ doctype }).catch(console.error);
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Open a quick entry dialog with custom fields only
 * Example: Quick invoice with just customer and amount
 */
export async function openQuickEntryWithFields(
  doctype: string,
  fieldsToShow: string[],
  title?: string,
) {
  return openQuickEntry({
    doctype,
    fields: fieldsToShow,
    title: title || `Quick ${doctype} Entry`,
  });
}

/**
 * Open a quick entry dialog with pre-filled defaults
 * Example: Quick expense entry with current date
 */
export async function openQuickEntryWithDefaults(
  doctype: string,
  defaults: Record<string, any>,
  title?: string,
) {
  return openQuickEntry({
    doctype,
    defaultValues: defaults,
    title: title || `New ${doctype}`,
  });
}
