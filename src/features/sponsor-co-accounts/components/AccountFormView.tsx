import { useId } from 'react';
import { ShieldCheck, UserRound } from 'lucide-react';
import { Tabs } from '@/components/layout';
import { SelectField } from '@/components/form';
import { DrawerActions, DrawerPanel, DrawerSection } from '@/components/overlay';
import {
  ACCOUNT_TYPE_SELECT_OPTIONS,
  AccessRightsDrawerSections,
  DRAWER_LABELS as D,
  IdentityFields,
  USER_FIELD_HINTS,
  USER_FIELD_LABELS,
} from '@/features/user-common';
import { ACCOUNTS_LABELS as L } from '../constants/accounts.constants';
import type { AccountFormModel, AccountFormTab } from '../hooks/useAccountForm';

type AccountFormViewProps = Omit<AccountFormModel, 'isNotFound'>;

const TABS = [
  { key: 'details', label: D.tabDetails, icon: UserRound },
  { key: 'access', label: L.globalTabLabel, icon: ShieldCheck },
];

/** Drawer form: sponsor accounts get a Global access rights tab; CO accounts a short note instead. */
export function AccountFormView({
  title,
  subtitle,
  submitLabel,
  formId,
  form,
  accessRights,
  accountType,
  isSponsor,
  activeTab,
  setActiveTab,
  isAccountTypeLocked,
  handleSubmit,
}: AccountFormViewProps) {
  const { register, formState } = form;
  const idPrefix = useId();
  const panelProps = (key: AccountFormTab) => ({
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
        isSponsor && (
          <Tabs
            items={TABS}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as AccountFormTab)}
            idPrefix={idPrefix}
          />
        )
      }
      footer={<DrawerActions primaryLabel={submitLabel} formId={formId} isBusy={formState.isSubmitting} />}
    >
      {/* Tabs stay mounted (only hidden) so values and errors survive tab switches. */}
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <div {...panelProps('details')}>
          <DrawerSection title={D.userDetails} description={D.userDetailsHint}>
            <IdentityFields register={register} errors={formState.errors}>
              {isAccountTypeLocked ? (
                <>
                  {/* Disabled inputs drop out of RHF values, so keep the value in a hidden input. */}
                  <input type="hidden" {...register('accountType')} />
                  <SelectField
                    label={USER_FIELD_LABELS.accountType}
                    isRequired
                    placeholder={false}
                    options={ACCOUNT_TYPE_SELECT_OPTIONS}
                    value={accountType}
                    disabled
                    hint={USER_FIELD_HINTS.accountTypeLocked}
                  />
                </>
              ) : (
                <SelectField
                  label={USER_FIELD_LABELS.accountType}
                  isRequired
                  placeholder={false}
                  options={ACCOUNT_TYPE_SELECT_OPTIONS}
                  error={formState.errors.accountType?.message}
                  {...register('accountType')}
                />
              )}
            </IdentityFields>
          </DrawerSection>
          {!isSponsor && (
            <DrawerSection title={L.coRightsTitle}>
              <p className="text-body text-ink-700">{L.coNote}</p>
            </DrawerSection>
          )}
        </div>
        {isSponsor && (
          <div {...panelProps('access')}>
            <AccessRightsDrawerSections model={accessRights} matrixTitle={L.globalMatrixTitle} />
          </div>
        )}
      </form>
    </DrawerPanel>
  );
}
