import type { User } from '@/types';
import { sanitizePermissions } from '@/rbac/permission.utils';
import { templatePermissions } from './access-rights.seed';

const CREATED_AT = '2026-09-01T09:00:00.000Z';

const adminRights = () => templatePermissions('tpl-it-admin');
/** Global part of a sponsor template (modules 1–7 + audit trail). */
const sponsorGlobal = (templateId: string) =>
  sanitizePermissions('sponsor', templatePermissions(templateId), 'global');

/** One user per user type; more can be created from the app. */
export const USERS_SEED: User[] = [
  // ---- AMS IT Admin ----
  {
    id: 'usr-abcd',
    prefix: 'Mr.',
    name: 'Abcd Pqrs',
    email: 'abcd.pqrs@amsltd.com',
    organization: 'AMS Ltd.',
    status: 'active',
    userType: 'admin',
    globalGrant: adminRights(),
    globalTemplateId: 'tpl-it-admin',
    isGlobalCustomised: false,
    createdAt: CREATED_AT,
  },

  // ---- Sponsor account ----
  {
    id: 'usr-jpatel',
    prefix: 'Dr.',
    name: 'Jignesh Patel',
    email: 'dr.jpatel@amsltd.com',
    organization: 'AMS Ltd.',
    status: 'active',
    userType: 'sponsor',
    accountType: 'sponsor',
    globalGrant: sponsorGlobal('tpl-head-sponsor'),
    globalTemplateId: 'tpl-head-sponsor',
    isGlobalCustomised: false,
    createdAt: CREATED_AT,
    createdBy: 'usr-abcd',
  },

  // ---- CO account (no global rights; access comes from site affiliations) ----
  {
    id: 'usr-amartin',
    prefix: 'Ms.',
    name: 'Anaïs Martin',
    email: 'anais.martin@cerc.fr',
    organization: 'CERC France',
    status: 'active',
    userType: 'co',
    accountType: 'co',
    createdAt: CREATED_AT,
    createdBy: 'usr-abcd',
  },

  // ---- Site user identity (rights come from SiteMemberships) ----
  {
    id: 'usr-pchevalier',
    prefix: 'Dr.',
    name: 'Philippe Chevalier',
    email: 'pchevalier@louisehospital.com',
    organization: 'Louis Pradel CV Hospital',
    status: 'active',
    userType: 'site',
    createdAt: CREATED_AT,
    createdBy: 'usr-jpatel',
  },
];
