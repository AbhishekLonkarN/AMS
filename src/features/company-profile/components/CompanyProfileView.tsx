import { Pencil, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  FileField,
  FormSection,
  ReadOnlyField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/form';
import {
  COMPANY_PROFILE_FIELDS as F,
  COMPANY_PROFILE_LABELS as L,
} from '../constants/company-profile.constants';
import type { CompanyProfileModel } from '../hooks/useCompanyProfile';

/** Read-only profile; the Edit button (edit rights only) turns the same sections into a form. */
export function CompanyProfileView({
  profile,
  isEditing,
  onEdit,
  handleCancel,
  form,
  adminOptions,
  logoFileName,
  itAdminUserId,
  handleLogoChange,
  handleAdminChange,
  handleSubmit,
}: CompanyProfileModel) {
  const { register, formState } = form;
  const { errors } = formState;

  if (!isEditing) {
    return (
      <div className="page-container">
        <PageHeader
          title={L.title}
          description={L.description}
          actions={
            onEdit && (
              <button type="button" className="btn btn-primary btn-sm" onClick={onEdit}>
                <Pencil className="size-4" aria-hidden /> {L.edit}
              </button>
            )
          }
        />
        <FormSection title={L.ownerSection}>
          <div className="form-grid">
            <ReadOnlyField label={F.ownerDisplayName} value={profile.ownerDisplayName} />
            <ReadOnlyField label={F.legalName} value={profile.legalName} />
            <ReadOnlyField label={F.address} value={profile.address} isFullWidth />
          </div>
        </FormSection>
        <FormSection title={L.softwareSection}>
          <div className="form-grid">
            <ReadOnlyField label={F.softwareName} value={profile.softwareName} />
            <ReadOnlyField label={F.logo} value={profile.logoFileName} />
          </div>
        </FormSection>
        <FormSection title={L.adminSection}>
          <div className="form-grid">
            <ReadOnlyField label={F.itAdminUserId} value={profile.itAdminUserId} />
            <ReadOnlyField label={F.itAdminName} value={profile.itAdminName} />
          </div>
        </FormSection>
      </div>
    );
  }

  return (
    <form className="page-container" onSubmit={handleSubmit} noValidate>
      {/* The header sits inside the <form>, so the Save button submits it. */}
      <PageHeader
        title={L.editTitle}
        description={L.description}
        actions={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancel}>
              {L.cancel}
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!formState.isDirty || formState.isSubmitting}>
              <Save className="size-4" aria-hidden /> {L.save}
            </button>
          </>
        }
      />

      <FormSection title={L.ownerSection}>
        <div className="form-grid">
          <TextField label={F.ownerDisplayName} isRequired error={errors.ownerDisplayName?.message} {...register('ownerDisplayName')} />
          <TextField label={F.legalName} isRequired error={errors.legalName?.message} {...register('legalName')} />
          <TextAreaField label={F.address} isRequired isFullWidth rows={5} error={errors.address?.message} {...register('address')} />
        </div>
      </FormSection>

      <FormSection title={L.softwareSection}>
        <div className="form-grid">
          <TextField label={F.softwareName} isRequired error={errors.softwareName?.message} {...register('softwareName')} />
          <FileField label={F.logo} accept="image/*" fileName={logoFileName} onFileNameChange={handleLogoChange} />
        </div>
      </FormSection>

      <FormSection title={L.adminSection}>
        <div className="form-grid">
          <SelectField
            label={F.itAdminUserId}
            isRequired
            options={adminOptions}
            value={itAdminUserId}
            error={errors.itAdminUserId?.message}
            onChange={(e) => handleAdminChange(e.target.value)}
          />
          <TextField label={F.itAdminName} isRequired readOnly hint={F.itAdminHint} {...register('itAdminName')} />
        </div>
      </FormSection>
    </form>
  );
}
