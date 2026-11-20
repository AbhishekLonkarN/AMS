import type { Preset, PresetDefaultValue, PresetFieldType, PresetInput, PresetValidation } from '@/types';
import { deleteJson, getAllPages, getJson, postJson, putJson } from './api.client';

interface ApiValidation {
  min_value?: number | null;
  max_value?: number | null;
  decimal_places?: number | null;
  min_length?: number | null;
  max_length?: number | null;
  char_set?: PresetValidation['charSet'] | null;
  min_date?: string | null;
  max_date?: string | null;
}

/** A pre-set as the backend sends it. */
interface ApiPreset {
  id: string;
  title: string;
  field_title: string;
  description: string;
  type: PresetFieldType;
  unit?: string | null;
  options?: { value: string; label: string }[];
  validation?: ApiValidation;
  default_value?: PresetDefaultValue | boolean | null;
  instructions?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const BASE = '/api/v1/presets';

const orUndefined = <T>(value: T | null | undefined) => (value === null ? undefined : value);

const toValidation = (v: ApiValidation = {}): PresetValidation => ({
  minValue: orUndefined(v.min_value),
  maxValue: orUndefined(v.max_value),
  decimalPlaces: orUndefined(v.decimal_places),
  minLength: orUndefined(v.min_length),
  maxLength: orUndefined(v.max_length),
  charSet: orUndefined(v.char_set),
  minDate: orUndefined(v.min_date),
  maxDate: orUndefined(v.max_date),
});

const toPreset = (p: ApiPreset): Preset => ({
  id: p.id,
  title: p.title,
  fieldTitle: p.field_title,
  description: p.description,
  type: p.type,
  unit: orUndefined(p.unit),
  options: p.options ?? [],
  validation: toValidation(p.validation),
  // The builder never stores booleans as defaults; anything else passes through.
  defaultValue: typeof p.default_value === 'boolean' ? undefined : orUndefined(p.default_value),
  instructions: orUndefined(p.instructions),
  createdByName: p.created_by,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

const toBody = (input: PresetInput) => ({
  title: input.title,
  field_title: input.fieldTitle,
  description: input.description,
  type: input.type,
  unit: input.unit,
  options: input.options,
  validation: {
    min_value: input.validation.minValue,
    max_value: input.validation.maxValue,
    decimal_places: input.validation.decimalPlaces,
    min_length: input.validation.minLength,
    max_length: input.validation.maxLength,
    char_set: input.validation.charSet,
    min_date: input.validation.minDate,
    max_date: input.validation.maxDate,
  },
  default_value: input.defaultValue,
  instructions: input.instructions,
});

/** Every pre-set, newest first. */
export const listPresets = async () => (await getAllPages<ApiPreset>(BASE)).map(toPreset);

export const getPreset = async (id: string) => toPreset(await getJson<ApiPreset>(`${BASE}/${id}`));

/** To duplicate a pre-set, create a copy of it with a new title. */
export const createPreset = async (input: PresetInput) => toPreset(await postJson<ApiPreset>(BASE, toBody(input)));

/** Replaces the pre-set. Fields already copied onto forms keep their settings. */
export const updatePreset = async (id: string, input: PresetInput) =>
  toPreset(await putJson<ApiPreset>(`${BASE}/${id}`, toBody(input)));

/** Refused (`in_use`) while a template or project eCRF holds a field copied from it. */
export const deletePreset = (id: string) => deleteJson(`${BASE}/${id}`);
