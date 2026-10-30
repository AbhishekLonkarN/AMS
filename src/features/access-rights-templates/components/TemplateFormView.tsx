import { PageHeader } from '@/components/layout';
import { FormActions, FormSection, SelectField, TextField } from '@/components/form';
import { PermissionMatrix } from '@/components/permission-matrix';
import { EmptyState } from '@/components/feedback';
import { STATUS_SELECT_OPTIONS } from '@/features/user-common';
import {
  ACCESS_RIGHTS_FIELDS as F,
  ACCESS_RIGHTS_LABELS as L,
  USER_TYPE_SELECT_OPTIONS,
} from '../constants/access-rights.constants';
import type { TemplateFormModel } from '../hooks/useTemplateForm';

type TemplateFormViewProps = Omit<TemplateFormModel, 'isNotFound'>;

export function TemplateFormView({
  title,
  submitLabel,
  backTo,
  form,
  userType,
  matrix,
  matrixTitle,
  permissions,
  permissionsError,
  isUserTypeLocked,
  handleUserTypeChange,
  handlePermissionsChange,
  handleSubmit,
}: TemplateFormViewProps) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <form className="page-container" onSubmit={handleSubmit} noValidate>
      <PageHeader title={title} backTo={backTo} />

      <FormSection title={L.detailsSection}>
        <div className="form-grid">
          <TextField label={F.name} isRequired error={errors.name?.message} {...register('name')} />
          <SelectField
            label={F.userType}
            isRequired
            options={USER_TYPE_SELECT_OPTIONS}
            value={userType}
            disabled={isUserTypeLocked}
            hint={isUserTypeLocked ? F.userTypeLocked : F.userTypeHint}
            error={errors.userType?.message}
            onChange={(e) => handleUserTypeChange(e.target.value)}
          />
          <SelectField
            label={F.status}
            isRequired
            placeholder={false}
            options={STATUS_SELECT_OPTIONS}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>
      </FormSection>

      {matrix ? (
        <div className="flex flex-col gap-2">
          <PermissionMatrix title={matrixTitle} matrix={matrix} value={permissions} onChange={handlePermissionsChange} />
          {permissionsError && (
            <p role="alert" className="text-label text-error">
              {permissionsError}
            </p>
          )}
        </div>
      ) : (
        <div className="section-card">
          <EmptyState title={L.pickUserType} />
        </div>
      )}

      <FormActions submitLabel={submitLabel} cancelTo={backTo} isSubmitting={formState.isSubmitting} />
    </form>
  );
}
