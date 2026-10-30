import type { AccessRightsTemplate, ActionKey, ModuleKey, PermissionKey, UserType } from '@/types';
import { getAllPermissions, parsePermissionKey, sanitizePermissions, toPermissionKey } from '@/rbac/permission.utils';

/*
 * Default access-rights templates (brief §4.5). Defaults chosen for the demo:
 *
 * IT Admin (admin)                      – everything in the admin matrix.
 * Head-Sponsor (sponsor)                – everything in the sponsor matrix.
 * Project Manager-Sponsor (sponsor)     – runs projects: masters view-only, eCRF template new/edit/view,
 *                                         project new/edit/view, full user/site management, queries,
 *                                         eTMF, contacts, settings, exports; no master delete, no locks.
 * QA Auditor (sponsor)                  – view + export on every module, nothing else.
 * Data Manager (sponsor)                – views everywhere; eCRF design (template + project eCRF);
 *                                         queries new/edit; eCRF + database lock; all exports.
 * Assistant Project Manager-CO (co)     – everything in the CO matrix.
 * CRA (co)                              – monitoring: site users new/edit/view, eCRFs view/lock,
 *                                         queries new/edit/view + export, eTMF view (site docs new/edit),
 *                                         contacts view.
 * Investigator (site)                   – everything in the site matrix.
 * CRC (site)                            – as Investigator but cannot edit Site Contacts.
 */

type Spec = Partial<Record<ModuleKey, ActionKey[]>>;

const fromSpec = (userType: UserType, spec: Spec): PermissionKey[] =>
  sanitizePermissions(
    userType,
    Object.entries(spec).flatMap(([module, actions]) =>
      (actions ?? []).map((a) => toPermissionKey(module as ModuleKey, a)),
    ),
  );

const withActions = (userType: UserType, actions: ActionKey[]) =>
  getAllPermissions(userType).filter((k) => actions.includes(parsePermissionKey(k).action));

const CREATED_AT = '2026-09-01T09:00:00.000Z';
const CREATED_BY = 'usr-jpatel';

const template = (
  id: string,
  name: string,
  userType: UserType,
  permissions: PermissionKey[],
  createdBy = CREATED_BY,
): AccessRightsTemplate => ({ id, name, userType, permissions, status: 'active', createdBy, createdAt: CREATED_AT });

export const ACCESS_RIGHTS_TEMPLATES_SEED: AccessRightsTemplate[] = [
  template('tpl-it-admin', 'IT Admin', 'admin', getAllPermissions('admin'), 'usr-abcd'),

  template('tpl-head-sponsor', 'Head-Sponsor', 'sponsor', getAllPermissions('sponsor')),

  template(
    'tpl-pm-sponsor',
    'Project Manager-Sponsor',
    'sponsor',
    fromSpec('sponsor', {
      masterProductGroup: ['view'],
      masterProjectStatus: ['view'],
      masterDefaultAccessRights: ['view'],
      masterSiteStatus: ['view'],
      masterParticipantStatus: ['view'],
      ecrfTemplate: ['new', 'edit', 'view'],
      project: ['new', 'edit', 'view'],
      projectEcrf: ['new', 'edit', 'affiliate', 'view'],
      sponsorUserManagement: ['new', 'edit', 'affiliate', 'view'],
      investigatorSite: ['new', 'edit', 'view'],
      coUserManagement: ['new', 'edit', 'affiliate', 'view'],
      siteUserManagement: ['new', 'edit', 'view', 'export'],
      siteEcrfs: ['view', 'export'],
      siteEcrfQuery: ['new', 'edit', 'view'],
      siteQueriesAll: ['export'],
      etmfProject: ['new', 'edit', 'view'],
      etmfSite: ['new', 'edit', 'view'],
      projectQueriesAll: ['export'],
      selectiveParticipantData: ['export'],
      projectDatabase: ['export'],
      supportContacts: ['new', 'edit', 'view'],
      siteContacts: ['view'],
      settings: ['edit', 'view'],
      auditTrail: ['view', 'export'],
    }),
  ),

  template('tpl-qa-auditor', 'QA Auditor', 'sponsor', withActions('sponsor', ['view', 'export'])),

  template(
    'tpl-data-manager',
    'Data Manager',
    'sponsor',
    [
      ...withActions('sponsor', ['view', 'export']),
      ...fromSpec('sponsor', {
        ecrfTemplate: ['new', 'edit'],
        projectEcrf: ['new', 'edit'],
        siteEcrfQuery: ['new', 'edit'],
        siteEcrfs: ['lock'],
        projectDatabase: ['lock'],
      }),
    ],
  ),

  template('tpl-apm-co', 'Assistant Project Manager-CO', 'co', getAllPermissions('co')),

  template(
    'tpl-cra',
    'CRA',
    'co',
    fromSpec('co', {
      siteUserManagement: ['new', 'edit', 'view'],
      siteEcrfs: ['view', 'lock'],
      siteEcrfQuery: ['new', 'edit', 'view'],
      siteQueriesAll: ['export'],
      etmfProject: ['view'],
      etmfSite: ['new', 'edit', 'view'],
      supportContacts: ['view'],
      siteContacts: ['view'],
    }),
  ),

  template('tpl-investigator', 'Investigator', 'site', getAllPermissions('site')),

  template(
    'tpl-crc',
    'CRC',
    'site',
    fromSpec('site', {
      siteEcrfs: ['new', 'edit', 'view', 'draftSave', 'submit'],
      siteEcrfQuery: ['view', 'respond'],
      etmfProject: ['view'],
      etmfSite: ['new', 'edit', 'view'],
      supportContacts: ['view'],
      siteContacts: ['view'],
    }),
  ),
];

export const templatePermissions = (templateId: string): PermissionKey[] =>
  ACCESS_RIGHTS_TEMPLATES_SEED.find((t) => t.id === templateId)?.permissions ?? [];
