import { Info } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { FormActions, FormSection, SelectField } from '@/components/form';
import {
  AccessRightsSection,
  IdentityFields,
  TIME_ZONE_SELECT_OPTIONS,
  USER_FIELD_LABELS as F,
} from '@/features/user-common';
import { SITE_USER_LABELS as L } from '../constants/site-users.constants';
import type { SiteUserFormModel } from '../hooks/useSiteUserForm';

type SiteUserFormViewProps = Omit<SiteUserFormModel, 'isNotFound'>;

export function SiteUserFormView({
  title,
  description,
  submitLabel,
  backTo,
  form,
  accessRights,
  designationOptions,
  isStatusLocked,
  reuseNotice,
  handleSubmit,
}: SiteUserFormViewProps) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <form className="page-container" onSubmit={handleSubmit} noValidate>
      <PageHeader title={title} description={description} backTo={backTo} />

      <FormSection title={L.identitySection}>
        <div className="flex flex-col gap-4">
          {reuseNotice && (
            <div role="note" className="alert alert-info alert-soft">
              <Info className="size-5 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">{L.reuseTitle}</p>
                <p>{reuseNotice}</p>
              </div>
            </div>
          )}
          <IdentityFields register={register} errors={errors} hasOrganization={false} isStatusLocked={isStatusLocked} />
        </div>
      </FormSection>

      <FormSection title={L.accessSection}>
        <AccessRightsSection model={accessRights} title={L.matrixTitle} isTemplateRequired>
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
