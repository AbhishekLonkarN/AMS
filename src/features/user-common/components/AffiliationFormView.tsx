import { Controller } from 'react-hook-form';
import { PageHeader } from '@/components/layout';
import { FormActions, FormSection, ReadOnlyField, SearchSelect, SelectField } from '@/components/form';
import type { AffiliationFormModel } from '../hooks/useAffiliationForm';
import { AFFILIATION_LABELS as L } from '../constants/affiliation.constants';
import { TIME_ZONE_SELECT_OPTIONS, USER_FIELD_LABELS as F } from '../constants/user-common.constants';
import { AccessRightsSection } from './AccessRightsSection';

interface AffiliationFormViewProps {
  title: string;
  description?: string;
  backTo: string;
  submitLabel: string;
  matrixTitle: string;
  model: AffiliationFormModel;
}

/** Affiliate / Edit form: email search (create) → auto-filled identity → designation, time-zone, rights. */
export function AffiliationFormView({ title, description, backTo, submitLabel, matrixTitle, model }: AffiliationFormViewProps) {
  const { form, accessRights, accountOptions, selectedUser, designationOptions, isEdit, handleSubmit } = model;
  const { register, control, formState } = form;
  const { errors } = formState;

  return (
    <form className="page-container" onSubmit={handleSubmit} noValidate>
      <PageHeader title={title} description={description} backTo={backTo} />

      <FormSection title={L.accountSection}>
        <div className="form-grid">
          {!isEdit && (
            <Controller
              control={control}
              name="userId"
              render={({ field, fieldState }) => (
                <SearchSelect
                  label={L.searchAccount}
                  isRequired
                  isFullWidth
                  placeholder={L.searchPlaceholder}
                  emptyLabel={L.noAccounts}
                  options={accountOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          )}
          <ReadOnlyField label={F.prefix} value={selectedUser?.prefix} />
          <ReadOnlyField label={F.name} value={selectedUser?.name} />
          <ReadOnlyField label={F.email} value={selectedUser?.email} />
          <ReadOnlyField label={F.organization} value={selectedUser?.organization} />
        </div>
      </FormSection>

      <FormSection title={L.accessSection}>
        <AccessRightsSection model={accessRights} title={matrixTitle} isTemplateRequired>
          <SelectField
            label={F.designation}
            isRequired
            options={designationOptions}
            error={errors.designation?.message}
            {...register('designation')}
          />
          <SelectField
            label={F.timeZone}
            isRequired
            placeholder={false}
            options={TIME_ZONE_SELECT_OPTIONS}
            error={errors.timeZone?.message}
            {...register('timeZone')}
          />
        </AccessRightsSection>
      </FormSection>

      <FormActions submitLabel={submitLabel} cancelTo={backTo} isSubmitting={formState.isSubmitting} />
    </form>
  );
}
