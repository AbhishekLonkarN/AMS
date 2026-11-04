import { Building2, Laptop, Pencil, Save, UserRound } from 'lucide-react';
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
import styles from './CompanyProfileView.module.css';

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
        <FormSection title={L.ownerSection} icon={Building2}>
          <div className={styles.columns}>
            <div className={styles.column}>
              <ReadOnlyField label={F.ownerDisplayName} value={profile.ownerDisplayName} />
              <ReadOnlyField label={F.address} value={profile.address} />
            </div>
            <div className={styles.column}>
              <ReadOnlyField label={F.legalName} value={profile.legalName} />
            </div>
          </div>
        </FormSection>
        <FormSection title={L.softwareSection} icon={Laptop}>
          <div className={styles.columns}>
            <div className={styles.column}>
              <ReadOnlyField
                label={F.softwareName}
                value={profile.softwareName && <span className={styles.emphasis}>{profile.softwareName}</span>}
              />
            </div>
            <div className={styles.column}>
              <ReadOnlyField label={F.logo} value={profile.logoFileName} />
            </div>
          </div>
        </FormSection>
        <FormSection title={L.adminSection} icon={UserRound}>
          <div className={styles.columns}>
            <div className={styles.column}>
              <ReadOnlyField
                label={F.itAdminUserId}
                value={profile.itAdminUserId && <span className={styles.emphasis}>{profile.itAdminUserId}</span>}
              />
            </div>
            <div className={styles.column}>
              <ReadOnlyField label={F.itAdminName} value={profile.itAdminName} />
            </div>
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

      <FormSection title={L.ownerSection} icon={Building2}>
        <div className="form-grid">
          <TextField label={F.ownerDisplayName} isRequired error={errors.ownerDisplayName?.message} {...register('ownerDisplayName')} />
          <TextField label={F.legalName} isRequired error={errors.legalName?.message} {...register('legalName')} />
          <TextAreaField label={F.address} isRequired isFullWidth rows={5} error={errors.address?.message} {...register('address')} />
        </div>
      </FormSection>

      <FormSection title={L.softwareSection} icon={Laptop}>
        <div className="form-grid">
          <TextField label={F.softwareName} isRequired error={errors.softwareName?.message} {...register('softwareName')} />
          <FileField label={F.logo} accept="image/*" fileName={logoFileName} onFileNameChange={handleLogoChange} />
        </div>
      </FormSection>

      <FormSection title={L.adminSection} icon={UserRound}>
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
