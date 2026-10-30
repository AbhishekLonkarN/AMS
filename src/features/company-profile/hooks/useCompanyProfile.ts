import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SelectOption } from '@/components/form';
import { notify, useCompanyProfileStore, useUsersStore } from '@/store';
import { usePermission } from '@/rbac';
import { ROUTES } from '@/app/router/route-paths.constants';
import { isSameText } from '@/utils/string.utils';
import { COMPANY_PROFILE_LABELS as L } from '../constants/company-profile.constants';
import { companyProfileSchema, type CompanyProfileFormValues } from '../schemas/company-profile.schema';

/** Read-only by default; users with Edit rights switch to the form with the Edit button. */
export function useCompanyProfile() {
  const profile = useCompanyProfileStore((s) => s.profile);
  const updateProfile = useCompanyProfileStore((s) => s.updateProfile);
  const users = useUsersStore((s) => s.users);
  const canEdit = usePermission('companyProfile.edit');
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: profile,
  });

  // IT Admin is picked from active admin users; the name follows the selection.
  const adminOptions: SelectOption[] = useMemo(
    () =>
      users
        .filter((u) => u.userType === 'admin' && (u.status === 'active' || isSameText(u.email, profile.itAdminUserId)))
        .map((u) => ({ value: u.email, label: `${u.email} — ${u.name}` })),
    [users, profile.itAdminUserId],
  );

  const handleAdminChange = (email: string) => {
    form.setValue('itAdminUserId', email, { shouldDirty: true, shouldValidate: true });
    const admin = users.find((u) => isSameText(u.email, email));
    form.setValue('itAdminName', admin?.name ?? '', { shouldDirty: true, shouldValidate: true });
  };

  const handleSubmit = form.handleSubmit((values) => {
    updateProfile(values);
    form.reset(values);
    setIsEditing(false);
    notify.success(L.saved);
  });

  // Always start editing from the saved profile; Cancel drops unsaved changes.
  const handleEdit = () => {
    form.reset(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.reset(profile);
    setIsEditing(false);
  };

  return {
    profile,
    isEditing: canEdit && isEditing,
    onEdit: canEdit ? handleEdit : undefined,
    handleCancel,
    backTo: ROUTES.adminHome,
    form,
    adminOptions,
    logoFileName: form.watch('logoFileName'),
    itAdminUserId: form.watch('itAdminUserId'),
    handleLogoChange: (name: string) => form.setValue('logoFileName', name, { shouldDirty: true }),
    handleAdminChange,
    handleSubmit,
  };
}

export type CompanyProfileModel = ReturnType<typeof useCompanyProfile>;
