import type { ReactNode } from 'react';
import styles from './FormSection.module.css';

interface FormSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** A card holding a group of fields (children usually in a `.form-grid`). */
export function FormSection({ title, description, actions, children }: FormSectionProps) {
  return (
    <section className="section-card">
      {(title || actions) && (
        <div className={styles.header}>
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
