import { PageHeader } from '@/components/layout';
import { FileField, FormActions, FormSection, SelectField, TextAreaField, TextField } from '@/components/form';
import { PROJECT_FIELDS as F, PROJECT_LABELS as L } from '../constants/projects.constants';
import type { ProjectFormModel } from '../hooks/useProjectForm';

type ProjectFormViewProps = Omit<ProjectFormModel, 'isNotFound'>;

export function ProjectFormView({
  title,
  submitLabel,
  backTo,
  form,
  options,
  logoFileName,
  handleLogoChange,
  handleSubmit,
}: ProjectFormViewProps) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <form className="page-container" onSubmit={handleSubmit} noValidate>
      <PageHeader title={title} backTo={backTo} />

      <FormSection title={L.sectionStudy}>
        <div className="form-grid">
          <TextField label={F.name} isRequired error={errors.name?.message} {...register('name')} />
          <TextField label={F.cipNo} isRequired error={errors.cipNo?.message} {...register('cipNo')} />
          <TextField label={F.testProduct} isRequired error={errors.testProduct?.message} {...register('testProduct')} />
          <TextField label={F.sponsor} isRequired error={errors.sponsor?.message} {...register('sponsor')} />
          <TextAreaField
            label={F.description}
            isRequired
            isFullWidth
            rows={4}
            error={errors.description?.message}
            {...register('description')}
          />
          <FileField label={F.logo} accept="image/*" fileName={logoFileName} onFileNameChange={handleLogoChange} />
        </div>
      </FormSection>

      <FormSection title={L.sectionTeam}>
        <div className="form-grid">
          <SelectField
            label={F.projectManagerId}
            isRequired
            options={options.projectManagers}
            error={errors.projectManagerId?.message}
            {...register('projectManagerId')}
          />
          <TextField label={F.croName} error={errors.croName?.message} {...register('croName')} />
          <SelectField
            label={F.croProjectManagerId}
            placeholder={L.noneOption}
            options={options.croProjectManagers}
            {...register('croProjectManagerId')}
          />
          <SelectField
            label={F.croAssistantPmId}
            placeholder={L.noneOption}
            options={options.croAssistantPms}
            {...register('croAssistantPmId')}
          />
        </div>
      </FormSection>

      <FormSection title={L.sectionTargets}>
        <div className="form-grid">
          <TextField
            label={F.enrolmentTarget}
            type="number"
            min={1}
            isRequired
            error={errors.enrolmentTarget?.message}
            {...register('enrolmentTarget', { valueAsNumber: true })}
          />
          <TextField
            label={F.sitesIdentified}
            type="number"
            min={1}
            isRequired
            error={errors.sitesIdentified?.message}
            {...register('sitesIdentified', { valueAsNumber: true })}
          />
          <SelectField
            label={F.statusId}
            isRequired
            options={options.statuses}
            error={errors.statusId?.message}
            {...register('statusId')}
          />
        </div>
      </FormSection>

      <FormActions submitLabel={submitLabel} cancelTo={backTo} isSubmitting={formState.isSubmitting} />
    </form>
  );
}
