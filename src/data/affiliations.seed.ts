import type { CoAffiliation, SiteMembership, SponsorAffiliation } from '@/types';
import { sanitizePermissions } from '@/rbac/permission.utils';
import { templatePermissions } from './access-rights.seed';

const AT = '2026-09-15T09:00:00.000Z';

/** Project part of a sponsor template (modules 8–23). */
const sponsorProject = (templateId: string) =>
  sanitizePermissions('sponsor', templatePermissions(templateId), 'project');

const sponsor = (
  id: string,
  userId: string,
  projectId: string,
  designation: string,
  templateId: string,
  extra: Partial<SponsorAffiliation> = {},
): SponsorAffiliation => ({
  id,
  userId,
  projectId,
  designation,
  timeZone: 'Asia/Kolkata',
  templateId,
  permissions: sponsorProject(templateId),
  isCustomised: false,
  status: 'active',
  affiliatedAt: AT,
  affiliatedBy: 'usr-jpatel',
  ...extra,
});

export const SPONSOR_AFFILIATIONS_SEED: SponsorAffiliation[] = [
  sponsor('saf-jpatel-restore', 'usr-jpatel', 'prj-restore', 'Head-Sponsor', 'tpl-head-sponsor'),
  sponsor('saf-jpatel-abcd', 'usr-jpatel', 'prj-abcd', 'Head-Sponsor', 'tpl-head-sponsor'),
  sponsor('saf-jpatel-pqrs', 'usr-jpatel', 'prj-pqrs', 'Head-Sponsor', 'tpl-head-sponsor'),
];

const co = (
  id: string,
  userId: string,
  projectId: string,
  siteId: string,
  designation: string,
  templateId: string,
  extra: Partial<CoAffiliation> = {},
): CoAffiliation => ({
  id,
  userId,
  projectId,
  siteId,
  designation,
  timeZone: 'Asia/Kolkata',
  templateId,
  permissions: templatePermissions(templateId),
  isCustomised: false,
  status: 'active',
  affiliatedAt: AT,
  affiliatedBy: 'usr-jpatel',
  ...extra,
});

export const CO_AFFILIATIONS_SEED: CoAffiliation[] = [
  co('caf-amartin-fr006', 'usr-amartin', 'prj-restore', 'site-restore-fr006', 'CRA-CO', 'tpl-cra', {
    timeZone: 'Europe/Paris',
  }),
];

const member = (
  id: string,
  userId: string,
  projectId: string,
  siteId: string,
  designation: string,
  templateId: string,
  extra: Partial<SiteMembership> = {},
): SiteMembership => ({
  id,
  userId,
  projectId,
  siteId,
  designation,
  timeZone: 'Europe/Paris',
  templateId,
  permissions: templatePermissions(templateId),
  isCustomised: false,
  status: 'active',
  createdAt: AT,
  createdBy: 'usr-jpatel',
  ...extra,
});

export const SITE_MEMBERSHIPS_SEED: SiteMembership[] = [
  member('smb-pchevalier-fr006', 'usr-pchevalier', 'prj-restore', 'site-restore-fr006', 'Investigator', 'tpl-investigator'),
];
