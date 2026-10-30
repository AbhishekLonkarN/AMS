import { useCallback, useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { PermissionKey, ScopeType, UserType } from '@/types';
import type { SelectOption } from '@/components/form';
import { useAccessRightsStore } from '@/store';
import { PERMISSION_CATALOG, isSamePermissionSet, sanitizePermissions } from '@/rbac';
import { RECORD_STATUS_LABELS } from '@/constants/user.constants';

interface AccessRightsFieldOptions {
  /** A form with `templateId: string` and `permissions: PermissionKey[]` fields. */
  form: UseFormReturn<any>;
  userType: UserType;
  /** Limit to one part of the matrix (sponsor `global` vs `project`). */
  scopeType?: ScopeType;
}

/**
 * Template select + matrix editing (assumption 4): choosing a template prefills
 * the matrix; boxes can then be ticked/unticked; "customised" = differs from it.
 * Inactive templates are hidden from the dropdown unless already selected.
 */
export function useAccessRightsField({ form, userType, scopeType }: AccessRightsFieldOptions) {
  const templates = useAccessRightsStore((s) => s.templates);
  const templateId: string = form.watch('templateId') ?? '';
  const permissions: PermissionKey[] = form.watch('permissions') ?? [];

  const templateSlice = useCallback(
    (id: string) => {
      const template = templates.find((t) => t.id === id);
      return template ? sanitizePermissions(userType, template.permissions, scopeType) : undefined;
    },
    [templates, userType, scopeType],
  );

  const templateOptions: SelectOption[] = useMemo(
    () =>
      templates
        .filter((t) => t.userType === userType && (t.status === 'active' || t.id === templateId))
        .map((t) => ({
          value: t.id,
          label: t.status === 'active' ? t.name : `${t.name} (${RECORD_STATUS_LABELS.inactive})`,
        })),
    [templates, userType, templateId],
  );

  const template = templates.find((t) => t.id === templateId);
  const templatePermissions = templateId ? templateSlice(templateId) : undefined;
  const isCustomised = !!templatePermissions && !isSamePermissionSet(templatePermissions, permissions);

  const handleTemplateChange = (id: string) => {
    form.setValue('templateId', id, { shouldDirty: true, shouldValidate: true });
    const slice = templateSlice(id);
    if (slice) form.setValue('permissions', slice, { shouldDirty: true });
  };

  const handlePermissionsChange = (next: PermissionKey[]) =>
    form.setValue('permissions', next, { shouldDirty: true });

  const handleReset = () => {
    if (templatePermissions) form.setValue('permissions', templatePermissions, { shouldDirty: true });
  };

  return {
    matrix: PERMISSION_CATALOG[userType],
    scopeTypes: scopeType ? [scopeType] : undefined,
    templateOptions,
    templateId,
    templateName: template?.name,
    templatePermissions,
    permissions,
    isCustomised,
    templateError: form.formState.errors.templateId?.message as string | undefined,
    handleTemplateChange,
    handlePermissionsChange,
    handleReset,
  };
}

export type AccessRightsFieldModel = ReturnType<typeof useAccessRightsField>;
