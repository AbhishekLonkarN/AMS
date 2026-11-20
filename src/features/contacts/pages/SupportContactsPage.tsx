import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { ConfirmDialog, EmptyState } from '@/components/feedback';
import { Modal } from '@/components/overlay';
import { FormActions, TextField } from '@/components/form';
import { SUPPORT_FIELDS as F, SUPPORT_LABELS as L } from '../constants/contacts.constants';
import { useSupportContacts } from '../hooks/useSupportContacts';
import { ContactCard } from '../components/ContactCard';

export function SupportContactsPage() {
  const model = useSupportContacts();
  const { card } = model;
  const { form, isOpen, close, handleSubmit } = model.modal;
  const { register, formState } = form;
  const e = formState.errors;

  return (
    <div className="page-container">
      <PageHeader
        title={L.title}
        description={L.description}
        actions={
          <>
            {model.canAdd && (
              <button type="button" className="btn btn-primary btn-sm" onClick={model.openForm}>
                <Plus className="size-4" aria-hidden /> {L.add}
              </button>
            )}
            {model.canEdit && (
              <button type="button" className="btn btn-primary btn-sm" onClick={model.openForm}>
                <Pencil className="size-4" aria-hidden /> {L.edit}
              </button>
            )}
            {model.canDelete && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={model.askDelete}>
                <Trash2 className="size-4" aria-hidden /> {L.delete}
              </button>
            )}
          </>
        }
      />

      {card ? (
        <>
          <ContactCard
            title={L.sponsorSection}
            rows={[
              { label: F.name, value: card.sponsorManager.name },
              { label: F.organization, value: card.sponsorManager.organization },
              { label: F.email, value: card.sponsorManager.email },
              { label: F.phone, value: card.sponsorManager.phone },
            ]}
          />
          <ContactCard title={L.croSection} rows={[{ label: F.croName, value: card.croName }]} />
          <ContactCard
            title={L.croManagerSection}
            rows={[
              { label: F.name, value: card.croManager.name },
              { label: F.email, value: card.croManager.email },
              { label: F.phone, value: card.croManager.phone },
            ]}
          />
          <ContactCard
            title={L.croAssistantSection}
            rows={[
              { label: F.name, value: card.croAssistantManager.name },
              { label: F.email, value: card.croAssistantManager.email },
              { label: F.phone, value: card.croAssistantManager.phone },
            ]}
          />
        </>
      ) : (
        <section className="section-card">
          <EmptyState title={L.emptyTitle} description={L.emptyDescription} />
        </section>
      )}

      <Modal isOpen={isOpen} title={model.modal.title} size="lg" onClose={close}>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-body font-semibold">{L.sponsorSection}</legend>
            <div className="form-grid">
              <TextField label={F.name} isRequired error={e.sponsorManager?.name?.message} {...register('sponsorManager.name')} />
              <TextField label={F.organization} isRequired error={e.sponsorManager?.organization?.message} {...register('sponsorManager.organization')} />
              <TextField label={F.email} isRequired error={e.sponsorManager?.email?.message} {...register('sponsorManager.email')} />
              <TextField label={F.phone} isRequired error={e.sponsorManager?.phone?.message} {...register('sponsorManager.phone')} />
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-body font-semibold">{L.croSection}</legend>
            <TextField label={F.croName} {...register('croName')} />
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-body font-semibold">{L.croManagerSection}</legend>
            <div className="form-grid">
              <TextField label={F.name} error={e.croManager?.name?.message} {...register('croManager.name')} />
              <TextField label={F.email} error={e.croManager?.email?.message} {...register('croManager.email')} />
              <TextField label={F.phone} error={e.croManager?.phone?.message} {...register('croManager.phone')} />
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-body font-semibold">{L.croAssistantSection}</legend>
            <div className="form-grid">
              <TextField label={F.name} error={e.croAssistantManager?.name?.message} {...register('croAssistantManager.name')} />
              <TextField label={F.email} error={e.croAssistantManager?.email?.message} {...register('croAssistantManager.email')} />
              <TextField label={F.phone} error={e.croAssistantManager?.phone?.message} {...register('croAssistantManager.phone')} />
            </div>
          </fieldset>
          <FormActions submitLabel={L.save} onCancel={close} />
        </form>
      </Modal>
      <ConfirmDialog {...model.confirm} />
    </div>
  );
}
