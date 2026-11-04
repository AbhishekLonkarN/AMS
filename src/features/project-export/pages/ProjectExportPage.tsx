import { ProjectExportView } from '../components/ProjectExportView';
import { useProjectExport } from '../hooks/useProjectExport';

export function ProjectExportPage() {
  return <ProjectExportView {...useProjectExport()} />;
}
