import { Controller } from 'react-hook-form';
import { ShieldCheck, UserRound } from 'lucide-react';
import { TabPanel, Tabs } from '@/components/layout';
import { ReadOnlyField, SearchSelect, SelectField } from '@/components/form';
import { DrawerActions, DrawerPanel, DrawerSection } from '@/components/overlay';
import type { AffiliationFormModel } from '../hooks/useAffiliationForm';
import { AFFILIATION_LABELS as L } from '../constants/affiliation.constants';
import { DRAWER_LABELS as D } from '../constants/drawer.constants';
import { TIME_ZONE_SELECT_OPTIONS, USER_FIELD_LABELS as F } from '../constants/user-common.constants';
import { AccessRightsDrawerSections } from './AccessRightsDrawerSections';

interface AffiliationFormViewProps {
  title: string;
  subtitle?: string;
  submitLabel: string;
  matrixTitle: string;
  model: AffiliationFormModel;
}

const TAB_ITEMS = [
  { key: 'user', label: L.tabUser, icon: UserRound },
  { key: 'access', label: D.tabAccess, icon: ShieldCheck },
];

/** Drawer form: (1) email search → auto-filled identity, designation, time-zone; (2) access rights. */
export function AffiliationFormView({ title, subtitle, submitLabel, matrixTitle, model }: AffiliationFormViewProps) {
  const { formId, tabs, form, accessRights, accountOptions, selectedUser, designationOptions, isEdit, handleSubmit } = model;
  const { register, control, formState } = form;
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
        <TabPanel idPrefix={tabs.idPrefix} tabKey="user" activeKey={tabs.activeTab}>
          <DrawerSection title={L.accountSection} description={isEdit ? L.accountHintEdit : L.accountHint}>
            <div className="form-grid">
              {!isEdit && (
                <Controller
                  control={control}
                  name="userId"
                  render={({ field, fieldState }) => (
                    <SearchSelect
                      label={L.searchAccount}
                      isRequired
                      isFullWidth
                      placeholder={L.searchPlaceholder}
                      emptyLabel={L.noAccounts}
                      options={accountOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              )}
              <ReadOnlyField label={F.prefix} value={selectedUser?.prefix} />
              <ReadOnlyField label={F.name} value={selectedUser?.name} />
              <ReadOnlyField label={F.email} value={selectedUser?.email} />
              <ReadOnlyField label={F.organization} value={selectedUser?.organization} />
            </div>
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
          <AccessRightsDrawerSections model={accessRights} matrixTitle={matrixTitle} isTemplateRequired />
        </TabPanel>
      </form>
    </DrawerPanel>
  );
}
