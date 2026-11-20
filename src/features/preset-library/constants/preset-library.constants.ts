import {
  CalendarDays,
  CircleDot,
  Hash,
  ListChecks,
  SquareCheck,
  SquareChevronDown,
  TextAlignStart,
  Type,
  type LucideIcon,
} from 'lucide-react';
import type { PresetCharSet, PresetFieldType } from '@/types';

export const PRESET_LABELS = {
  listTitle: 'Pre-set Data-field Library',
  listDescription:
    'Reusable data fields with their settings ready to go. Set a field up once here, then copy it onto any eCRF form.',
  addButton: 'Add Pre-set',
  createTitle: 'Add Pre-set',
  createDescription: 'A reusable data field: name it, pick its type, then set its rules.',
  editTitle: 'Edit Pre-set',
  duplicateTitle: 'Duplicate Pre-set',
  duplicateDescription: 'A copy of an existing pre-set. Give it its own title.',
  editHint:
    'Changes apply to the library only. Fields already copied onto templates or project eCRFs keep their current settings.',
  copySuffix: '(copy)',

  sectionEntry: 'Library entry',
  sectionEntryHint: 'How the pre-set is found and recognised in the library.',
  sectionField: 'Data field',
  sectionFieldHint: 'What people see when they fill in the form.',
  sectionType: 'Field type',
  sectionTypeHint: 'You can switch freely: settings for another type are set aside and come back if you switch back.',
  sectionOptions: 'Answer options',
  sectionOptionsHint: 'The choices offered, in the order shown on the form.',
  sectionRules: 'Rules',
  sectionRulesHint: 'Optional. Leave a box empty for no limit.',
  sectionDefault: 'Default value',
  sectionDefaultHint: 'Optional. Pre-filled on the form; people can change it.',
  noDefault: 'No default',
  clearDefault: 'Clear',

  previewTitle: 'Live preview',
  previewHint: 'Try a value to check the rules.',
  previewValid: 'This value passes every rule.',
  previewEmpty: 'Type a value to test the rules.',
  previewNoRules: 'No rules set, so any value is accepted.',
  previewUntitled: 'Untitled field',
  previewNoOptions: 'Add answer options to see them here.',
  previewSelect: 'Select…',

  view: 'View',
  edit: 'Edit',
  duplicate: 'Duplicate',
  delete: 'Delete',
  close: 'Close',
  submitCreate: 'Add to library',
  submitEdit: 'Save changes',

  confirmDeleteTitle: 'Delete pre-set?',
  confirmDelete: (title: string) =>
    `“${title}” will be removed from the library. A pre-set that a template or project eCRF still uses cannot be deleted.`,
  leaveTitle: 'Discard unsaved changes?',
  leaveMessage: 'Your changes to this pre-set have not been saved. If you leave now, they will be lost.',
  leaveConfirm: 'Discard',
  leaveCancel: 'Keep editing',

  created: (title: string) => `“${title}” has been added to the library.`,
  saved: (title: string) => `Changes to “${title}” have been saved.`,
  deleted: (title: string) => `“${title}” has been deleted.`,
  saveFailed: 'The pre-set could not be saved.',
  deleteFailed: 'The pre-set could not be deleted.',

  searchPlaceholder: 'Search title or field…',
  loading: 'Loading the library…',
  loadFailed: 'The library could not be loaded.',
  loadingPreset: 'Loading the pre-set…',
  loadPresetFailed: 'The pre-set could not be loaded.',
  retry: 'Try again',
  emptyTitle: 'Your library is empty',
  emptyDescription: 'Add a pre-set for a field you use often, such as weight, blood pressure or a yes/no question.',
  itemLabel: 'pre-sets',

  viewSettings: 'Settings',
  viewAbout: 'About',
  updated: (when: string) => `Last updated ${when}`,
} as const;

export const PRESET_FIELDS = {
  title: 'Pre-set Title',
  titleHint: 'Unique. The name it is listed under in the library.',
  description: 'Description',
  descriptionHint: 'When to use it, so others pick the right pre-set.',
  fieldTitle: 'Data-field Title',
  fieldTitleHint: 'The label shown on the form.',
  instructions: 'Instructions',
  instructionsHint: 'Optional. Shown with the field to guide data entry.',
  type: 'Type',
  unit: 'Unit',
  unitHint: 'Shown next to the value, e.g. kg or mmHg.',
  minValue: 'Minimum',
  maxValue: 'Maximum',
  decimalPlaces: 'Decimal places',
  decimalPlacesHint: 'Most digits allowed after the decimal point.',
  minLength: 'Minimum length',
  maxLength: 'Maximum length',
  charSet: 'Allowed characters',
  minDate: 'Earliest date',
  maxDate: 'Latest date',
  options: 'Options',
  defaultValue: 'Default',
  createdBy: 'Created By',
  updatedAt: 'Last updated',
} as const;

export const PRESET_COLUMNS = {
  title: 'Pre-set Title',
  fieldTitle: 'Data-field Title',
  type: 'Type',
  settings: 'Settings',
  createdBy: 'Created By',
  updatedAt: 'Last updated',
} as const;

