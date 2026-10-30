import type { ReactNode } from 'react';
import styles from './DetailList.module.css';

export interface DetailItem {
  label: string;
  value: ReactNode;
}

interface DetailListProps {
  items: DetailItem[];
}

const EMPTY = '—';

/** Label / value rows (read-only "View" content), as in the reference drawer. */
export function DetailList({ items }: DetailListProps) {
  return (
    <dl className={styles.list}>
      {items.map((item) => {
        const isEmpty = item.value === undefined || item.value === null || item.value === '';
        return (
          <div key={item.label} className={styles.row}>
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>{isEmpty ? EMPTY : item.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
