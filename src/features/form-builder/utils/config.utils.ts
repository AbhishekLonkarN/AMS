import type {
  FieldConfig,
  FieldOption,
  FieldType,
  FormBuilderConfig,
  SectionConfig,
} from '@/components/dynamic-form';
import { createId } from '@/utils/id.utils';
import {
  OPTION_TYPES,
  PLACEHOLDER_TYPES,
  REMOVED_FIELDS_CAP,
} from '../constants/form-builder.constants';
import type { RemovedField } from '../form-builder.types';
import { NEW_FIELD_KEY, NEW_SECTION_KEY, ensureUniqueKey, toKey } from './key.utils';

type RawRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is RawRecord =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/** Blank strings count as absent (unlike `??`, which would keep ''). */
export const nonEmptyString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined;

const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;

export const EMPTY_CONFIG: FormBuilderConfig = { sections: [] };

const newUid = () => createId('fb');

/** A missing or malformed value is an empty form, so the builder never crashes on bad data. */
export function normalizeConfig(value: unknown): FormBuilderConfig {
  return isRecord(value) && Array.isArray(value.sections)
    ? (value as unknown as FormBuilderConfig)
    : EMPTY_CONFIG;
}

// ---- load ----------------------------------------------------------------

function toBuilderField(raw: RawRecord): FieldConfig {
  // `is_required` is an older spelling; it is folded into `required` and dropped, otherwise a
  // stale `is_required: true` would win again on the next load after the user switched it off.
  const { is_required: isRequiredLegacy, ...rest } = raw;
  const key = nonEmptyString(raw.key) ?? '';
  return {
    // Spread first: properties the builder doesn't model (validation, layout…) must survive a save.
    ...rest,
    key,
    label: typeof raw.label === 'string' ? raw.label : '',
    type: (nonEmptyString(raw.type) ?? 'text') as FieldType,
    required: asBoolean(isRequiredLegacy) ?? asBoolean(raw.required) ?? false,
    placeholder: nonEmptyString(raw.placeholder),
    width: typeof raw.width === 'number' ? raw.width : undefined,
    options: Array.isArray(raw.options)
      ? raw.options
          .filter(isRecord)
          .map((o) => ({ ...o, value: String(o.value ?? ''), label: String(o.label ?? '') }))
      : undefined,
    source: nonEmptyString(raw.source),
    // Loaded fields are saved fields: their keys are frozen from here on.
    isNew: false,
    // '' is a deliberate "no catalog mapping" and must not be replaced by the key.
    catalogFieldKey: typeof raw.catalogFieldKey === 'string' ? raw.catalogFieldKey : key,
    uid: newUid(),
  };
}

function toBuilderSection(raw: RawRecord): SectionConfig {
  return {
    ...raw,
    key: nonEmptyString(raw.key) ?? '',
    title: nonEmptyString(raw.title) ?? '',
    description: nonEmptyString(raw.description),
    collapsible: asBoolean(raw.collapsible),
    catalogKey: nonEmptyString(raw.catalogKey),
    fields: Array.isArray(raw.fields) ? raw.fields.filter(isRecord).map(toBuilderField) : [],
    uid: newUid(),
  };
}

/** Saved JSON → builder config. `null` (nothing saved yet) is an empty form. */
export function dbConfigToBuilderConfig(raw: unknown): FormBuilderConfig {
  if (!isRecord(raw) || !Array.isArray(raw.sections)) {
    return { sections: [] };
  }
  return {
    ...raw,
    sections: raw.sections.filter(isRecord).map(toBuilderSection),
  } as FormBuilderConfig;
}

// ---- save ----------------------------------------------------------------

/** Builder config → JSON to save: editor-only state removed, blank option rows dropped. */
export function toDbConfig(config: FormBuilderConfig): FormBuilderConfig {
  return {
    ...config,
    sections: config.sections.map(({ uid: _uid, ...section }) => ({
      ...section,
      fields: section.fields.map(
        ({
          isNew: _isNew,
          fieldAction: _action,
          locked: _locked,
          typeLocked: _typeLocked,
          uid: _fieldUid,
          ...field
        }) =>
          field.options ? { ...field, options: field.options.filter((o) => o.label.trim()) } : field
      ),
    })),
  };
}

