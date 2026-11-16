import type { EcrfTemplate } from '@/types';

const UPDATED_AT = '2026-09-15T09:00:00.000Z';

/**
 * The system default eCRF: the least specific layer of the key catalog. Templates reuse its
 * section and field keys so answers line up across studies.
 */
export const SYSTEM_DEFAULT_ECRF = {
  sections: [
    {
      key: 'visit',
      title: 'Visit',
      fields: [
        { key: 'visit_number', label: 'Visit number', type: 'auto', width: 8 },
        { key: 'visit_date', label: 'Visit date', type: 'date', required: true, width: 8 },
        { key: 'visit_type', label: 'Visit type', type: 'select', required: true, width: 8, options: [
          { value: 'screening', label: 'Screening' },
          { value: 'baseline', label: 'Baseline' },
          { value: 'follow_up', label: 'Follow-up' },
        ] },
      ],
    },
    {
      key: 'demographics',
      title: 'Demographics',
      fields: [
        { key: 'subject_initials', label: 'Subject initials', type: 'text', required: true, width: 8, placeholder: 'e.g. RKS' },
        { key: 'date_of_birth', label: 'Date of birth', type: 'date', required: true, width: 8 },
        { key: 'gender', label: 'Gender', type: 'select', required: true, width: 8, options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'third_gender', label: 'Third Gender' },
        ] },
      ],
    },
    {
      key: 'vital_signs',
      title: 'Vital signs',
      fields: [
        { key: 'height_cm', label: 'Height (cm)', type: 'number', width: 6 },
        { key: 'weight_kg', label: 'Weight (kg)', type: 'number', width: 6 },
        { key: 'systolic_bp', label: 'Systolic BP (mmHg)', type: 'number', width: 6 },
        { key: 'diastolic_bp', label: 'Diastolic BP (mmHg)', type: 'number', width: 6 },
      ],
    },
    {
      key: 'adverse_events',
      title: 'Adverse events',
      fields: [
        { key: 'ae_term', label: 'Adverse event', type: 'text', required: true, width: 12 },
        { key: 'onset_date', label: 'Onset date', type: 'date', required: true, width: 6 },
        { key: 'severity', label: 'Severity', type: 'select', required: true, width: 6, options: [
          { value: 'mild', label: 'Mild' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'severe', label: 'Severe' },
        ] },
        { key: 'is_serious', label: 'Serious adverse event', type: 'checkbox', width: 24 },
        { key: 'ae_description', label: 'Description', type: 'textarea', width: 24 },
      ],
    },
  ],
};

export const ECRF_TEMPLATES_SEED: EcrfTemplate[] = [
  {
    id: 'ecrf-ic-stent',
    name: 'Coronary Stent Follow-up',
    productGroupId: 'ms-pg-ic',
    description: 'Follow-up visit after coronary stent implantation.',
    status: 'active',
    createdBy: 'usr-jpatel',
    updatedAt: UPDATED_AT,
    config: {
      sections: [
        SYSTEM_DEFAULT_ECRF.sections[0],
        SYSTEM_DEFAULT_ECRF.sections[1],
        {
          key: 'procedure',
          title: 'Procedure',
          description: 'Index procedure details.',
          fields: [
            { key: 'stent_type', label: 'Stent type', type: 'select', required: true, width: 12, options: [
              { value: 'des', label: 'DES' },
              { value: 'bms', label: 'BMS' },
              { value: 'bvs', label: 'BVS' },
            ] },
            { key: 'target_vessel', label: 'Target vessel', type: 'multiselect', width: 12, options: [
              { value: 'lad', label: 'LAD' },
              { value: 'lcx', label: 'LCx' },
              { value: 'rca', label: 'RCA' },
            ] },
            // `validation` isn't modelled by the builder; it must survive an edit and save.
            { key: 'lesion_length_mm', label: 'Lesion length (mm)', type: 'number', width: 12, validation: { min: 0, max: 100 } },
            { key: 'site_status', label: 'Site status at procedure', type: 'lookup', source: 'siteStatus', width: 12 },
          ],
        },
      ],
    },
  },
  {
    id: 'ecrf-cs-valve',
    name: 'Valve Surgery Baseline',
    productGroupId: 'ms-pg-cs',
    description: 'Baseline assessment before valve surgery.',
    status: 'active',
    createdBy: 'usr-jpatel',
    updatedAt: UPDATED_AT,
    config: {
      sections: [SYSTEM_DEFAULT_ECRF.sections[1], SYSTEM_DEFAULT_ECRF.sections[2]],
    },
  },
];
