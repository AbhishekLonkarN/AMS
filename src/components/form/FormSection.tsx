import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import styles from './FormSection.module.css';

interface FormSectionProps {
  title?: string;
  description?: string;
  /** Shown in a small tile before the title; a hairline separates the header from the fields. */
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
}

/** A card holding a group of fields (children usually in a `.form-grid`). */
export function FormSection({ title, description, icon: Icon, actions, children }: FormSectionProps) {
  return (
    <section className="section-card">
      {(title || actions) && (
        <div className={clsx(styles.header, Icon && styles.headerWithIcon)}>
          <div className={styles.heading}>
            {Icon && (
              <span className={styles.icon}>
                <Icon className="size-4" aria-hidden />
              </span>
            )}
            <div>
              {title && <h2 className={styles.title}>{title}</h2>}
              {description && <p className={styles.description}>{description}</p>}
            </div>
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
