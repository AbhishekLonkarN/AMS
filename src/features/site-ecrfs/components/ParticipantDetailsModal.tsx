import { useEffect } from 'react';
import { Modal } from '@/components/overlay';
import { FormActions, SelectField, TextField } from '@/components/form';
import { PARTICIPANT_LABELS as L, SITE_ECRF_LABELS as S } from '../constants/site-ecrfs.constants';
import type { ParticipantDetailsModel } from '../hooks/useParticipantDetailsForm';

/** Add New Participant / Edit details: the four identifiers shown at the top of the eCRF. */
export function ParticipantDetailsModal({ isOpen, isEdit, close, form, handleSubmit, statusOptions, participantPrefix }: ParticipantDetailsModel) {
  const { register, formState, setFocus } = form;
  const { errors } = formState;

  useEffect(() => {
    if (isOpen) {setFocus(isEdit ? 'participantNo' : 'screeningNo');}
  }, [isOpen, isEdit, setFocus]);

  return (
    <Modal isOpen={isOpen} title={isEdit ? L.editTitle : L.addTitle} description={L.description} onClose={close}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="form-grid">
          <TextField
            label={S.identifiers.screeningNo}
            isRequired
            readOnly={isEdit}
            hint={isEdit ? L.screeningLocked : L.screeningHint}
            error={errors.screeningNo?.message}
            {...register('screeningNo')}
          />
          <TextField
            label={S.identifiers.participantNo}
            hint={L.participantHint(participantPrefix)}
            error={errors.participantNo?.message}
            {...register('participantNo')}
          />
          <TextField label={S.identifiers.initials} isRequired error={errors.initials?.message} {...register('initials')} />
          <SelectField label={S.identifiers.status} isRequired options={statusOptions} error={errors.statusId?.message} {...register('statusId')} />
        </div>
        <FormActions submitLabel={isEdit ? L.saveButton : L.addButton} onCancel={close} />
      </form>
    </Modal>
  );
}