export const PRESET_VALIDATION = {
  required: 'This field is required.',
  tooLong: (max: number) => `Use at most ${max} characters.`,
  titleTaken: 'A pre-set with this title already exists.',
  notANumber: 'Enter a number.',
  wholeNumber: 'Enter a whole number.',
  between: (min: number, max: number) => `Enter a number from ${min} to ${max}.`,
  minAboveMax: 'The minimum is greater than the maximum.',
  minLengthAboveMax: 'The minimum length is greater than the maximum length.',
  minDateAfterMax: 'The earliest date is after the latest date.',
  noOptions: 'Add at least one option.',
  blankOption: 'Give every option a label, or remove the empty ones.',
  duplicateOption: 'Two options have the same label.',
  // Answer checks (live preview and default value)
  tooShortAnswer: (n: number) => `Use at least ${n} character${n === 1 ? '' : 's'}.`,
  tooLongAnswer: (n: number) => `Use at most ${n} character${n === 1 ? '' : 's'}.`,
  lettersOnly: 'Use letters only.',
  lettersAndDigitsOnly: 'Use letters and digits only, without spaces.',
  belowMin: (min: number) => `Enter ${min} or more.`,
  aboveMax: (max: number) => `Enter ${max} or less.`,
  tooManyDecimals: (n: number) => (n === 0 ? 'Enter a whole number.' : `Use at most ${n} decimal place${n === 1 ? '' : 's'}.`),
  notADate: 'Enter a date.',
  beforeMinDate: (date: string) => `Pick ${date} or later.`,
  afterMaxDate: (date: string) => `Pick ${date} or earlier.`,
  notAnOption: 'Pick one of the options.',
} as const;

/** Short, plain descriptions of the rules (list column, preview and view chips). */
export const PRESET_RULE_TEXT = {
  lengthRange: (min: number, max: number) => `${min}–${max} characters`,
  minLength: (n: number) => `At least ${n} characters`,
  maxLength: (n: number) => `Up to ${n} characters`,
  valueRange: (min: number, max: number) => `${min} to ${max}`,
  minValue: (n: number) => `${n} or more`,
  maxValue: (n: number) => `Up to ${n}`,
  decimals: (n: number) => (n === 0 ? 'Whole numbers' : `${n} decimal place${n === 1 ? '' : 's'}`),
  dateRange: (min: string, max: string) => `${min} – ${max}`,
  fromDate: (date: string) => `From ${date}`,
  untilDate: (date: string) => `Until ${date}`,
  options: (n: number) => `${n} option${n === 1 ? '' : 's'}`,
  defaultValue: (value: string) => `Default: ${value}`,
  none: 'No rules',
} as const;

export interface PresetTypeMeta {
  label: string;
  /** One line telling a non-technical user when to pick it. */
  hint: string;
  icon: LucideIcon;
}

/** In the order shown in the type picker: free entry first, then choices. */
export const PRESET_TYPES: PresetFieldType[] = [
  'TEXT',
  'LONG_TEXT',
  'NUMERIC',
  'DATE',
  'DROPDOWN',
  'RADIO',
  'CHECKBOX',
  'MULTI_SELECT',
];

export const PRESET_TYPE_META: Record<PresetFieldType, PresetTypeMeta> = {
  TEXT: { label: 'Text', hint: 'A short answer on one line', icon: Type },
  LONG_TEXT: { label: 'Long text', hint: 'Several lines, e.g. notes', icon: TextAlignStart },
  NUMERIC: { label: 'Number', hint: 'A measurement or count', icon: Hash },
  DATE: { label: 'Date', hint: 'A calendar date', icon: CalendarDays },
  DROPDOWN: { label: 'Dropdown', hint: 'Pick one from a list', icon: SquareChevronDown },
  RADIO: { label: 'Radio buttons', hint: 'Pick one, all choices visible', icon: CircleDot },
  CHECKBOX: { label: 'Tick boxes', hint: 'Tick any number of choices', icon: SquareCheck },
  MULTI_SELECT: { label: 'Multi-select', hint: 'Pick several from a list', icon: ListChecks },
};

export const CHOICE_TYPES = new Set<PresetFieldType>(['DROPDOWN', 'RADIO', 'CHECKBOX', 'MULTI_SELECT']);
export const MULTI_VALUE_TYPES = new Set<PresetFieldType>(['CHECKBOX', 'MULTI_SELECT']);
export const TEXT_TYPES = new Set<PresetFieldType>(['TEXT', 'LONG_TEXT']);

export const CHAR_SET_LABELS: Record<PresetCharSet, string> = {
  ANY: 'Any characters',
  ALPHA: 'Letters only',
  ALPHANUMERIC: 'Letters and digits',
};

export const CHAR_SETS: PresetCharSet[] = ['ANY', 'ALPHA', 'ALPHANUMERIC'];

/** The backend's limits. */
export const PRESET_LIMITS = {
  title: 100,
  fieldTitle: 300,
  description: 2000,
  instructions: 1000,
  unit: 30,
  maxDecimalPlaces: 10,
  maxLength: 10_000,
} as const;
