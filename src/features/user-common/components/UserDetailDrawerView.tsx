import { useId, useState } from 'react';
import { FileText, Pencil, ShieldCheck, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { DetailList, Tabs, type DetailItem } from '@/components/layout';
import { DrawerActions, DrawerPanel, DrawerSection } from '@/components/overlay';
import { StatusBadge, type StatusKind } from '@/components/feedback';
import { PermissionTable } from '@/components/permission-matrix';
import type { DetailMatrix } from '../user-common.types';
import { DRAWER_LABELS as L } from '../constants/drawer.constants';

export interface DetailSection {
  title: string;
  items: DetailItem[];
}

export interface DrawerToolbarAction {
  key: string;
  label: string;
  icon: LucideIcon;
  tone?: 'default' | 'danger';
  onClick: () => void;
}

interface UserDetailDrawerViewProps {
  title: string;
  subtitle?: string;
  status?: StatusKind;
  sections: DetailSection[];
  matrix?: DetailMatrix;
  /** Secondary actions in the toolbar row (Deactivate, Deaffiliate…). */
  toolbarActions?: DrawerToolbarAction[];
  /** Shown as the primary footer button when the user may edit. */
  onEdit?: () => void;
}

const TABS = [
  { key: 'overview', label: L.tabOverview, icon: FileText },
  { key: 'access', label: L.tabAccess, icon: ShieldCheck },
];

/** Read-only drawer: Overview (label/value sections) and, when rights apply, an Access rights tab. */
export function UserDetailDrawerView({
  title,
  subtitle,
  status,
  sections,
  matrix,
  toolbarActions = [],
  onEdit,
}: UserDetailDrawerViewProps) {
  const idPrefix = useId();
  const [activeTab, setActiveTab] = useState('overview');
  const showOverview = !matrix || activeTab === 'overview';

  return (
    <DrawerPanel
      title={title}
      subtitle={subtitle}
      headerExtra={status && <StatusBadge status={status} />}
      toolbar={
        toolbarActions.length > 0 &&
        toolbarActions.map(({ key, label, icon: Icon, tone, onClick }) => (
          <button
            key={key}
            type="button"
            className={clsx('btn btn-sm border-base-300 bg-base-100', tone === 'danger' && 'text-error')}
            onClick={onClick}
          >
            <Icon className="size-4" aria-hidden /> {label}
          </button>
        ))
      }
      tabs={matrix && <Tabs items={TABS} activeKey={activeTab} onChange={setActiveTab} idPrefix={idPrefix} />}
      footer={<DrawerActions cancelLabel={L.close} primaryLabel={onEdit && L.edit} primaryIcon={Pencil} onPrimary={onEdit} />}
    >
      {showOverview ? (
        sections.map((section) => (
          <DrawerSection key={section.title} title={section.title}>
            <DetailList items={section.items} />
          </DrawerSection>
        ))
      ) : (
        // The table card has its own header, so no section title above it.
        <div className="shrink-0">
          <PermissionTable
            title={matrix.title ?? L.effectiveRights}
            matrix={matrix.matrix}
            scopeTypes={matrix.scopeTypes}
            value={matrix.permissions}
            templatePermissions={matrix.templatePermissions}
            templateName={matrix.templateName}
            isReadOnly
          />
        </div>
      )}
    </DrawerPanel>
  );
}
