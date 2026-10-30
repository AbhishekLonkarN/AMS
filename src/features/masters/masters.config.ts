import type { MasterKey, PermissionKey } from '@/types';
import { MASTER_META } from '@/constants/master.constants';

/** Everything the generic master screen needs for one master (brief §5, screens 16–19). */
export interface MasterConfig {
  key: MasterKey;
  title: string;
  /** Field / column label and the name used in messages, e.g. "Product Group". */
  itemName: string;
  description: string;
  permissions: {
    view: PermissionKey;
    new: PermissionKey;
    edit: PermissionKey;
    /** Deactivate / Re-activate (assumption 7; Product Group uses edit). */
    deactivate: PermissionKey;
  };
}

const DESCRIPTIONS: Record<MasterKey, string> = {
  productGroup: 'Device / therapeutic categories used to organise eCRF templates.',
  projectStatus: 'Study lifecycle stages used on projects.',
  siteStatus: 'Site lifecycle stages used on investigators and sites.',
  participantStatus: 'Patient disposition values used on participants.',
};

const build = (key: MasterKey): MasterConfig => {
  const meta = MASTER_META[key];
  const prefix = meta.permissionModule;
  return {
    key,
    title: meta.title,
    itemName: meta.itemName,
    description: DESCRIPTIONS[key],
    permissions: {
      view: `${prefix}.view` as PermissionKey,
      new: `${prefix}.new` as PermissionKey,
      edit: `${prefix}.edit` as PermissionKey,
      deactivate: meta.deactivatePermission,
    },
  };
};

export const MASTERS_CONFIG: Record<MasterKey, MasterConfig> = {
  productGroup: build('productGroup'),
  projectStatus: build('projectStatus'),
  siteStatus: build('siteStatus'),
  participantStatus: build('participantStatus'),
};
