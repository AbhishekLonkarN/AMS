import { isEnrolled } from '@/utils/participant.utils';
import { useParams } from 'react-router-dom';
import { useParticipantsStore, useProjectsStore, useSitesStore, useUsersStore } from '@/store';
import { usePermission } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { useHubTiles } from '@/features/shell';
import { useMasterLabel } from '@/features/masters';
import { useExportProjectDatabase } from '@/features/project-export';
import { userNameById, type DetailField } from '@/features/user-common';
import { PROJECT_FIELDS as F, PROJECT_LABELS as L } from '../constants/projects.constants';

/** Project hub: summary card + permission-gated module tiles. */
export function useProjectHub() {
  const { projectId } = useParams();
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId));
  const sites = useSitesStore((s) => s.sites);
  const users = useUsersStore((s) => s.users);
  const participants = useParticipantsStore((state) => state.participants);
  const masterLabel = useMasterLabel();
  const tiles = useHubTiles('project');
  const canEdit = usePermission('project.edit');
  const canExport = usePermission('projectDatabase.export');
  const { exportProject } = useExportProjectDatabase();

  if (!project) {return null;}

  const projectSites = sites.filter((s) => s.projectId === project.id);
  const enrolled = participants.filter((participant) => participant.projectId === project.id && isEnrolled(participant)).length;
  const croTeam = [project.croName, userNameById(users, project.croProjectManagerId), userNameById(users, project.croAssistantPmId)]
    .filter(Boolean)
    .join(' · ');

  const facts: DetailField[] = [
    { label: F.cipNo, value: project.cipNo },
    { label: F.testProduct, value: project.testProduct },
    { label: F.productGroupId, value: masterLabel(project.productGroupId) },
    { label: F.studyType, value: project.studyType },
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
    onExport: canExport ? () => exportProject(project) : undefined,
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
