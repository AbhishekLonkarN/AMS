import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { DataGrid } from '@/components/data-grid';
import { ConfirmDialog } from '@/components/feedback';
import type { MasterListModel } from '../hooks/useMasterList';
import { MASTER_LABELS } from '../constants/masters.constants';
import { MasterFormModal } from './MasterFormModal';

export function MasterListView(model: MasterListModel) {
  return (
    <div className="page-container">
      <PageHeader title={model.title} description={model.description} backTo={model.backTo} />
      <DataGrid
        // Fresh grid state (search, filters, page) when switching between masters.
        key={model.title}
        data={model.items}
        columns={model.columns}
        getRowId={(i) => i.id}
        rowActions={model.rowActions}
        isRowMuted={(i) => i.status !== 'active'}
        searchPlaceholder={MASTER_LABELS.searchPlaceholder}
        toolbarActions={
          model.canAdd && (
            <button type="button" className="btn btn-primary btn-sm" onClick={model.onAdd}>
              <Plus className="size-4" aria-hidden /> {model.addLabel}
            </button>
          )
        }
      />
      <MasterFormModal model={model.form} />
      <ConfirmDialog {...model.confirm} />
    </div>
  );
}
