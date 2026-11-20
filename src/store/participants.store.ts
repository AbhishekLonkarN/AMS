import type { FormProgress, Id, Participant } from '@/types';
import { PARTICIPANTS_SEED } from '@/data/participants.seed';
import { AUDIT_NA, AUDIT_PAGES } from '@/constants/audit.constants';
import { canOpenClinicalForm, clinicalForms, validateClinicalValue } from '@/features/project-workflows/project-ecrf.utils';
import { useProjectsStore } from './projects.store';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { createAppStore } from './store.config';
import { recordAudit, recordFieldChanges } from './audit.store';
import { useSessionStore } from './session.store';
import { useSitesStore } from './sites.store';
import { useMastersStore } from './masters.store';

export interface ParticipantDetailsInput {
  screeningNo: string;
  participantNo?: string;
  initials: string;
  /** MasterItem id (participantStatus). */
  statusId: Id;
}

interface ParticipantsState {
  participants: Participant[];
  /** Adds a participant to a site (site users). Every form starts as "Not started". */
  addParticipant: (siteId: Id, input: ParticipantDetailsInput) => Participant | null;
  /** Edits the identifiers of a participant; the Screening No./ID never changes. */
  updateParticipant: (participantId: Id, input: Omit<ParticipantDetailsInput, 'screeningNo'>) => boolean;
  /**
   * Saves the data of one form. `draft` keeps it open for later; `submitted` records it as complete.
   * Returns false when the form is locked.
   */
  saveForm: (
    participantId: Id,
    formKey: string,
    values: Record<string, string>,
    progress: Exclude<FormProgress, 'notStarted'>,
    correctionReason?: string,
  ) => boolean;
  /** Locks one form of one participant (the padlock in the form navigator). */
  lockForm: (participantId: Id, formKey: string) => boolean;
  unlockForm: (participantId: Id, formKey: string) => boolean;
}

