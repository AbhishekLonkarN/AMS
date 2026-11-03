import type { ReactNode } from 'react';
import type { MatrixDefinition, PermissionKey, ScopeType } from '@/types';

/** One label / value row in a View drawer. */
export interface DetailField {
  label: string;
  value: ReactNode;
}

/** Effective rights shown read-only in a View drawer. */
export interface DetailMatrix {
  title?: string;
  matrix: MatrixDefinition;
  scopeTypes?: ScopeType[];
  permissions: PermissionKey[];
  templatePermissions?: PermissionKey[];
  templateName?: string;
}