// ---- editing ---------------------------------------------------------------

export function createField(siblings: FieldConfig[]): FieldConfig {
  return {
    key: ensureUniqueKey(
      NEW_FIELD_KEY,
      siblings.map((f) => f.key)
    ),
    label: '',
    type: 'text',
    required: false,
    width: 24,
    isNew: true,
    fieldAction: 'delete',
    uid: newUid(),
  };
}

/** A new blank field placed at `index` (between two existing fields). */
export function insertField(
  fields: FieldConfig[],
  index: number
): { fields: FieldConfig[]; field: FieldConfig } {
  const field = createField(fields);
  const next = [...fields];
  next.splice(index, 0, field);
  return { fields: next, field };
}

/**
 * A copy placed right below the original. The copy is a brand-new, unsaved field: its own
 * label and key, no catalog mapping, no inherited lock, and no conditional rule (one per form).
 */
export function duplicateField(
  fields: FieldConfig[],
  index: number,
  copySuffix: string
): FieldConfig[] {
  const source = fields[index];
  const label = source.label.trim() ? `${source.label} ${copySuffix}` : '';
  const {
    conditional_source: _rule,
    catalogFieldKey: _catalogKey,
    locked: _locked,
    typeLocked: _typeLocked,
    ...rest
  } = source;
  const copy: FieldConfig = {
    ...rest,
    label,
    key: ensureUniqueKey(
      label ? toKey(label) : NEW_FIELD_KEY,
      fields.map((f) => f.key)
    ),
    options: cloneOptions(source.options),
    isNew: true,
    fieldAction: 'delete',
    uid: newUid(),
  };
  const next = [...fields];
  next.splice(index + 1, 0, copy);
  return next;
}

export function createSection(siblings: SectionConfig[]): SectionConfig {
  return {
    key: ensureUniqueKey(
      NEW_SECTION_KEY,
      siblings.map((s) => s.key)
    ),
    title: '',
    fields: [],
    uid: newUid(),
  };
}

/** Switching type keeps only the settings the new type uses, so stale options aren't saved. */
export function changeFieldType(field: FieldConfig, type: FieldType | ''): FieldConfig {
  return {
    ...field,
    type,
    options: OPTION_TYPES.has(type)
      ? (field.options ?? [{ value: 'option_1', label: '' }])
      : undefined,
    source: type === 'lookup' ? field.source : undefined,
    placeholder: PLACEHOLDER_TYPES.has(type) ? field.placeholder : undefined,
  };
}

/**
 * An option's stored value is a slug of its label. While the label is blank it keeps its
 * previous value (or option_N), and it never collides with another option.
 */
export function optionValue(
  label: string,
  previous: string | undefined,
  index: number,
  otherValues: string[]
): string {
  const base = toKey(label, '') || previous || `option_${index + 1}`;
  return ensureUniqueKey(base, otherValues);
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** A removed field can no longer reveal anything: drop rules elsewhere that pointed at it. */
export function dropOrphanedRules(fields: FieldConfig[], removedKey: string): FieldConfig[] {
  return fields.map((field) => {
    if (field.conditional_source?.field !== removedKey) {
      return field;
    }
    const { conditional_source: _rule, ...rest } = field;
    return rest;
  });
}

/** Newest first, one entry per key, at most `cap` entries. */
export function pushRemovedField(
  list: RemovedField[],
  entry: RemovedField,
  cap: number = REMOVED_FIELDS_CAP
): RemovedField[] {
  return [entry, ...list.filter((e) => e.field.key !== entry.field.key)].slice(0, cap);
}

/** Puts a removed field back exactly as it was, at its old position where possible. */
export function restoreField(fields: FieldConfig[], entry: RemovedField): FieldConfig[] {
  const next = [...fields];
  next.splice(Math.min(entry.index, next.length), 0, entry.field);
  return next;
}

export const cloneOptions = (options?: FieldOption[]) => options?.map((o) => ({ ...o }));
