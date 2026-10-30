import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { PageHeader, TileGrid, type TileView } from '@/components/layout';
import { ReadOnlyField } from '@/components/form';
import { SHELL_LABELS } from '../constants/shell.constants';
import styles from './HubSummaryView.module.css';

export interface HubFact {
  label: string;
  value: ReactNode;
}

export interface HubProgress {
  label: string;
  valueText: string;
  value: number;
  max: number;
}

interface HubSummaryViewProps {
  title: string;
  description?: string;
  status?: string;
  editTo?: string;
  editLabel: string;
  facts: HubFact[];
  progress?: HubProgress;
  tilesTitle: string;
  tiles: TileView[];
}

/** Project / site hub: key facts + progress, then the module tiles. */
export function HubSummaryView({
  title,
  description,
  status,
  editTo,
  editLabel,
  facts,
  progress,
  tilesTitle,
  tiles,
}: HubSummaryViewProps) {
  return (
    <div className="page-container">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            {status && <span className="badge badge-soft badge-primary">{status}</span>}
            {editTo && (
              <Link to={editTo} className="btn btn-sm">
                <Pencil className="size-4" aria-hidden /> {editLabel}
              </Link>
            )}
          </>
        }
      />

      <section className={styles.summary}>
        <div className={styles.facts}>
          {facts.map((fact) => (
            <ReadOnlyField key={fact.label} label={fact.label} value={fact.value} />
          ))}
        </div>
        {progress && (
          <div className={styles.progress}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>{progress.label}</span>
              <span className={styles.progressValue}>{progress.valueText}</span>
            </div>
            <progress className="progress progress-primary w-full" value={progress.value} max={progress.max} />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2>{tilesTitle}</h2>
        {tiles.length ? <TileGrid tiles={tiles} /> : <p className="section-card text-ink-500">{SHELL_LABELS.noTiles}</p>}
      </section>
    </div>
  );
}
