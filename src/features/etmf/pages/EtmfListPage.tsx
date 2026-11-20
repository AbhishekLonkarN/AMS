import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { EtmfScope } from '@/types';
import { PageHeader } from '@/components/layout';
import { DataGrid } from '@/components/data-grid';
import { ConfirmDialog } from '@/components/feedback';
import { Modal } from '@/components/overlay';
import { FileField, FormActions, TextField } from '@/components/form';
import { ETMF_FIELDS as F, ETMF_LABELS as L } from '../constants/etmf.constants';
import { useEtmfList } from '../hooks/useEtmfList';

interface EtmfListPageProps {
  scope: EtmfScope;
}

/** eTMF Documents list (project or site level) with add / edit dialog and delete confirmation. */
export function EtmfListPage({ scope }: EtmfListPageProps) {
  const model = useEtmfList(scope);
  const { form, isOpen, close, handleSubmit } = model.modal;
  const { register, formState, setFocus, setValue, watch } = form;
  const { errors } = formState;
  const fileName = watch('fileName');

  useEffect(() => {
    if (isOpen) {setFocus('srNo');}
  }, [isOpen, setFocus]);

  return (
    <div className="page-container">
      <PageHeader title={model.title} description={model.description} />
      <DataGrid
        // A fresh grid (search, filters, page) when the page switches between project and site documents.
        key={scope}
        data={model.rows}
        columns={model.columns}
        getRowId={(d) => d.id}
        rowActions={model.rowActions}
        initialSorting={[{ id: 'srNo', desc: false }]}
        searchPlaceholder={L.searchPlaceholder}
        itemLabel={L.itemLabel}
        emptyTitle={L.emptyTitle}
        emptyDescription={L.emptyDescription}
        toolbarActions={
          model.canAdd && (
            <button type="button" className="btn btn-primary btn-sm" onClick={model.onAdd}>
              <Plus className="size-4" aria-hidden /> {L.addButton}
            </button>
          )
        }
      />

      <Modal isOpen={isOpen} title={model.modal.title} description={L.systemFields} onClose={close}>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="form-grid">
            <TextField label={F.srNo} isRequired error={errors.srNo?.message} {...register('srNo')} />
            <TextField label={F.title} isRequired error={errors.title?.message} {...register('title')} />
            <TextField label={F.documentDate} type="date" error={errors.documentDate?.message} {...register('documentDate')} />
            <TextField label={F.version} placeholder="V01" error={errors.version?.message} {...register('version')} />
            <TextField label={F.validityDate} type="date" error={errors.validityDate?.message} {...register('validityDate')} />
          </div>
          <FileField
            label={F.file}
            isRequired
            accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
            hint="PDF, Word, Excel, JPEG or PNG, up to 25 MB."
            onFileChange={model.modal.setFile}
            error={errors.fileName?.message}
            fileName={fileName}
            onFileNameChange={(name) => setValue('fileName', name, { shouldDirty: true, shouldValidate: true })}
          />
          <FormActions submitLabel={L.save} onCancel={close} />
        </form>
      </Modal>
      <Modal isOpen={!!model.history} title="Document Version History" description={model.history?.title} onClose={model.closeHistory}>
        {model.history?.fileVersions?.length ? (
          <ul className="divide-y divide-ink-200">
            {model.history.fileVersions.map((version) => (
              <li key={version.id} className="flex items-center justify-between gap-3 py-3">
                <span>{version.version ?? 'Initial'} · {version.fileName}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => model.downloadVersion(version.id)}>Download</button>
              </li>
            ))}
          </ul>
        ) : <p>No file versions are available in this session.</p>}
      </Modal>
      <ConfirmDialog {...model.confirm} />
    </div>
  );
}
