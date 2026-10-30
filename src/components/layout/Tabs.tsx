import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import styles from './Tabs.module.css';

export interface TabItem {
  key: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Prefix for tab / panel ids so panels can reference their tab. */
  idPrefix: string;
}

/** Underline tabs. Panels use id `${idPrefix}-panel-${key}` and aria-labelledby `${idPrefix}-tab-${key}`. */
export function Tabs({ items, activeKey, onChange, idPrefix }: TabsProps) {
  return (
    <div role="tablist" className={styles.list}>
      {items.map(({ key, label, icon: Icon }) => {
        const isActive = key === activeKey;
        return (
          <button
            key={key}
            id={`${idPrefix}-tab-${key}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${key}`}
            className={clsx(styles.tab, isActive && styles.active)}
            onClick={() => onChange(key)}
          >
            {Icon && <Icon className="size-4" aria-hidden />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
