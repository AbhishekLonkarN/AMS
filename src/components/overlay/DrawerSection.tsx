import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './DrawerSection.module.css';

interface DrawerSectionProps {
  title: string;
  description?: string;
  /** `boxed` (default): content in a light-grey box. `plain`: content as-is (e.g. a permission matrix card). */
  variant?: 'boxed' | 'plain';
  children: ReactNode;
}

/** Section title on white, content in a subtle grey box — separates parts of a long form. */
export function DrawerSection({ title, description, variant = 'boxed', children }: DrawerSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={clsx(variant === 'boxed' && styles.box)}>{children}</div>
    </section>
  );
}
