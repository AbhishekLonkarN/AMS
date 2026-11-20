import type { DataQuery, Participant } from '@/types';
import { clinicalForms } from './project-ecrf.utils';

export function clinicalExportRows(participants: Participant[], queries: DataQuery[]) {
  const byParticipant = new Map<string, DataQuery[]>();
  for (const query of queries) {
    const batch = byParticipant.get(query.participantId) ?? [];
    batch.push(query);
    byParticipant.set(query.participantId, batch);
  }
  return [
    ['Record type', 'Project ID', 'Site ID', 'Screening ID', 'Participant ID', 'Initials', 'Participant status',
      'Form', 'Field', 'Value / query', 'Response', 'Record status', 'Recorded at'],
    ...participants.flatMap((participant) => {
      const identity = [participant.projectId, participant.siteId, participant.screeningNo, participant.participantNo, participant.initials, participant.statusId];
      const forms = clinicalForms(participant.ecrfDesign);
      const fields = participant.forms.flatMap((form) => {
        const values = form.submittedValues ?? (form.progress === 'submitted' ? form.values : undefined);
        if (!values) return [];
        const definition = forms.find((item) => item.key === form.formKey);
        return Object.entries(values).map(([key, value]) => [
          'Form value', ...identity, definition?.label ?? form.formKey,
          definition?.fields.find((field) => field.key === key)?.label ?? key, value, '', form.lock ? 'Locked' : 'Submitted', form.lock?.at,
        ]);
      });
      const queryRows = (byParticipant.get(participant.id) ?? []).map((query) => [
        'Query', ...identity, query.formKey, query.fieldKey, query.text, query.response, query.status, query.raisedAt,
      ]);
      return [['Participant', ...identity, '', '', '', '', '', participant.screenedAt], ...fields, ...queryRows];
    }),
  ];
}
