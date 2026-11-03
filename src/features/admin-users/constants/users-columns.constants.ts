import type { User } from '@/types';
import { createSrNoColumn, createStatusColumn, type DataGridColumn } from '@/components/data-grid';
import { fullName } from '@/utils/string.utils';
import { USERS_COLUMN_LABELS as C, USERS_TYPE_LABELS } from './users-list.constants';

export const USERS_COLUMNS: DataGridColumn<User>[] = [
  createSrNoColumn<User>(),
  { id: 'name', header: C.name, accessorFn: (u) => fullName(u.prefix, u.name) },
  { id: 'email', header: C.email, accessorKey: 'email' },
  {
    id: 'type',
    header: C.type,
    accessorFn: (u) => (u.userType === 'site' ? '' : USERS_TYPE_LABELS[u.userType]),
    meta: { filterVariant: 'select' },
  },
  { id: 'organization', header: C.organization, accessorKey: 'organization', meta: { filterVariant: 'select' } },
  createStatusColumn<User>((u) => u.status, C.status),
];
