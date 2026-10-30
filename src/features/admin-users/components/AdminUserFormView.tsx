import { useId } from 'react';
import { ShieldCheck, UserRound } from 'lucide-react';
import { Tabs } from '@/components/layout';
import { DrawerActions, DrawerPanel, DrawerSection } from '@/components/overlay';
import { AccessRightsDrawerSections, DRAWER_LABELS as D, IdentityFields } from '@/features/user-common';
import { ADMIN_USERS_LABELS as L } from '../constants/admin-users.constants';
import type { AdminUserFormModel, AdminUserFormTab } from '../hooks/useAdminUserForm';

type AdminUserFormViewProps = Omit<AdminUserFormModel, 'isNotFound'>;

const TABS = [
  { key: 'details', label: D.tabDetails, icon: UserRound },
  { key: 'access', label: D.tabAccess, icon: ShieldCheck },
];

/** Drawer form: tabs (details / access rights), grey sections, Cancel + primary in the footer. */
export function AdminUserFormView({
  title,
  subtitle,
  submitLabel,
  formId,
  form,
  accessRights,
  activeTab,
  setActiveTab,
  isStatusLocked,
  handleSubmit,
}: AdminUserFormViewProps) {
  const idPrefix = useId();
  const panelProps = (key: AdminUserFormTab) => ({
    role: 'tabpanel',
    id: `${idPrefix}-panel-${key}`,
    'aria-labelledby': `${idPrefix}-tab-${key}`,
    hidden: activeTab !== key,
    className: 'flex flex-col gap-6',
  });

  return (
    <DrawerPanel
      title={title}
      subtitle={subtitle}
      tabs={
        <Tabs
          items={TABS}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as AdminUserFormTab)}
          idPrefix={idPrefix}
        />
      }
      footer={<DrawerActions primaryLabel={submitLabel} formId={formId} isBusy={form.formState.isSubmitting} />}
    >
      {/* Both tabs stay mounted (only hidden) so values and errors survive tab switches. */}
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <div {...panelProps('details')}>
          <DrawerSection title={D.userDetails} description={D.userDetailsHint}>
            <IdentityFields register={form.register} errors={form.formState.errors} isStatusLocked={isStatusLocked} />
          </DrawerSection>
        </div>
        <div {...panelProps('access')}>
          <AccessRightsDrawerSections model={accessRights} matrixTitle={L.matrixTitle} matrixStyle="table" />
        </div>
      </form>
    </DrawerPanel>
  );
}
