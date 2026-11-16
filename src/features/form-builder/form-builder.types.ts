import type {
  FieldConfig,
  FieldOption,
  FieldType,
  FormBuilderConfig,
} from '@/components/dynamic-form';

/** `auto`: keys are read-only and always derived from labels (create-from-scratch flows). */
export type KeyMode = 'auto';

/** A reusable field definition offered in the Field Key dropdown. */
export interface CatalogField {
  key: string;
  label: string;
  type: FieldType | '';
  required?: boolean;
  placeholder?: string;
  width?: number;
  options?: FieldOption[];
  source?: string;
  /** The most specific layer that defines this key. */
  layer: string;
}

export interface CatalogSection {
  key: string;
  title: string;
  description?: string;
  fields: CatalogField[];
  layer: string;
}

export type SectionKeyCatalog = CatalogSection[];

/** One source of keys, least specific first (system default → tenant template → this record). */
export interface CatalogLayer {
  name: string;
  config: FormBuilderConfig | null | undefined;
}

export type IncompleteReason =
  | 'sectionTitle'
  | 'sectionKey'
  | 'fieldLabel'
  | 'fieldType'
  | 'fieldKey'
  | 'fieldOptions'
  | 'fieldSource'
  | 'duplicateKey';

/** The first thing `validate()` found missing. `fieldIndex` is absent for a section-level problem. */
export interface IncompleteItem {
  sectionIndex: number;
  fieldIndex?: number;
  reason: IncompleteReason;
  message: string;
}

/** A field removed this session, kept so it can be restored exactly. */
export interface RemovedField {
  field: FieldConfig;
  index: number;
}

export interface FormBuilderHandle {
  /** Marks the first incomplete section / field, scrolls to it, and returns false; true when complete. */
  validate: () => boolean;
}
