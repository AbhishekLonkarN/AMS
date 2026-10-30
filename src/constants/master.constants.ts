import type { MasterKey, PermissionKey } from '@/types';

export const MASTER_KEYS: MasterKey[] = ['productGroup', 'projectStatus', 'siteStatus', 'participantStatus'];

export interface MasterMeta {
  /** Page / list title, e.g. "Master-Product Group". */
  title: string;
  /** Singular name used in field labels and messages, e.g. "Product Group". */
  itemName: string;
  permissionModule: string;
  /** Permission gating Deactivate / Re-activate (assumption 7). */
  deactivatePermission: PermissionKey;
}

export const MASTER_META: Record<MasterKey, MasterMeta> = {
  productGroup: {
    title: 'Master-Product Group',
    itemName: 'Product Group',
    permissionModule: 'masterProductGroup',
    // No "delete" column for Product Group; Deactivate is gated by edit.
    deactivatePermission: 'masterProductGroup.edit',
  },
  projectStatus: {
    title: 'Master-Project Status',
    itemName: 'Project Status',
    permissionModule: 'masterProjectStatus',
    deactivatePermission: 'masterProjectStatus.delete',
  },
  siteStatus: {
    title: 'Master-Site Status',
    itemName: 'Site Status',
    permissionModule: 'masterSiteStatus',
    deactivatePermission: 'masterSiteStatus.delete',
  },
  participantStatus: {
    title: "Master-Participant's Status",
    itemName: 'Participant Status',
    permissionModule: 'masterParticipantStatus',
    deactivatePermission: 'masterParticipantStatus.delete',
  },
};
