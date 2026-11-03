import { useParams } from 'react-router-dom';
import { useProjectsStore, useSitesStore, useUsersStore } from '@/store';
import { usePermission } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { useHubTiles } from '@/features/shell';
import { useMasterLabel } from '@/features/masters';
import { userNameById, type DetailField } from '@/features/user-common';
import { PROJECT_FIELDS as F, PROJECT_LABELS as L } from '../constants/projects.constants';

/** Project hub: summary card + permission-gated module tiles. */
export function useProjectHub() {
  const { projectId } = useParams();
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId));
  const sites = useSitesStore((s) => s.sites);
  const users = useUsersStore((s) => s.users);
  const masterLabel = useMasterLabel();
  const tiles = useHubTiles('project');
  const canEdit = usePermission('project.edit');

  if (!project) return null;

  const projectSites = sites.filter((s) => s.projectId === project.id);
  const enrolled = projectSites.reduce((sum, s) => sum + s.actualRecruitment, 0);
  const croTeam = [project.croName, userNameById(users, project.croProjectManagerId), userNameById(users, project.croAssistantPmId)]
    .filter(Boolean)
    .join(' · ');

  const facts: DetailField[] = [
    { label: F.cipNo, value: project.cipNo },
    { label: F.testProduct, value: project.testProduct },
    { label: F.sponsor, value: project.sponsor },
    { label: F.projectManagerId, value: userNameById(users, project.projectManagerId) },
    { label: F.croName, value: croTeam },
    { label: L.sites, value: L.sitesValue(projectSites.length, project.sitesIdentified) },
  ];

  return {
    id: project.id,
    title: project.name,
    description: project.description,
    status: masterLabel(project.statusId),
    editTo: canEdit ? paths.projectEdit(project.id) : undefined,
    facts,
    progress: {
      label: L.enrolment,
      valueText: L.enrolmentValue(enrolled, project.enrolmentTarget),
      value: enrolled,
      max: project.enrolmentTarget,
    },
    tiles,
  };
}

export type ProjectHubModel = NonNullable<ReturnType<typeof useProjectHub>>;
