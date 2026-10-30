import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AccountType, ScopeType, UserType } from '@/types';
import type { SelectOption } from '@/components/form';
import type { AssignmentInput } from '@/store';
import { useUsersStore } from '@/store';
import { DEFAULT_TIME_ZONE } from '@/constants/time-zone.constants';
import { fullName } from '@/utils/string.utils';
import { AFFILIATION_LABELS as L } from '../constants/affiliation.constants';
import { affiliationSchema, type AffiliationFormValues } from '../schemas/affiliation.schema';
import { useAccessRightsField } from './useAccessRightsField';

export interface ExistingAffiliation extends AssignmentInput {
  userId: string;
}

interface AffiliationFormOptions {
  /** Which accounts can be searched (sponsor accounts for projects, CO accounts for sites). */
  accountType: AccountType;
  matrixUserType: UserType;
  scopeType?: ScopeType;
  /** Record being edited; omit to affiliate someone new. */
  existing?: ExistingAffiliation;
  /** Users already actively affiliated here (cannot be affiliated twice). */
  affiliatedUserIds: Set<string>;
  designations: readonly string[];
  onSubmit: (values: AffiliationFormValues, meta: { name: string }) => void;
}

/** Shared state/logic for Affiliate / Edit Sponsor user and Affiliate / Edit CO user. */
export function useAffiliationForm({
  accountType,
  matrixUserType,
  scopeType,
  existing,
  affiliatedUserIds,
  designations,
  onSubmit,
}: AffiliationFormOptions) {
  const users = useUsersStore((s) => s.users);

  const form = useForm<AffiliationFormValues>({
    resolver: zodResolver(affiliationSchema),
    defaultValues: {
      userId: existing?.userId ?? '',
      designation: existing?.designation ?? '',
      timeZone: existing?.timeZone ?? DEFAULT_TIME_ZONE,
      templateId: existing?.templateId ?? '',
      permissions: existing?.permissions ?? [],
    },
  });
  const accessRights = useAccessRightsField({ form, userType: matrixUserType, scopeType });

  // Email search: active accounts of the right type; already-affiliated ones shown disabled.
  const accountOptions: SelectOption[] = useMemo(
    () =>
      users
        .filter((u) => u.accountType === accountType && u.status === 'active')
        .map((u) => {
          const isTaken = affiliatedUserIds.has(u.id);
          return {
            value: u.id,
            label: u.email,
            description: `${fullName(u.prefix, u.name)} · ${u.organization}${isTaken ? ` · ${L.alreadyAffiliated}` : ''}`,
            isDisabled: isTaken,
          };
        }),
    [users, accountType, affiliatedUserIds],
  );

  const userId = form.watch('userId');
  const selectedUser = users.find((u) => u.id === userId);
  const designationOptions: SelectOption[] = designations.map((d) => ({ value: d, label: d }));

  const handleSubmit = form.handleSubmit((values) =>
    onSubmit(values, { name: selectedUser ? fullName(selectedUser.prefix, selectedUser.name) : '' }),
  );

  return {
    isEdit: !!existing,
    form,
    accessRights,
    accountOptions,
    selectedUser,
    designationOptions,
    handleSubmit,
  };
}

export type AffiliationFormModel = ReturnType<typeof useAffiliationForm>;
