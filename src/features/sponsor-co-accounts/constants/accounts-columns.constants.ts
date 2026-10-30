import type { User } from '@/types';
import { createSrNoColumn, createStatusColumn, type DataGridColumn } from '@/components/data-grid';
import { ACCOUNT_TYPE_LABELS } from '@/constants/user.constants';
import { fullName } from '@/utils/string.utils';
import { ACCOUNT_COLUMN_LABELS as C } from './accounts.constants';

export const ACCOUNT_COLUMNS: DataGridColumn<User>[] = [
  createSrNoColumn<User>(),
  { id: 'name', header: C.name, accessorFn: (u) => fullName(u.prefix, u.name) },
  { id: 'email', header: C.email, accessorKey: 'email' },
  {
    id: 'accountType',
    header: C.accountType,
    accessorFn: (u) => (u.accountType ? ACCOUNT_TYPE_LABELS[u.accountType] : ''),
    meta: { filterVariant: 'select' },
  },
  { id: 'organization', header: C.organization, accessorKey: 'organization', meta: { filterVariant: 'select' } },
  createStatusColumn<User>((u) => u.status, C.status),
];
