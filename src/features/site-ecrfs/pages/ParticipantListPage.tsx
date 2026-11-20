import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { DataGrid } from '@/components/data-grid';
import { PARTICIPANT_LABELS as P, SITE_ECRF_LABELS as L } from '../constants/site-ecrfs.constants';
import { ParticipantDetailsModal } from '../components/ParticipantDetailsModal';
import { useParticipantList } from '../hooks/useParticipantList';

export function ParticipantListPage() {
  const list = useParticipantList();
  return (
    <div className="page-container">
      <PageHeader title={list.title} description={list.description} />
      <DataGrid
        data={list.rows}
        columns={list.columns}
        getRowId={(p) => p.id}
        searchPlaceholder={L.searchPlaceholder}
        itemLabel={L.itemLabel}
        emptyTitle={L.emptyTitle}
        emptyDescription={list.emptyDescription}
        exportActions={list.exportActions}
        toolbarActions={
          list.canAdd && (
            <button type="button" className="btn btn-primary btn-sm" onClick={list.details.open}>
              <Plus className="size-4" aria-hidden /> {P.addTitle}
            </button>
          )
        }
      />
      <ParticipantDetailsModal {...list.details} />
    </div>
  );
}
