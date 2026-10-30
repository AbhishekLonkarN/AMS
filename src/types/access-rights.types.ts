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
