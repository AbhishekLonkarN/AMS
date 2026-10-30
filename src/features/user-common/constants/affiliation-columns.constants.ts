import type { StatusKind } from '@/components/feedback';
import { createSrNoColumn, createStatusColumn, type DataGridColumn } from '@/components/data-grid';

/** One row of a Sponsor / CO / Site user list. */
export interface AffiliationRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  organization: string;
  designation: string;
  statusKind: StatusKind;
}

export const AFFILIATION_COLUMN_LABELS = {
  name: 'Name',
  email: 'Email ID',
  designation: 'Designation',
  organization: 'Organization',
  status: 'User Status',
} as const;

const C = AFFILIATION_COLUMN_LABELS;

export function buildAffiliationColumns({ hasOrganization }: { hasOrganization: boolean }): DataGridColumn<AffiliationRow>[] {
  return [
    createSrNoColumn<AffiliationRow>(),
    { id: 'name', header: C.name, accessorKey: 'name', meta: { className: 'font-medium' } },
    { id: 'email', header: C.email, accessorKey: 'email' },
    { id: 'designation', header: C.designation, accessorKey: 'designation', meta: { filterVariant: 'select' } },
    ...(hasOrganization
      ? [{ id: 'organization', header: C.organization, accessorKey: 'organization', meta: { filterVariant: 'select' } } as const]
      : []),
    createStatusColumn<AffiliationRow>((r) => r.statusKind, C.status),
  ] as DataGridColumn<AffiliationRow>[];
}
