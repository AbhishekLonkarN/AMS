import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LAYOUT_LABELS } from './layout.constants';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, backTo, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        {backTo && (
          <Link to={backTo} className="btn btn-square btn-ghost btn-sm mt-0.5" aria-label={LAYOUT_LABELS.back}>
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
