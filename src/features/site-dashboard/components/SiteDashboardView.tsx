import type { ReactNode } from 'react';
import { PageHeader } from '@/components/layout';
import { ActivityChart, StatusBars, dashboardStyles as styles } from '@/features/admin-dashboard';
import { SITE_DASHBOARD_LABELS as L } from '../constants/site-dashboard.constants';
import type { SiteDashboardModel } from '../hooks/useSiteDashboard';

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>{title}</h2>
          {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

/** Operational home of one site: enrolment against target, enrolment over time and query counts. */
export function SiteDashboardView({ siteCode, siteName, investigator, location, status, recruitment, enrolment, hasEnrolment, queries }: SiteDashboardModel) {
  return (
    <div className="page-container">
      <PageHeader
        title={L.title}
        description={`${investigator} · ${siteCode} · ${siteName}, ${location}`}
        actions={<span className="badge badge-soft badge-primary">{status}</span>}
      />

      <div className={styles.chartRow}>
        <Card title={L.enrolmentStatus.title}>
          <StatusBars items={recruitment} />
        </Card>
        <Card title={L.enrolment.title} subtitle={L.enrolment.subtitle}>
          {hasEnrolment ? <ActivityChart points={enrolment} /> : <p className={styles.empty}>{L.enrolment.empty}</p>}
        </Card>
      </div>

      <Card title={L.queries.title}>
        <StatusBars items={queries} />
      </Card>
    </div>
  );
}
