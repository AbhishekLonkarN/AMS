import type { FieldConfig, SectionConfig } from '@/components/dynamic-form';
import { FORM_BUILDER_LABELS } from '../constants/form-builder.constants';
import type { IncompleteItem, IncompleteReason, KeyMode } from '../form-builder.types';
import { effectiveFieldKey } from './key.utils';

const E = FORM_BUILDER_LABELS.errors;

const isBlank = (value?: string) => !value?.trim();

function fieldProblem(
  field: FieldConfig,
  keyMode?: KeyMode
): Exclude<IncompleteReason, 'duplicateKey'> | null {
  if (isBlank(field.label)) {
    return 'fieldLabel';
  }
  if (isBlank(field.type)) {
    return 'fieldType';
  }
  // In auto mode the key is always derived from the label, so a label is enough.
  if (keyMode !== 'auto' && isBlank(field.key)) {
    return 'fieldKey';
  }
  if (
    (field.type === 'select' || field.type === 'multiselect') &&
    !field.options?.some((o) => !isBlank(o.label))
  ) {
    return 'fieldOptions';
  }
  if (field.type === 'lookup' && isBlank(field.source)) {
    return 'fieldSource';
  }
  return null;
}

/**
 * The first incomplete section or field, in display order, or null when the form can be saved.
 * Only the first is reported so the user fixes one thing at a time instead of a wall of red.
 */
export function findFirstIncomplete(
  sections: SectionConfig[],
  keyMode?: KeyMode
): IncompleteItem | null {
  for (const [sectionIndex, section] of sections.entries()) {
    if (isBlank(section.title)) {
      return { sectionIndex, reason: 'sectionTitle', message: E.sectionTitle };
    }
    if (keyMode !== 'auto' && isBlank(section.key)) {
      return { sectionIndex, reason: 'sectionKey', message: E.sectionKey };
    }

    const seen = new Set<string>();
    for (const [fieldIndex, field] of section.fields.entries()) {
      const reason = fieldProblem(field, keyMode);
      if (reason) {
        return { sectionIndex, fieldIndex, reason, message: E[reason] };
      }
      // Two fields resolving to one key would write their answers to the same place.
      const key = effectiveFieldKey(field);
      if (seen.has(key)) {
        return { sectionIndex, fieldIndex, reason: 'duplicateKey', message: E.duplicateKey(key) };
      }
      seen.add(key);
    }
  }
  return null;
}

export const isSameIncomplete = (a: IncompleteItem | null, b: IncompleteItem | null) =>
  !!a &&
  !!b &&
  a.sectionIndex === b.sectionIndex &&
  a.fieldIndex === b.fieldIndex &&
  a.reason === b.reason;
