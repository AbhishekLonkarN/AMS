import type { Participant, DataQuery } from '@/types';
import { RESTORE_DEMO_ECRF } from './projects.seed';

const scope = { projectId: 'prj-restore', siteId: 'site-restore-fr006' };
const screenedAt = '2026-09-08T09:00:00.000Z';
const enrolledAt = '2026-09-10T09:00:00.000Z';
const submittedForms = {
  visit: { visit_date: '2026-09-08', visit_type: 'screening' },
  demographics: { subject_initials: 'TST', date_of_birth: '1980-01-01', gender: 'third_gender' },
};

export const PARTICIPANTS_SEED: Participant[] = [{
  ...scope,
  id: 'pt-restore-demo-001',
  screeningNo: 'FR-006-S001',
  participantNo: 'FR-006-001',
  initials: 'TST',
  statusId: 'ms-pt-enrolled',
  screenedAt,
  enrolledAt,
  ecrfDesign: RESTORE_DEMO_ECRF,
  forms: [
    ...Object.entries<Record<string, string>>(submittedForms).map(([formKey, values]) => ({
      formKey, progress: 'submitted' as const, values: { ...values }, submittedValues: { ...values },
    })),
    { formKey: 'vital_signs', progress: 'draft', values: {} },
  ],
}];

export const QUERIES_SEED: DataQuery[] = [{
  ...scope,
  id: 'qry-restore-demo-001',
  participantId: 'pt-restore-demo-001',
  formKey: 'visit',
  fieldKey: 'visit_date',
  status: 'notRead',
  text: 'Demo query. Please confirm the recorded screening visit date.',
  raisedBy: 'usr-amartin',
  raisedAt: '2026-09-11T09:00:00.000Z',
}];
