import type { FieldConfig, FieldType, FormBuilderConfig, SectionConfig } from '@/components/dynamic-form';

/*
 * The backend stores an eCRF design as a form definition: ordered forms → sections → fields.
 * The builder edits sections → fields, and a builder section is where answers are stored
 * (`[sectionKey][fieldKey]`, field keys unique per section). That is what a backend form is
 * (field keys unique per form, referenced as `form_key.field_key`), so:
 *
 *   builder section  ↔  backend form, holding one section with the same key and title
 *   builder field    ↔  backend field
 *
 * Backend settings the builder doesn't edit (validation, conditions, calculations, the form's
 * stage, follow-up schedule and rules) ride along in `meta` and are sent back unchanged. A
 * backend form with several sections opens as one builder section and is saved back as one.
 */

export type ApiFieldType =
  | 'TEXT'
  | 'LONG_TEXT'
  | 'NUMERIC'
  | 'DATE'
  | 'DROPDOWN'
  | 'RADIO'
  | 'CHECKBOX'
  | 'MULTI_SELECT';

interface ApiOption {
  value: string;
  label: string;
}

interface ApiFormField {
  key: string;
  label: string;
  type: ApiFieldType;
  instructions?: string | null;
  mandatory?: boolean;
  default_value?: unknown;
  unit?: string | null;
  options?: ApiOption[];
  validation?: Record<string, unknown>;
  visible_when?: unknown;
  mandatory_when?: unknown;
  calculation?: unknown;
  preset_id?: string | null;
}

interface ApiFormSection {
  key: string;
  title: string;
  instructions?: string | null;
  fields: ApiFormField[];
}

type ProgressionMode = 'HARD' | 'SOFT';

interface ApiFormDef {
  key: string;
  label: string;
  stage?: string | null;
  repeatable?: boolean;
  progression_to_next?: ProgressionMode | null;
  follow_up?: unknown;
  sections: ApiFormSection[];
  rules?: unknown[];
}

export interface ApiFormDefinition {
  schema_version: 1;
  forms: ApiFormDef[];
}

/** Builder types the backend can store, and the backend type each is saved as. */
const API_TYPE_OF: Partial<Record<FieldType, ApiFieldType>> = {
  text: 'TEXT',
  textarea: 'LONG_TEXT',
  number: 'NUMERIC',
  date: 'DATE',
  select: 'DROPDOWN',
  multiselect: 'MULTI_SELECT',
};

/** How each backend type is shown in the builder. RADIO and CHECKBOX have no builder type of their own. */
const BUILDER_TYPE_OF: Record<ApiFieldType, FieldType> = {
  TEXT: 'text',
  LONG_TEXT: 'textarea',
  NUMERIC: 'number',
  DATE: 'date',
  DROPDOWN: 'select',
  RADIO: 'select',
  CHECKBOX: 'multiselect',
  MULTI_SELECT: 'multiselect',
};

const CHOICE_TYPES = new Set<ApiFieldType>(['DROPDOWN', 'RADIO', 'CHECKBOX', 'MULTI_SELECT']);

/** Used when a form has no saved progression mode yet: the next form may be opened without submitting. */
const DEFAULT_PROGRESSION: ProgressionMode = 'SOFT';

/** Every builder type the backend can store. */
export const SAVABLE_FIELD_TYPES = Object.keys(API_TYPE_OF) as FieldType[];

/** The savable builder types among the backend field types listed by the Form Builder catalog. */
export const builderTypesFor = (apiTypes: readonly string[]): FieldType[] =>
  SAVABLE_FIELD_TYPES.filter((type) => apiTypes.includes(API_TYPE_OF[type] as string));

/** A field whose type the backend can't store (e.g. one restored from an old local draft). */
export class UnsupportedFieldTypeError extends Error {
  constructor(readonly fieldLabel: string) {
    super(`“${fieldLabel}” has a field type that can't be saved. Choose another type.`);
  }
}

