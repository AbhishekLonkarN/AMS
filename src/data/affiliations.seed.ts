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
  sponsor('saf-kbhatt-restore', 'usr-kbhatt', 'prj-restore', 'Project Manager-Sponsor', 'tpl-pm-sponsor'),
  sponsor('saf-kbhatt-pqrs', 'usr-kbhatt', 'prj-pqrs', 'Project Manager-Sponsor', 'tpl-pm-sponsor'),
  sponsor('saf-akulkarni-restore', 'usr-akulkarni', 'prj-restore', 'QA Auditor', 'tpl-qa-auditor'),
  sponsor('saf-akulkarni-abcd', 'usr-akulkarni', 'prj-abcd', 'Project Manager-Sponsor', 'tpl-pm-sponsor'),
  sponsor('saf-vpatel-xyz', 'usr-vpatel', 'prj-xyz', 'CRA-Sponsor', 'tpl-data-manager', {
    timeZone: 'Europe/Paris',
  }),
  sponsor('saf-pasari-restore', 'usr-pasari', 'prj-restore', 'Head-Sponsor', 'tpl-head-sponsor', {
    status: 'deaffiliated',
    deaffiliatedAt: '2026-10-01T09:00:00.000Z',
  }),
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
  co('caf-priya-fr006', 'usr-priya', 'prj-restore', 'site-restore-fr006', 'Project Manager-CO', 'tpl-apm-co'),
  co('caf-priya-in001', 'usr-priya', 'prj-restore', 'site-restore-in001', 'Project Manager-CO', 'tpl-apm-co'),
  co('caf-neha-in001', 'usr-neha', 'prj-restore', 'site-restore-in001', 'Assistant Project Manager-CO', 'tpl-apm-co'),
  co('caf-neha-in002', 'usr-neha', 'prj-restore', 'site-restore-in002', 'Assistant Project Manager-CO', 'tpl-apm-co'),
  co('caf-akale-in003', 'usr-akale', 'prj-restore', 'site-restore-in003', 'CRA-CO', 'tpl-cra'),
  co('caf-asha-fr006', 'usr-asha', 'prj-restore', 'site-restore-fr006', 'CRA-CO', 'tpl-cra', {
    status: 'deaffiliated',
    deaffiliatedAt: '2026-10-01T09:00:00.000Z',
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
  member('smb-dyna-fr006', 'usr-dyna', 'prj-restore', 'site-restore-fr006', 'CRC', 'tpl-crc'),
  member('smb-dyna-abcd-fr001', 'usr-dyna', 'prj-abcd', 'site-abcd-fr001', 'CRC', 'tpl-crc'),
  member('smb-maria-fr006', 'usr-maria', 'prj-restore', 'site-restore-fr006', 'CRC', 'tpl-crc'),
];
