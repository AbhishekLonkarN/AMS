import { Link } from 'react-router-dom';
import { ChevronRight, FolderKanban, Hospital } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { PICKER_LABELS } from '../constants/auth.constants';
import type { ContextGroup } from '../hooks/useContextPicker';
import styles from './ContextPickerView.module.css';

interface ContextPickerViewProps {
  groups: ContextGroup[];
}

export function ContextPickerView({ groups }: ContextPickerViewProps) {
  return (
    <div className="page-container">
      <PageHeader title={PICKER_LABELS.title} description={PICKER_LABELS.description} />

      {groups.length === 0 && <p className="section-card text-ink-500">{PICKER_LABELS.empty}</p>}

      {groups.map((group) => (
        <section key={group.projectId} className="flex flex-col gap-3">
          <h2 className={styles.projectTitle}>
            <FolderKanban className="size-4 text-primary" aria-hidden /> {group.projectName}
          </h2>
          <ul className={styles.grid}>
            {group.options.map((option) => (
              <li key={option.siteId}>
                <Link to={option.to} className={styles.card}>
                  <span className={styles.icon}>
                    <Hospital className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={styles.siteTitle}>
                      {option.siteCode} · {option.siteName}
                    </span>
                    <span className={styles.meta}>
                      {PICKER_LABELS.investigator}: {option.investigator} · {option.location}
                    </span>
                    {option.designation && <span className="badge badge-soft badge-primary mt-2">{option.designation}</span>}
                  </span>
                  <ChevronRight className="size-4 text-ink-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
