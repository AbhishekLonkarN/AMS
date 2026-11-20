import { Link, useParams } from 'react-router-dom';
import { paths } from '@/app/router/route-paths.constants';
import { PageHeader } from '@/components/layout';
import { useMasterLabel } from '@/features/masters';
import { usePermission } from '@/rbac';
import { useProjectsStore } from '@/store';

export function ProjectSettingsPage() {
  const { projectId = '' } = useParams();
  const project = useProjectsStore((s) => s.projects.find((item) => item.id === projectId));
  const masterLabel = useMasterLabel();
  const canEditSettings = usePermission('settings.edit');
  const canEditProject = usePermission('project.edit');
  const canEdit = canEditSettings && canEditProject;

  if (!project) {return null;}
  return (
    <div className="page-container">
      <PageHeader title="Project Settings" description={project.name}
        actions={canEdit && <Link to={paths.projectEdit(project.id)} className="btn btn-primary btn-sm">Edit project details</Link>} />
      <section className="section-card space-y-3">
        <h2 className="text-lg font-semibold">Study configuration</h2>
        <dl className="grid grid-cols-[1fr_auto] gap-2">
          <dt>Product group</dt><dd>{masterLabel(project.productGroupId)}</dd>
          <dt>Study type</dt><dd>{project.studyType || '—'}</dd>
          <dt>Project status</dt><dd>{masterLabel(project.statusId)}</dd>
          <dt>Enrolment target</dt><dd>{project.enrolmentTarget}</dd>
          <dt>eCRF</dt><dd>{project.ecrf?.publishedAt ? 'Published' : project.ecrf ? 'Draft' : 'Not configured'}</dd>
          <dt>Database</dt><dd>{project.databaseLock ? 'Locked' : 'Open'}</dd>
        </dl>
      </section>
    </div>
  );
}
