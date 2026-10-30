import type { AuditEntry, Id, PermissionKey } from '@/types';
import { AUDIT_SEED } from '@/data/audit.seed';
import { createId } from '@/utils/id.utils';
import { formatTimeZone, guessTimeZone, nowIso } from '@/utils/date.utils';
import { diffPermissions, formatPermission } from '@/rbac/permission.utils';
import { createAppStore } from './store.config';
import { useSessionStore } from './session.store';
import { useUsersStore } from './users.store';
import { useProjectsStore } from './projects.store';
import { useSitesStore } from './sites.store';

interface AuditState {
  entries: AuditEntry[];
  addEntry: (entry: AuditEntry) => void;
}

export const useAuditStore = createAppStore<AuditState>('audit', (set) => ({
  entries: AUDIT_SEED,
  addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
}));

// ---------------------------------------------------------------------------
// recordAudit helpers – every mutating store action goes through these.
// Other stores are read lazily (inside the functions) so import cycles are safe.
// ---------------------------------------------------------------------------

export interface AuditContext {
  projectId?: Id;
  siteId?: Id;
  participantId?: string;
  formTitle?: string;
  /** Overrides the acting user. `null` = no user (e.g. failed login). */
  actorEmail?: string | null;
}

export interface AuditInput extends AuditContext {
  page: string;
  event: string;
  originalValue?: string;
  changedTo?: string;
}

function currentActorEmail() {
  const userId = useSessionStore.getState().currentUserId;
  return useUsersStore.getState().users.find((u) => u.id === userId)?.email;
}

export function recordAudit(input: AuditInput) {
  const { projectId, siteId, actorEmail, ...rest } = input;
  const site = siteId ? useSitesStore.getState().sites.find((s) => s.id === siteId) : undefined;
  const project = useProjectsStore.getState().projects.find((p) => p.id === (projectId ?? site?.projectId));

  useAuditStore.getState().addEntry({
    id: createId('aud'),
    timestamp: nowIso(),
    timeZone: formatTimeZone(guessTimeZone()),
    projectName: project?.name,
    investigator: site?.investigatorName,
    ...rest,
    userEmail: actorEmail === null ? undefined : (actorEmail ?? currentActorEmail()),
  });
}

type AuditValue = string | number | boolean | null | undefined;

export interface AuditField<T> {
  key: keyof T;
  label: string;
  format?: (value: any) => string;
}

const toText = (value: AuditValue) => (value === undefined || value === null || value === '' ? '—' : String(value));

/** One audit entry per changed field: "Edited <subject>: <field>". */
export function recordFieldChanges<T extends object>(args: {
  page: string;
  subject: string;
  before: T;
  after: T;
  fields: AuditField<T>[];
  context?: AuditContext;
}) {
  const { page, subject, before, after, fields, context } = args;
  for (const field of fields) {
    const from = before[field.key] as AuditValue;
    const to = after[field.key] as AuditValue;
    if (from === to) continue;
    recordAudit({
      ...context,
      page,
      event: `Edited ${subject}: ${field.label}`,
      originalValue: field.format ? field.format(from) : toText(from),
      changedTo: field.format ? field.format(to) : toText(to),
    });
  }
}

/** Records revoked (original) and granted (changed to) permissions as one entry. */
export function recordPermissionChange(args: {
  page: string;
  subject: string;
  before: PermissionKey[];
  after: PermissionKey[];
  context?: AuditContext;
}) {
  const { added, removed } = diffPermissions(args.before, args.after);
  if (!added.length && !removed.length) return;
  recordAudit({
    ...args.context,
    page: args.page,
    event: `Changed access rights of ${args.subject}`,
    originalValue: removed.length ? `Revoked: ${removed.map(formatPermission).join('; ')}` : '—',
    changedTo: added.length ? `Granted: ${added.map(formatPermission).join('; ')}` : '—',
  });
}
