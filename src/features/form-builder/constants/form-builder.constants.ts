import type { FieldType } from '@/components/dynamic-form';
import type { SelectOption } from '@/components/form';

export const FORM_BUILDER_LABELS = {
  editorTitle: 'Form structure',
  editorHint: 'Sections and fields, in the order participants will see them.',
  previewTitle: 'Live preview',
  previewHint: 'Exactly what data entry will look like.',
  emptyTitle: 'No sections yet.',
  emptyDescription: "No sections yet. Click 'Add Section'",
  addSection: 'Add Section',
  addField: 'Add Field',
  addOption: 'Add Option',
  untitledSection: (n: number) => `Section ${n}`,
  untitledField: 'Untitled field',
  fieldCount: (n: number) => `${n} field${n === 1 ? '' : 's'}`,

  sectionName: 'Section Name',
  sectionKey: 'Section Key',
  sectionDescription: 'Description',
  sectionKeyAutoHint: 'Set from the section name.',
  sectionKeyFrozenHint: 'Answers are stored under this key, so it cannot change.',

  label: 'Label',
  fieldKey: 'Field Key',
  type: 'Type',
  required: 'Required',
  width: 'Width',
  widthValue: (n: number) => `${n} / 24 columns`,
  placeholder: 'Placeholder',
  options: 'Options',
  optionPlaceholder: (n: number) => `Option ${n}`,
  dataSource: 'Data source',
  autoNote: 'Filled in automatically by the system (e.g. a record number). Users cannot edit it.',
  fieldKeyLiveHint: 'Follows the label until the form is saved.',
  fieldKeyFrozenHint: 'Saved: answers are stored under this key, so it cannot change.',
  fieldKeyCatalogHint: 'Pick a reusable key; its settings are copied onto this field.',
  inheritedHint: 'Inherited from the template; only some settings can change.',

  /** Short hover hints; the icon buttons also keep their full aria-labels. */
  tips: {
    moveUp: 'Move up',
    moveDown: 'Move down',
    duplicate: 'Duplicate field',
    revert: 'Revert to the template default',
    removeField: 'Remove field',
    removeSection: 'Remove section',
    removeOption: 'Remove option',
    insert: 'Insert a field here',
    restore: 'Put this field back where it was',
    required: 'Users must answer this field',
    width: (n: number) => `Takes ${n} of 24 columns in a row`,
    preview: 'See the form as users will. Click a field to edit it.',
    test: 'Fill in and submit the form to check it works',
  },
  copySuffix: '(copy)',
  duplicateField: (name: string) => `Duplicate field "${name}"`,
  insertField: (position: number) => `Insert a field at position ${position}`,
  editFieldCard: (name: string) => `Edit field "${name}"`,
  collapseFieldCard: (name: string) => `Collapse field "${name}"`,
  requiredChip: 'Required',
  widthChip: (n: number) => `${n}/24`,
  previewMode: 'Preview',
  testMode: 'Test it',
  modeGroup: 'Preview mode',
  previewHintClick: 'Click a field to edit it.',
  testHint: 'Fill in the form and submit it to check required fields and the saved answers.',
  submitTest: 'Submit test',
  resetTest: 'Reset',
  testPassed: 'All required fields are filled. This is what would be saved:',
  testFailed: (n: number) => `${n} field${n === 1 ? '' : 's'} need${n === 1 ? 's' : ''} attention.`,
  moveUp: (name: string) => `Move "${name}" up`,
  moveDown: (name: string) => `Move "${name}" down`,
  removeSection: (name: string) => `Remove section "${name}"`,
  removeField: (name: string) => `Remove field "${name}"`,
  removeOption: (name: string) => `Remove option "${name}"`,
  revertField: (name: string) => `Revert "${name}" to default`,
  expand: (name: string) => `Expand "${name}"`,
  collapse: (name: string) => `Collapse "${name}"`,
  removed: (label: string) => `Removed: ${label} — Undo`,
  restoreField: (label: string) => `Restore field "${label}"`,

  confirmRemoveSectionTitle: 'Remove section?',
  confirmRemoveSection: (name: string) =>
    `"${name}" and all its fields will be removed from this form.`,
  confirmRemoveFieldTitle: 'Remove field?',
  confirmRemoveField: (name: string) =>
    `"${name}" will be removed. You can undo this until you leave the page.`,
  confirmRevertTitle: 'Revert to default?',
  confirmRevert: (name: string) =>
    `"${name}" goes back to the template's version. Your changes to it are lost.`,
  remove: 'Remove',
  revert: 'Revert',

  errors: {
    sectionTitle: 'Section name is required.',
    sectionKey: 'Section key is required.',
    fieldLabel: 'Label is required.',
    fieldType: 'Type is required.',
    fieldKey: 'Field key is required.',
    fieldOptions: 'Add at least one option with a label.',
    fieldSource: 'Choose a data source.',
    duplicateKey: (key: string) => `Another field in this section already uses the key "${key}".`,
  },
} as const;

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  textarea: 'Long text',
  number: 'Number',
  select: 'Dropdown',
  multiselect: 'Multi-select',
  date: 'Date',
  datetime: 'Date and time',
  currency: 'Currency',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  checkbox: 'Checkbox',
  lookup: 'Lookup (live list)',
  file: 'File',
  auto: 'Auto-generated',
};

export const FIELD_TYPE_OPTIONS: SelectOption[] = (
  Object.keys(FIELD_TYPE_LABELS) as FieldType[]
).map((type) => ({
  value: type,
  label: FIELD_TYPE_LABELS[type],
}));

/** Types that show a Placeholder box. */
export const PLACEHOLDER_TYPES = new Set<string>([
  'text',
  'textarea',
  'number',
  'currency',
  'phone',
  'email',
  'address',
]);
export const OPTION_TYPES = new Set<string>(['select', 'multiselect']);

/** How many removed fields a section remembers for Undo. */
export const REMOVED_FIELDS_CAP = 5;
