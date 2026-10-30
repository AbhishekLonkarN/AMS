import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import type { PermissionKey } from '@/types';
import { ACTION_LABELS } from '@/rbac/permission-catalog.constants';
import { getModuleLabel, toPermissionKey } from '@/rbac/permission.utils';
import { StatusBadge } from '@/components/feedback';
import type { PermissionMatrixProps } from './permission-matrix.types';
import { PERMISSION_MATRIX_LABELS as L } from './permission-matrix.constants';
import {
  allKeys,
  columnKeys,
  getCheckState,
  getVisibleActions,
  getVisibleModules,
  rowKeys,
  setKeys,
} from './permission-matrix.utils';
import { TriStateCheckbox } from './TriStateCheckbox';
import styles from './PermissionMatrix.module.css';

export function PermissionMatrix({
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
  const modules = useMemo(() => getVisibleModules(matrix, scopeTypes), [matrix, scopeTypes]);
  const actions = useMemo(() => getVisibleActions(matrix, modules), [matrix, modules]);
  const visibleKeys = useMemo(() => allKeys(modules), [modules]);

  const selected = useMemo(() => new Set(value), [value]);
  const baseline = useMemo(() => (templatePermissions ? new Set(templatePermissions) : null), [templatePermissions]);
  const changedKeys = useMemo(
    () => (baseline ? visibleKeys.filter((k) => selected.has(k) !== baseline.has(k)) : []),
    [baseline, visibleKeys, selected],
  );

  const grantedCount = visibleKeys.filter((k) => selected.has(k)).length;
  const isCustomised = changedKeys.length > 0;
  const isEditable = !isReadOnly && !!onChange;

  const update = (keys: PermissionKey[], isChecked: boolean) => onChange?.(setKeys(value, keys, isChecked));

  return (
    <div className={clsx(styles.wrap, !isEditable && styles.readOnly)}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.count}>{L.granted(grantedCount, visibleKeys.length)}</span>
        </div>
        <div className={styles.headerBadges}>
          {isReadOnly && <span className="badge badge-ghost">{L.readOnly}</span>}
          {templateName && isCustomised && <StatusBadge status="customised" label={L.customised(templateName)} />}
          {templateName && !isCustomised && <span className="badge badge-soft badge-info">{L.matchesTemplate(templateName)}</span>}
          {isEditable && isCustomised && onResetToTemplate && (
            <button type="button" className="btn btn-ghost btn-xs" onClick={onResetToTemplate}>
              <RotateCcw className="size-3.5" aria-hidden /> {L.resetToTemplate}
            </button>
          )}
        </div>
      </div>

      <div className={styles.scroll}>
        <table className={clsx('table table-sm', styles.table)}>
          <thead>
            <tr>
              <th className={styles.srTh}>{L.srNo}</th>
              <th className={styles.moduleTh}>{L.module}</th>
              {isEditable && (
                <th className={styles.actionTh}>
                  <span className={styles.actionLabel}>{L.all}</span>
                  <TriStateCheckbox
                    state={getCheckState(visibleKeys, selected)}
                    label={L.selectColumn(L.all)}
                    onChange={(isChecked) => update(visibleKeys, isChecked)}
                  />
                </th>
              )}
              {actions.map((action) => {
                const keys = columnKeys(modules, action);
                return (
                  <th key={action} className={styles.actionTh}>
                    <span className={styles.actionLabel}>{ACTION_LABELS[action]}</span>
                    {isEditable && (
                      <TriStateCheckbox
                        state={getCheckState(keys, selected)}
                        label={L.selectColumn(ACTION_LABELS[action])}
                        onChange={(isChecked) => update(keys, isChecked)}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {modules.map((module, index) => {
              const moduleLabel = getModuleLabel(module);
              const keys = rowKeys(module);
              return (
                <tr key={module.key} className={styles.row}>
                  <td className={styles.srTd}>{index + 1}</td>
                  <th scope="row" className={styles.moduleTd}>
                    {moduleLabel}
                  </th>
                  {isEditable && (
                    <td className={styles.cell}>
                      <TriStateCheckbox
                        state={getCheckState(keys, selected)}
                        label={L.selectRow(moduleLabel)}
                        onChange={(isChecked) => update(keys, isChecked)}
                      />
                    </td>
                  )}
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
                      <td key={action} className={clsx(styles.cell, isChanged && styles.changedCell)}>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary"
                          aria-label={L.cell(moduleLabel, ACTION_LABELS[action])}
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
      </div>
    </div>
  );
}
