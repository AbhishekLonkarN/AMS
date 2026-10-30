import { Controller } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { DataGrid } from '@/components/data-grid';
import { ConfirmDialog, StatusBadge } from '@/components/feedback';
import {
  FORM_LABELS,
  FileField,
  FormActions,
  FormSection,
  SearchSelect,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/form';
import { Modal, Popover, Tooltip } from '@/components/overlay';
import { PermissionMatrix } from '@/components/permission-matrix';
import { fullName } from '@/utils/string.utils';
import { UI_KIT_LABELS as L } from '../constants/ui-kit.constants';
import { UI_KIT_USER_COLUMNS } from '../constants/ui-kit-columns.constants';
import type { UiKitViewModel } from '../hooks/useUiKit';
import styles from './UiKitView.module.css';

export function UiKitView(vm: UiKitViewModel) {
  const { register, control, formState } = vm.form;
  const { errors } = formState;

  return (
    <div className="page-container">
      <PageHeader title={L.title} description={L.description} />

      <FormSection title={L.badgesTitle}>
        <div className={styles.row}>
          <StatusBadge status="active" />
          <StatusBadge status="inactive" />
          <StatusBadge status="deaffiliated" />
          <StatusBadge status="customised" />
          <StatusBadge status="draft" />
          <Tooltip content={L.tooltipText}>
            <button type="button" className="btn btn-sm">
              {L.tooltipTrigger}
            </button>
          </Tooltip>
          <Popover trigger={<button type="button" className="btn btn-sm">{L.popoverTrigger}</button>}>
            {(close) => (
              <div className="flex flex-col gap-2">
                <p className="text-label">{L.popoverText}</p>
                <button type="button" className="btn btn-xs self-end" onClick={close}>
                  {L.popoverClose}
                </button>
              </div>
            )}
          </Popover>
        </div>
      </FormSection>

      <FormSection title={L.toastsTitle}>
        <div className={styles.row}>
          <button type="button" className="btn btn-sm btn-success" onClick={vm.toast.success}>
            {L.toastSuccess}
          </button>
          <button type="button" className="btn btn-sm btn-error" onClick={vm.toast.error}>
            {L.toastError}
          </button>
          <button type="button" className="btn btn-sm" onClick={vm.toast.phase2}>
            {L.toastPhase2}
          </button>
          <button type="button" className="btn btn-sm btn-primary" onClick={vm.openModal}>
            {L.openModal}
          </button>
        </div>
      </FormSection>

      <form onSubmit={vm.handleSubmit} noValidate>
        <FormSection title={L.formTitle} description={L.formDescription}>
          <div className="form-grid">
            <SelectField label={L.fields.prefix} isRequired options={vm.prefixOptions} error={errors.prefix?.message} {...register('prefix')} />
            <TextField label={L.fields.name} isRequired error={errors.name?.message} {...register('name')} />
            <TextField label={L.fields.email} type="email" isRequired error={errors.email?.message} {...register('email')} />
            <SelectField
              label={L.fields.status}
              isRequired
              placeholder={false}
              options={vm.statusOptions}
              error={errors.status?.message}
              {...register('status')}
            />
            <Controller
              control={control}
              name="accountId"
              render={({ field, fieldState }) => (
                <SearchSelect
                  label={L.fields.account}
                  isRequired
                  options={vm.accountOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <FileField label={L.fields.logo} fileName={vm.logoFileName} accept="image/*" onFileNameChange={vm.setLogoFileName} />
            <TextAreaField
              label={L.fields.description}
              isRequired
              isFullWidth
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
          <div className="mt-6">
            <FormActions submitLabel={FORM_LABELS.submit} onCancel={() => vm.form.reset()} />
          </div>
        </FormSection>
      </form>

      <section className="flex flex-col gap-3">
        <h2>{L.gridTitle}</h2>
        <DataGrid
          data={vm.users}
          columns={UI_KIT_USER_COLUMNS}
          getRowId={(u) => u.id}
          rowActions={vm.rowActions}
          exportActions={vm.exportActions}
          isRowMuted={(u) => u.status !== 'active'}
          toolbarActions={
            <button type="button" className="btn btn-primary btn-sm">
              <Plus className="size-4" aria-hidden /> {L.addUser}
            </button>
          }
        />
      </section>

      <PermissionMatrix
        title={L.matrixTitle}
        matrix={vm.sponsorMatrix}
        scopeTypes={['project']}
        value={vm.matrixValue}
        onChange={vm.setMatrixValue}
        templatePermissions={vm.templateProjectRights}
        templateName={vm.templateName}
        onResetToTemplate={vm.handleResetMatrix}
      />

      <PermissionMatrix
        title={L.matrixReadOnlyTitle}
        matrix={vm.coMatrix}
        value={vm.craPermissions}
        templatePermissions={vm.craPermissions}
        templateName={vm.craTemplateName}
        isReadOnly
      />

      <Modal isOpen={vm.isModalOpen} title={L.modalTitle} onClose={vm.closeModal}>
        <p>{L.modalBody}</p>
      </Modal>

      <ConfirmDialog
        isOpen={!!vm.pendingDeactivate}
        title={L.confirmTitle}
        message={vm.pendingDeactivate ? L.confirmMessage(fullName(vm.pendingDeactivate.prefix, vm.pendingDeactivate.name)) : ''}
        confirmLabel={L.deactivate}
        tone="danger"
        onConfirm={vm.handleConfirmDeactivate}
        onCancel={vm.handleCancelDeactivate}
      />
    </div>
  );
}
