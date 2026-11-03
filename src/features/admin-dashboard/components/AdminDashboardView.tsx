import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { ArrowRight, History, KeyRound, LogIn, Pencil, PlusCircle, Power, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import type { User } from '@/types';
import { ROUTES } from '@/app/router/route-paths.constants';
import { USER_TYPE_LABELS, RECORD_STATUS_LABELS } from '@/constants/user.constants';
import { DASHBOARD_LABELS as L, type QuickActionConfig } from '../constants/admin-dashboard.constants';
import type { KpiView } from '../hooks/useAdminDashboard';
import { initials, type ActivityKind, type DayPoint, type StatusCount } from '../utils/admin-dashboard.utils';
import { ActivityChart, DonutChart, StatusBars, type DonutSegment } from './DashboardCharts';
import styles from './AdminDashboardView.module.css';

interface ActivityItem {
  id: string;
  kind: ActivityKind;
  event: string;
  user: string;
  when: string;
}

interface AdminDashboardViewProps {
  kpis: KpiView[];
  userSegments: DonutSegment[];
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  activity: DayPoint[];
  projectStatuses: StatusCount[];
  recentActivity: ActivityItem[];
  recentUsers: User[];
  quickActions: QuickActionConfig[];
  canViewAudit: boolean;
  canViewUsers: boolean;
}

const ACTIVITY_ICONS: Record<ActivityKind, LucideIcon> = {
  login: LogIn,
  create: PlusCircle,
  edit: Pencil,
  status: Power,
  rights: KeyRound,
  other: History,
};

function Card({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>{title}</h2>
          {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

const ViewAll = ({ to, label }: { to: string; label: string }) => (
  <Link to={to} className={styles.viewAll}>
    {label} <ArrowRight className="size-3.5" aria-hidden />
  </Link>
);

/** Admin landing page: KPI cards, charts, recent activity, quick actions and newest users. */
export function AdminDashboardView({
  kpis,
  userSegments,
  totalUsers,
  activeUsers,
  inactiveUsers,
  activity,
  projectStatuses,
  recentActivity,
  recentUsers,
  quickActions,
  canViewAudit,
  canViewUsers,
}: AdminDashboardViewProps) {
  const hasActivity = activity.some((p) => p.count > 0);

  return (
    <div className="page-container">
      <PageHeader title={L.title} description={L.description} />

      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <article key={kpi.key} className={styles.kpi}>
            <span className={styles.kpiIcon} data-tone={kpi.tone}>
              <kpi.icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className={styles.kpiLabel}>{kpi.label}</p>
              <p className={styles.kpiValue}>{kpi.value}</p>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.chartRow}>
        <Card title={L.usersByType.title}>
          <div className={styles.donutBody}>
            <DonutChart segments={userSegments} total={totalUsers} totalLabel={L.usersByType.total} />
          </div>
          <dl className={styles.statusSplit}>
            <div className={styles.statusItem} data-status="active">
              <dt>{L.usersByType.active}</dt>
              <dd>{activeUsers}</dd>
            </div>
            <div className={styles.statusItem} data-status="inactive">
              <dt>{L.usersByType.inactive}</dt>
              <dd>{inactiveUsers}</dd>
            </div>
          </dl>
        </Card>
        <Card title={L.activity.title} subtitle={L.activity.subtitle}>
          {hasActivity ? <ActivityChart points={activity} /> : <p className={styles.empty}>{L.activity.empty}</p>}
        </Card>
      </div>

      <div className={styles.feedRow}>
        <Card
          title={L.recentActivity.title}
          action={canViewAudit ? <ViewAll to={ROUTES.auditTrail} label={L.recentActivity.viewAll} /> : undefined}
        >
          {recentActivity.length ? (
            <ul className={clsx(styles.feed, styles.scroll)}>
              {recentActivity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.kind];
                return (
                  <li key={item.id} className={styles.feedItem}>
                    <span className={styles.feedIcon} data-kind={item.kind}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={styles.feedEvent}>{item.event}</p>
                      <p className={styles.feedMeta}>{item.user}</p>
                    </div>
                    <span className={styles.feedWhen}>{item.when}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.empty}>{L.recentActivity.empty}</p>
          )}
        </Card>

        <Card title={L.quickActions.title}>
          <ul className={styles.actions}>
            {quickActions.map((action) => (
              <li key={action.key}>
                <Link to={action.to} className={styles.action}>
                  <span className={styles.actionIcon}>
                    <action.icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={styles.actionLabel}>{action.label}</span>
                    <span className={styles.actionDescription}>{action.description}</span>
                  </span>
                  <ArrowRight className={styles.actionArrow} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className={styles.chartRow}>
        <Card title={L.projectsByStatus.title}>
          {projectStatuses.length ? <StatusBars items={projectStatuses} /> : <p className={styles.empty}>{L.projectsByStatus.empty}</p>}
        </Card>
        <Card
          title={L.recentUsers.title}
          action={canViewUsers ? <ViewAll to={ROUTES.users} label={L.recentUsers.viewAll} /> : undefined}
        >
          {recentUsers.length ? (
            <ul className={clsx(styles.users, styles.scroll)}>
              {recentUsers.map((user) => (
                <li key={user.id} className={styles.userRow}>
                  <span className={styles.avatar} aria-hidden>
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={styles.userName}>{user.name}</p>
                    <p className={styles.feedMeta}>{user.email}</p>
                  </div>
                  <span className="badge badge-soft badge-primary badge-sm">{USER_TYPE_LABELS[user.userType]}</span>
                  <span className={styles.userStatus} data-status={user.status}>
                    {RECORD_STATUS_LABELS[user.status]}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>{L.recentUsers.empty}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
