import type { FormBuilderConfig } from '@/components/dynamic-form';
import type { Id, IsoDateTime } from './common.types';

export interface Project {
  id: Id;
  name: string;
  cipNo: string;
  testProduct: string;
  productGroupId?: Id;
  studyType?: string;
  ecrf?: {
    config: FormBuilderConfig;
    sourceTemplateId?: Id;
    publishedAt?: IsoDateTime;
  };
  databaseLock?: { at: IsoDateTime; byUserId: Id; reason: string };
  description: string;
  sponsor: string;
  /** Sponsor-type account. */
  projectManagerId: Id;
  croName?: string;
  /** CO-type accounts. */
  croProjectManagerId?: Id;
  croAssistantPmId?: Id;
  enrolmentTarget: number;
  sitesIdentified: number;
  /** MasterItem id (projectStatus). */
  statusId: Id;
  /** Logo upload is UI-only in Phase 1. */
  logoFileName?: string;
  createdAt: IsoDateTime;
  createdBy?: Id;
}
