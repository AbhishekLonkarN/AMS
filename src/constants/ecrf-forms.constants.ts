/**
 * The standard form sequence of a participant's eCRF (PRD 10.3.1), with a few representative data fields per form.
 * Until the project eCRF builder feeds the real design, the monitoring screens read the forms from here.
 */
export interface EcrfFieldDef {
  key: string;
  label: string;
  /** Shown after the value, e.g. "g/dL". */
  unit?: string;
}

export interface EcrfFormDef {
  key: string;
  /** Shown in the navigator and used as the "Form Title" in lists and the audit trail. */
  label: string;
  /** Shown in the participant list's "Form Status" column. */
  shortLabel: string;
  fields: EcrfFieldDef[];
}

const followUp = (key: string, number: string, label: string): EcrfFormDef => ({
  key,
  label: `${number}) ${label}`,
  shortLabel: `${number}) ${label}`,
  fields: [
    { key: 'visitDate', label: 'Date of visit' },
    { key: 'symptoms', label: 'Angina / symptom status' },
    { key: 'ecg', label: 'ECG findings' },
    { key: 'bloodPressure', label: 'Blood pressure', unit: 'mmHg' },
    { key: 'adverseEvent', label: 'Adverse event reported' },
  ],
});

export const ECRF_FORMS: EcrfFormDef[] = [
  {
    key: 'screening',
    label: '1) Screening',
    shortLabel: '1) Screening',
    fields: [
      { key: 'consentDate', label: 'Date of informed consent' },
      { key: 'age', label: 'Age', unit: 'years' },
      { key: 'gender', label: 'Gender' },
      { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL' },
      { key: 'cholesterol', label: 'Total Cholesterol', unit: 'mg/dL' },
      { key: 'tcHdl', label: 'TC/HDL Ratio' },
      { key: 'eligible', label: 'Inclusion / exclusion criteria met' },
    ],
  },
  {
    key: 'enrolment',
    label: '2) Enrolment / Procedure',
    shortLabel: '2) Enrolment / Procedure',
    fields: [
      { key: 'procedureDate', label: 'Date of procedure' },
      { key: 'lesionLocation', label: 'Lesion location' },
      { key: 'stentSize', label: 'Stent size', unit: 'mm' },
      { key: 'stentCount', label: 'Number of stents implanted' },
      { key: 'procedureSuccess', label: 'Procedure successful' },
    ],
  },
  {
    key: 'postProcedure',
    label: '3) Post-Procedure',
    shortLabel: '3) Post-Procedure',
    fields: [
      { key: 'timiFlow', label: 'Post-procedure TIMI flow' },
      { key: 'residualStenosis', label: 'Residual stenosis', unit: '%' },
      { key: 'medication', label: 'Anti-platelet medication given' },
    ],
  },
  {
    key: 'discharge',
    label: '4) Discharge',
    shortLabel: '4) Discharge',
    fields: [
      { key: 'dischargeDate', label: 'Date of discharge' },
      { key: 'condition', label: 'Condition at discharge' },
      { key: 'dischargeMedication', label: 'Discharge medication' },
    ],
  },
  followUp('followUp1', '5.1', 'Follow-up 1 (7 Days)'),
  followUp('followUp2', '5.2', 'Follow-up 2 (30 Days)'),
  followUp('followUp3', '5.3', 'End of CI Follow-up 3 (90 Days)'),
];

export const ECRF_FORM_BY_KEY: Record<string, EcrfFormDef> = Object.fromEntries(ECRF_FORMS.map((f) => [f.key, f]));

export const NOT_STARTED_LABEL = 'Not started';
