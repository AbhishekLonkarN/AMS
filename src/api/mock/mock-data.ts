import type { ApiFormDefinition } from '../form-definition.mapper';

/*
 * Demo data for the mock backend, in the shape the backend sends (snake_case), so the same
 * mappers that read real responses read these. Users and access-rights templates come from
 * `src/data`; everything else the backend owns is here.
 */

type ApiForm = ApiFormDefinition['forms'][number];
type ApiField = ApiForm['sections'][number]['fields'][number];

const AT = '2026-09-15T09:00:00.000Z';
const BY = 'Dr. Jignesh Patel';

// ---- Product groups ---------------------------------------------------------

export interface MockProductGroup {
  id: string;
  code: string;
  description: string;
  is_active: boolean;
}

export const PRODUCT_GROUPS_SEED: MockProductGroup[] = [
  { id: 'ms-pg-ic', code: 'IC', description: 'Interventional Cardiology', is_active: true },
  { id: 'ms-pg-cs', code: 'CS', description: 'Cardiovascular Surgery', is_active: true },
  {
    id: 'ms-pg-wc-endo',
    code: 'WC-Endo',
    description: 'Wound Closure and Endo Surgery',
    is_active: false,
  },
];

// ---- eCRF templates ---------------------------------------------------------

export interface MockDesignVersion {
  version_no: number;
  state: 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED';
  revision: number;
  definition: ApiFormDefinition;
}

export interface MockEcrfTemplate {
  id: string;
  name: string;
  product_group_id: string;
  suitable_for: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  versions: MockDesignVersion[];
}

const option = (value: string, label: string) => ({ value, label });

const field = (key: string, label: string, type: ApiField['type'], extra: Partial<ApiField> = {}): ApiField => ({
  key,
  label,
  type,
  mandatory: false,
  options: [],
  ...extra,
});

const form = (key: string, label: string, fields: ApiField[], instructions?: string): ApiForm => ({
  key,
  label,
  progression_to_next: 'SOFT',
  sections: [{ key, title: label, instructions, fields }],
});

/** The last form has no next form to progress to. */
const definition = (forms: ApiForm[]): ApiFormDefinition => ({
  schema_version: 1,
  forms: forms.map((f, i) => (i === forms.length - 1 ? { ...f, progression_to_next: undefined } : f)),
});

const VISIT = form('visit', 'Visit', [
  field('visit_date', 'Visit date', 'DATE', { mandatory: true }),
  field('visit_type', 'Visit type', 'DROPDOWN', {
    mandatory: true,
    options: [option('screening', 'Screening'), option('baseline', 'Baseline'), option('follow_up', 'Follow-up')],
  }),
]);

const DEMOGRAPHICS = form('demographics', 'Demographics', [
  field('subject_initials', 'Subject initials', 'TEXT', {
    mandatory: true,
    instructions: 'e.g. RKS',
  }),
  field('date_of_birth', 'Date of birth', 'DATE', { mandatory: true }),
  field('gender', 'Gender', 'DROPDOWN', {
    mandatory: true,
    options: [option('male', 'Male'), option('female', 'Female'), option('third_gender', 'Third Gender')],
  }),
]);

const VITAL_SIGNS = form('vital_signs', 'Vital signs', [
  field('height_cm', 'Height (cm)', 'NUMERIC', { unit: 'cm' }),
  field('weight_kg', 'Weight (kg)', 'NUMERIC', { unit: 'kg' }),
  field('systolic_bp', 'Systolic BP (mmHg)', 'NUMERIC', { unit: 'mmHg' }),
  field('diastolic_bp', 'Diastolic BP (mmHg)', 'NUMERIC', { unit: 'mmHg' }),
]);

const PROCEDURE = form(
  'procedure',
  'Procedure',
  [
    field('stent_type', 'Stent type', 'DROPDOWN', {
      mandatory: true,
      options: [option('des', 'DES'), option('bms', 'BMS'), option('bvs', 'BVS')],
    }),
    field('target_vessel', 'Target vessel', 'MULTI_SELECT', {
      options: [option('lad', 'LAD'), option('lcx', 'LCx'), option('rca', 'RCA')],
    }),
    field('lesion_length_mm', 'Lesion length (mm)', 'NUMERIC', {
      unit: 'mm',
      validation: { min_value: 0, max_value: 100 },
    }),
  ],
  'Index procedure details.',
);

