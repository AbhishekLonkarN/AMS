export const FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'select',
  'multiselect',
  'date',
  'datetime',
  'currency',
  'phone',
  'email',
  'address',
  'checkbox',
  'lookup',
  'file',
  'auto',
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export interface FieldOption {
  value: string;
  label: string;
}

/** A single-select option on a sibling field that reveals a live list in this (text) field. */
export interface ConditionalSource {
  field: string;
  value: string;
  source: string;
}

export interface FieldConfig {
  /** Storage key: answers are saved at [sectionKey][fieldKey], so a saved key never changes. */
  key: string;
  label: string;
  /** '' only while the user is choosing; validation rejects it. */
  type: FieldType | '';
  required?: boolean;
  placeholder?: string;
  /** 1–24 grid columns, default 24. */
  width?: number;
  /** select / multiselect only. */
  options?: FieldOption[];
  /** lookup only: name of a live reference list. */
  source?: string;
  conditional_source?: ConditionalSource;

  // ---- editor-only, never persisted ----
  /** Unsaved field: its key still follows the label. */
  isNew?: boolean;
  /** Inherited field: width / placeholder / options disabled. */
  locked?: boolean;
  /** Defaults to `locked`. */
  typeLocked?: boolean;
  /** Trailing action in the field card header. */
  fieldAction?: 'delete' | 'revert' | 'none';
  /** Stable React identity, so a key change doesn't remount the card and drop focus. */
  uid?: string;
  /** Catalog entry this field is mapped to ('' = deliberately cleared). Persisted. */
  catalogFieldKey?: string;
  /** Saved settings the builder doesn't edit (e.g. validation rules), kept as they are. */
  meta?: Record<string, unknown>;
}

export interface SectionConfig {
  key: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  fields: FieldConfig[];
  catalogKey?: string;
  /** Saved settings the builder doesn't edit (e.g. the clinical stage), kept as they are. */
  meta?: Record<string, unknown>;
  /** Editor-only stable React identity. */
  uid?: string;
}

export interface FormBuilderConfig {
  sections: SectionConfig[];
}

/** Options for a `lookup` field's live reference list. */
export type LookupResolver = (source: string) => FieldOption[];
