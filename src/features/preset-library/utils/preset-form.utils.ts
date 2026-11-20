import type { Preset, PresetFieldType, PresetInput } from '@/types';
import { CHOICE_TYPES, MULTI_VALUE_TYPES, TEXT_TYPES } from '../constants/preset-library.constants';
import type { PresetFormValues } from '../schemas/preset.schema';
import { parseNumber } from './preset-rules.utils';

export const EMPTY_PRESET_VALUES: PresetFormValues = {
  title: '',
  fieldTitle: '',
  description: '',
  instructions: '',
  type: 'TEXT',
  unit: '',
  minValue: '',
  maxValue: '',
  decimalPlaces: '',
  minLength: '',
  maxLength: '',
  charSet: 'ANY',
  minDate: '',
  maxDate: '',
  options: [],
  defaultValue: '',
  defaultValues: [],
};

const numberText = (value?: number) => (value === undefined ? '' : String(value));
const asNumber = (text: string) => parseNumber(text) ?? undefined;
const blankToUndefined = (text: string) => text.trim() || undefined;

/** A saved pre-set (or a copy of one) as form values. */
export function toFormValues(preset: Preset, overrides: Partial<PresetFormValues> = {}): PresetFormValues {
  const v = preset.validation;
  const isMulti = MULTI_VALUE_TYPES.has(preset.type);
  return {
    ...EMPTY_PRESET_VALUES,
    title: preset.title,
    fieldTitle: preset.fieldTitle,
    description: preset.description,
    instructions: preset.instructions ?? '',
    type: preset.type,
    unit: preset.unit ?? '',
    minValue: numberText(v.minValue),
    maxValue: numberText(v.maxValue),
    decimalPlaces: numberText(v.decimalPlaces),
    minLength: numberText(v.minLength),
    maxLength: numberText(v.maxLength),
    charSet: v.charSet ?? 'ANY',
    minDate: v.minDate ?? '',
    maxDate: v.maxDate ?? '',
    options: preset.options.map((o) => ({ ...o })),
    defaultValue: !isMulti && preset.defaultValue !== undefined ? String(preset.defaultValue) : '',
    defaultValues: isMulti && Array.isArray(preset.defaultValue) ? [...preset.defaultValue] : [],
    ...overrides,
  };
}

/**
 * Form values → what is sent. Only the settings of the chosen type are included, since the
 * backend refuses settings that don't apply to it.
 */
export function toPresetInput(values: PresetFormValues): PresetInput {
  const { type } = values;
  const isText = TEXT_TYPES.has(type);
  const isChoice = CHOICE_TYPES.has(type);

  let defaultValue: PresetInput['defaultValue'];
  if (MULTI_VALUE_TYPES.has(type)) {
    defaultValue = values.defaultValues.length ? values.defaultValues : undefined;
  } else if (type === 'NUMERIC') {
    defaultValue = asNumber(values.defaultValue);
  } else {
    defaultValue = blankToUndefined(values.defaultValue);
  }

  return {
    title: values.title.trim(),
    fieldTitle: values.fieldTitle.trim(),
    description: values.description.trim(),
    instructions: blankToUndefined(values.instructions),
    type,
    unit: type === 'NUMERIC' ? blankToUndefined(values.unit) : undefined,
    options: isChoice ? values.options.map((o) => ({ value: o.value, label: o.label.trim() })) : [],
    validation: {
      minValue: type === 'NUMERIC' ? asNumber(values.minValue) : undefined,
      maxValue: type === 'NUMERIC' ? asNumber(values.maxValue) : undefined,
      decimalPlaces: type === 'NUMERIC' ? asNumber(values.decimalPlaces) : undefined,
      minLength: isText ? asNumber(values.minLength) : undefined,
      maxLength: isText ? asNumber(values.maxLength) : undefined,
      charSet: isText && values.charSet !== 'ANY' ? values.charSet : undefined,
      minDate: type === 'DATE' ? blankToUndefined(values.minDate) : undefined,
      maxDate: type === 'DATE' ? blankToUndefined(values.maxDate) : undefined,
    },
    defaultValue,
  };
}

/** Types whose answers mean the same thing, so a default carries over between them. */
const familyOf = (type: PresetFieldType) => {
  if (TEXT_TYPES.has(type)) {
    return 'text';
  }
  if (MULTI_VALUE_TYPES.has(type)) {
    return 'many';
  }
  return CHOICE_TYPES.has(type) ? 'one' : type;
};

/**
 * A type change. Every setting stays in the form (only the chosen type's are sent), so
 * switching back brings them back; the default is kept only when it still means the same thing.
 */
export function switchType(values: PresetFormValues, next: PresetFieldType): PresetFormValues {
  const keepsDefault = familyOf(values.type) === familyOf(next);
  return {
    ...values,
    type: next,
    defaultValue: keepsDefault ? values.defaultValue : '',
    defaultValues: keepsDefault ? values.defaultValues : [],
  };
}
