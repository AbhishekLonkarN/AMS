import type { Id, IsoDateTime, RecordStatus } from './common.types';
import type { PermissionKey } from './rbac.types';

export type AffiliationStatus = 'active' | 'deaffiliated';

interface AccessAssignment {
  designation: string;
  /** IANA zone, e.g. Asia/Kolkata. */
  timeZone: string;
  templateId: Id;
  permissions: PermissionKey[];
  /** True when permissions differ from the template's (assumption 4). */
  isCustomised: boolean;
}

/** Sponsor account ↔ project. Grants project-scope rights. */
export interface SponsorAffiliation extends AccessAssignment {
  id: Id;
  userId: Id;
  projectId: Id;
  status: AffiliationStatus;
  affiliatedAt: IsoDateTime;
  affiliatedBy?: Id;
  deaffiliatedAt?: IsoDateTime;
}

/** CO account ↔ site. Grants site-scope rights. */
export interface CoAffiliation extends SponsorAffiliation {
  siteId: Id;
}

/** Site user identity ↔ site. Grants site-scope rights. */
export interface SiteMembership extends AccessAssignment {
  id: Id;
  userId: Id;
  projectId: Id;
  siteId: Id;
  status: RecordStatus;
  createdAt: IsoDateTime;
  createdBy?: Id;
}
