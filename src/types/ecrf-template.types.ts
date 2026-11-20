import type { FormBuilderConfig } from '@/components/dynamic-form';
import type { Id, IsoDateTime, RecordStatus } from './common.types';

/** A reusable eCRF design, as listed by the backend. The design itself is an `EcrfDesign`. */
export interface EcrfTemplate {
  id: Id;
  name: string;
  productGroupId: Id;
  productGroupCode: string;
  suitableFor: string;
  status: RecordStatus;
  createdByName: string;
  createdAt: IsoDateTime;
  /** The effective version, or null while nothing has been published. */
  publishedVersionNo: number | null;
  /** True while there are saved changes that haven't been published. */
  hasDraft: boolean;
}

/** The design version being worked on: the open draft, else the published one. */
export interface EcrfDesign {
  /** Builder config, ready for `dbConfigToBuilderConfig`. */
  config: FormBuilderConfig;
  versionNo: number;
  state: 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED';
  /** The draft's revision, sent back on save; null when the version is not an open draft. */
  draftRevision: number | null;
}
