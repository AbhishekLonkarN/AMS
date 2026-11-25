import { linkedSiteIsActive } from '@/features/sponsor-sites/site-registry.store';
import type { DataQuery, Id, Participant } from '@/types';
import { QUERIES_SEED } from '@/data/participants.seed';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { clinicalForms } from '@/features/project-workflows/project-ecrf.utils';
import { useProjectsStore } from './projects.store';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { createAppStore } from './store.config';
import { recordAudit } from './audit.store';
import { useSessionStore } from './session.store';
import { useParticipantsStore } from './participants.store';

export interface RaiseQueryInput {
  participantId: Id;
  formKey: string;
  fieldKey: string;
  text: string;
}

interface QueriesState {
  queries: DataQuery[];
  /** Raises a query against one data field; it starts as "Not read" and is visible to site users. */
  raiseQuery: (input: RaiseQueryInput) => DataQuery | null;
  /** Marks a responded query as resolved (sponsor and CO users only). */
  resolveQuery: (id: Id) => boolean;
  /** A site user opened a "Not read" query, so it becomes "Read". */
  markQueryRead: (id: Id) => void;
  /** A site user answers an open query; it becomes "Responded" until the monitor resolves it. */
  respondQuery: (id: Id, response: string) => boolean;
}

const definitionOf = (participant: Participant | undefined, formKey: string) =>
  clinicalForms(participant?.ecrfDesign).find((definition) => definition.key === formKey);
const fieldLabel = (participant: Participant | undefined, formKey: string, fieldKey: string) =>
  definitionOf(participant, formKey)?.fields.find((f) => f.key === fieldKey)?.label ?? fieldKey;
const projectLocked = (id: Id) => !!useProjectsStore.getState().projects.find((project) => project.id === id)?.databaseLock;
const queryLocked = (query: DataQuery) => !linkedSiteIsActive(query.siteId) || projectLocked(query.projectId) ||
  !!useParticipantsStore.getState().participants.find((p) => p.id === query.participantId)?.forms.find((f) => f.formKey === query.formKey)?.lock;

export const useQueriesStore = createAppStore<QueriesState>('queries', (set, get) => ({
  queries: QUERIES_SEED,

  raiseQuery: (input) => {
    const participant = useParticipantsStore.getState().participants.find((p) => p.id === input.participantId);
    const userId = useSessionStore.getState().currentUserId;
    const form = participant?.forms.find((item) => item.formKey === input.formKey);
    if (!participant || !linkedSiteIsActive(participant.siteId) || !userId || !input.text.trim() || projectLocked(participant.projectId) ||
        !form || (form.progress !== 'submitted' && !form.submittedValues) || form.lock ||
        !definitionOf(participant, input.formKey)?.fields.some((field) => field.key === input.fieldKey) ||
        get().queries.some((query) => query.participantId === input.participantId && query.formKey === input.formKey &&
          query.fieldKey === input.fieldKey && query.status !== 'resolved')) return null;

    const query: DataQuery = {
      id: createId('qry'),
      projectId: participant.projectId,
      siteId: participant.siteId,
      participantId: participant.id,
      formKey: input.formKey,
      fieldKey: input.fieldKey,
      text: input.text.trim(),
      status: 'notRead',
      raisedBy: userId,
      raisedAt: nowIso(),
    };
    set((s) => ({ queries: [query, ...s.queries] }));
    recordAudit({
      page: AUDIT_PAGES.siteQueries,
      event: `Raised query on ${fieldLabel(participant, input.formKey, input.fieldKey)}`,
      changedTo: query.text,
      siteId: participant.siteId,
      participantId: participant.screeningNo,
      projectId: participant?.projectId,
      formTitle: definitionOf(participant, input.formKey)?.label,
    });
    return query;
  },

  markQueryRead: (id) => {
    const query = get().queries.find((q) => q.id === id);
    if (!query || query.status !== 'notRead' || queryLocked(query)) {return;}
    set((s) => ({ queries: s.queries.map((q) => (q.id === id ? { ...q, status: 'read' as const } : q)) }));
  },

  respondQuery: (id, response) => {
    const query = get().queries.find((q) => q.id === id);
    const userId = useSessionStore.getState().currentUserId;
    const text = response.trim();
    if (!query || !userId || !text || queryLocked(query) || (query.status !== 'notRead' && query.status !== 'read')) {return false;}

    set((s) => ({
      queries: s.queries.map((q) =>
        q.id === id ? { ...q, status: 'responded' as const, response: text, respondedBy: userId, respondedAt: nowIso() } : q,
      ),
    }));
    const participant = useParticipantsStore.getState().participants.find((p) => p.id === query.participantId);
    recordAudit({
      page: AUDIT_PAGES.siteQueries,
      event: `Responded to query on ${fieldLabel(participant, query.formKey, query.fieldKey)}`,
      originalValue: query.status === 'read' ? 'Read' : 'Not read',
      changedTo: text,
      siteId: query.siteId,
      participantId: participant?.screeningNo,
      projectId: participant?.projectId,
      formTitle: definitionOf(participant, query.formKey)?.label,
    });
    return true;
  },

  resolveQuery: (id) => {
    const query = get().queries.find((q) => q.id === id);
    const userId = useSessionStore.getState().currentUserId;
    if (!query || query.status !== 'responded' || !userId || queryLocked(query)) return false;

    set((s) => ({
      queries: s.queries.map((q) => (q.id === id ? { ...q, status: 'resolved', resolvedBy: userId, resolvedAt: nowIso() } : q)),
    }));
    const participant = useParticipantsStore.getState().participants.find((p) => p.id === query.participantId);
    recordAudit({
      page: AUDIT_PAGES.siteQueries,
      event: `Resolved query on ${fieldLabel(participant, query.formKey, query.fieldKey)}`,
      originalValue: 'Responded',
      changedTo: 'Resolved',
      siteId: query.siteId,
      participantId: participant?.screeningNo,
      projectId: participant?.projectId,
      formTitle: definitionOf(participant, query.formKey)?.label,
    });
    return true;
  },
}));
