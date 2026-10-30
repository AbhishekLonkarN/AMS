import type { Id, IsoDateTime, RecordStatus } from './common.types';

export type MasterKey = 'productGroup' | 'projectStatus' | 'siteStatus' | 'participantStatus';

export interface MasterItem {
  id: Id;
  masterKey: MasterKey;
  label: string;
  description: string;
  status: RecordStatus;
  createdBy?: Id;
  updatedAt: IsoDateTime;
}
