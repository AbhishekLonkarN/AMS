import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, Eye, Pencil } from 'lucide-react';
import type { PermissionKey, User } from '@/types';
import type { RowAction } from '@/components/data-grid';
import type { SelectOption } from '@/components/form';
import { notify, useAccessRightsStore, useUsersStore } from '@/store';
import { PERMISSION_CATALOG, sanitizePermissions } from '@/rbac';
import { PREFIX_OPTIONS, RECORD_STATUS_LABELS } from '@/constants/user.constants';
import { fullName } from '@/utils/string.utils';
import { UI_KIT_LABELS as L } from '../constants/ui-kit.constants';
import { uiKitFormSchema, type UiKitFormValues } from '../schemas/ui-kit-form.schema';

/** Wires live seed data and demo handlers into the UI kit view. */
export function useUiKit() {
  const users = useUsersStore((s) => s.users);
  const templates = useAccessRightsStore((s) => s.templates);

  // ---- form ----
  const form = useForm<UiKitFormValues>({
    resolver: zodResolver(uiKitFormSchema),
    defaultValues: { prefix: '', name: '', email: '', status: 'active', description: '', accountId: '' },
  });
  const [logoFileName, setLogoFileName] = useState<string>();
  const handleSubmit = form.handleSubmit(() => notify.success(L.saved));

  const prefixOptions: SelectOption[] = PREFIX_OPTIONS.map((p) => ({ value: p, label: p }));
  const statusOptions: SelectOption[] = Object.entries(RECORD_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  const accountOptions: SelectOption[] = users
    .filter((u) => u.accountType === 'sponsor')
    .map((u) => ({
      value: u.id,
      label: u.email,
      description: `${fullName(u.prefix, u.name)} · ${u.organization}`,
      isDisabled: u.status !== 'active',
    }));

  // ---- permission matrix ----
  const pmTemplate = templates.find((t) => t.id === 'tpl-pm-sponsor');
  const templateProjectRights = useMemo(
    () => sanitizePermissions('sponsor', pmTemplate?.permissions ?? [], 'project'),
    [pmTemplate],
  );
  const [matrixValue, setMatrixValue] = useState<PermissionKey[]>(templateProjectRights);
  const craTemplate = templates.find((t) => t.id === 'tpl-cra');

  // ---- grid ----
  const [pendingDeactivate, setPendingDeactivate] = useState<User | null>(null);
  const rowActions = (user: User): RowAction[] => {
    const name = fullName(user.prefix, user.name);
    const actions: RowAction[] = [
      { key: 'view', label: L.view, icon: Eye, onClick: () => notify.info(L.rowAction(L.view, name)) },
      { key: 'edit', label: L.edit, icon: Pencil, onClick: () => notify.info(L.rowAction(L.edit, name)) },
    ];
    if (user.status === 'active') {
      actions.push({ key: 'deactivate', label: L.deactivate, icon: Ban, tone: 'danger', onClick: () => setPendingDeactivate(user) });
    }
    return actions;
  };
  const handleConfirmDeactivate = () => {
    if (pendingDeactivate) notify.success(L.confirmed(fullName(pendingDeactivate.prefix, pendingDeactivate.name)));
    setPendingDeactivate(null);
  };

  // ---- modal ----
  const [isModalOpen, setIsModalOpen] = useState(false);

  return {
    form,
    handleSubmit,
    prefixOptions,
    statusOptions,
    accountOptions,
    logoFileName,
    setLogoFileName,
    sponsorMatrix: PERMISSION_CATALOG.sponsor,
    coMatrix: PERMISSION_CATALOG.co,
    matrixValue,
    setMatrixValue,
    templateProjectRights,
    templateName: pmTemplate?.name,
    handleResetMatrix: () => setMatrixValue(templateProjectRights),
    craPermissions: craTemplate?.permissions ?? [],
    craTemplateName: craTemplate?.name,
    users,
    rowActions,
    exportActions: { onExcel: () => notify.phase2('Excel export'), onPdf: () => notify.phase2('PDF export') },
    pendingDeactivate,
    handleConfirmDeactivate,
    handleCancelDeactivate: () => setPendingDeactivate(null),
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    toast: {
      success: () => notify.success(L.toastSuccess),
      error: () => notify.error(L.toastError),
      phase2: () => notify.phase2(),
    },
  };
}

export type UiKitViewModel = ReturnType<typeof useUiKit>;
