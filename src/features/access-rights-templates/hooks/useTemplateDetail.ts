import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, RotateCcw } from 'lucide-react';
import { PERMISSION_CATALOG, usePermissionChecker } from '@/rbac';
import { notify, useAccessRightsSetsStore } from '@/store';
import { paths } from '@/app/router/route-paths.constants';
import { USER_TYPE_LABELS } from '@/constants/user.constants';
import {
  DRAWER_LABELS as D,
  USER_FIELD_LABELS,
  formatCreated,
  type DrawerToolbarAction,
  type StatusToggleConfirm,
} from '@/features/user-common';
import { ACCESS_RIGHTS_FIELDS as F, ACCESS_RIGHTS_LABELS as L } from '../constants/access-rights.constants';
import { saveErrorMessage } from '../utils/access-rights.utils';

/** Read-only set + its rights (drawer View mode), with Deactivate / Re-activate. */
export function useTemplateDetail(templateId?: string) {
  const navigate = useNavigate();
  const template = useAccessRightsSetsStore((s) => s.sets.find((t) => t.id === templateId));
  const isLoaded = useAccessRightsSetsStore((s) => s.loadState === 'loaded');
  const setActive = useAccessRightsSetsStore((s) => s.setActive);
  const can = usePermissionChecker();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!template) {
    return isLoaded
      ? { isLoading: false as const, isNotFound: true as const }
      : { isLoading: true as const, isNotFound: false as const };
  }

  const isActive = template.status === 'active';
  const toolbarActions: DrawerToolbarAction[] = can('masterDefaultAccessRights.delete')
    ? [
        {
          key: 'toggle',
          label: isActive ? L.deactivate : L.reactivate,
          icon: isActive ? Ban : RotateCcw,
          tone: isActive ? 'danger' : 'default',
          onClick: () => setIsConfirming(true),
        },
      ]
    : [];

  const confirm: StatusToggleConfirm = {
    isOpen: isConfirming,
    title: isActive ? L.confirmDeactivateTitle : L.confirmReactivateTitle,
    message: isActive ? L.confirmDeactivate(template.name) : L.confirmReactivate(template.name),
    confirmLabel: isActive ? L.deactivate : L.reactivate,
    tone: isActive ? 'danger' : 'primary',
    onConfirm: async () => {
      setIsConfirming(false);
      try {
        await setActive(template.id, !isActive);
        notify.success(isActive ? L.deactivated(template.name) : L.reactivated(template.name));
      } catch (error) {
        notify.error(saveErrorMessage(error));
      }
    },
    onCancel: () => setIsConfirming(false),
  };

  return {
    isLoading: false as const,
    isNotFound: false as const,
    title: template.name,
    subtitle: USER_TYPE_LABELS[template.userType],
    status: template.status,
    sections: [
      {
        title: L.detailsSection,
        items: [
          { label: F.name, value: template.name },
          { label: F.userType, value: USER_TYPE_LABELS[template.userType] },
        ],
      },
      {
        title: D.record,
        items: [
          { label: F.createdBy, value: template.createdByName },
          { label: USER_FIELD_LABELS.createdAt, value: formatCreated(template.createdAt) },
        ],
      },
    ],
    matrix: {
      title: L.matrixTitle(USER_TYPE_LABELS[template.userType]),
      matrix: PERMISSION_CATALOG[template.userType],
      permissions: template.permissions,
    },
    toolbarActions,
    onEdit: can('masterDefaultAccessRights.edit') ? () => navigate(paths.accessRightsEdit(template.id)) : undefined,
    confirm,
  };
}
