export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  isDisabled?: boolean;
}

/** Props shared by every labelled field. */
export interface FieldChromeProps {
  label: string;
  hint?: string;
  error?: string;
  isRequired?: boolean;
  /** Spans both columns of a `.form-grid`. */
  isFullWidth?: boolean;
}
