import { PersonalDashboardView } from '../components/PersonalDashboardView';
import { usePersonalDashboard } from '../hooks/usePersonalDashboard';

export function PersonalDashboardPage() {
  return <PersonalDashboardView {...usePersonalDashboard()} />;
}
