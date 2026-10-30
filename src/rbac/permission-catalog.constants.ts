import type { ActionKey, MatrixDefinition, ModuleDefinition, ModuleKey, ScopeType, UserType } from '@/types';

/**
 * Single source of truth for the RBAC matrices (brief §4.2). The matrix editor
 * and every permission check read from here. "–" cells are simply actions not
 * listed for a module.
 */

export const ACTION_KEYS = [
  'new',
  'edit',
  'affiliate',
  'view',
  'delete',
  'export',
  'lock',
  'draftSave',
  'submit',
  'respond',
] as const;

export const ACTION_LABELS: Record<ActionKey, string> = {
  new: 'New',
  edit: 'Edit',
  affiliate: 'Affiliate',
  view: 'View',
  delete: 'Delete',
  export: 'Export',
  lock: 'Lock/Unlock',
  draftSave: 'Draft Save',
  submit: 'Submit',
  respond: 'Respond',
};

export const MODULE_LABELS = {
  // Admin
  companyProfile: 'Software & Owner Company Profile',
  adminUser: 'Admin User',
  sponsorCoUser: 'Sponsor and CO User',
  cloudSettings: 'Cloud Settings',
  // Shared
  projectDatabase: 'Project Database',
  auditTrail: 'Audit Trail',
  // Sponsor
  masterProductGroup: 'Master-Product Group',
  masterProjectStatus: 'Master-Project Status',
  masterDefaultAccessRights: 'Master-Default Access Rights',
  masterSiteStatus: 'Master-Site Status',
  masterParticipantStatus: "Master-Participant's Status",
  ecrfTemplate: 'eCRF Template',
  project: 'Project',
  projectEcrf: 'eCRF of Project',
  sponsorUserManagement: 'Sponsor User Management',
  investigatorSite: 'Investigator and Site',
  coUserManagement: 'CO User Management',
  siteUserManagement: 'Site User Management',
  siteEcrfs: 'eCRFs of Site',
  siteEcrfQuery: 'Query on eCRFs of Site',
  siteQueriesAll: 'All queries of a site for a project',
  etmfProject: 'eTMF Documents-Project',
  etmfSite: 'eTMF Documents-Site',
  projectQueriesAll: 'All Queries on eCRFs of Project',
  selectiveParticipantData: 'Selective participant data',
  supportContacts: 'Project and CO/CRO Contacts for Support',
  siteContacts: 'Site Contacts',
  settings: 'Settings',
} as const;

const mod = (key: ModuleKey, actions: ActionKey[], scope: ScopeType, label?: string): ModuleDefinition => ({
  key,
  actions,
  scope,
  label,
});

const SPONSOR_ACTIONS: ActionKey[] = ['new', 'edit', 'affiliate', 'view', 'delete', 'export', 'lock'];

export const PERMISSION_CATALOG: Record<UserType, MatrixDefinition> = {
  admin: {
    userType: 'admin',
    actions: ['new', 'edit', 'view', 'export'],
    modules: [
      mod('companyProfile', ['edit', 'view'], 'global'),
      mod('adminUser', ['new', 'edit', 'view'], 'global'),
      mod('sponsorCoUser', ['new', 'edit', 'view'], 'global'),
      mod('projectDatabase', ['export'], 'global'),
      mod('cloudSettings', ['new', 'edit', 'view'], 'global'),
      mod('auditTrail', ['view', 'export'], 'global'),
    ],
  },

  // Modules 1–7 and Audit Trail are global (assumption 2); 8–23 are per project.
  sponsor: {
    userType: 'sponsor',
    actions: SPONSOR_ACTIONS,
    modules: [
      mod('masterProductGroup', ['new', 'edit', 'view'], 'global'),
      mod('masterProjectStatus', ['new', 'edit', 'view', 'delete'], 'global'),
      mod('masterDefaultAccessRights', ['new', 'edit', 'view', 'delete'], 'global'),
      mod('masterSiteStatus', ['new', 'edit', 'view', 'delete'], 'global'),
      mod('masterParticipantStatus', ['new', 'edit', 'view', 'delete'], 'global'),
      mod('ecrfTemplate', ['new', 'edit', 'view', 'delete'], 'global'),
      mod('project', ['new', 'edit', 'view'], 'global'),
      mod('projectEcrf', ['new', 'edit', 'affiliate', 'view'], 'project'),
      mod('sponsorUserManagement', ['new', 'edit', 'affiliate', 'view'], 'project'),
      mod('investigatorSite', ['new', 'edit', 'view'], 'project'),
      mod('coUserManagement', ['new', 'edit', 'affiliate', 'view'], 'project'),
      mod('siteUserManagement', ['new', 'edit', 'view', 'export'], 'project'),
      mod('siteEcrfs', ['view', 'export', 'lock'], 'project'),
      mod('siteEcrfQuery', ['new', 'edit', 'view'], 'project'),
      mod('siteQueriesAll', ['export'], 'project'),
      mod('etmfProject', ['new', 'edit', 'view', 'delete'], 'project'),
      mod('etmfSite', ['new', 'edit', 'view', 'delete'], 'project'),
      mod('projectQueriesAll', ['export'], 'project'),
      mod('selectiveParticipantData', ['export'], 'project'),
      mod('projectDatabase', ['export', 'lock'], 'project'),
      mod('supportContacts', ['new', 'edit', 'view', 'delete'], 'project'),
      mod('siteContacts', ['view'], 'project'),
      mod('settings', ['edit', 'view'], 'project'),
      mod('auditTrail', ['view', 'export'], 'global'),
    ],
  },

  co: {
    userType: 'co',
    actions: SPONSOR_ACTIONS,
    modules: [
      mod('siteUserManagement', ['new', 'edit', 'view', 'export'], 'site'),
      mod('siteEcrfs', ['view', 'export', 'lock'], 'site'),
      mod('siteEcrfQuery', ['new', 'edit', 'view'], 'site'),
      mod('siteQueriesAll', ['export'], 'site'),
      mod('etmfProject', ['new', 'edit', 'view', 'delete'], 'site'),
      mod('etmfSite', ['new', 'edit', 'view', 'delete'], 'site'),
      mod('supportContacts', ['new', 'edit', 'view', 'delete'], 'site'),
      mod('siteContacts', ['view'], 'site'),
    ],
  },

  site: {
    userType: 'site',
    actions: ['new', 'edit', 'view', 'draftSave', 'submit', 'respond'],
    modules: [
      mod('siteEcrfs', ['new', 'edit', 'view', 'draftSave', 'submit'], 'site'),
      mod('siteEcrfQuery', ['view', 'respond'], 'site'),
      mod('etmfProject', ['view'], 'site'),
      mod('etmfSite', ['new', 'edit', 'view'], 'site'),
      mod('supportContacts', ['view'], 'site', 'Project Contacts for Support'),
      mod('siteContacts', ['new', 'edit', 'view'], 'site'),
    ],
  },
};
