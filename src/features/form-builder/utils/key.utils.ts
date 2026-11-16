import type { FieldConfig, SectionConfig } from '@/components/dynamic-form';

export const KEY_MAX_LENGTH = 100;
export const NEW_FIELD_KEY = 'new_field';
export const NEW_SECTION_KEY = 'new_section';

/** "Date of Birth (DOB)" → "date_of_birth_dob". Falls back when nothing usable is left. */
export function toKey(label: string, fallback = 'field'): string {
  const key = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, KEY_MAX_LENGTH)
    // Cutting at the limit can leave a trailing separator.
    .replace(/_+$/, '');
  return key || fallback;
}

/** Appends _2, _3… until the key is free among `siblings`. */
export function ensureUniqueKey(key: string, siblings: Iterable<string>): string {
  const taken = new Set(siblings);
  if (!taken.has(key)) {
    return key;
  }
  for (let n = 2; ; n += 1) {
    const suffix = `_${n}`;
    const candidate = `${key.slice(0, KEY_MAX_LENGTH - suffix.length)}${suffix}`;
    if (!taken.has(candidate)) {
      return candidate;
    }
  }
}

/** `new_field`, `new_field_2`… are placeholders, not real keys yet. */
export function isPlaceholderKey(key: string, base: string): boolean {
  return key === base || new RegExp(`^${base}_\\d+$`).test(key);
}

export const isInheritedField = (field: FieldConfig) =>
  field.fieldAction === 'revert' || field.fieldAction === 'none';

export const isUnsavedField = (field: FieldConfig) =>
  field.isNew === true || isPlaceholderKey(field.key, NEW_FIELD_KEY);

/**
 * A field's key follows its label only until the form is saved. Inherited fields and fields
 * that adopted a catalog key keep theirs, since answers may already be stored under it.
 */
export const followsLabel = (field: FieldConfig) =>
  isUnsavedField(field) && !isInheritedField(field) && !field.catalogFieldKey;

/** The key duplicates are judged on: the mapped catalog key, else the field's own key. */
export const effectiveFieldKey = (field: FieldConfig) => field.catalogFieldKey || field.key;

/**
 * The key to show (and later commit) for a field. Siblings exclude the field itself so the
 * suggestion doesn't step x → x_2 → x_3 as it is re-derived.
 */
export function resolveLabelBlurKey(field: FieldConfig, siblingKeys: string[]): string {
  if (!followsLabel(field) || !field.label.trim()) {
    return field.key;
  }
  return ensureUniqueKey(toKey(field.label), siblingKeys);
}

export const isPlaceholderSectionKey = (section: SectionConfig) =>
  isPlaceholderKey(section.key, NEW_SECTION_KEY);

/** A section's placeholder key turns into a real one, from its name, the first time the name is set. */
export function resolveSectionBlurKey(section: SectionConfig, siblingKeys: string[]): string {
  if (!isPlaceholderSectionKey(section) || section.catalogKey || !section.title.trim()) {
    return section.key;
  }
  return ensureUniqueKey(toKey(section.title, 'section'), siblingKeys);
}

/** Keys of every field in `fields` except the one at `index`. */
export const otherFieldKeys = (fields: FieldConfig[], index: number) =>
  fields.filter((_, i) => i !== index).map((f) => f.key);

export const otherSectionKeys = (sections: SectionConfig[], index: number) =>
  sections.filter((_, i) => i !== index).map((s) => s.key);

/**
 * Commits every pending label-derived key (normally done on blur). Run before validating so a
 * field whose label is still focused isn't saved under its placeholder key.
 */
export function commitPendingKeys(sections: SectionConfig[]): SectionConfig[] {
  let isChanged = false;
  const next = sections.map((section, sectionIndex) => {
    const sectionKey = resolveSectionBlurKey(section, otherSectionKeys(sections, sectionIndex));
    let fields = section.fields;
    fields.forEach((field, fieldIndex) => {
      const key = resolveLabelBlurKey(field, otherFieldKeys(fields, fieldIndex));
      if (key !== field.key) {
        fields = fields.map((f, i) => (i === fieldIndex ? { ...f, key } : f));
      }
    });
    if (sectionKey === section.key && fields === section.fields) {
      return section;
    }
    isChanged = true;
    return { ...section, key: sectionKey, fields };
  });
  return isChanged ? next : sections;
}
