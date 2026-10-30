import type { User } from '@/types';
import { createSrNoColumn, createStatusColumn, type DataGridColumn } from '@/components/data-grid';
import { USER_TYPE_LABELS } from '@/constants/user.constants';
import { fullName } from '@/utils/string.utils';
import { UI_KIT_LABELS } from './ui-kit.constants';

const C = UI_KIT_LABELS.columns;

export const UI_KIT_USER_COLUMNS: DataGridColumn<User>[] = [
  createSrNoColumn<User>(),
  { id: 'name', header: C.name, accessorFn: (u) => fullName(u.prefix, u.name) },
  { id: 'email', header: C.email, accessorKey: 'email' },
  {
    id: 'userType',
    header: C.userType,
    accessorFn: (u) => USER_TYPE_LABELS[u.userType],
    meta: { filterVariant: 'select' },
  },
  { id: 'organization', header: C.organization, accessorKey: 'organization', meta: { filterVariant: 'select' } },
  createStatusColumn<User>((u) => u.status),
];
