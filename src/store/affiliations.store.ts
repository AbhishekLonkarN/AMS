import type { CoAffiliation, Id, PermissionKey, RecordStatus, SiteMembership, SponsorAffiliation, UserType } from '@/types';
import {
  CO_AFFILIATIONS_SEED,
  SITE_MEMBERSHIPS_SEED,
  SPONSOR_AFFILIATIONS_SEED,
} from '@/data/affiliations.seed';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { TIME_ZONE_OPTIONS } from '@/constants/time-zone.constants';
import { isSamePermissionSet, sanitizePermissions } from '@/rbac/permission.utils';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { createAppStore } from './store.config';
import { statusText } from '@/utils/status.utils';
import { recordAudit, recordFieldChanges, recordPermissionChange, type AuditField } from './audit.store';
import { useSessionStore } from './session.store';
import { useUsersStore } from './users.store';
import { useAccessRightsStore } from './access-rights.store';

export interface AssignmentInput {
  designation: string;
  timeZone: string;
  templateId: Id;
  permissions: PermissionKey[];
}

export interface SponsorAffiliationInput extends AssignmentInput {
  userId: Id;
  projectId: Id;
}

export interface CoAffiliationInput extends SponsorAffiliationInput {
  siteId: Id;
}

export interface SiteMembershipInput extends CoAffiliationInput {
  status: RecordStatus;
}

interface AffiliationsState {
  sponsorAffiliations: SponsorAffiliation[];
  coAffiliations: CoAffiliation[];
  siteMemberships: SiteMembership[];

  affiliateSponsorUser: (input: SponsorAffiliationInput) => SponsorAffiliation;
  updateSponsorAffiliation: (id: Id, input: AssignmentInput) => void;
  deaffiliateSponsorUser: (id: Id) => void;

  affiliateCoUser: (input: CoAffiliationInput) => CoAffiliation;
  updateCoAffiliation: (id: Id, input: AssignmentInput) => void;
  deaffiliateCoUser: (id: Id) => void;

  addSiteMembership: (input: SiteMembershipInput) => SiteMembership;
  updateSiteMembership: (id: Id, input: AssignmentInput & { status: RecordStatus }) => void;
  setSiteMembershipStatus: (id: Id, status: RecordStatus) => void;
}

// ---- helpers ----

const actorId = () => useSessionStore.getState().currentUserId ?? undefined;
const emailOf = (userId: Id) => useUsersStore.getState().users.find((u) => u.id === userId)?.email ?? userId;
const templateName = (id?: Id) => useAccessRightsStore.getState().templates.find((t) => t.id === id)?.name ?? '—';
const timeZoneLabel = (tz?: string) => TIME_ZONE_OPTIONS.find((o) => o.value === tz)?.label ?? tz ?? '—';

/** Permissions the template would give in this context (sponsor affiliations get the project part only). */
function templatePermissionsFor(userType: UserType, templateId: Id): PermissionKey[] {
  const template = useAccessRightsStore.getState().templates.find((t) => t.id === templateId);
  if (!template) return [];
  return sanitizePermissions(userType, template.permissions, userType === 'sponsor' ? 'project' : undefined);
}

const isCustomised = (userType: UserType, input: AssignmentInput) =>
  !isSamePermissionSet(templatePermissionsFor(userType, input.templateId), input.permissions);

const ASSIGNMENT_AUDIT_FIELDS: AuditField<AssignmentInput & { status?: string }>[] = [
  { key: 'designation', label: 'Designation' },
  { key: 'timeZone', label: 'Time-zone', format: timeZoneLabel },
  { key: 'templateId', label: 'Default Access Rights Set', format: templateName },
  { key: 'status', label: 'Status', format: (v) => (v ? statusText(v) : '—') },
];

