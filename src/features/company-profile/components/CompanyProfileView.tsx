import { Building2, Laptop, Pencil, Save, UserRound } from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/components/layout';
import {
  FileField,
  FormSection,
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

function Item({ label, value, isWide, isStrong }: { label: string; value?: string; isWide?: boolean; isStrong?: boolean }) {
  return (
    <div className={clsx(styles.item, isWide && styles.wide)}>
      <span className={styles.label}>{label}</span>
      <span className={clsx(styles.value, isStrong && value && styles.emphasis, !value && styles.empty)}>{value || '—'}</span>
    </div>
  );
}

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
          <div className={styles.grid}>
            <Item label={F.ownerDisplayName} value={profile.ownerDisplayName} />
            <Item label={F.legalName} value={profile.legalName} />
            <Item label={F.address} value={profile.address} isWide />
          </div>
        </FormSection>
        <FormSection title={L.softwareSection} icon={Laptop}>
          <div className={styles.grid}>
            <Item label={F.softwareName} value={profile.softwareName} isStrong />
            <Item label={F.logo} value={profile.logoFileName} />
          </div>
        </FormSection>
        <FormSection title={L.adminSection} icon={UserRound}>
          <div className={styles.grid}>
            <Item label={F.itAdminUserId} value={profile.itAdminUserId} isStrong />
            <Item label={F.itAdminName} value={profile.itAdminName} />
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
