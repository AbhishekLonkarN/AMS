import { FileText, ShieldCheck } from 'lucide-react';
import { TabPanel, Tabs } from '@/components/layout';
import { SelectField, TextField } from '@/components/form';
import { DrawerActions, DrawerPanel, DrawerSection } from '@/components/overlay';
import { PermissionTable } from '@/components/permission-matrix';
import { STATUS_SELECT_OPTIONS } from '@/features/user-common';
import {
  ACCESS_RIGHTS_FIELDS as F,
  ACCESS_RIGHTS_LABELS as L,
  USER_TYPE_SELECT_OPTIONS,
} from '../constants/access-rights.constants';
import type { TemplateFormModel } from '../hooks/useTemplateForm';

type TemplateFormViewProps = Omit<TemplateFormModel, 'isNotFound'>;

const TAB_ITEMS = [
  { key: 'details', label: L.tabDetails, icon: FileText },
  { key: 'access', label: L.tabAccess, icon: ShieldCheck },
];

/** Drawer form: (1) set name, user type, status; (2) the rights for that user type. */
export function TemplateFormView({
  title,
  subtitle,
  submitLabel,
  formId,
  tabs,
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
    <DrawerPanel
      title={title}
      subtitle={subtitle}
      tabs={<Tabs items={TAB_ITEMS} activeKey={tabs.activeTab} onChange={tabs.setActiveTab} idPrefix={tabs.idPrefix} />}
      footer={<DrawerActions primaryLabel={submitLabel} formId={formId} isBusy={formState.isSubmitting} />}
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <TabPanel idPrefix={tabs.idPrefix} tabKey="details" activeKey={tabs.activeTab}>
          <DrawerSection title={L.detailsSection} description={L.detailsHint}>
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
          </DrawerSection>
        </TabPanel>

        <TabPanel idPrefix={tabs.idPrefix} tabKey="access" activeKey={tabs.activeTab}>
          {permissionsError && (
            <p role="alert" className="text-label text-error">
              {permissionsError}
            </p>
          )}
          {matrix ? (
            <div className="shrink-0">
              <PermissionTable title={matrixTitle} matrix={matrix} value={permissions} onChange={handlePermissionsChange} />
            </div>
          ) : (
            <DrawerSection title={L.tabAccess}>
              <p className="text-body text-ink-600">{L.pickUserType}</p>
            </DrawerSection>
          )}
        </TabPanel>
      </form>
    </DrawerPanel>
  );
}
