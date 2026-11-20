import type { MasterItem } from '@/types';
import { createSrNoColumn, createStatusColumn, type DataGridColumn } from '@/components/data-grid';
import { MASTER_LABELS } from './masters.constants';

export const buildMasterColumns = (itemName: string): DataGridColumn<MasterItem>[] => [
  createSrNoColumn<MasterItem>(),
  { id: 'label', header: itemName, accessorKey: 'label', meta: { className: 'font-medium sm:min-w-32' } },
  { id: 'description', header: MASTER_LABELS.description, accessorKey: 'description', meta: { isTruncated: true, hideBelow: 'md' } },
  createStatusColumn<MasterItem>((i) => i.status, MASTER_LABELS.status),
];
