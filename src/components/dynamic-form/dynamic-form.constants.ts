export const DYNAMIC_FORM_LABELS = {
  required: (label: string) => `${label} is required`,
  autoValue: 'Generated automatically',
  autoHint: 'Filled in by the system when the record is saved.',
  noOptions: 'No options yet.',
  noSource: 'No data source chosen.',
  untitledField: 'Untitled field',
  editField: (label: string) => `Edit field "${label}"`,
  editFieldTip: 'Click to edit this field',
} as const;

/** Full row. */
export const DEFAULT_FIELD_WIDTH = 24;
