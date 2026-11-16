import type { ReactNode } from 'react';
import { PageHeader } from '@/components/layout';
import { ActivityChart, DonutChart, StatusBars, dashboardStyles as styles } from '@/features/admin-dashboard';
import { PERSONAL_DASHBOARD_LABELS as L } from '../constants/personal-dashboard.constants';
import type { PersonalDashboardModel } from '../hooks/usePersonalDashboard';

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

/** Sponsor landing page: KPI cards and charts for the user's own projects, sites and activity. */
export function PersonalDashboardView({
  kpis,
  projectStatuses,
  siteSegments,
  totalSites,
  enrolmentByProject,
  activity,
}: PersonalDashboardModel) {
  const hasActivity = activity.some((p) => p.count > 0);

  return (
    <div className="page-container">
      <PageHeader title={L.title} description={L.description} />

      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <article key={kpi.key} className={styles.kpi}>
            <span className={styles.kpiIcon} data-tone={kpi.tone}>
              <kpi.icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className={styles.kpiLabel}>{kpi.label}</p>
              <p className={styles.kpiValue}>{kpi.value}</p>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.chartRow}>
        <Card title={L.sitesByStatus.title}>
          <div className={styles.donutBody}>
            <DonutChart segments={siteSegments} total={totalSites} totalLabel={L.sitesByStatus.total} />
          </div>
        </Card>
        <Card title={L.activity.title} subtitle={L.activity.subtitle}>
          {hasActivity ? <ActivityChart points={activity} /> : <p className={styles.empty}>{L.activity.empty}</p>}
        </Card>
      </div>

      <div className={styles.chartRow}>
        <Card title={L.projectsByStatus.title}>
          {projectStatuses.length ? <StatusBars items={projectStatuses} /> : <p className={styles.empty}>{L.projectsByStatus.empty}</p>}
        </Card>
        <Card title={L.enrolment.title}>
          {enrolmentByProject.length ? <StatusBars items={enrolmentByProject} /> : <p className={styles.empty}>{L.enrolment.empty}</p>}
        </Card>
      </div>
    </div>
  );
}
