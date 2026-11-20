import { ApiError } from '@/api';
import { MASTER_LABELS as L } from '../constants/masters.constants';

/** The backend's message when it sent one, else a generic one. */
export const saveErrorMessage = (error: unknown) =>
  error instanceof ApiError && error.status > 0 ? error.message : L.saveFailed;

/** True when the backend refused the value because another item already uses it. */
export const isValueTaken = (error: unknown) => error instanceof ApiError && error.code === 'duplicate_value';
