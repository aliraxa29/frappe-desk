// Type definitions for form buttons

export interface FormButton {
  label: string;
  name: string;
  onClick: () => void | Promise<void>;
  icon?: string;
  className?: string;
  visible?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "tertiary" | "destructive" | "plain";
}

export interface FormButtonGroup {
  label: string;
  name: string;
  buttons: FormButton[];
  icon?: string;
  className?: string;
  visible?: boolean;
  variant?: "primary" | "secondary" | "tertiary" | "destructive" | "plain";
}

export type CustomFormButton = FormButton | FormButtonGroup;
