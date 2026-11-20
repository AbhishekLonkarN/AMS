import { useEffect } from 'react';
import { Modal } from '@/components/overlay';
import { FormActions, SelectField, TextAreaField, TextField } from '@/components/form';
import { STATUS_SELECT_OPTIONS } from '@/features/user-common';
import { MASTER_LABELS as L } from '../constants/masters.constants';
import type { MasterFormModel } from '../hooks/useMasterForm';

interface MasterFormModalProps {
  model: MasterFormModel;
}

export function MasterFormModal({ model }: MasterFormModalProps) {
  const { register, formState, setFocus } = model.form;
  const { errors } = formState;

  // Focus the name field once the dialog has opened (instead of the autoFocus prop).
  useEffect(() => {
    if (model.isOpen) {
      setFocus('label');
    }
  }, [model.isOpen, setFocus]);

  return (
    <Modal isOpen={model.isOpen} title={model.title} onClose={model.close}>
      <form onSubmit={model.handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField label={model.itemName} isRequired error={errors.label?.message} {...register('label')} />
        <TextAreaField label={L.description} isRequired error={errors.description?.message} {...register('description')} />
        <SelectField
          label={L.status}
          isRequired
          placeholder={false}
          options={STATUS_SELECT_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />
        <FormActions submitLabel={model.submitLabel} onCancel={model.close} isSubmitting={model.isSubmitting} />
      </form>
    </Modal>
  );
}