export const ECRF_TEMPLATES_SEED: MockEcrfTemplate[] = [
  {
    id: 'ecrf-ic-stent',
    name: 'Coronary Stent Follow-up',
    product_group_id: 'ms-pg-ic',
    suitable_for: 'Follow-up visit after coronary stent implantation.',
    is_active: true,
    created_by: BY,
    created_at: AT,
    versions: [
      {
        version_no: 1,
        state: 'PUBLISHED',
        revision: 1,
        definition: definition([VISIT, DEMOGRAPHICS, PROCEDURE]),
      },
    ],
  },
  {
    id: 'ecrf-cs-valve',
    name: 'Valve Surgery Baseline',
    product_group_id: 'ms-pg-cs',
    suitable_for: 'Baseline assessment before valve surgery.',
    is_active: true,
    created_by: BY,
    created_at: '2026-09-16T09:00:00.000Z',
    // Never published: shows the "draft only" state.
    versions: [
      {
        version_no: 1,
        state: 'DRAFT',
        revision: 2,
        definition: definition([DEMOGRAPHICS, VITAL_SIGNS]),
      },
    ],
  },
];

// ---- Pre-set Data-field Library --------------------------------------------

export interface MockPreset {
  id: string;
  title: string;
  field_title: string;
  description: string;
  type: ApiField['type'];
  unit?: string | null;
  options?: { value: string; label: string }[];
  validation?: Record<string, unknown>;
  default_value?: unknown;
  instructions?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const preset = (
  id: string,
  title: string,
  fieldTitle: string,
  description: string,
  type: MockPreset['type'],
  extra: Partial<MockPreset> = {},
  createdAt = AT,
): MockPreset => ({
  id,
  title,
  field_title: fieldTitle,
  description,
  type,
  options: [],
  validation: {},
  created_by: BY,
  created_at: createdAt,
  updated_at: createdAt,
  ...extra,
});

export const PRESETS_SEED: MockPreset[] = [
  preset('pre-sbp', 'Systolic blood pressure', 'Systolic BP (mmHg)', 'Resting systolic blood pressure.', 'NUMERIC', {
    unit: 'mmHg',
    validation: { min_value: 50, max_value: 250, decimal_places: 0 },
  }),
  preset('pre-dbp', 'Diastolic blood pressure', 'Diastolic BP (mmHg)', 'Resting diastolic blood pressure.', 'NUMERIC', {
    unit: 'mmHg',
    validation: { min_value: 30, max_value: 150, decimal_places: 0 },
  }),
  preset('pre-hr', 'Heart rate', 'Heart rate (bpm)', 'Pulse at rest.', 'NUMERIC', {
    unit: 'bpm',
    validation: { min_value: 20, max_value: 250, decimal_places: 0 },
  }),
  preset('pre-initials', 'Subject initials', 'Subject initials', 'Initials of the participant.', 'TEXT', {
    instructions: 'Letters only, e.g. RKS.',
    validation: { max_length: 4, char_set: 'ALPHA' },
  }),
  preset('pre-dob', 'Date of birth', 'Date of birth', 'Participant date of birth.', 'DATE', {
    validation: { min_date: '1900-01-01' },
  }),
  preset('pre-gender', 'Gender', 'Gender', 'Gender of the participant.', 'DROPDOWN', {
    options: [option('male', 'Male'), option('female', 'Female'), option('third_gender', 'Third Gender')],
  }),
  preset('pre-severity', 'Adverse event severity', 'Severity', 'How severe an adverse event is.', 'DROPDOWN', {
    options: [option('mild', 'Mild'), option('moderate', 'Moderate'), option('severe', 'Severe')],
  }),
  preset('pre-smoking', 'Smoking status', 'Smoking status', 'Current smoking habit.', 'RADIO', {
    options: [option('current', 'Current smoker'), option('former', 'Former smoker'), option('never', 'Never smoked')],
  }),
  preset('pre-vessel', 'Target vessel', 'Target vessel', 'Vessel(s) treated in the index procedure.', 'MULTI_SELECT', {
    options: [option('lad', 'LAD'), option('lcx', 'LCx'), option('rca', 'RCA')],
  }),
  preset('pre-history', 'Medical history notes', 'Medical history', 'Free-text history.', 'LONG_TEXT', {
    validation: { max_length: 500 },
  }),
];