export const useParticipantsStore = createAppStore<ParticipantsState>('participants', (set, get) => {
  const setLock = (participantId: Id, formKey: string, isLocked: boolean) => {
    const participant = get().participants.find((p) => p.id === participantId);
    const form = participant?.forms.find((f) => f.formKey === formKey);
    const userId = useSessionStore.getState().currentUserId;
    if (!participant || !form || !userId || !!form.lock === isLocked ||
      useProjectsStore.getState().projects.find((item) => item.id === participant.projectId)?.databaseLock ||
      (isLocked && form.progress !== 'submitted')) return false;

    set((s) => ({
      participants: s.participants.map((p) =>
        p.id !== participantId
          ? p
          : {
              ...p,
              forms: p.forms.map((f) =>
                f.formKey === formKey ? { ...f, lock: isLocked ? { byUserId: userId, at: nowIso() } : undefined } : f,
              ),
            },
      ),
    }));

    const title = clinicalForms(participant.ecrfDesign).find((definition) => definition.key === formKey)?.label ?? formKey;
    recordAudit({
      page: AUDIT_PAGES.siteEcrfs,
      event: `${isLocked ? 'Locked' : 'Unlocked'} form ${title} of participant ${participant.screeningNo}`,
      changedTo: isLocked ? 'Locked' : 'Unlocked',
      originalValue: isLocked ? 'Unlocked' : 'Locked',
      siteId: participant.siteId,
      participantId: participant.screeningNo,
      formTitle: title, projectId: participant.projectId,
    });
    return true;
  };

  const statusLabel = (id: Id) => useMastersStore.getState().items.find((item) => item.id === id)?.label ?? id;

  return {
    participants: PARTICIPANTS_SEED,

    addParticipant: (siteId, input) => {
      const site = useSitesStore.getState().sites.find((s) => s.id === siteId);
      const project = useProjectsStore.getState().projects.find((item) => item.id === site?.projectId);
      if (!site || !project?.ecrf?.publishedAt || project.databaseLock) return null;
      const ecrfDesign = structuredClone(project.ecrf.config);
      const participant: Participant = {
        id: createId('pt'),
        projectId: site.projectId,
        siteId,
        screeningNo: input.screeningNo.trim(),
        participantNo: input.participantNo?.trim() || undefined,
        initials: input.initials.trim().toUpperCase(),
        statusId: input.statusId,
        screenedAt: nowIso(),
        forms: clinicalForms(ecrfDesign).map((f) => ({ formKey: f.key, progress: 'notStarted' as const, values: {} })),
        ecrfDesign,
      };
      set((s) => ({ participants: [...s.participants, participant] }));
      recordAudit({
        page: AUDIT_PAGES.siteEcrfs,
        event: `Added participant ${participant.screeningNo}`,
        changedTo: statusLabel(participant.statusId),
        siteId,
        participantId: participant.screeningNo,
      });
      return participant;
    },

    updateParticipant: (participantId, input) => {
      const before = get().participants.find((p) => p.id === participantId);
      if (!before || useProjectsStore.getState().projects.find((item) => item.id === before.projectId)?.databaseLock) return false;
      const after: Participant = {
        ...before,
        participantNo: input.participantNo?.trim() || undefined,
        initials: input.initials.trim().toUpperCase(),
        statusId: input.statusId,
      };
      set((s) => ({ participants: s.participants.map((p) => (p.id === participantId ? after : p)) }));
      recordFieldChanges({
        page: AUDIT_PAGES.siteEcrfs,
        subject: `participant ${before.screeningNo}`,
        before,
        after,
        context: { siteId: before.siteId, participantId: before.screeningNo },
        fields: [
          { key: 'participantNo', label: "Participant's No./ID" },
          { key: 'initials', label: "Participant's Initial" },
          { key: 'statusId', label: "Participant's Status", format: (v) => statusLabel(String(v ?? '')) },
        ],
      });
      return true;
    },

    saveForm: (participantId, formKey, values, progress, correctionReason) => {
      const participant = get().participants.find((p) => p.id === participantId);
      const form = participant?.forms.find((f) => f.formKey === formKey);
      const definitions = clinicalForms(participant?.ecrfDesign);
      const def = definitions.find((item) => item.key === formKey);
      if (!participant || !form || !def || form.lock || !canOpenClinicalForm(participant, formKey) ||
        useProjectsStore.getState().projects.find((item) => item.id === participant.projectId)?.databaseLock ||
        (progress === 'submitted' && def.fields.some((field) => validateClinicalValue(field, values[field.key])))) return false;
      const previousSubmission = form.submittedValues ?? (form.progress === 'submitted' ? form.values : undefined);
      const isCorrection = progress === 'submitted' && !!previousSubmission &&
        def.fields.some((field) => (previousSubmission[field.key] ?? '') !== (values[field.key] ?? ''));
      if (isCorrection && !correctionReason?.trim()) return false;
      const submittedValues = progress === 'submitted' ? { ...values } :
        form.submittedValues ?? (form.progress === 'submitted' ? { ...form.values } : undefined);

      set((s) => ({
        participants: s.participants.map((p) =>
          p.id !== participantId
            ? p
            : { ...p, forms: p.forms.map((f) => (f.formKey === formKey ? { ...f, values: { ...values }, progress, submittedValues } : f)) },
        ),
      }));

      const context = { projectId: participant.projectId, siteId: participant.siteId, participantId: participant.screeningNo, formTitle: def.label };
      for (const field of def.fields) {
        const from = (isCorrection ? previousSubmission : form.values)?.[field.key] ?? '';
        const to = values[field.key] ?? '';
        if (from === to) {continue;}
        recordAudit({
          ...context,
          page: AUDIT_PAGES.siteEcrfs,
          event: isCorrection ? `Corrected ${field.label}: ${correctionReason?.trim()}` : `Edited ${field.label}`,
          originalValue: from || AUDIT_NA,
          changedTo: to || AUDIT_NA,
        });
      }
      recordAudit({
        ...context,
        page: AUDIT_PAGES.siteEcrfs,
        event: `${progress === 'submitted' ? 'Submitted' : progress === 'softSubmitted' ? 'Soft submitted' : 'Draft saved'} form ${def.label} of participant ${participant.screeningNo}`,
        originalValue: form.progress,
        changedTo: progress === 'submitted' ? 'Submitted' : progress === 'softSubmitted' ? 'Soft submitted' : 'Draft',
      });
      return true;
    },

    lockForm: (participantId, formKey) => setLock(participantId, formKey, true),
    unlockForm: (participantId, formKey) => setLock(participantId, formKey, false),
  };
});
