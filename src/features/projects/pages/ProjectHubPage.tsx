import { HubSummaryView, NotFoundPage } from '@/features/shell';
import { PROJECT_LABELS as L } from '../constants/projects.constants';
import { useProjectHub } from '../hooks/useProjectHub';

export function ProjectHubPage() {
  const model = useProjectHub();
  if (!model) return <NotFoundPage />;
  return <HubSummaryView {...model} editLabel={L.hubEdit} tilesTitle={L.modulesTitle} />;
}
