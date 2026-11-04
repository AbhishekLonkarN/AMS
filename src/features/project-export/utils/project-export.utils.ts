import type { Project, Site } from '@/types';
import type { CsvCell } from '@/utils/download.utils';
import { formatDate } from '@/utils/date.utils';
import { PROJECT_FIELDS as F } from '@/features/projects';
import { PROJECT_EXPORT_SECTIONS as S } from '../constants/project-export.constants';

interface ExportLookups {
  statusLabel: (id?: string) => string;
  userName: (id?: string) => string;
}

/** One project's database: its details, then its sites. Rows for a CSV file. */
export function projectDatabaseRows(project: Project, sites: Site[], { statusLabel, userName }: ExportLookups): CsvCell[][] {
  return [
    [S.project],
    [F.name, project.name],
    [F.cipNo, project.cipNo],
    [F.testProduct, project.testProduct],
    [F.description, project.description],
    [F.sponsor, project.sponsor],
    [F.projectManagerId, userName(project.projectManagerId)],
    [F.croName, project.croName ?? ''],
    [F.croProjectManagerId, userName(project.croProjectManagerId)],
    [F.croAssistantPmId, userName(project.croAssistantPmId)],
    [F.enrolmentTarget, project.enrolmentTarget],
    [F.sitesIdentified, project.sitesIdentified],
    [F.statusId, statusLabel(project.statusId)],
    ['Created on', formatDate(project.createdAt)],
    [],
    [S.sites],
    ['Site ID', 'Site Name', 'Investigator', 'Investigator Email', 'Location', 'Expected Recruitment', 'Actual Recruitment', 'Site Status'],
    ...sites.map((s) => [
      s.siteCode,
      s.siteName,
      s.investigatorName,
      s.investigatorEmail,
      s.location,
      s.expectedRecruitment,
      s.actualRecruitment,
      statusLabel(s.statusId),
    ]),
  ];
}

/** "RESTORE_database_2026-11-03.csv": safe to save on any system. */
export const projectExportFilename = (projectName: string, extension = 'csv') =>
  `${projectName.replace(/[^\w.-]+/g, '_')}_database_${new Date().toISOString().slice(0, 10)}.${extension}`;
