import { Link, useParams } from 'react-router-dom';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { PageHeader } from '@/components/layout';
import { StatusBars, dashboardStyles as styles } from '@/features/admin-dashboard';
import { useMasterLabel } from '@/features/masters';
import { useAccessibleSites, useCurrentPrincipal, usePermission } from '@/rbac';
import { useParticipantsStore, useProjectsStore, useQueriesStore } from '@/store';

export function ProjectDashboardPage() {
  const { projectId = '' } = useParams();
  const project = useProjectsStore((state) => state.projects.find((item) => item.id === projectId));
  const sites = useAccessibleSites(projectId);
  const participantRecords = useParticipantsStore((state) => state.participants);
  const queryRecords = useQueriesStore((state) => state.queries);
  const principal = useCurrentPrincipal();
  const canSeeSites = usePermission('investigatorSite.view');
  const canSeeQueries = usePermission('projectQueriesAll.export');
  const canSeeDesign = usePermission('projectEcrf.view');
  const canSeeDocuments = usePermission('etmfProject.view');
  const canSeeContacts = usePermission('supportContacts.view');
  const label = useMasterLabel();
  if (!project) return null;

  const siteIds = new Set(sites.map((site) => site.id));
  const participants = participantRecords.filter((item) => item.projectId === projectId && siteIds.has(item.siteId));
  const queries = queryRecords.filter((item) => item.projectId === projectId && siteIds.has(item.siteId));
  const forms = participants.flatMap((participant) => participant.forms);
  const isSponsor = principal?.user.userType === 'sponsor';
  const target = isSponsor ? project.enrolmentTarget : sites.reduce((sum, site) => sum + site.expectedRecruitment, 0);
  const siteStatuses = [...new Set(sites.map((site) => site.statusId))];
  const sections = [
    { title: 'Enrolment status', items: [
      { id: 'target', label: 'Target', count: target },
      { id: 'enrolled', label: 'Enrolled', count: participants.filter((item) => !!item.participantNo).length },
    ] },
    { title: 'Site status', items: siteStatuses.map((id) => ({ id, label: label(id), count: sites.filter((site) => site.statusId === id).length })),
      link: canSeeSites ? { title: 'Open sites', to: paths.projectSites(projectId) } : undefined },
    { title: 'eCRF status', items: [
      { id: 'draft', label: 'Draft', count: forms.filter((form) => form.progress === 'draft').length },
      { id: 'soft', label: 'Soft submitted', count: forms.filter((form) => form.progress === 'softSubmitted').length },
      { id: 'submitted', label: 'Submitted', count: forms.filter((form) => form.progress === 'submitted').length },
      { id: 'locked', label: 'Locked', count: forms.filter((form) => !!form.lock || !!project.databaseLock).length },
    ], link: canSeeDesign ? { title: 'Open project eCRF', to: paths.projectEcrf(projectId) } : undefined },
    { title: 'Data queries', items: [
      { id: 'notRead', label: 'Not read', count: queries.filter((query) => query.status === 'notRead').length },
      { id: 'read', label: 'Read', count: queries.filter((query) => query.status === 'read').length },
      { id: 'responded', label: 'Responded', count: queries.filter((query) => query.status === 'responded').length },
      { id: 'resolved', label: 'Resolved', count: queries.filter((query) => query.status === 'resolved').length },
    ], link: canSeeQueries ? { title: 'Open project queries', to: paths.projectQueries(projectId) } : undefined },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Project Dashboard" description={project.name} backTo={isSponsor ? paths.projectHub(projectId) : ROUTES.selectContext} />
      {!isSponsor && (
        <section className="section-card flex flex-wrap gap-2">
          {canSeeDocuments && <Link className="btn btn-secondary" to={paths.projectEtmf(projectId)}>Project documents</Link>}
          {canSeeContacts && <Link className="btn btn-secondary" to={paths.projectSupportContacts(projectId)}>Support contacts</Link>}
        </section>
      )}
      <div className={styles.chartRow}>
        {sections.map(({ title, items, link }) => (
          <section key={title} className={styles.card}>
            <h2 className={styles.cardTitle}>{title}</h2>
            {items.length ? <StatusBars items={items} /> : <p className={styles.empty}>No site records in this scope.</p>}
            {link && <Link className="btn btn-ghost btn-sm" to={link.to}>{link.title}</Link>}
          </section>
        ))}
      </div>
    </div>
  );
}
