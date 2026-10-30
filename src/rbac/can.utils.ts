import type {
  CoAffiliation,
  Grant,
  PermissionKey,
  Principal,
  Scope,
  SiteMembership,
  SponsorAffiliation,
  User,
} from '@/types';

export interface GrantSources {
  sponsorAffiliations: SponsorAffiliation[];
  coAffiliations: CoAffiliation[];
  siteMemberships: SiteMembership[];
}

/**
 * Effective grants of a user. Inactive users and ended affiliations/memberships
 * contribute nothing, so deaffiliation takes effect immediately.
 */
export function buildGrants(user: User, sources: GrantSources): Grant[] {
  if (user.status !== 'active') return [];

  switch (user.userType) {
    case 'admin':
      return [{ scope: { type: 'global' }, permissions: user.globalGrant ?? [] }];
    case 'sponsor':
      return [
        { scope: { type: 'global' }, permissions: user.globalGrant ?? [] },
        ...sources.sponsorAffiliations
          .filter((a) => a.userId === user.id && a.status === 'active')
          .map<Grant>((a) => ({ scope: { type: 'project', projectId: a.projectId }, permissions: a.permissions })),
      ];
    case 'co':
      return sources.coAffiliations
        .filter((a) => a.userId === user.id && a.status === 'active')
        .map<Grant>((a) => ({
          scope: { type: 'site', projectId: a.projectId, siteId: a.siteId },
          permissions: a.permissions,
        }));
    case 'site':
      return sources.siteMemberships
        .filter((m) => m.userId === user.id && m.status === 'active')
        .map<Grant>((m) => ({
          scope: { type: 'site', projectId: m.projectId, siteId: m.siteId },
          permissions: m.permissions,
        }));
    default:
      return [];
  }
}

/**
 * Does a grant's scope cover the requested scope?
 * - no requested scope  → "anywhere" (used for nav/tile visibility)
 * - global request      → global grants only
 * - project request     → global, that project, or any site inside that project
 * - site request        → global, the site's project, or that site
 */
export function scopeCovers(grant: Scope, requested?: Scope): boolean {
  if (!requested) return true;
  if (grant.type === 'global') return true;

  switch (requested.type) {
    case 'global':
      return false;
    case 'project':
      return grant.projectId === requested.projectId;
    case 'site':
      if (grant.type === 'project') return grant.projectId === requested.projectId;
      return grant.siteId === requested.siteId;
  }
}

/** Pure permission check. An array means "any of". */
export function can(
  principal: Principal | null | undefined,
  permission: PermissionKey | PermissionKey[],
  scope?: Scope,
): boolean {
  if (!principal || principal.user.status !== 'active') return false;
  const wanted = Array.isArray(permission) ? permission : [permission];

  return principal.grants.some(
    (grant) => scopeCovers(grant.scope, scope) && wanted.some((p) => grant.permissions.includes(p)),
  );
}
