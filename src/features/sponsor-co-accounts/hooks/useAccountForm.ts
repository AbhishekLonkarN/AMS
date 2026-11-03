import { useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AccountType, User } from '@/types';
import { notify, useAffiliationsStore, useUsersStore } from '@/store';
import { fullName } from '@/utils/string.utils';
import {
  DETAILS_TAB_FIELDS,
  USER_ACTION_LABELS,
  useAccessRightsField,
  useEmailUniqueness,
} from '@/features/user-common';
import { ACCOUNTS_LABELS as L } from '../constants/accounts.constants';
import { buildAccountSchema, type AccountFormValues } from '../schemas/account.schema';

export type FormMode = 'create' | 'edit';
export type AccountFormTab = 'details' | 'access';

interface AccountFormOptions {
  mode: FormMode;
  userId?: string;
  onDone: () => void;
}

const toFormValues = (user?: User, presetType?: AccountType): AccountFormValues => ({
  prefix: user?.prefix ?? '',
  name: user?.name ?? '',
  email: user?.email ?? '',
  organization: user?.organization ?? '',
  status: user?.status ?? 'active',
  accountType: user?.accountType ?? presetType ?? 'sponsor',
  templateId: user?.globalTemplateId ?? '',
  permissions: user?.globalGrant ?? [],
});

const isAccount = (u: User) => u.userType === 'sponsor' || u.userType === 'co';

/** Create and Edit share this hook and one drawer form view. */
export function useAccountForm({ mode, userId, onDone }: AccountFormOptions) {
  const user = useUsersStore((s) => s.users.find((u) => u.id === userId && isAccount(u)));
  const addUser = useUsersStore((s) => s.addUser);
  const updateUser = useUsersStore((s) => s.updateUser);
  const hasAffiliations = useAffiliationsStore(
    (s) =>
      !!user &&
      [...s.sponsorAffiliations, ...s.coAffiliations].some((a) => a.userId === user.id && a.status === 'active'),
  );
  const formId = useId();
  // The Create User menu opens this form with ?type=sponsor or ?type=co.
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const presetType: AccountType | undefined = typeParam === 'co' || typeParam === 'sponsor' ? typeParam : undefined;
  const [selectedTab, setActiveTab] = useState<AccountFormTab>('details');

  const isEmailTaken = useEmailUniqueness(user?.id);
  const schema = useMemo(() => buildAccountSchema(isEmailTaken), [isEmailTaken]);
  const form = useForm<AccountFormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(user, presetType) });
  const accessRights = useAccessRightsField({ form, userType: 'sponsor', scopeType: 'global' });
  const accountType = form.watch('accountType') as AccountType;
  const isSponsor = accountType === 'sponsor';

  const handleSubmit = form.handleSubmit(
    (values) => {
      const { templateId, permissions, accountType: type, ...identity } = values;
      const isSponsorAccount = type === 'sponsor';
      const payload = {
        ...identity,
        accountType: type,
        // CO accounts carry no global rights (assumption 2).
        globalGrant: isSponsorAccount ? permissions : [],
        globalTemplateId: isSponsorAccount ? templateId || undefined : undefined,
        isGlobalCustomised: isSponsorAccount ? accessRights.isCustomised : false,
      };
      const name = fullName(identity.prefix, identity.name);
      if (mode === 'create') {
        addUser({ ...payload, userType: type });
        notify.success(USER_ACTION_LABELS.created(name));
      } else if (user) {
        updateUser(user.id, { ...payload, userType: type });
        notify.success(USER_ACTION_LABELS.saved(name));
      }
      onDone();
    },
    // Show the tab that holds the first error.
    (errors) => setActiveTab(DETAILS_TAB_FIELDS.some((f) => f in errors) ? 'details' : 'access'),
  );

  return {
    isNotFound: mode === 'edit' && !user,
    title: mode === 'create' ? L.createTitle : L.editTitle,
    subtitle: mode === 'edit' ? user?.email : L.createDescription,
    submitLabel: mode === 'create' ? L.submitCreate : L.submitEdit,
    formId,
    form,
    accessRights,
    accountType,
    isSponsor,
    // CO accounts have no access-rights tab.
    activeTab: isSponsor ? selectedTab : ('details' as AccountFormTab),
    setActiveTab,
    isAccountTypeLocked: hasAffiliations,
    handleSubmit,
  };
}

export type AccountFormModel = ReturnType<typeof useAccountForm>;
