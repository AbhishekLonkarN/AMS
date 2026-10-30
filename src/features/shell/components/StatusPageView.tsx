import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import styles from './StatusPageView.module.css';

interface StatusPageViewProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  actionLabel?: string;
  actionTo?: string;
  children?: ReactNode;
}

/** Centered message page: 403, 404 and Phase-2 placeholders. */
export function StatusPageView({ icon: Icon, eyebrow, title, body, actionLabel, actionTo, children }: StatusPageViewProps) {
  return (
    <div className="page-container">
      <div className={styles.card}>
        <span className={styles.icon}>
          <Icon className="size-7" aria-hidden />
        </span>
        <span className="badge badge-soft badge-primary">{eyebrow}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.body}>{body}</p>
        {children}
        {actionLabel && actionTo && (
          <Link to={actionTo} className="btn btn-primary">
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
