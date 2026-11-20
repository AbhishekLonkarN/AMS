import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataGrid, type DataGridColumn } from '@/components/data-grid';
import { SelectField } from '@/components/form';
import { PageHeader } from '@/components/layout';
import { useAccessibleSites } from '@/rbac';
import { notify, recordAudit, useParticipantsStore, useQueriesStore } from '@/store';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { downloadCsv } from '@/utils/download.utils';
import type { Participant } from '@/types';
import { clinicalExportRows } from './clinical-export.utils';

export function SelectiveExportPage() {
  const { projectId = '' } = useParams();
  return <SelectiveExport key={projectId} projectId={projectId} />;
}

function SelectiveExport({ projectId }: { projectId: string }) {
  const sites = useAccessibleSites(projectId);
  const participants = useParticipantsStore((state) => state.participants);
  const queries = useQueriesStore((state) => state.queries);
  const [siteId, setSiteId] = useState('');
  const [investigator, setInvestigator] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const scopedSites = sites.filter((site) => (!siteId || site.id === siteId) && (!investigator || site.investigatorName === investigator));
  const siteById = new Map(scopedSites.map((site) => [site.id, site]));
  const rows = participants.filter((participant) => participant.projectId === projectId && siteById.has(participant.siteId));
  const chosen = rows.filter((participant) => selected.includes(participant.id));
  const columns: DataGridColumn<Participant>[] = [
    { id: 'selected', header: 'Select', cell: ({ row }) => (
      <input className="checkbox checkbox-sm" type="checkbox" aria-label={`Select ${row.original.screeningNo}`}
        checked={selected.includes(row.original.id)} onChange={(event) => {
          const id = row.original.id;
          setSelected((current) => event.target.checked ? [...current, id] : current.filter((item) => item !== id));
        }} />
    ) },
    { accessorKey: 'screeningNo', header: 'Screening ID' },
    { accessorKey: 'participantNo', header: 'Participant ID' },
    { id: 'site', header: 'Site', accessorFn: (participant) => siteById.get(participant.siteId)?.siteName },
  ];
  const exportSelected = async () => {
    if (!chosen.length) return;
    const records = clinicalExportRows(chosen, queries.filter((query) => query.projectId === projectId));
    if (!(await downloadCsv('selected-project-participants.csv', records))) return;
    recordAudit({ page: AUDIT_PAGES.projectExport, projectId, event: 'Exported selected participant data (CSV)',
      changedTo: `${chosen.length} participants: ${chosen.map((participant) => participant.screeningNo).join(', ')}; site: ${siteId || 'all'}; investigator: ${investigator || 'all'}` });
    notify.success('Selected participants exported.');
  };
  const investigatorNames = [...new Set(sites.map((site) => site.investigatorName))];

  return (
    <div className="page-container">
      <PageHeader title="Selective Data Export" description="Choose participant records to include."
        actions={<button type="button" className="btn btn-primary" disabled={!chosen.length} onClick={() => void exportSelected()}>Export {chosen.length} selected (CSV)</button>} />
      <section className="section-card flex flex-wrap items-end gap-3">
        <SelectField label="Site" value={siteId} placeholder="All sites"
          options={sites.map((site) => ({ value: site.id, label: site.siteName }))}
          onChange={(event) => { setSiteId(event.target.value); setSelected([]); }} />
        <SelectField label="Investigator" value={investigator} placeholder="All investigators"
          options={investigatorNames.map((name) => ({ value: name, label: name }))}
          onChange={(event) => { setInvestigator(event.target.value); setSelected([]); }} />
        <button type="button" className="btn btn-secondary" disabled={!rows.length} onClick={() => setSelected(rows.map((item) => item.id))}>Select all in scope</button>
        <button type="button" className="btn btn-ghost" disabled={!chosen.length} onClick={() => setSelected([])}>Clear selection</button>
      </section>
      <DataGrid data={rows} columns={columns} getRowId={(item) => item.id} searchPlaceholder="Find participants" emptyTitle="No participants in this scope" />
    </div>
  );
}
