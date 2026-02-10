import { reactive } from "vue";
import type { FormContext, Document, DocTypeMeta } from "../types";
import { toast } from "../stores/toast";
import { dialog } from "../stores/dialog";

export function createFormContext(
  doctype: string,
  doc: Document,
  meta: DocTypeMeta,
): FormContext {
  const customButtons: any[] = [];
  const buttonGroups = new Map<string, any[]>();

  const ctx = reactive<FormContext>({
    doctype,
    doc: reactive(doc),
    meta,
    dirty: false,
    customButtons,

    set_value(field: string, value: any) {
      this.doc[field] = value;
      this.dirty = true;
      // Trigger form event
      triggerFormEvent(this.doctype, "field_changed", {
        ...this,
        field,
        value,
        previous_value: undefined,
      });
    },

    get_value(field: string) {
      return this.doc[field];
    },

    refresh_field(field?: string) {
      // Vue reactivity handles UI automatically
    },

    throw(msg: string) {
      console.error("Form Error:", msg);
      dialog.error("Error", msg);
    },

    notify(
      msg: string,
      type: "success" | "error" | "warning" | "info" = "info",
    ) {
      toast[type](msg);
    },

    validate(): boolean {
      let isValid = true;
      for (const field of this.meta.fields) {
        if (field.reqd && !this.doc[field.fieldname]) {
          toast.error(`${field.label} is required`);
          isValid = false;
          break;
        }
      }
      return isValid;
    },

    async save() {
      if (!this.validate()) return;
      toast.warning("Save functionality not yet implemented");
    },

    async submit() {
      toast.warning("Submit functionality not yet implemented");
    },

    async amend() {
      toast.warning("Amend functionality not yet implemented");
    },

    async duplicate() {
      toast.warning("Duplicate functionality not yet implemented");
    },

    add_custom_button(
      label: string,
      callback: () => void | Promise<void>,
      options: {
        group?: string;
        icon?: string;
        className?: string;
        variant?: "primary" | "secondary" | "danger";
        show_on?: "new" | "edit" | "always";
      } = {},
    ) {
      const isNew = !doc.name || doc.name.startsWith("new-") || doc.__islocal;

      // Check visibility condition
      if (options.show_on === "new" && !isNew) return;
      if (options.show_on === "edit" && isNew) return;

      const button: any = {
        label,
        name: label.toLowerCase().replace(/\s+/g, "_"),
        onClick: callback,
        icon: options.icon,
        className: options.className,
        variant: options.variant,
        visible: true,
      };

      if (options.group) {
        // Add to button group (dropdown)
        if (!buttonGroups.has(options.group)) {
          // Create group button
          const groupButton: any = {
            label: options.group,
            name: options.group.toLowerCase().replace(/\s+/g, "_"),
            buttons: [],
            visible: true,
          };
          customButtons.push(groupButton);
          buttonGroups.set(options.group, []);
        }

        // Add button to group
        buttonGroups.get(options.group)!.push(button);

        // Update the group in customButtons
        const groupIndex = customButtons.findIndex(
          (b) => "buttons" in b && b.label === options.group,
        );
        if (groupIndex >= 0) {
          customButtons[groupIndex].buttons = buttonGroups.get(options.group)!;
        }
      } else {
        // Add as standalone button
        customButtons.push(button);
      }
    },
  });

  return ctx;
}

// Global event registry
export const formRegistry = {
  forms: {} as Record<string, any[]>,
};

export function defineForm(doctype: string, handlers: any) {
  if (!formRegistry.forms[doctype]) {
    formRegistry.forms[doctype] = [];
  }
  formRegistry.forms[doctype].push(handlers);
}

export function triggerFormEvent(doctype: string, event: string, ctx: any) {
  const handlers = formRegistry.forms[doctype] || [];

  for (const handler of handlers) {
    if (typeof handler[event] === "function") {
      try {
        handler[event](ctx);
      } catch (error) {
        console.error(`Error in ${doctype}.${event}:`, error);
      }
    }
  }
}
