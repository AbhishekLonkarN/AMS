import dayjs from 'dayjs';
import type { AuditEntry, MasterItem, Project, RecordStatus, User, UserType } from '@/types';
import { formatDate } from '@/utils/date.utils';
import { AVATAR_COLORS } from '../constants/admin-dashboard.constants';

export type ActivityKind = 'login' | 'create' | 'edit' | 'status' | 'rights' | 'other';

/** Groups an audit event into one of a few kinds, used for the icon in the activity feed. */
export function classifyEvent(event: string): ActivityKind {
  const e = event.toLowerCase();
  if (e.startsWith('log-in') || e.startsWith('logged')) return 'login';
  if (e.includes('access rights')) return 'rights';
  if (/^(created|affiliated)/.test(e)) return 'create';
  if (/^(deactivated|re-activated|deaffiliated)/.test(e)) return 'status';
  if (e.startsWith('edited')) return 'edit';
  return 'other';
}

export function countUsersByType(users: User[]): Record<UserType, number> {
  const counts: Record<UserType, number> = { admin: 0, sponsor: 0, co: 0, site: 0 };
  for (const user of users) counts[user.userType] += 1;
  return counts;
}

export const countByStatus = (users: { status: RecordStatus }[], status: RecordStatus) =>
  users.filter((u) => u.status === status).length;

export interface DayPoint {
  key: string;
  /** Short date, shown under every few bars. */
  label: string;
  /** Full date for the tooltip. */
  title: string;
  count: number;
}

/**
 * Audit events per day for the `days` days up to the latest entry, so a quiet system still shows
 * its most recent activity instead of an empty chart.
 */
export function auditByDay(entries: AuditEntry[], days: number): DayPoint[] {
  const latest = entries.reduce<dayjs.Dayjs | null>((max, e) => {
    const t = dayjs(e.timestamp);
    return !max || t.isAfter(max) ? t : max;
  }, null);
  const end = (latest ?? dayjs()).startOf('day');

  const counts = new Map<string, number>();
  for (const entry of entries) {
    const key = dayjs(entry.timestamp).format('YYYY-MM-DD');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: days }, (_, i) => {
    const day = end.subtract(days - 1 - i, 'day');
    const key = day.format('YYYY-MM-DD');
    return { key, label: day.format('DD MMM'), title: day.format('DD-MMM-YYYY'), count: counts.get(key) ?? 0 };
  });
}

/** Events in the last 7 days, counted back from the latest entry. */
export const countRecentEvents = (points: DayPoint[], days = 7) =>
  points.slice(-days).reduce((sum, p) => sum + p.count, 0);

export function relativeTime(iso: string, now = dayjs()) {
  const minutes = now.diff(iso, 'minute');
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days} d ago` : formatDate(iso);
}

export interface StatusCount {
  id: string;
  label: string;
  count: number;
}

export function projectsByStatus(projects: Project[], masters: MasterItem[]): StatusCount[] {
  const counts = new Map<string, number>();
  for (const p of projects) counts.set(p.statusId, (counts.get(p.statusId) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count, label: masters.find((m) => m.id === id)?.label ?? '—' }))
    .sort((a, b) => b.count - a.count);
}

/** Newest first; users created at the same time keep the most recently added first. */
export const recentlyAdded = (users: User[], limit: number) =>
  [...users].reverse().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);

/** Stable colour per user, so the same person always gets the same avatar colour. */
export const avatarColor = (key: string) => {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const initials = (name: string) =>
  name
    .replace(/^(Dr|Mr|Ms|Mrs|Prof)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
