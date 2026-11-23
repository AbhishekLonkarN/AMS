import type { ReactNode } from 'react';

export interface ContactRow {
  label: string;
  value?: string;
}

interface ContactCardProps {
  title: string;
  rows: ContactRow[];
  actions?: ReactNode;
}

/** A titled group of label / value rows (read-only). Empty values show a dash. */
export function ContactCard({ title, rows, actions }: ContactCardProps) {
  return (
    <section className="section-card flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 border-b border-base-300 pb-2">
        <h2 className="text-body font-semibold text-base-content">{title}</h2>
        {actions}
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <dt className="text-caption text-ink-500">{row.label}</dt>
            <dd className={row.value ? 'text-body font-medium break-words text-base-content' : 'text-body text-ink-400'}>
              {row.value || '—'}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
