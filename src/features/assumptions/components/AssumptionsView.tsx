import { Hammer } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { FormSection } from '@/components/form';
import { ASSUMPTIONS_LABELS as L } from '../constants/assumptions.constants';
import type { AssumptionsModel } from '../hooks/useAssumptions';
import styles from './AssumptionsView.module.css';

export function AssumptionsView({ sections, demoRows, phase2Modules }: AssumptionsModel) {
  return (
    <div className="page-container">
      <PageHeader title={L.title} description={L.description} />

      <FormSection title={L.demoTitle} description={L.demoDescription}>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{L.demoColumns.role}</th>
                <th>{L.demoColumns.user}</th>
                <th>{L.demoColumns.tryThis}</th>
              </tr>
            </thead>
            <tbody>
              {demoRows.map((row) => (
                <tr key={row.key}>
                  <td className="font-semibold whitespace-nowrap">{row.role}</td>
                  <td>
                    <span className="block">{row.name}</span>
                    <span className="block text-caption text-ink-500">{row.email}</span>
                  </td>
                  <td className="text-label">{row.tryThis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormSection>

      {sections.map((section) => (
        <FormSection key={section.id} title={section.title} description={section.description}>
          <ol className={styles.list}>
            {section.items.map((item) => (
              <li key={item.title} className={styles.item}>
                <span className={styles.number}>{item.number}</span>
                <div>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemBody}>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </FormSection>
      ))}

      <FormSection title={L.phase2Title} description={L.phase2Description}>
        <ul className={styles.phase2}>
          {phase2Modules.map((module) => (
            <li key={module} className={styles.phase2Item}>
              <Hammer className="size-4 shrink-0 text-ink-400" aria-hidden /> {module}
            </li>
          ))}
        </ul>
      </FormSection>
    </div>
  );
}
