import type { FormBuilderConfig } from '@/components/dynamic-form';
import { ApiError, UnsupportedFieldTypeError } from '@/api';
import { ECRF_TEMPLATE_LABELS as L } from '../constants/ecrf-templates.constants';

interface Problem {
  /** Where it is, e.g. `forms[0].sections[0].fields[2].key` or `body.definition.forms.0.…`. */
  location: string;
  message: string;
}

/** Design problems from `invalid_form_definition` (issues) or request validation (fields). */
function problemsOf(error: ApiError): Problem[] {
  const { issues, fields } = error.details as {
    issues?: { path: string; message: string }[];
    fields?: { field: string; message: string }[];
  };
  if (issues?.length) {
    return issues.map((i) => ({ location: i.path, message: i.message }));
  }
  return (fields ?? []).map((f) => ({ location: f.field, message: f.message }));
}

// Both `forms[1].sections[0].fields[2]` and `forms.1.sections.0.fields.2`.
const LOCATION = /forms(?:\[|\.)(\d+)\]?(?:\.sections(?:\[|\.)\d+\]?\.fields(?:\[|\.)(\d+)\]?)?/;

/**
 * Names the builder section and field a problem is in. Each builder section is saved as one
 * backend form holding a single section, so form index = section index and field indexes match.
 */
function describe(problem: Problem, config?: FormBuilderConfig): string {
  const match = LOCATION.exec(problem.location);
  const section = match ? config?.sections[Number(match[1])] : undefined;
  if (!match || !section) {
    return problem.message;
  }
  const field = match[2] === undefined ? undefined : section.fields[Number(match[2])];
  const where = [section.title, field?.label].filter((s) => s?.trim()).map((s) => `“${s}”`).join(' › ');
  return where ? `${where}: ${problem.message}` : problem.message;
}

/**
 * A message for a failed save or publish. Design problems name the first one (and how many
 * more there are); `config` is the design that was sent, to name sections and fields.
 */
export function templateErrorMessage(error: unknown, config?: FormBuilderConfig): string {
  if (error instanceof UnsupportedFieldTypeError) {
    return error.message;
  }
  if (!(error instanceof ApiError) || error.status === 0) {
    return L.saveFailed;
  }
  if (error.code === 'design_conflict') {
    return L.designConflict;
  }
  const problems = problemsOf(error);
  if (!problems.length) {
    return error.message;
  }
  const more = problems.length - 1;
  return `${describe(problems[0], config)}${more ? L.moreIssues(more) : ''}`;
}

/** True when the backend refused the name because another template already uses it. */
export const isNameTaken = (error: unknown) =>
  error instanceof ApiError && error.code === 'duplicate_value' && error.details.field === 'name';
