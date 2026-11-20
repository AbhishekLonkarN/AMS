import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notify, useContactsStore, useSitesStore } from '@/store';
import { usePermission } from '@/rbac';
import { SITE_CONTACT_LABELS as L } from '../constants/contacts.constants';
import { siteContactsSchema, type SiteContactsFormValues } from '../schemas/site-contacts.schema';

const EMPTY_PERSON = { name: '', email: '', phone: '' };

/** Site Contacts: every user with View reads the card; a site user with Edit maintains it. */
export function useSiteContacts() {
  const { siteId = '' } = useParams();
  const card = useContactsStore((s) => s.siteContacts.find((c) => c.siteId === siteId));
  const saveSiteContacts = useContactsStore((s) => s.saveSiteContacts);
  const investigatorEmail = useSitesStore((s) => s.sites.find((site) => site.id === siteId)?.investigatorEmail);
  const canEdit = usePermission('siteContacts.edit');
  const canAdd = usePermission('siteContacts.new');
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<SiteContactsFormValues>({
    resolver: zodResolver(siteContactsSchema),
    defaultValues: { investigatorPhone: '', smoName: '', crc1: EMPTY_PERSON, crc2: EMPTY_PERSON },
  });

  const open = () => {
    form.reset({
      investigatorPhone: card?.investigator.phone ?? '',
      smoName: card?.smoName ?? '',
      crc1: card?.crc1 ?? EMPTY_PERSON,
      crc2: card?.crc2 ?? EMPTY_PERSON,
    });
    setIsOpen(true);
  };

  const handleSubmit = form.handleSubmit((values) => {
    saveSiteContacts({
      siteId,
      investigator: { email: card?.investigator.email ?? investigatorEmail ?? '', phone: values.investigatorPhone },
      smoName: values.smoName,
      crc1: values.crc1,
      crc2: values.crc2,
    });
    notify.success(L.saved);
    setIsOpen(false);
  });

  return { card, canEdit: card ? canEdit : canAdd, open, modal: { isOpen, form, close: () => setIsOpen(false), handleSubmit } };
}
