import { PageHeader } from '@/components/layout';
import { FormActions, FormSection, SelectField, TextAreaField, TextField } from '@/components/form';
import { SITE_FIELDS as F, SITE_LABELS as L } from '../constants/sites.constants';
import type { SiteFormModel } from '../hooks/useSiteForm';

type SiteFormViewProps = Omit<SiteFormModel, 'isNotFound'>;

export function SiteFormView({ title, submitLabel, backTo, form, statusOptions, handleSubmit }: SiteFormViewProps) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <form className="page-container" onSubmit={handleSubmit} noValidate>
      <PageHeader title={title} backTo={backTo} />

      <FormSection title={L.sectionInvestigator}>
        <div className="form-grid">
          <TextField
            label={F.investigatorName}
            isRequired
            error={errors.investigatorName?.message}
            {...register('investigatorName')}
          />
          <TextField
            label={F.investigatorEmail}
            type="email"
            isRequired
            error={errors.investigatorEmail?.message}
            {...register('investigatorEmail')}
          />
        </div>
      </FormSection>

      <FormSection title={L.sectionSite}>
        <div className="form-grid">
          <TextField
            label={F.siteCode}
            isRequired
            hint={F.siteCodeHint}
            error={errors.siteCode?.message}
            {...register('siteCode')}
          />
          <TextField label={F.siteName} isRequired error={errors.siteName?.message} {...register('siteName')} />
          <TextField label={F.location} isRequired error={errors.location?.message} {...register('location')} />
          <SelectField
            label={F.statusId}
            isRequired
            options={statusOptions}
            error={errors.statusId?.message}
            {...register('statusId')}
          />
          <TextAreaField
            label={F.address}
            isRequired
            isFullWidth
            rows={4}
            error={errors.address?.message}
            {...register('address')}
          />
          <TextField
            label={F.expectedRecruitment}
            type="number"
            min={1}
            isRequired
            error={errors.expectedRecruitment?.message}
            {...register('expectedRecruitment', { valueAsNumber: true })}
          />
        </div>
      </FormSection>

      <FormActions submitLabel={submitLabel} cancelTo={backTo} isSubmitting={formState.isSubmitting} />
    </form>
  );
}
