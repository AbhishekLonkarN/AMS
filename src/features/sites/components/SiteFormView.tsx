import { SelectField, TextAreaField, TextField } from '@/components/form';
import { DrawerActions, DrawerPanel, DrawerSection } from '@/components/overlay';
import { SITE_FIELDS as F, SITE_LABELS as L } from '../constants/sites.constants';
import type { SiteFormModel } from '../hooks/useSiteForm';

type SiteFormViewProps = Omit<SiteFormModel, 'isNotFound'>;

/** Drawer form: investigator + site sections, Cancel + primary in the footer. */
export function SiteFormView({ title, subtitle, submitLabel, formId, form, statusOptions, handleSubmit }: SiteFormViewProps) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <DrawerPanel
      title={title}
      subtitle={subtitle}
      footer={<DrawerActions primaryLabel={submitLabel} formId={formId} isBusy={formState.isSubmitting} />}
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <DrawerSection title={L.sectionInvestigator} description={L.sectionInvestigatorHint}>
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
        </DrawerSection>

        <DrawerSection title={L.sectionSite}>
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
        </DrawerSection>
      </form>
    </DrawerPanel>
  );
}
