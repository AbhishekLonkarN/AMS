import { closeoutReadiness } from '@/features/project-workflows/closeout.utils';
import { useParticipantsStore } from './participants.store';
import { useQueriesStore } from './queries.store';
import type { Id, Project } from '@/types';
import { PROJECTS_SEED } from '@/data/projects.seed';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { createAppStore } from './store.config';
import { recordAudit, recordFieldChanges, type AuditField } from './audit.store';
import { useSessionStore } from './session.store';
import { useUsersStore } from './users.store';
import { useMastersStore } from './masters.store';
import { useProductGroupsStore } from './product-groups.store';

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'createdBy' | 'ecrf' | 'databaseLock'>;

interface ProjectsState {
  projects: Project[];
  addProject: (input: ProjectInput) => Project;
  updateProject: (id: Id, input: ProjectInput) => void;
  saveEcrf: (id: Id, config: NonNullable<Project['ecrf']>['config'], sourceTemplateId?: Id, publish?: boolean) => boolean;
  setDatabaseLock: (id: Id, locked: boolean, reason: string) => boolean;
}

const userName = (id?: Id) => useUsersStore.getState().users.find((u) => u.id === id)?.name ?? '—';
const masterLabel = (id?: Id) => (useMastersStore.getState().items.find((item) => item.id === id) ?? useProductGroupsStore.getState().groups.find((item) => item.id === id))?.label ?? '—';

const PROJECT_AUDIT_FIELDS: AuditField<Project>[] = [
  { key: 'name', label: 'Project Name' },
  { key: 'cipNo', label: 'CIP No.' },
  { key: 'testProduct', label: 'Test Product' },
  { key: 'productGroupId', label: 'Product Group', format: masterLabel },
  { key: 'studyType', label: 'Study Type' },
  { key: 'description', label: 'Project Description' },
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'projectManagerId', label: 'Project Manager', format: userName },
  { key: 'croName', label: 'CRO Name' },
  { key: 'croProjectManagerId', label: 'CRO Project Manager 1', format: userName },
  { key: 'croAssistantPmId', label: 'CRO Assistant Project Manager', format: userName },
  { key: 'enrolmentTarget', label: 'Total Enrolment Target' },
  { key: 'sitesIdentified', label: 'Sites Identified' },
  { key: 'statusId', label: 'Project Status', format: masterLabel },
];

export const useProjectsStore = createAppStore<ProjectsState>('projects', (set, get) => ({
  projects: PROJECTS_SEED,

  addProject: (input) => {
    const project: Project = {
      ...input,
      id: createId('prj'),
      createdAt: nowIso(),
      createdBy: useSessionStore.getState().currentUserId ?? undefined,
    };
    set((s) => ({ projects: [...s.projects, project] }));
    recordAudit({
      page: AUDIT_PAGES.projects,
      event: `Created project ${project.name}`,
      changedTo: project.name,
      projectId: project.id,
    });
    return project;
  },

  saveEcrf: (id, config, sourceTemplateId, publish = false) => {
    const project = get().projects.find((item) => item.id === id);
    if (!project || project.databaseLock || project.ecrf?.publishedAt) {return false;}
    const ecrf = { config: structuredClone(config), sourceTemplateId, publishedAt: publish ? nowIso() : undefined };
    set((state) => ({ projects: state.projects.map((item) => item.id === id ? { ...item, ecrf } : item) }));
    recordAudit({
      page: AUDIT_PAGES.projects, projectId: id,
      event: publish ? 'Published project eCRF' : 'Saved project eCRF draft',
      changedTo: publish ? 'Published v1' : 'Draft',
    });
    return true;
  },

  setDatabaseLock: (id, locked, reason) => {
    const project = get().projects.find((item) => item.id === id);
    const byUserId = useSessionStore.getState().currentUserId;
    const comment = reason.trim();
    if (!project || !byUserId || !comment || !!project.databaseLock === locked) {return false;}
    if (locked && closeoutReadiness(id, useParticipantsStore.getState().participants, useQueriesStore.getState().queries).blocked) {return false;}
    const databaseLock = locked ? { at: nowIso(), byUserId, reason: comment } : undefined;
    set((state) => ({ projects: state.projects.map((item) => item.id === id ? { ...item, databaseLock } : item) }));
    recordAudit({
      page: AUDIT_PAGES.projects, projectId: id,
      event: `${locked ? 'Locked' : 'Unlocked'} project database: ${comment}`,
      originalValue: locked ? 'Open' : 'Locked', changedTo: locked ? 'Locked' : 'Open',
    });
    return true;
  },

  updateProject: (id, input) => {
    const before = get().projects.find((p) => p.id === id);
    if (!before) {return;}
    const after = { ...before, ...input };
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? after : p)) }));
    recordFieldChanges({
      page: AUDIT_PAGES.projects,
      subject: `project ${before.name}`,
      before,
      after,
      fields: PROJECT_AUDIT_FIELDS,
      context: { projectId: id },
    });
  },
}));
