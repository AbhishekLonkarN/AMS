import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const DATE_FORMAT = 'DD-MMM-YYYY';
export const TIME_FORMAT = 'HH:mm';

export const nowIso = () => dayjs().toISOString();

export const guessTimeZone = () => dayjs.tz.guess();

export const formatDate = (iso?: string, tz?: string) =>
  iso ? (tz ? dayjs(iso).tz(tz) : dayjs(iso)).format(DATE_FORMAT) : '';

export const formatTime = (iso?: string, tz?: string) =>
  iso ? (tz ? dayjs(iso).tz(tz) : dayjs(iso)).format(TIME_FORMAT) : '';

/** "GMT + 05:30 (Asia/Kolkata)", the audit trail's reference time-zone format. */
export function formatTimeZone(tz: string) {
  const offset = dayjs().tz(tz).format('Z');
  return `GMT ${offset.slice(0, 1)} ${offset.slice(1)} (${tz})`;
}
