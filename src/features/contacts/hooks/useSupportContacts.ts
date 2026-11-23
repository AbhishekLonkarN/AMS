import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SupportContacts } from '@/types';
import { notify, useContactsStore } from '@/store';
import { usePermission } from '@/rbac';
import { SUPPORT_LABELS as L } from '../constants/contacts.constants';
import { supportContactsSchema, type SupportContactsFormValues } from '../schemas/support-contacts.schema';

const EMPTY_PERSON = { name: '', email: '', phone: '' };
const EMPTY: SupportContactsFormValues = {
  sponsorManager: { ...EMPTY_PERSON, organization: '' },
  croName: '',
  croManager: EMPTY_PERSON,
  croAssistantManager: EMPTY_PERSON,
};

/** Sponsor and CO/CRO Contacts for Support: one card per project, view / add / edit / delete by permission. */
export function useSupportContacts() {
  const { projectId = '' } = useParams();
  const card = useContactsStore((s) => s.supportContacts.find((c) => c.projectId === projectId));
  const saveSupportContacts = useContactsStore((s) => s.saveSupportContacts);
  const deleteSupportContacts = useContactsStore((s) => s.deleteSupportContacts);
  const canAdd = usePermission('supportContacts.new');
  const canEdit = usePermission('supportContacts.edit');
  const canDelete = usePermission('supportContacts.delete');

  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const form = useForm<SupportContactsFormValues>({ resolver: zodResolver(supportContactsSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (isOpen) {form.reset(card ? toFormValues(card) : EMPTY);}
    // Reset only when the dialog opens, not on every card change while it is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = form.handleSubmit((values) => {
    const isNew = !card;
    saveSupportContacts({ projectId, ...values });
    notify.success(isNew ? L.added : L.saved);
    setIsOpen(false);
  });

  const handleDelete = () => {
    deleteSupportContacts(projectId);
    notify.success(L.deleted);
    setIsConfirmingDelete(false);
  };

  return {
    card,
    canAdd: canAdd && !card,
    canEdit: canEdit && !!card,
    canDelete: canDelete && !!card,
    openForm: () => setIsOpen(true),
    askDelete: () => setIsConfirmingDelete(true),
    modal: { isOpen, title: card ? L.editTitle : L.addTitle, form, close: () => setIsOpen(false), handleSubmit },
    confirm: {
      isOpen: isConfirmingDelete,
      title: L.deleteTitle,
      message: L.deleteMessage,
      confirmLabel: L.delete,
      tone: 'danger' as const,
      onConfirm: handleDelete,
      onCancel: () => setIsConfirmingDelete(false),
    },
  };
}

function toFormValues(card: SupportContacts): SupportContactsFormValues {
  const { projectId: _projectId, ...rest } = card;
  return rest;
}

export type SupportContactsModel = ReturnType<typeof useSupportContacts>;
