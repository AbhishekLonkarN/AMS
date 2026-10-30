import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import type { MatrixDefinition, PermissionKey, ScopeType } from '@/types';
import { PageHeader } from '@/components/layout';
import { FormSection, ReadOnlyField } from '@/components/form';
import { StatusBadge, type StatusKind } from '@/components/feedback';
import { PermissionMatrix } from '@/components/permission-matrix';
import { USER_ACTION_LABELS } from '../constants/user-common.constants';

export interface DetailField {
  label: string;
  value: ReactNode;
  isFullWidth?: boolean;
}

export interface DetailMatrix {
  title?: string;
  matrix: MatrixDefinition;
  scopeTypes?: ScopeType[];
  permissions: PermissionKey[];
  templatePermissions?: PermissionKey[];
  templateName?: string;
}

interface RecordDetailViewProps {
  title: string;
  description?: string;
  backTo: string;
  /** Omit when the user lacks the edit right. */
  editTo?: string;
  status?: StatusKind;
  sectionTitle?: string;
  fields: DetailField[];
  matrix?: DetailMatrix;
}

/** Read-only "View" mode: fields + effective permissions (disabled matrix). */
export function RecordDetailView({ title, description, backTo, editTo, status, sectionTitle, fields, matrix }: RecordDetailViewProps) {
  return (
    <div className="page-container">
      <PageHeader
        title={title}
        description={description}
        backTo={backTo}
        actions={
          <>
            {status && <StatusBadge status={status} />}
            {editTo && (
              <Link to={editTo} className="btn btn-primary btn-sm">
                <Pencil className="size-4" aria-hidden /> {USER_ACTION_LABELS.editDetails}
              </Link>
            )}
          </>
        }
      />
      <FormSection title={sectionTitle}>
        <div className="form-grid">
          {fields.map((field) => (
            <ReadOnlyField key={field.label} label={field.label} value={field.value} isFullWidth={field.isFullWidth} />
          ))}
        </div>
      </FormSection>
      {matrix && (
        <PermissionMatrix
          title={matrix.title}
          matrix={matrix.matrix}
          scopeTypes={matrix.scopeTypes}
          value={matrix.permissions}
          templatePermissions={matrix.templatePermissions}
          templateName={matrix.templateName}
          isReadOnly
        />
      )}
    </div>
  );
}
