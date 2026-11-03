import { FileField, SelectField, TextAreaField, TextField } from '@/components/form';
import { DrawerActions, DrawerPanel, DrawerSection } from '@/components/overlay';
import { PROJECT_FIELDS as F, PROJECT_LABELS as L } from '../constants/projects.constants';
import type { ProjectFormModel } from '../hooks/useProjectForm';

type ProjectFormViewProps = Omit<ProjectFormModel, 'isNotFound'>;

/** Drawer form: three grey sections, Cancel + primary in the footer. */
export function ProjectFormView({
  title,
  subtitle,
  submitLabel,
  formId,
  form,
  options,
  logoFileName,
  handleLogoChange,
  handleSubmit,
}: ProjectFormViewProps) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <DrawerPanel
      title={title}
      subtitle={subtitle}
      footer={<DrawerActions primaryLabel={submitLabel} formId={formId} isBusy={formState.isSubmitting} />}
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <DrawerSection title={L.sectionStudy} description={L.sectionStudyHint}>
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
        </DrawerSection>

        <DrawerSection title={L.sectionTeam} description={L.sectionTeamHint}>
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
        </DrawerSection>

        <DrawerSection title={L.sectionTargets}>
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
        </DrawerSection>
      </form>
    </DrawerPanel>
  );
}
