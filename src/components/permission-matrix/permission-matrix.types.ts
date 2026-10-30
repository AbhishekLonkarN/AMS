import type { MatrixDefinition, PermissionKey, ScopeType } from '@/types';

export interface PermissionMatrixProps {
  /** Matrix shape from the permission catalog (admin / sponsor / co / site). */
  matrix: MatrixDefinition;
  value: PermissionKey[];
  onChange?: (next: PermissionKey[]) => void;
  isReadOnly?: boolean;
  /** Show only modules of these scope types (e.g. sponsor global vs project rights). */
  scopeTypes?: ScopeType[];
  /** Template baseline → "customised" indicator and per-cell change markers. */
  templatePermissions?: PermissionKey[];
  templateName?: string;
  onResetToTemplate?: () => void;
  title?: string;
}
