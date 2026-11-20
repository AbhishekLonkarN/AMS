import { useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Modal } from '@/components/overlay';
import { FormActions, TextField } from '@/components/form';
import { useSitesStore } from '@/store';
import { NotFoundPage } from '@/features/shell';
import { SITE_CONTACT_FIELDS as F, SITE_CONTACT_LABELS as L } from '../constants/contacts.constants';
import { useSiteContacts } from '../hooks/useSiteContacts';
import { ContactCard } from '../components/ContactCard';

/** Site Contacts: the site's contact card. Sponsor and CO users read it; the site user maintains it. */
export function SiteContactsPage() {
  const { projectId, siteId } = useParams();
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId && x.projectId === projectId));
  const { card, canEdit, open, modal } = useSiteContacts();
  const { form, isOpen, close, handleSubmit } = modal;
  const { register, formState } = form;
  const e = formState.errors;
  if (!site) {return <NotFoundPage />;}

  return (
    <div className="page-container">
      <PageHeader
        title={L.title}
        description={L.description(site.siteCode)}
        actions={
          canEdit && (
            <button type="button" className="btn btn-primary btn-sm" onClick={open}>
              <Pencil className="size-4" aria-hidden /> {L.edit}
            </button>
          )
        }
      />
      <ContactCard
        title={L.investigatorSection}
        rows={[
          { label: F.investigatorName, value: site.investigatorName },
          { label: F.siteName, value: site.siteName },
          { label: F.email, value: card?.investigator.email ?? site.investigatorEmail },
          { label: F.phone, value: card?.investigator.phone },
        ]}
      />
      <ContactCard title={L.smoSection} rows={[{ label: F.smoName, value: card?.smoName }]} />
      <ContactCard
        title={L.crc1Section}
        rows={[
          { label: F.name, value: card?.crc1.name },
          { label: F.email, value: card?.crc1.email },
          { label: F.phone, value: card?.crc1.phone },
        ]}
      />
      <ContactCard
        title={L.crc2Section}
        rows={[
          { label: F.name, value: card?.crc2.name },
          { label: F.email, value: card?.crc2.email },
          { label: F.phone, value: card?.crc2.phone },
        ]}
      />

      <Modal isOpen={isOpen} title={L.editTitle} description={L.editDescription} size="lg" onClose={close}>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-body font-semibold">{L.investigatorSection}</legend>
            <TextField label={F.phone} isRequired error={e.investigatorPhone?.message} {...register('investigatorPhone')} />
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-body font-semibold">{L.smoSection}</legend>
            <TextField label={F.smoName} {...register('smoName')} />
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-body font-semibold">{L.crc1Section}</legend>
            <div className="form-grid">
              <TextField label={F.name} error={e.crc1?.name?.message} {...register('crc1.name')} />
              <TextField label={F.email} error={e.crc1?.email?.message} {...register('crc1.email')} />
              <TextField label={F.phone} error={e.crc1?.phone?.message} {...register('crc1.phone')} />
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-body font-semibold">{L.crc2Section}</legend>
            <div className="form-grid">
              <TextField label={F.name} error={e.crc2?.name?.message} {...register('crc2.name')} />
              <TextField label={F.email} error={e.crc2?.email?.message} {...register('crc2.email')} />
              <TextField label={F.phone} error={e.crc2?.phone?.message} {...register('crc2.phone')} />
            </div>
          </fieldset>
          <FormActions submitLabel={L.save} onCancel={close} />
        </form>
      </Modal>
    </div>
  );
}
