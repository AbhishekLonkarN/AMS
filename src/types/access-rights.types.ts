import type { Id, IsoDateTime, RecordStatus } from './common.types';
import type { PermissionKey, UserType } from './rbac.types';

/** Master – Default Access Rights. Typed by user type (assumption 3). */
export interface AccessRightsTemplate {
  id: Id;
  name: string;
  userType: UserType;
  permissions: PermissionKey[];
  status: RecordStatus;
  createdBy: Id;
  createdAt: IsoDateTime;
}

/** A Default Access Rights set as the backend returns it (Masters › Default Access Rights). */
export interface AccessRightsSet {
  id: Id;
  name: string;
  userType: UserType;
  permissions: PermissionKey[];
  status: RecordStatus;
  createdByName: string;
  createdAt: IsoDateTime;
}

export type AccessRightsSetInput = Pick<AccessRightsSet, 'name' | 'userType' | 'permissions' | 'status'>;
