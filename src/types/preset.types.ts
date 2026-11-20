import type { Id, IsoDateTime } from './common.types';

/** The data-field types a pre-set can have (the backend's form field types). */
export type PresetFieldType =
  | 'TEXT'
  | 'LONG_TEXT'
  | 'NUMERIC'
  | 'DATE'
  | 'DROPDOWN'
  | 'RADIO'
  | 'CHECKBOX'
  | 'MULTI_SELECT';

/** Characters a text field accepts. */
export type PresetCharSet = 'ANY' | 'ALPHA' | 'ALPHANUMERIC';

export interface PresetOption {
  value: string;
  label: string;
}

/** Limits on what may be entered. Which ones apply depends on the type. */
export interface PresetValidation {
  minValue?: number;
  maxValue?: number;
  decimalPlaces?: number;
  minLength?: number;
  maxLength?: number;
  charSet?: PresetCharSet;
  /** YYYY-MM-DD */
  minDate?: string;
  /** YYYY-MM-DD */
  maxDate?: string;
}

export type PresetDefaultValue = string | number | string[];

/** What is sent to create or replace a pre-set. */
export interface PresetInput {
  /** The name it is listed under in the library. Unique. */
  title: string;
  /** The label the field gets on a form. */
  fieldTitle: string;
  description: string;
  type: PresetFieldType;
  unit?: string;
  options: PresetOption[];
  validation: PresetValidation;
  defaultValue?: PresetDefaultValue;
  instructions?: string;
}

/** A reusable data field with its settings (Pre-set Data-field Library). */
export interface Preset extends PresetInput {
  id: Id;
  createdByName: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
