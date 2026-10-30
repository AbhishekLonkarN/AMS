import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import type { MasterKey, PermissionKey } from '@/types';
import { MASTER_KEYS, MASTER_META } from '@/constants/master.constants';
import { RequirePermission } from '@/rbac';
import { NotFoundPage } from '@/features/shell';

interface RequireMasterKeyProps {
  children: ReactNode;
}

/** `/masters/:masterKey` — the key must be a known master and the user needs its view right. */
export function RequireMasterKey({ children }: RequireMasterKeyProps) {
  const { masterKey } = useParams();
  if (!MASTER_KEYS.includes(masterKey as MasterKey)) return <NotFoundPage />;

  const permission = `${MASTER_META[masterKey as MasterKey].permissionModule}.view` as PermissionKey;
  return <RequirePermission permission={permission}>{children}</RequirePermission>;
}
