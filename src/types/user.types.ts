import type { Id, IsoDateTime, RecordStatus } from './common.types';
import type { PermissionKey, UserType } from './rbac.types';

export type AccountType = 'sponsor' | 'co';

/**
 * A login identity. Admin, sponsor and CO accounts are created by an Admin.
 * Site users are created per site; the same email at several sites is one
 * identity with several SiteMemberships (assumption 5).
 */
export interface User {
  id: Id;
  prefix: string;
  name: string;
  email: string;
  organization: string;
  status: RecordStatus;
  userType: UserType;
  /** Sponsor/CO accounts only (assumption 1). */
  accountType?: AccountType;
  /** Admin rights, or sponsor global rights (modules 1–7 + audit trail, assumption 2). */
  globalGrant?: PermissionKey[];
  globalTemplateId?: Id;
  isGlobalCustomised?: boolean;
  createdAt: IsoDateTime;
  createdBy?: Id;
}
