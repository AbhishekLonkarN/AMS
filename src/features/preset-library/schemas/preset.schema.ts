import { z } from 'zod';
import type { PresetCharSet, PresetFieldType } from '@/types';
import {
  CHOICE_TYPES,
  MULTI_VALUE_TYPES,
  PRESET_LIMITS as LIMIT,
  PRESET_TYPES,
  PRESET_VALIDATION as V,
  TEXT_TYPES,
} from '../constants/preset-library.constants';
import { checkAnswer, parseNumber } from '../utils/preset-rules.utils';
import { toPresetInput } from '../utils/preset-form.utils';

const text = (max: number) => z.string().trim().max(max, V.tooLong(max));
const required = (max: number) => text(max).min(1, V.required);

/**
 * Form values. Number boxes stay text (a half-typed "1." must not be rewritten), and settings
 * for every type are kept while the user switches types; only those of the chosen type count.
 */
const shape = z.object({
  title: required(LIMIT.title),
  fieldTitle: required(LIMIT.fieldTitle),
  description: required(LIMIT.description),
  instructions: text(LIMIT.instructions),
  type: z.enum(PRESET_TYPES as [PresetFieldType, ...PresetFieldType[]]),
  unit: text(LIMIT.unit),
  minValue: z.string(),
  maxValue: z.string(),
  decimalPlaces: z.string(),
  minLength: z.string(),
  maxLength: z.string(),
  charSet: z.enum(['ANY', 'ALPHA', 'ALPHANUMERIC'] as [PresetCharSet, ...PresetCharSet[]]),
  minDate: z.string(),
  maxDate: z.string(),
  options: z.array(z.object({ value: z.string(), label: z.string() })),
  /** The default for single-value types. */
  defaultValue: z.string(),
  /** The default for CHECKBOX / MULTI_SELECT. */
  defaultValues: z.array(z.string()),
});

export type PresetFormValues = z.infer<typeof shape>;

type Issue = { path: keyof PresetFormValues; message: string };

/** A whole number within [min, max] typed into a box; blank is fine. */
function checkWhole(values: PresetFormValues, path: keyof PresetFormValues, min: number, max: number): Issue | null {
  const value = parseNumber(values[path] as string);
  if (value === undefined) {
    return null;
  }
  if (value === null || !Number.isInteger(value)) {
    return { path, message: V.wholeNumber };
  }
  return value < min || value > max ? { path, message: V.between(min, max) } : null;
}

/** The checks that depend on the chosen type (the backend's field-settings checks). */
function typeIssues(values: PresetFormValues, isTitleTaken: (title: string) => boolean): Issue[] {
  const issues: (Issue | null)[] = [];
  const { type } = values;

  if (values.title.trim() && isTitleTaken(values.title.trim())) {
    issues.push({ path: 'title', message: V.titleTaken });
  }

  if (type === 'NUMERIC') {
    const min = parseNumber(values.minValue);
    const max = parseNumber(values.maxValue);
    issues.push(min === null ? { path: 'minValue', message: V.notANumber } : null);
    issues.push(max === null ? { path: 'maxValue', message: V.notANumber } : null);
    if (typeof min === 'number' && typeof max === 'number' && min > max) {
      issues.push({ path: 'maxValue', message: V.minAboveMax });
    }
    issues.push(checkWhole(values, 'decimalPlaces', 0, LIMIT.maxDecimalPlaces));
  }

  if (TEXT_TYPES.has(type)) {
    const minIssue = checkWhole(values, 'minLength', 0, LIMIT.maxLength);
    const maxIssue = checkWhole(values, 'maxLength', 1, LIMIT.maxLength);
    issues.push(minIssue, maxIssue);
    const min = parseNumber(values.minLength);
    const max = parseNumber(values.maxLength);
    if (!minIssue && !maxIssue && typeof min === 'number' && typeof max === 'number' && min > max) {
      issues.push({ path: 'maxLength', message: V.minLengthAboveMax });
    }
  }

  if (type === 'DATE' && values.minDate && values.maxDate && values.minDate > values.maxDate) {
    issues.push({ path: 'maxDate', message: V.minDateAfterMax });
  }

  if (CHOICE_TYPES.has(type)) {
    const labels = values.options.map((o) => o.label.trim().toLowerCase());
    if (!labels.length) {
      issues.push({ path: 'options', message: V.noOptions });
    } else if (labels.some((l) => !l)) {
      issues.push({ path: 'options', message: V.blankOption });
    } else if (new Set(labels).size !== labels.length) {
      issues.push({ path: 'options', message: V.duplicateOption });
    }
  }

  // The default must itself pass the rules, but only once the rules themselves are valid.
  if (!issues.some(Boolean)) {
    const input = toPresetInput(values);
    const isMulti = MULTI_VALUE_TYPES.has(type);
    const message = checkAnswer(input, isMulti ? values.defaultValues : values.defaultValue);
    if (message) {
      issues.push({ path: isMulti ? 'defaultValues' : 'defaultValue', message });
    }
  }

  return issues.filter((i): i is Issue => !!i);
}

/** `isTitleTaken` is an early hint; the backend has the final say on unique titles. */
export const buildPresetSchema = (isTitleTaken: (title: string) => boolean) =>
  shape.superRefine((values, ctx) => {
    for (const issue of typeIssues(values, isTitleTaken)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [issue.path], message: issue.message });
    }
  });
