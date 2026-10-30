import { RECORD_STATUS_LABELS } from '@/constants/user.constants';
import type { RecordStatus } from '@/types';

export const statusText = (status: string) => RECORD_STATUS_LABELS[status as RecordStatus] ?? status;
