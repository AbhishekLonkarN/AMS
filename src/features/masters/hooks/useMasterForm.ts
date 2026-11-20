import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { MasterItem } from '@/types';
import { notify } from '@/store';
import { isSameText } from '@/utils/string.utils';
import type { MasterConfig } from '../masters.config';
import { MASTER_LABELS as L, MASTER_VALIDATION as V } from '../constants/masters.constants';
import { buildMasterItemSchema, type MasterItemFormValues } from '../schemas/master-item.schema';
import { isValueTaken, saveErrorMessage } from '../utils/masters.utils';
import type { MasterSource } from './useMasterSource';

const EMPTY: MasterItemFormValues = { label: '', description: '', status: 'active' };

/** Add / Edit modal state + form for one master. */
export function useMasterForm(config: MasterConfig, source: MasterSource) {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<MasterItem | null>(null);

  // Read at validation time so one schema serves add and every edit.
  const editingIdRef = useRef<string | null>(null);
  const itemsRef = useRef(source.items);
  itemsRef.current = source.items;
  // An early hint only; for Product Group the backend has the final say on unique values.
  const schema = useMemo(
    () =>
      buildMasterItemSchema(config.itemName, (label) =>
        itemsRef.current.some((i) => i.id !== editingIdRef.current && isSameText(i.label, label)),
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

  const handleSubmit = form.handleSubmit(async (values) => {
    const input = { ...values, label: values.label.trim(), description: values.description.trim() };
    try {
      if (editing) {
        await source.update(editing, input);
        notify.success(L.saved(input.label));
      } else {
        await source.add(input);
        notify.success(L.added(input.label));
      }
      close();
    } catch (error) {
      if (isValueTaken(error)) {
        form.setError('label', { type: 'unique', message: V.taken(config.itemName) });
      } else {
        notify.error(saveErrorMessage(error));
      }
    }
  });

  return {
    isOpen,
    isEdit: !!editing,
    isSubmitting: form.formState.isSubmitting,
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
