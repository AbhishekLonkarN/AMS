import type { PresetDefaultValue, PresetInput } from '@/types';
import { formatDate } from '@/utils/date.utils';
import {
  CHAR_SET_LABELS,
  CHOICE_TYPES,
  MULTI_VALUE_TYPES,
  PRESET_RULE_TEXT as R,
  PRESET_VALIDATION as V,
  TEXT_TYPES,
} from '../constants/preset-library.constants';

/** The part of a pre-set that decides what answers are accepted. */
export type PresetRules = Pick<PresetInput, 'type' | 'unit' | 'options' | 'validation'>;

/** Python's isalpha / isalnum: letters (any script), or letters and digits, nothing else. */
const LETTERS = /^\p{L}+$/u;
const LETTERS_DIGITS = /^[\p{L}\p{N}]+$/u;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A number typed into a box: `undefined` when blank, `null` when not a number. */
export function parseNumber(text: string): number | undefined | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

const decimalsOf = (value: number) => {
  const [, fraction = ''] = String(value).split('.');
  return fraction.length;
};

const isRealDate = (text: string) => ISO_DATE.test(text) && !Number.isNaN(Date.parse(`${text}T00:00:00Z`));

/**
 * Why an answer would be refused, or null when it is accepted. A blank answer is accepted
 * (pre-sets aren't mandatory on their own). The checks match the backend's.
 */
export function checkAnswer(rules: PresetRules, answer: string | string[]): string | null {
  const v = rules.validation;

  if (MULTI_VALUE_TYPES.has(rules.type)) {
    const values = Array.isArray(answer) ? answer : [answer].filter(Boolean);
    const allowed = new Set(rules.options.map((o) => o.value));
    return values.every((x) => allowed.has(x)) ? null : V.notAnOption;
  }

  const text = (Array.isArray(answer) ? (answer[0] ?? '') : answer).trim();
  if (!text) {
    return null;
  }

  if (CHOICE_TYPES.has(rules.type)) {
    return rules.options.some((o) => o.value === text) ? null : V.notAnOption;
  }

  if (TEXT_TYPES.has(rules.type)) {
    if (v.minLength !== undefined && text.length < v.minLength) {
      return V.tooShortAnswer(v.minLength);
    }
    if (v.maxLength !== undefined && text.length > v.maxLength) {
      return V.tooLongAnswer(v.maxLength);
    }
    if (v.charSet === 'ALPHA' && !LETTERS.test(text)) {
      return V.lettersOnly;
    }
    if (v.charSet === 'ALPHANUMERIC' && !LETTERS_DIGITS.test(text)) {
      return V.lettersAndDigitsOnly;
    }
    return null;
  }

  if (rules.type === 'NUMERIC') {
    const value = parseNumber(text);
    if (value === null || value === undefined) {
      return V.notANumber;
    }
    if (v.minValue !== undefined && value < v.minValue) {
      return V.belowMin(v.minValue);
    }
    if (v.maxValue !== undefined && value > v.maxValue) {
      return V.aboveMax(v.maxValue);
    }
    if (v.decimalPlaces !== undefined && decimalsOf(value) > v.decimalPlaces) {
      return V.tooManyDecimals(v.decimalPlaces);
    }
    return null;
  }

  // DATE: ISO strings compare correctly as text.
  if (!isRealDate(text)) {
    return V.notADate;
  }
  if (v.minDate && text < v.minDate) {
    return V.beforeMinDate(formatDate(v.minDate));
  }
  if (v.maxDate && text > v.maxDate) {
    return V.afterMaxDate(formatDate(v.maxDate));
  }
  return null;
}

/** True when at least one rule limits the answer (choice fields are always limited to their options). */
export const hasRules = (rules: PresetRules) =>
  CHOICE_TYPES.has(rules.type) || Object.values(rules.validation).some((x) => x !== undefined && x !== 'ANY');

/** A default value as people read it: option labels instead of stored values. */
export function defaultValueText(rules: PresetRules, value: PresetDefaultValue | undefined): string {
  if (value === undefined || value === '' || (Array.isArray(value) && !value.length)) {
    return '';
  }
  const labelOf = (x: string) => rules.options.find((o) => o.value === x)?.label ?? x;
  if (Array.isArray(value)) {
    return value.map(labelOf).join(', ');
  }
  if (CHOICE_TYPES.has(rules.type)) {
    return labelOf(String(value));
  }
  if (rules.type === 'DATE') {
    return formatDate(String(value));
  }
  return rules.type === 'NUMERIC' && rules.unit ? `${value} ${rules.unit}` : String(value);
}

/** Plain-language rule chips, e.g. ["kg", "0 to 300", "1 decimal place"]. */
export function ruleSummary(rules: PresetRules): string[] {
  const v = rules.validation;
  const chips: string[] = [];

  if (CHOICE_TYPES.has(rules.type)) {
    chips.push(R.options(rules.options.length));
  } else if (TEXT_TYPES.has(rules.type)) {
    if (v.minLength !== undefined && v.maxLength !== undefined) {
      chips.push(R.lengthRange(v.minLength, v.maxLength));
    } else if (v.minLength !== undefined) {
      chips.push(R.minLength(v.minLength));
    } else if (v.maxLength !== undefined) {
      chips.push(R.maxLength(v.maxLength));
    }
    if (v.charSet && v.charSet !== 'ANY') {
      chips.push(CHAR_SET_LABELS[v.charSet]);
    }
  } else if (rules.type === 'NUMERIC') {
    if (rules.unit) {
      chips.push(rules.unit);
    }
    if (v.minValue !== undefined && v.maxValue !== undefined) {
      chips.push(R.valueRange(v.minValue, v.maxValue));
    } else if (v.minValue !== undefined) {
      chips.push(R.minValue(v.minValue));
    } else if (v.maxValue !== undefined) {
      chips.push(R.maxValue(v.maxValue));
    }
    if (v.decimalPlaces !== undefined) {
      chips.push(R.decimals(v.decimalPlaces));
    }
  } else if (v.minDate && v.maxDate) {
    chips.push(R.dateRange(formatDate(v.minDate), formatDate(v.maxDate)));
  } else if (v.minDate) {
    chips.push(R.fromDate(formatDate(v.minDate)));
  } else if (v.maxDate) {
    chips.push(R.untilDate(formatDate(v.maxDate)));
  }
  return chips;
}
