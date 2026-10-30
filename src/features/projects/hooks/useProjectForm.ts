import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Project } from '@/types';
import type { ProjectInput } from '@/store';
import { notify, useAccessRightsStore, useAffiliationsStore, useProjectsStore } from '@/store';
import { sanitizePermissions, useCurrentPrincipal } from '@/rbac';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { DEFAULT_TIME_ZONE } from '@/constants/time-zone.constants';
import { isSameText } from '@/utils/string.utils';
import { useMasterOptions } from '@/features/masters';
import { PROJECT_LABELS as L } from '../constants/projects.constants';
import { buildProjectSchema, type ProjectFormValues } from '../schemas/project.schema';
import { useAccountOptions } from './useAccountOptions';

export type FormMode = 'create' | 'edit';

const toFormValues = (p?: Project) =>
  ({
    name: p?.name ?? '',
    cipNo: p?.cipNo ?? '',
    testProduct: p?.testProduct ?? '',
    description: p?.description ?? '',
    sponsor: p?.sponsor ?? '',
    projectManagerId: p?.projectManagerId ?? '',
    croName: p?.croName ?? '',
    croProjectManagerId: p?.croProjectManagerId ?? '',
    croAssistantPmId: p?.croAssistantPmId ?? '',
    enrolmentTarget: p?.enrolmentTarget ?? '',
    sitesIdentified: p?.sitesIdentified ?? '',
    statusId: p?.statusId ?? '',
    logoFileName: p?.logoFileName,
  }) as unknown as ProjectFormValues;

const toInput = (v: ProjectFormValues): ProjectInput => ({
  ...v,
  name: v.name.trim(),
  croName: v.croName || undefined,
  croProjectManagerId: v.croProjectManagerId || undefined,
  croAssistantPmId: v.croAssistantPmId || undefined,
});

/** Create and Edit share this hook and one form view. */
export function useProjectForm(mode: FormMode) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const principal = useCurrentPrincipal();
  const projects = useProjectsStore((s) => s.projects);
  const addProject = useProjectsStore((s) => s.addProject);
  const updateProject = useProjectsStore((s) => s.updateProject);
  const affiliateSponsorUser = useAffiliationsStore((s) => s.affiliateSponsorUser);
  const templates = useAccessRightsStore((s) => s.templates);
  const project = projects.find((p) => p.id === projectId);

  const schema = useMemo(
    () => buildProjectSchema((name) => projects.some((p) => p.id !== project?.id && isSameText(p.name, name))),
    [projects, project?.id],
  );
  const form = useForm<ProjectFormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(project) });

  const options = {
    projectManagers: useAccountOptions('sponsor', project?.projectManagerId),
    croProjectManagers: useAccountOptions('co', project?.croProjectManagerId),
    croAssistantPms: useAccountOptions('co', project?.croAssistantPmId),
    statuses: useMasterOptions('projectStatus', project?.statusId),
  };

  /** Creator is auto-affiliated so the new project shows up in their list (prototype assumption). */
  const affiliateCreator = (newProjectId: string) => {
    const user = principal?.user;
    if (!user) return;
    const template = templates.find((t) => t.id === user.globalTemplateId);
    affiliateSponsorUser({
      userId: user.id,
      projectId: newProjectId,
      designation: template?.name ?? L.creatorDesignationFallback,
      timeZone: DEFAULT_TIME_ZONE,
      templateId: template?.id ?? '',
      permissions: template ? sanitizePermissions('sponsor', template.permissions, 'project') : [],
    });
  };

  const handleSubmit = form.handleSubmit((values) => {
    const input = toInput(values);
    if (mode === 'create') {
      const created = addProject(input);
      affiliateCreator(created.id);
      notify.success(L.created(created.name));
      navigate(paths.projectHub(created.id));
    } else if (project) {
      updateProject(project.id, input);
      notify.success(L.saved(input.name));
      navigate(paths.projectHub(project.id));
    }
  });

  return {
    isNotFound: mode === 'edit' && !project,
    title: mode === 'create' ? L.createTitle : L.editTitle,
    submitLabel: mode === 'create' ? L.submitCreate : L.submitEdit,
    backTo: project ? paths.projectHub(project.id) : ROUTES.projects,
    form,
    options,
    logoFileName: form.watch('logoFileName'),
    handleLogoChange: (name: string) => form.setValue('logoFileName', name, { shouldDirty: true }),
    handleSubmit,
  };
}

export type ProjectFormModel = ReturnType<typeof useProjectForm>;
