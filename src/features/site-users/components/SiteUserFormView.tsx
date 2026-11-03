import { Info, ShieldCheck, UserRound } from 'lucide-react';
import { TabPanel, Tabs } from '@/components/layout';
import { SelectField } from '@/components/form';
import { DrawerActions, DrawerPanel, DrawerSection } from '@/components/overlay';
import {
  AccessRightsDrawerSections,
  DRAWER_LABELS as D,
  IdentityFields,
  TIME_ZONE_SELECT_OPTIONS,
  USER_FIELD_LABELS as F,
} from '@/features/user-common';
import { SITE_USER_LABELS as L } from '../constants/site-users.constants';
import type { SiteUserFormModel } from '../hooks/useSiteUserForm';

type SiteUserFormViewProps = Omit<SiteUserFormModel, 'isNotFound'>;

const TAB_ITEMS = [
  { key: 'details', label: D.tabDetails, icon: UserRound },
  { key: 'access', label: D.tabAccess, icon: ShieldCheck },
];

/** Drawer form: (1) identity, designation, time-zone; (2) access rights. */
export function SiteUserFormView({
  title,
  subtitle,
  submitLabel,
  formId,
  tabs,
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
    <DrawerPanel
      title={title}
      subtitle={subtitle}
      tabs={<Tabs items={TAB_ITEMS} activeKey={tabs.activeTab} onChange={tabs.setActiveTab} idPrefix={tabs.idPrefix} />}
      footer={<DrawerActions primaryLabel={submitLabel} formId={formId} isBusy={formState.isSubmitting} />}
    >
      {/* Both tabs stay mounted (only hidden) so values and errors survive tab switches. */}
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <TabPanel idPrefix={tabs.idPrefix} tabKey="details" activeKey={tabs.activeTab}>
          {reuseNotice && (
            <div role="note" className="alert alert-info alert-soft shrink-0">
              <Info className="size-5 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">{L.reuseTitle}</p>
                <p>{reuseNotice}</p>
              </div>
            </div>
          )}
          <DrawerSection title={D.userDetails} description={L.identityHint}>
            <IdentityFields register={register} errors={errors} hasOrganization={false} isStatusLocked={isStatusLocked} />
          </DrawerSection>

          <DrawerSection title={L.roleSection}>
            <div className="form-grid">
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
            </div>
          </DrawerSection>
        </TabPanel>

        <TabPanel idPrefix={tabs.idPrefix} tabKey="access" activeKey={tabs.activeTab}>
          <AccessRightsDrawerSections model={accessRights} matrixTitle={L.matrixTitle} isTemplateRequired />
        </TabPanel>
      </form>
    </DrawerPanel>
  );
}
