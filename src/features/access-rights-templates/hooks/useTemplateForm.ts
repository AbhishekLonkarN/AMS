import { useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AccessRightsSet, PermissionKey, UserType } from '@/types';
import { notify, useAccessRightsSetsStore } from '@/store';
import { PERMISSION_CATALOG } from '@/rbac';
import { USER_TYPE_LABELS } from '@/constants/user.constants';
import { isSameText } from '@/utils/string.utils';
import { useFormTabs } from '@/features/user-common';
import { ACCESS_RIGHTS_LABELS as L, ACCESS_RIGHTS_VALIDATION as V } from '../constants/access-rights.constants';
import { buildTemplateSchema, type TemplateFormValues } from '../schemas/access-rights-template.schema';
import { isNameTaken, saveErrorMessage } from '../utils/access-rights.utils';

export type FormMode = 'create' | 'edit';

interface TemplateFormOptions {
  mode: FormMode;
  templateId?: string;
  /** Called after a successful save (closes the drawer). */
  onDone: () => void;
}

const TABS = ['details', 'access'] as const;
const FIELD_TABS = { name: 'details', userType: 'details', status: 'details', permissions: 'access' } as const;

const toFormValues = (t?: AccessRightsSet) =>
  ({
    name: t?.name ?? '',
    userType: t?.userType ?? '',
    status: t?.status ?? 'active',
    permissions: t?.permissions ?? [],
  }) as unknown as TemplateFormValues;

/** Create and Edit share this hook and one drawer form view. */
export function useTemplateForm({ mode, templateId, onDone }: TemplateFormOptions) {
  const sets = useAccessRightsSetsStore((s) => s.sets);
  const addSet = useAccessRightsSetsStore((s) => s.add);
  const updateSet = useAccessRightsSetsStore((s) => s.update);
  const formId = useId();
  const tabs = useFormTabs(TABS, FIELD_TABS);
  const template = sets.find((t) => t.id === templateId);

  // An early hint only; the backend has the final say on unique names.
  const schema = useMemo(
    () => buildTemplateSchema((name) => sets.some((t) => t.id !== template?.id && isSameText(t.name, name))),
    [sets, template?.id],
  );
  const form = useForm<TemplateFormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(template) });

  const userType = form.watch('userType') as UserType | '';
  const permissions = form.watch('permissions') ?? [];
  // The backend doesn't report which users have a set yet, so the user type stays editable.
  const isUserTypeLocked = false;

  // A different user type has a different matrix shape, so start from an empty matrix.
  const handleUserTypeChange = (next: string) => {
    form.setValue('userType', next as UserType, { shouldDirty: true, shouldValidate: true });
    form.setValue('permissions', [], { shouldDirty: true });
  };

  const handlePermissionsChange = (next: PermissionKey[]) =>
    form.setValue('permissions', next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });

  const handleSubmit = form.handleSubmit(async (values) => {
    const input = { ...values, name: values.name.trim() };
    try {
      if (mode === 'create') {
        await addSet(input);
        notify.success(L.created(input.name));
      } else if (template) {
        await updateSet(template.id, input);
        notify.success(L.saved(input.name));
      }
      onDone();
    } catch (error) {
      if (isNameTaken(error)) {
        form.setError('name', { type: 'unique', message: V.taken });
        tabs.setActiveTab('details');
      } else {
        notify.error(saveErrorMessage(error));
      }
    }
  }, tabs.showFirstError);

  return {
    isNotFound: mode === 'edit' && !template,
    title: mode === 'create' ? L.createTitle : L.editTitle,
    subtitle: mode === 'edit' ? template?.name : L.createDescription,
    submitLabel: mode === 'create' ? L.submitCreate : L.submitEdit,
    // Editing a set doesn't change users who already hold it; the edit screen says so (BR-MST-12).
    detailsHint: mode === 'edit' ? L.detailsHintEdit : L.detailsHint,
    formId,
    tabs,
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