export const useAffiliationsStore = createAppStore<AffiliationsState>('affiliations', (set, get) => ({
  sponsorAffiliations: SPONSOR_AFFILIATIONS_SEED,
  coAffiliations: CO_AFFILIATIONS_SEED,
  siteMemberships: SITE_MEMBERSHIPS_SEED,

  // ---------------- Sponsor ↔ project ----------------
  affiliateSponsorUser: (input) => {
    const affiliation: SponsorAffiliation = {
      ...input,
      id: createId('saf'),
      isCustomised: isCustomised('sponsor', input),
      status: 'active',
      affiliatedAt: nowIso(),
      affiliatedBy: actorId(),
    };
    set((s) => ({ sponsorAffiliations: [...s.sponsorAffiliations, affiliation] }));
    const email = emailOf(input.userId);
    const context = { projectId: input.projectId };
    recordAudit({ ...context, page: AUDIT_PAGES.sponsorUsers, event: `Affiliated user ${email}`, changedTo: input.designation });
    recordPermissionChange({ page: AUDIT_PAGES.sponsorUsers, subject: email, before: [], after: input.permissions, context });
    return affiliation;
  },

  updateSponsorAffiliation: (id, input) => {
    const before = get().sponsorAffiliations.find((a) => a.id === id);
    if (!before) return;
    const after: SponsorAffiliation = { ...before, ...input, isCustomised: isCustomised('sponsor', input) };
    set((s) => ({ sponsorAffiliations: s.sponsorAffiliations.map((a) => (a.id === id ? after : a)) }));
    const email = emailOf(before.userId);
    const context = { projectId: before.projectId };
    const page = AUDIT_PAGES.sponsorUsers;
    recordFieldChanges({ page, subject: `user ${email}`, before, after, fields: ASSIGNMENT_AUDIT_FIELDS, context });
    recordPermissionChange({ page, subject: email, before: before.permissions, after: after.permissions, context });
  },

  deaffiliateSponsorUser: (id) => {
    const affiliation = get().sponsorAffiliations.find((a) => a.id === id);
    if (!affiliation || affiliation.status !== 'active') return;
    set((s) => ({
      sponsorAffiliations: s.sponsorAffiliations.map((a) =>
        a.id === id ? { ...a, status: 'deaffiliated', deaffiliatedAt: nowIso() } : a,
      ),
    }));
    recordAudit({
      projectId: affiliation.projectId,
      page: AUDIT_PAGES.sponsorUsers,
      event: `Deaffiliated user ${emailOf(affiliation.userId)}`,
      originalValue: 'Affiliated',
      changedTo: 'Deaffiliated',
    });
  },

  // ---------------- CO ↔ site ----------------
  affiliateCoUser: (input) => {
    const affiliation: CoAffiliation = {
      ...input,
      id: createId('caf'),
      isCustomised: isCustomised('co', input),
      status: 'active',
      affiliatedAt: nowIso(),
      affiliatedBy: actorId(),
    };
    set((s) => ({ coAffiliations: [...s.coAffiliations, affiliation] }));
    const email = emailOf(input.userId);
    const context = { siteId: input.siteId };
    recordAudit({ ...context, page: AUDIT_PAGES.coUsers, event: `Affiliated user ${email}`, changedTo: input.designation });
    recordPermissionChange({ page: AUDIT_PAGES.coUsers, subject: email, before: [], after: input.permissions, context });
    return affiliation;
  },

  updateCoAffiliation: (id, input) => {
    const before = get().coAffiliations.find((a) => a.id === id);
    if (!before) return;
    const after: CoAffiliation = { ...before, ...input, isCustomised: isCustomised('co', input) };
    set((s) => ({ coAffiliations: s.coAffiliations.map((a) => (a.id === id ? after : a)) }));
    const email = emailOf(before.userId);
    const context = { siteId: before.siteId };
    const page = AUDIT_PAGES.coUsers;
    recordFieldChanges({ page, subject: `user ${email}`, before, after, fields: ASSIGNMENT_AUDIT_FIELDS, context });
    recordPermissionChange({ page, subject: email, before: before.permissions, after: after.permissions, context });
  },

  deaffiliateCoUser: (id) => {
    const affiliation = get().coAffiliations.find((a) => a.id === id);
    if (!affiliation || affiliation.status !== 'active') return;
    set((s) => ({
      coAffiliations: s.coAffiliations.map((a) =>
        a.id === id ? { ...a, status: 'deaffiliated', deaffiliatedAt: nowIso() } : a,
      ),
    }));
    recordAudit({
      siteId: affiliation.siteId,
      page: AUDIT_PAGES.coUsers,
      event: `Deaffiliated user ${emailOf(affiliation.userId)}`,
      originalValue: 'Affiliated',
      changedTo: 'Deaffiliated',
    });
  },

  // ---------------- Site user ↔ site ----------------
  addSiteMembership: (input) => {
    const membership: SiteMembership = {
      ...input,
      id: createId('smb'),
      isCustomised: isCustomised('site', input),
      createdAt: nowIso(),
      createdBy: actorId(),
    };
    set((s) => ({ siteMemberships: [...s.siteMemberships, membership] }));
    const email = emailOf(input.userId);
    const context = { siteId: input.siteId };
    recordAudit({ ...context, page: AUDIT_PAGES.siteUsers, event: `Created site user ${email}`, changedTo: input.designation });
    recordPermissionChange({ page: AUDIT_PAGES.siteUsers, subject: email, before: [], after: input.permissions, context });
    return membership;
  },

  updateSiteMembership: (id, input) => {
    const before = get().siteMemberships.find((m) => m.id === id);
    if (!before) return;
    const after: SiteMembership = { ...before, ...input, isCustomised: isCustomised('site', input) };
    set((s) => ({ siteMemberships: s.siteMemberships.map((m) => (m.id === id ? after : m)) }));
    const email = emailOf(before.userId);
    const context = { siteId: before.siteId };
    const page = AUDIT_PAGES.siteUsers;
    recordFieldChanges({ page, subject: `site user ${email}`, before, after, fields: ASSIGNMENT_AUDIT_FIELDS, context });
    recordPermissionChange({ page, subject: email, before: before.permissions, after: after.permissions, context });
  },

  setSiteMembershipStatus: (id, status) => {
    const membership = get().siteMemberships.find((m) => m.id === id);
    if (!membership || membership.status === status) return;
    set((s) => ({ siteMemberships: s.siteMemberships.map((m) => (m.id === id ? { ...m, status } : m)) }));
    recordAudit({
      siteId: membership.siteId,
      page: AUDIT_PAGES.siteUsers,
      event: `${status === 'active' ? 'Re-activated' : 'Deactivated'} site user ${emailOf(membership.userId)}`,
      originalValue: statusText(membership.status),
      changedTo: statusText(status),
    });
  },
}));
