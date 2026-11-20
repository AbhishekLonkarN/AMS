export { AdminDashboardPage } from './pages/AdminDashboardPage';
// Building blocks reused by the sponsor's Personal Dashboard.
export { ActivityChart, DonutChart, StatusBars, type DonutSegment } from './components/DashboardCharts';
export { default as dashboardStyles } from './components/AdminDashboardView.module.css';
export { auditByDay, countRecentEvents, projectsByStatus, type DayPoint } from './utils/admin-dashboard.utils';
export { ACTIVITY_DAYS } from './constants/admin-dashboard.constants';
export type { KpiView } from './hooks/useAdminDashboard';
