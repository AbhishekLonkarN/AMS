import { ApiError } from '@/api';
import { MULTI_VALUE_TYPES, PRESET_LABELS as L } from '../constants/preset-library.constants';
import type { PresetFormValues } from '../schemas/preset.schema';

type FormPath = keyof PresetFormValues;

const BACKEND_TO_FORM: Record<string, FormPath> = {
  title: 'title',
  field_title: 'fieldTitle',
  description: 'description',
  instructions: 'instructions',
  type: 'type',
  unit: 'unit',
  options: 'options',
  min_value: 'minValue',
  max_value: 'maxValue',
  decimal_places: 'decimalPlaces',
  min_length: 'minLength',
  max_length: 'maxLength',
  char_set: 'charSet',
  min_date: 'minDate',
  max_date: 'maxDate',
  label: 'fieldTitle',
};

export interface FieldProblem {
  path: FormPath;
  message: string;
}

/**
 * Backend problems placed on the form field they concern. Settings problems come as
 * `field.validation.min_value` (issues), request problems as `body.validation.min_value` (fields).
 */
export function fieldProblems(error: unknown, type: PresetFormValues['type']): FieldProblem[] {
  if (!(error instanceof ApiError)) {
    return [];
  }
  if (error.code === 'duplicate_value') {
    const path = BACKEND_TO_FORM[String(error.details.field)];
    return path ? [{ path, message: error.message }] : [];
  }
  const { issues, fields } = error.details as {
    issues?: { path: string; message: string }[];
    fields?: { field: string; message: string }[];
  };
  const raw = issues?.map((i) => ({ location: i.path, message: i.message })) ??
    fields?.map((f) => ({ location: f.field, message: f.message })) ?? [];

  return raw.flatMap(({ location, message }) => {
    const parts = location.split('.');
    if (parts.includes('default_value')) {
      return [{ path: MULTI_VALUE_TYPES.has(type) ? 'defaultValues' : 'defaultValue', message }];
    }
    // `body.options.0.label` is about an option, not the field's label.
    if (parts.includes('options')) {
      return [{ path: 'options' as const, message }];
    }
    const path = [...parts].reverse().map((p) => BACKEND_TO_FORM[p]).find(Boolean);
    return path ? [{ path, message }] : [];
  });
}

/** The backend's message when it sent one, else a generic one. */
export const errorMessage = (error: unknown, fallback: string = L.saveFailed) =>
  error instanceof ApiError && error.status > 0 ? error.message : fallback;
