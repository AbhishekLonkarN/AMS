import { AdminDashboardView } from '../components/AdminDashboardView';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

export function AdminDashboardPage() {
  const dashboard = useAdminDashboard();
  return <AdminDashboardView {...dashboard} />;
}
