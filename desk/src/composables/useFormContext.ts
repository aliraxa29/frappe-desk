import { ref, computed, type Ref } from "vue";
import type {
  CustomFormButton,
  FormButton,
  FormButtonGroup,
} from "./useFormButtons";
import { desk } from "../utils/resource";

export interface FormContext {
  doctype: string;
  docname: string | null;
  doc: any;
  is_new: () => boolean;
  add_custom_button: (
    label: string,
    callback: () => void | Promise<void>,
    options?: {
      group?: string;
      icon?: string;
      className?: string;
      show_on?: "new" | "edit";
    },
  ) => void;
  call: typeof desk.call;
}

export function useFormContext(
  doctype: string,
  docname: string | null,
  formData: Ref<any>,
) {
  const customButtons = ref<CustomFormButton[]>([]);
  const buttonGroups = ref<Map<string, FormButton[]>>(new Map());

  const isNewDocument = computed(() => !docname || docname === "new");

  /**
   * Create a Frappe-like form context object
   */
  function createFormContext(): FormContext {
    return {
      doctype,
      docname,
      doc: formData.value || {},
      is_new: () => isNewDocument.value,
      call: desk.call,
      add_custom_button: (label, callback, options = {}) => {
        addCustomButton(label, callback, options);
      },
    };
  }

  /**
   * Add a custom button to the form
   */
  function addCustomButton(
    label: string,
    callback: () => void | Promise<void>,
    options: {
      group?: string;
      icon?: string;
      className?: string;
      show_on?: "new" | "edit";
    } = {},
  ) {
    // Check visibility condition
    if (options.show_on === "new" && !isNewDocument.value) return;
    if (options.show_on === "edit" && isNewDocument.value) return;

    const button: FormButton = {
      label,
      name: label.toLowerCase().replace(/\s+/g, "_"),
      onClick: callback,
      icon: options.icon,
      className: options.className || "bg-blue-600 hover:bg-blue-700",
      visible: true,
    };

    if (options.group) {
      // Add to button group (dropdown)
      if (!buttonGroups.value.has(options.group)) {
        // Create group button
        const groupButton: FormButtonGroup = {
          label: options.group,
          name: options.group.toLowerCase().replace(/\s+/g, "_"),
          buttons: [],
          visible: true,
        };
        customButtons.value.push(groupButton);
        buttonGroups.value.set(options.group, []);
      }

      // Add button to group
      buttonGroups.value.get(options.group)!.push(button);

      // Update the group in customButtons
      const groupIndex = customButtons.value.findIndex(
        (b: any) => "buttons" in b && b.label === options.group,
      );
      if (groupIndex >= 0) {
        (customButtons.value[groupIndex] as FormButtonGroup).buttons =
          buttonGroups.value.get(options.group)!;
      }
    } else {
      // Add as standalone button
      customButtons.value.push(button);
    }
  }

  /**
   * Load and execute form scripts
   */
  async function loadFormScripts() {
    try {
      // Fetch form scripts from backend
      const response = await desk.call({
        method: "desktop.doctype_scripts.get_doctype_with_scripts",
        args: { doctype },
      });

      // Backend returns scripts in __ts_scripts field (from get_doctype_with_scripts)
      const scriptCode = response.message?.docs?.[0]?.__ts_scripts;

      if (scriptCode) {
        const formContext = createFormContext();

        // Execute the form script with the form context
        try {
          const scriptFunction = new Function("frm", scriptCode);
          await scriptFunction(formContext);
        } catch (error) {
          console.error(`Error executing form scripts for ${doctype}:`, error);
        }
      }
    } catch (error) {
      console.warn(`No form scripts found for ${doctype}`);
    }
  }

  /**
   * Clear buttons (useful for re-initialization)
   */
  function clearButtons() {
    customButtons.value = [];
    buttonGroups.value.clear();
  }

  return {
    customButtons,
    isNewDocument,
    createFormContext,
    addCustomButton,
    loadFormScripts,
    clearButtons,
  };
}