/** Drops null / undefined entries; the backend sends every unset setting as null. */
function compact(record: Record<string, unknown>): Record<string, unknown> | undefined {
  const entries = Object.entries(record).filter(([, value]) => value !== null && value !== undefined);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

const blankToUndefined = (value?: string | null) => value?.trim() || undefined;

// ---- backend → builder ------------------------------------------------------

function fromApiField(field: ApiFormField): FieldConfig {
  const isChoice = CHOICE_TYPES.has(field.type);
  return {
    key: field.key,
    label: field.label,
    type: BUILDER_TYPE_OF[field.type] ?? 'text',
    required: !!field.mandatory,
    // The backend's instructions are the guidance shown with the field: the builder's placeholder.
    placeholder: blankToUndefined(field.instructions),
    options: isChoice ? (field.options ?? []).map((o) => ({ value: o.value, label: o.label })) : undefined,
    meta: compact({
      type: field.type,
      unit: field.unit,
      validation: compact(field.validation ?? {}),
      default_value: field.default_value,
      calculation: field.calculation,
      visible_when: field.visible_when,
      mandatory_when: field.mandatory_when,
      preset_id: field.preset_id,
    }),
  };
}

function fromApiForm(form: ApiFormDef): SectionConfig {
  const [first] = form.sections;
  return {
    key: form.key,
    title: form.label,
    description: blankToUndefined(first?.instructions),
    fields: form.sections.flatMap((s) => s.fields.map(fromApiField)),
    meta: compact({
      sectionKey: first?.key,
      stage: form.stage,
      repeatable: form.repeatable,
      progression_to_next: form.progression_to_next,
      follow_up: form.follow_up,
      rules: form.rules?.length ? form.rules : undefined,
    }),
  };
}

/** A saved design as builder config (before `dbConfigToBuilderConfig` adds editor state). */
export const fromFormDefinition = (definition: ApiFormDefinition): FormBuilderConfig => ({
  sections: definition.forms.map(fromApiForm),
});

// ---- builder → backend ------------------------------------------------------

function toApiField(field: FieldConfig): ApiFormField {
  const apiType = field.type ? API_TYPE_OF[field.type] : undefined;
  if (!apiType) {
    throw new UnsupportedFieldTypeError(field.label.trim() || field.key);
  }
  const meta = field.meta ?? {};
  // A RADIO / CHECKBOX field keeps its backend type while the builder type still shows it.
  // Type-specific settings only make sense for the type they were set on.
  const savedType = meta.type as ApiFieldType | undefined;
  const keepsType = !!savedType && BUILDER_TYPE_OF[savedType] === field.type;
  const type = keepsType ? savedType : apiType;
  return {
    key: field.key,
    label: field.label.trim(),
    type,
    mandatory: !!field.required,
    instructions: blankToUndefined(field.placeholder),
    options: CHOICE_TYPES.has(type)
      ? (field.options ?? []).filter((o) => o.label.trim()).map((o) => ({ value: o.value, label: o.label.trim() }))
      : [],
    visible_when: meta.visible_when,
    mandatory_when: meta.mandatory_when,
    preset_id: meta.preset_id as string | undefined,
    ...(keepsType && {
      unit: meta.unit as string | undefined,
      validation: meta.validation as Record<string, unknown> | undefined,
      default_value: meta.default_value,
      calculation: meta.calculation,
    }),
  };
}

function toApiForm(section: SectionConfig, index: number, count: number): ApiFormDef {
  const meta = section.meta ?? {};
  const title = section.title.trim();
  // Every form but the last needs a progression mode before it can be published.
  const isLast = index === count - 1;
  return {
    key: section.key,
    label: title,
    stage: meta.stage as string | undefined,
    repeatable: meta.repeatable as boolean | undefined,
    progression_to_next: isLast
      ? undefined
      : ((meta.progression_to_next as ProgressionMode | undefined) ?? DEFAULT_PROGRESSION),
    follow_up: meta.follow_up,
    rules: meta.rules as unknown[] | undefined,
    sections: [
      {
        key: (meta.sectionKey as string | undefined) ?? section.key,
        title,
        instructions: blankToUndefined(section.description),
        fields: section.fields.map(toApiField),
      },
    ],
  };
}

/** Builder config (as returned by `toDbConfig`) → the design to save. Throws `UnsupportedFieldTypeError`. */
export const toFormDefinition = (config: FormBuilderConfig): ApiFormDefinition => ({
  schema_version: 1,
  forms: config.sections.map((section, index) => toApiForm(section, index, config.sections.length)),
});
