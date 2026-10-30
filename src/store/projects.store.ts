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

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'createdBy'>;

interface ProjectsState {
  projects: Project[];
  addProject: (input: ProjectInput) => Project;
  updateProject: (id: Id, input: ProjectInput) => void;
}

const userName = (id?: Id) => useUsersStore.getState().users.find((u) => u.id === id)?.name ?? '—';
const masterLabel = (id?: Id) => useMastersStore.getState().items.find((i) => i.id === id)?.label ?? '—';

const PROJECT_AUDIT_FIELDS: AuditField<Project>[] = [
  { key: 'name', label: 'Project Name' },
  { key: 'cipNo', label: 'CIP No.' },
  { key: 'testProduct', label: 'Test Product' },
  { key: 'description', label: 'Project Description' },
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'projectManagerId', label: 'Project Manager', format: userName },
  { key: 'croName', label: 'CRO Name' },
  { key: 'croProjectManagerId', label: 'CRO Project Manager', format: userName },
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

  updateProject: (id, input) => {
    const before = get().projects.find((p) => p.id === id);
    if (!before) return;
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
