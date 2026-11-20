import type { FieldConfig, FormBuilderConfig } from '@/components/dynamic-form';
import type { Participant } from '@/types';
import { ECRF_FORMS, type EcrfFieldDef, type EcrfFormDef } from '@/constants/ecrf-forms.constants';

export type ClinicalField = EcrfFieldDef & Pick<FieldConfig, 'type' | 'options' | 'meta'> & { required: boolean };
export type ClinicalForm = Omit<EcrfFormDef, 'fields'> & { fields: ClinicalField[]; progression?: 'hard' | 'soft' };

export function clinicalForms(design?: FormBuilderConfig): ClinicalForm[] {
  if (!design) {
    return ECRF_FORMS.map((form) => ({
      ...form,
      fields: form.fields.map((field) => ({ ...field, type: 'text', required: true })),
    }));
  }
  return design.sections.map((section) => ({
    key: section.key, label: section.title, shortLabel: section.title,
    progression: section.meta?.progression === 'hard' || section.meta?.progression === 'soft' ? section.meta.progression : undefined,
    fields: section.fields.map((field) => ({
      key: field.key, label: field.label, type: field.type, options: field.options, meta: field.meta,
      required: !!field.required,
      unit: typeof field.meta?.unit === 'string' ? field.meta.unit : undefined,
    })),
  }));
}

export function canOpenClinicalForm(participant: Participant, formKey: string): boolean {
  const definitions = clinicalForms(participant.ecrfDesign);
  const index = definitions.findIndex((definition) => definition.key === formKey);
  return index >= 0 && definitions.slice(0, index).every((definition) => {
    const progress = participant.forms.find((form) => form.formKey === definition.key)?.progress;
    if (definition.progression === 'hard') return progress === 'submitted';
    if (definition.progression === 'soft') return !!progress && progress !== 'notStarted';
    return true;
  });
}

export function validateClinicalValue(field: ClinicalField, value = ''): string | undefined {
  if (!value.trim()) return field.required ? 'This field is required.' : undefined;
  if (field.type === 'number' || field.type === 'currency') {
    const number = Number(value);
    const min = field.meta?.min;
    const max = field.meta?.max;
    if (!Number.isFinite(number)) return 'Enter a valid number.';
    if ((typeof min === 'number' && number < min) || (typeof max === 'number' && number > max)) return 'Enter a value within the configured range.';
  }
  if ((field.type === 'select' || field.type === 'multiselect') && value.split('\n').some((entry) => !field.options?.some((option) => option.value === entry))) return 'Select a listed option.';
  if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(value)) return 'Enter a valid email address.';
  return undefined;
}
