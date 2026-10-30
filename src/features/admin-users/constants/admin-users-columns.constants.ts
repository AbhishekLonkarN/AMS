import type { User } from '@/types';
import { createSrNoColumn, createStatusColumn, type DataGridColumn } from '@/components/data-grid';
import { fullName } from '@/utils/string.utils';
import { ADMIN_USER_COLUMN_LABELS as C } from './admin-users.constants';

export const ADMIN_USER_COLUMNS: DataGridColumn<User>[] = [
  createSrNoColumn<User>(),
  { id: 'name', header: C.name, accessorFn: (u) => fullName(u.prefix, u.name) },
  { id: 'email', header: C.email, accessorKey: 'email' },
  createStatusColumn<User>((u) => u.status, C.status),
];
