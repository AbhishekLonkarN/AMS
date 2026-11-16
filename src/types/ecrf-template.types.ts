import type { Id, IsoDateTime, RecordStatus } from './common.types';

/** A reusable eCRF design. `config` is the form JSON exactly as saved (rendered by DynamicForm). */
export interface EcrfTemplate {
  id: Id;
  name: string;
  productGroupId: Id;
  description?: string;
  status: RecordStatus;
  config: unknown;
  createdBy?: Id;
  updatedAt: IsoDateTime;
}
