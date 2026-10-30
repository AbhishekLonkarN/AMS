import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AccessRightsTemplate, PermissionKey, UserType } from '@/types';
import { notify, useAccessRightsStore } from '@/store';
import { PERMISSION_CATALOG } from '@/rbac';
import { ROUTES } from '@/app/router/route-paths.constants';
import { USER_TYPE_LABELS } from '@/constants/user.constants';
import { isSameText } from '@/utils/string.utils';
import { ACCESS_RIGHTS_LABELS as L } from '../constants/access-rights.constants';
import { buildTemplateSchema, type TemplateFormValues } from '../schemas/access-rights-template.schema';
import { useTemplateUsage } from './useTemplateUsage';

export type FormMode = 'create' | 'edit';

const toFormValues = (t?: AccessRightsTemplate) =>
  ({
    name: t?.name ?? '',
    userType: t?.userType ?? '',
    status: t?.status ?? 'active',
    permissions: t?.permissions ?? [],
  }) as unknown as TemplateFormValues;

/** Create and Edit share this hook and one form view. */
export function useTemplateForm(mode: FormMode) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const templates = useAccessRightsStore((s) => s.templates);
  const addTemplate = useAccessRightsStore((s) => s.addTemplate);
  const updateTemplate = useAccessRightsStore((s) => s.updateTemplate);
  const usage = useTemplateUsage();
  const template = templates.find((t) => t.id === templateId);

  const schema = useMemo(
    () => buildTemplateSchema((name) => templates.some((t) => t.id !== template?.id && isSameText(t.name, name))),
    [templates, template?.id],
  );
  const form = useForm<TemplateFormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(template) });

  const userType = form.watch('userType') as UserType | '';
  const permissions = form.watch('permissions') ?? [];
  const isUserTypeLocked = mode === 'edit' && (usage.get(template?.id ?? '') ?? 0) > 0;

  // A different user type has a different matrix shape, so start from an empty matrix.
  const handleUserTypeChange = (next: string) => {
    form.setValue('userType', next as UserType, { shouldDirty: true, shouldValidate: true });
    form.setValue('permissions', [], { shouldDirty: true });
  };

  const handlePermissionsChange = (next: PermissionKey[]) =>
    form.setValue('permissions', next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });

  const handleSubmit = form.handleSubmit((values) => {
    const input = { ...values, name: values.name.trim() };
    if (mode === 'create') {
      addTemplate(input);
      notify.success(L.created(input.name));
    } else if (template) {
      updateTemplate(template.id, input);
      notify.success(L.saved(input.name));
    }
    navigate(ROUTES.accessRights);
  });

  return {
    isNotFound: mode === 'edit' && !template,
    title: mode === 'create' ? L.createTitle : L.editTitle,
    submitLabel: mode === 'create' ? L.submitCreate : L.submitEdit,
    backTo: ROUTES.accessRights,
    form,
    userType,
    matrix: userType ? PERMISSION_CATALOG[userType] : undefined,
    matrixTitle: userType ? L.matrixTitle(USER_TYPE_LABELS[userType]) : '',
    permissions,
    permissionsError: form.formState.errors.permissions?.message as string | undefined,
    isUserTypeLocked,
    handleUserTypeChange,
    handlePermissionsChange,
    handleSubmit,
  };
}

export type TemplateFormModel = ReturnType<typeof useTemplateForm>;
