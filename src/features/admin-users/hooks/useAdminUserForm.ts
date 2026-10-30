import { useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from '@/types';
import { notify, useCompanyProfileStore, useSessionStore, useUsersStore } from '@/store';
import { fullName } from '@/utils/string.utils';
import {
  DETAILS_TAB_FIELDS,
  USER_ACTION_LABELS,
  useAccessRightsField,
  useEmailUniqueness,
} from '@/features/user-common';
import { ADMIN_USERS_LABELS as L } from '../constants/admin-users.constants';
import { buildAdminUserSchema, type AdminUserFormValues } from '../schemas/admin-user.schema';

export type FormMode = 'create' | 'edit';
export type AdminUserFormTab = 'details' | 'access';

interface AdminUserFormOptions {
  mode: FormMode;
  userId?: string;
  /** Called after a successful save (closes the drawer). */
  onDone: () => void;
}

const toFormValues = (user: User | undefined, defaultOrganization: string): AdminUserFormValues => ({
  prefix: user?.prefix ?? '',
  name: user?.name ?? '',
  email: user?.email ?? '',
  organization: user?.organization ?? defaultOrganization,
  status: user?.status ?? 'active',
  templateId: user?.globalTemplateId ?? '',
  permissions: user?.globalGrant ?? [],
});

/** Create and Edit share this hook and one drawer form view. */
export function useAdminUserForm({ mode, userId, onDone }: AdminUserFormOptions) {
  const user = useUsersStore((s) => s.users.find((u) => u.id === userId && u.userType === 'admin'));
  const addUser = useUsersStore((s) => s.addUser);
  const updateUser = useUsersStore((s) => s.updateUser);
  const currentUserId = useSessionStore((s) => s.currentUserId);
  const ownerName = useCompanyProfileStore((s) => s.profile.ownerDisplayName);
  const formId = useId();
  const [activeTab, setActiveTab] = useState<AdminUserFormTab>('details');

  const isEmailTaken = useEmailUniqueness(user?.id);
  const schema = useMemo(() => buildAdminUserSchema(isEmailTaken), [isEmailTaken]);
  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(user, ownerName),
  });
  const accessRights = useAccessRightsField({ form, userType: 'admin' });

  const handleSubmit = form.handleSubmit(
    (values) => {
      const { templateId, permissions, ...identity } = values;
      const payload = {
        ...identity,
        globalGrant: permissions,
        globalTemplateId: templateId || undefined,
        isGlobalCustomised: accessRights.isCustomised,
      };
      const name = fullName(identity.prefix, identity.name);
      if (mode === 'create') {
        addUser({ ...payload, userType: 'admin' });
        notify.success(USER_ACTION_LABELS.created(name));
      } else if (user) {
        updateUser(user.id, payload);
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
    activeTab,
    setActiveTab,
    isStatusLocked: !!user && user.id === currentUserId,
    handleSubmit,
  };
}

export type AdminUserFormModel = ReturnType<typeof useAdminUserForm>;
