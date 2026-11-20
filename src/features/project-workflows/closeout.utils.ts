import type { DataQuery, Participant } from '@/types';
import { clinicalForms } from './project-ecrf.utils';

export function closeoutReadiness(projectId: string, allParticipants: Participant[], queries: DataQuery[]) {
  const participants = allParticipants.filter((participant) => participant.projectId === projectId);
  const openQueries = queries.filter((query) => query.projectId === projectId && query.status !== 'resolved').length;
  const incompleteForms = participants.reduce((count, participant) => {
    const forms = participant.forms;
    const submitted = forms.filter((form) => form.progress === 'submitted');
    // Unstarted optional forms do not prevent close-out. Drafts and required forms must be submitted.
    const required = clinicalForms(participant.ecrfDesign).filter((form) =>
      (participant.statusId !== 'ms-pt-screen-failed' || form.key === 'visit') && form.fields.some((field) => field.required),
    );
    return count + new Set([
      ...required.filter((form) => !submitted.some((submission) => submission.formKey === form.key)).map((form) => form.key),
      ...forms.filter((form) => form.progress === 'draft' || form.progress === 'softSubmitted').map((form) => form.formKey),
    ]).size;
  }, 0);
  return { participantCount: participants.length, openQueries, incompleteForms, blocked: !participants.length || !!(openQueries + incompleteForms) };
}
