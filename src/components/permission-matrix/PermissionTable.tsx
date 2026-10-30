import { useMemo, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import clsx from 'clsx';
import type { PermissionKey } from '@/types';
import { ACTION_LABELS } from '@/rbac/permission-catalog.constants';
import { getModuleLabel, toPermissionKey } from '@/rbac/permission.utils';
import { StatusBadge } from '@/components/feedback';
import type { PermissionMatrixProps } from './permission-matrix.types';
import { PERMISSION_MATRIX_LABELS as L } from './permission-matrix.constants';
import { MODULE_DISPLAY, type ModuleTone } from './module-display.constants';
import {
  allKeys,
  getCheckState,
  getVisibleActions,
  getVisibleModules,
  rowKeys,
  setKeys,
} from './permission-matrix.utils';
import { TriStateCheckbox } from './TriStateCheckbox';
import styles from './PermissionTable.module.css';

const TONE_CLASS: Record<ModuleTone, string> = {
  blue: styles.blue,
  teal: styles.teal,
  violet: styles.violet,
  orange: styles.orange,
  sky: styles.sky,
  pink: styles.pink,
  green: styles.green,
};

/**
 * Compact, visual permission matrix: modules with icon + description as rows,
 * actions as columns, search, select-all (overall and per row).
 * Same props and behaviour as PermissionMatrix.
 */
export function PermissionTable({
  matrix,
  value,
  onChange,
  isReadOnly = false,
  scopeTypes,
  templatePermissions,
  templateName,
  onResetToTemplate,
  title = L.title,
}: PermissionMatrixProps) {
  const [query, setQuery] = useState('');
  const modules = useMemo(() => getVisibleModules(matrix, scopeTypes), [matrix, scopeTypes]);
  const actions = useMemo(() => getVisibleActions(matrix, modules), [matrix, modules]);
  const visibleKeys = useMemo(() => allKeys(modules), [modules]);

  const needle = query.trim().toLowerCase();
  const shownModules = needle
    ? modules.filter((m) => `${getModuleLabel(m)} ${MODULE_DISPLAY[m.key]?.description ?? ''}`.toLowerCase().includes(needle))
    : modules;
  // Select-all controls act on the rows currently shown (respects the search).
  const shownKeys = allKeys(shownModules);

  const selected = useMemo(() => new Set(value), [value]);
  const baseline = useMemo(() => (templatePermissions ? new Set(templatePermissions) : null), [templatePermissions]);
  const changedKeys = baseline ? visibleKeys.filter((k) => selected.has(k) !== baseline.has(k)) : [];

  const grantedCount = visibleKeys.filter((k) => selected.has(k)).length;
  const isCustomised = changedKeys.length > 0;
  const isEditable = !isReadOnly && !!onChange;

  const update = (keys: PermissionKey[], isChecked: boolean) => onChange?.(setKeys(value, keys, isChecked));

  return (
    <div className={clsx(styles.card, !isEditable && styles.readOnly)}>
      <div className={styles.header}>
        <div className="min-w-0">
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.count}>{L.granted(grantedCount, visibleKeys.length)}</p>
        </div>
        <div className={styles.headerEnd}>
          {isReadOnly && <span className="badge badge-ghost">{L.readOnly}</span>}
          {templateName && isCustomised && <StatusBadge status="customised" label={L.customised(templateName)} size="sm" />}
          {templateName && !isCustomised && (
            <span className="badge badge-soft badge-info badge-sm">{L.matchesTemplate(templateName)}</span>
          )}
          {isEditable && isCustomised && onResetToTemplate && (
            <button type="button" className="btn btn-ghost btn-xs" onClick={onResetToTemplate}>
              <RotateCcw className="size-3.5" aria-hidden /> {L.resetToTemplate}
            </button>
          )}
          {isEditable && (
            <label className={styles.selectAll}>
              <TriStateCheckbox
                state={getCheckState(shownKeys, selected)}
                label={L.selectAllRights}
                onChange={(isChecked) => update(shownKeys, isChecked)}
                className={clsx('checkbox-sm', styles.box)}
              />
              {L.selectAll}
            </label>
          )}
        </div>
      </div>

      <label className={clsx('input input-sm', styles.search)}>
        <Search className="size-4 text-ink-400" aria-hidden />
        <span className="sr-only">{L.searchLabel}</span>
        <input type="search" className="grow" placeholder={L.searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>

      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.moduleTh}>{L.modulePermission}</th>
              {actions.map((action) => (
                <th key={action} className={styles.actionTh}>
                  {ACTION_LABELS[action]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shownModules.map((module) => {
              const label = getModuleLabel(module);
              const display = MODULE_DISPLAY[module.key];
              const Icon = display?.icon;
              return (
                <tr key={module.key} className={styles.row}>
                  <th scope="row" className={styles.moduleTd}>
                    <span className={styles.moduleCell}>
                      {isEditable && (
                        <TriStateCheckbox
                          state={getCheckState(rowKeys(module), selected)}
                          label={L.selectRow(label)}
                          onChange={(isChecked) => update(rowKeys(module), isChecked)}
                          className={styles.box}
                        />
                      )}
                      {Icon && (
                        <span className={clsx(styles.icon, TONE_CLASS[display.tone])}>
                          <Icon className="size-4" aria-hidden />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className={styles.moduleName}>{label}</span>
                        {display?.description && <span className={styles.moduleDescription}>{display.description}</span>}
                      </span>
                    </span>
                  </th>
                  {actions.map((action) => {
                    if (!module.actions.includes(action)) {
                      return (
                        <td key={action} className={styles.cell}>
                          <span className={styles.na} aria-label={L.notApplicable}>
                            –
                          </span>
                        </td>
                      );
                    }
                    const key = toPermissionKey(module.key, action);
                    const isChanged = changedKeys.includes(key);
                    return (
                      <td key={action} className={styles.cell}>
                        <input
                          type="checkbox"
                          className={clsx('checkbox checkbox-xs checkbox-primary', styles.box, isChanged && styles.changed)}
                          aria-label={L.cell(label, ACTION_LABELS[action])}
                          title={isChanged ? L.changedFromTemplate : undefined}
                          checked={selected.has(key)}
                          disabled={!isEditable}
                          onChange={(e) => update([key], e.target.checked)}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {shownModules.length === 0 && <p className={styles.empty}>{L.noMatches}</p>}
      </div>
    </div>
  );
}
