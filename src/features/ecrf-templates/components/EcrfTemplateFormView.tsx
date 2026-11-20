import { FileText, History, LayoutList } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/date.utils';
import { TabPanel, Tabs } from '@/components/layout';
import { SelectField, TextAreaField, TextField } from '@/components/form';
import { DrawerActions, DrawerPanel, DrawerSection, Tooltip } from '@/components/overlay';
import { ConfirmDialog } from '@/components/feedback';
import { STATUS_SELECT_OPTIONS } from '@/features/user-common';
import { FormBuilder } from '@/features/form-builder';
import {
  ECRF_TEMPLATE_FIELDS as F,
  ECRF_TEMPLATE_LABELS as L,
} from '../constants/ecrf-templates.constants';
import type { EcrfTemplateFormModel } from '../hooks/useEcrfTemplateForm';

type EcrfTemplateFormViewProps = EcrfTemplateFormModel;

const TAB_ITEMS = [
  { key: 'details', label: L.tabDetails, icon: FileText },
  { key: 'builder', label: L.tabBuilder, icon: LayoutList },
];

/** Drawer: (1) template details, Next; (2) the form builder with its live preview, Save. */
export function EcrfTemplateFormView({
  title,
  subtitle,
  isNameLocked,
  detailsHint,
  tabs,
  form,
  productGroupOptions,
  draft,
  setDraft,
  builderRef,
  fieldTypes,
  keyMode,
  sectionKeyCatalog,
  primaryLabel,
  handlePrimary,
  confirm,
  isDirty,
  isSaving,
  recovery,
  leaveConfirm,
}: EcrfTemplateFormViewProps) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <DrawerPanel
      title={title}
      subtitle={subtitle}
      headerExtra={
        isDirty && (
          <Tooltip content={L.unsavedTip} placement="bottom">
            <span className="flex shrink-0 items-center gap-1.5 rounded-pill bg-status-warning-soft px-2.5 py-1 text-caption font-medium text-tone-orange">
              <span className="size-1.5 rounded-pill bg-status-warning" aria-hidden />
              {L.unsavedBadge}
            </span>
          </Tooltip>
        )
      }
      tabs={
        <Tabs
          items={TAB_ITEMS}
          activeKey={tabs.activeTab}
          onChange={tabs.setActiveTab}
          idPrefix={tabs.idPrefix}
        />
      }
      footer={
        <DrawerActions primaryLabel={primaryLabel} onPrimary={() => void handlePrimary()} isBusy={isSaving} />
      }
    >
      {recovery && (
        <div
          role="status"
          className="flex shrink-0 flex-wrap items-center gap-3 rounded-card border border-status-info bg-status-info-soft px-4 py-3"
        >
          <History className="size-5 shrink-0 text-accent-700" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium text-ink-800">
              {L.recoveryTitle(`${formatDate(recovery.savedAt)} ${formatTime(recovery.savedAt)}`)}
            </p>
            <p className="text-label text-ink-600">{L.recoveryHint}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={recovery.dismiss}>
              {L.discardDraft}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={recovery.restore}>
              {L.restore}
            </button>
          </div>
        </div>
      )}
      <TabPanel idPrefix={tabs.idPrefix} tabKey="details" activeKey={tabs.activeTab}>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void handlePrimary();
          }}
        >
          <DrawerSection title={L.detailsSection} description={detailsHint}>
            <div className="form-grid">
              <TextField
                label={F.name}
                isRequired
                readOnly={isNameLocked}
                hint={isNameLocked ? L.nameLocked : undefined}
                error={errors.name?.message}
                {...register('name')}
              />
              <SelectField
                label={F.productGroup}
                isRequired
                options={productGroupOptions}
                error={errors.productGroupId?.message}
                {...register('productGroupId')}
              />
              <SelectField
                label={F.status}
                isRequired
                placeholder={false}
                options={STATUS_SELECT_OPTIONS}
                error={errors.status?.message}
                {...register('status')}
              />
              <TextAreaField
                label={F.suitableFor}
                isRequired
                isFullWidth
                error={errors.suitableFor?.message}
                {...register('suitableFor')}
              />
            </div>
          </DrawerSection>
        </form>
      </TabPanel>

      {/* Outside the <form>: Enter in a builder input must not submit the details. */}
      <TabPanel idPrefix={tabs.idPrefix} tabKey="builder" activeKey={tabs.activeTab}>
        <FormBuilder
          ref={builderRef}
          value={draft}
          onChange={setDraft}
          keyMode={keyMode}
          sectionKeyCatalog={sectionKeyCatalog}
          fieldTypes={fieldTypes}
        />
      </TabPanel>

      <ConfirmDialog {...confirm} confirmLabel={L.save} />
      <ConfirmDialog {...leaveConfirm} tone="danger" />
    </DrawerPanel>
  );
}
