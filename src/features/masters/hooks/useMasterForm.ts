import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { MasterItem } from '@/types';
import { notify, useMastersStore } from '@/store';
import { isSameText } from '@/utils/string.utils';
import type { MasterConfig } from '../masters.config';
import { MASTER_LABELS as L } from '../constants/masters.constants';
import { buildMasterItemSchema, type MasterItemFormValues } from '../schemas/master-item.schema';

const EMPTY: MasterItemFormValues = { label: '', description: '', status: 'active' };

/** Add / Edit modal state + form for one master. */
export function useMasterForm(config: MasterConfig) {
  const addMasterItem = useMastersStore((s) => s.addMasterItem);
  const updateMasterItem = useMastersStore((s) => s.updateMasterItem);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<MasterItem | null>(null);

  // Read at validation time so one schema serves add and every edit.
  const editingIdRef = useRef<string | null>(null);
  const schema = useMemo(
    () =>
      buildMasterItemSchema(config.itemName, (label) =>
        useMastersStore
          .getState()
          .items.some((i) => i.masterKey === config.key && i.id !== editingIdRef.current && isSameText(i.label, label)),
      ),
    [config],
  );
  const form = useForm<MasterItemFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const openCreate = () => {
    editingIdRef.current = null;
    setEditing(null);
    form.reset(EMPTY);
    setIsOpen(true);
  };

  const openEdit = (item: MasterItem) => {
    editingIdRef.current = item.id;
    setEditing(item);
    form.reset({ label: item.label, description: item.description, status: item.status });
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const handleSubmit = form.handleSubmit((values) => {
    const input = { ...values, label: values.label.trim(), description: values.description.trim() };
    if (editing) {
      updateMasterItem(editing.id, input);
      notify.success(L.saved(input.label));
    } else {
      addMasterItem(config.key, input);
      notify.success(L.added(input.label));
    }
    close();
  });

  return {
    isOpen,
    isEdit: !!editing,
    title: editing ? L.editTitle(config.itemName) : L.addTitle(config.itemName),
    submitLabel: editing ? L.save : L.add,
    itemName: config.itemName,
    form,
    openCreate,
    openEdit,
    close,
    handleSubmit,
  };
}

export type MasterFormModel = ReturnType<typeof useMasterForm>;
