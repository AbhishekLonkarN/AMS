import { ApiError } from '@/api';
import { ACCESS_RIGHTS_LABELS as L } from '../constants/access-rights.constants';

/** The backend's message when it sent one, else a generic one. */
export const saveErrorMessage = (error: unknown) =>
  error instanceof ApiError && error.status > 0 ? error.message : L.saveFailed;

/** True when the backend refused the name because another set already uses it. */
export const isNameTaken = (error: unknown) =>
  error instanceof ApiError && error.code === 'duplicate_value' && error.details.field === 'name';
