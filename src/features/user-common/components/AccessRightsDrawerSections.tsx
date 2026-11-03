import type { ReactNode } from 'react';
import { SelectField } from '@/components/form';
import { DrawerSection } from '@/components/overlay';
import { PermissionTable } from '@/components/permission-matrix';
import type { AccessRightsFieldModel } from '../hooks/useAccessRightsField';
import { USER_FIELD_LABELS } from '../constants/user-common.constants';
import { DRAWER_LABELS as L } from '../constants/drawer.constants';

interface AccessRightsDrawerSectionsProps {
  model: AccessRightsFieldModel;
  matrixTitle?: string;
  isTemplateRequired?: boolean;
  /** Extra fields in the grey box before the template select. */
  children?: ReactNode;
}

/** Drawer layout of access rights: template select in a grey box, then the permission table. */
export function AccessRightsDrawerSections({
  model,
  matrixTitle,
  isTemplateRequired = false,
  children,
}: AccessRightsDrawerSectionsProps) {
  return (
    <>
      <DrawerSection title={L.template} description={isTemplateRequired ? L.templateRequiredHint : L.templateHint}>
        <div className="form-grid">
          {children}
          <SelectField
            label={isTemplateRequired ? USER_FIELD_LABELS.template : USER_FIELD_LABELS.templateOptional}
            isRequired={isTemplateRequired}
            options={model.templateOptions}
            value={model.templateId}
            error={model.templateError}
            onChange={(e) => model.handleTemplateChange(e.target.value)}
          />
        </div>
      </DrawerSection>
      {/* The table card has its own header, so no section title above it. */}
      <div className="shrink-0">
        <PermissionTable
          title={matrixTitle ?? L.accessRights}
          matrix={model.matrix}
          scopeTypes={model.scopeTypes}
          value={model.permissions}
          onChange={model.handlePermissionsChange}
          templatePermissions={model.templatePermissions}
          templateName={model.templateName}
          onResetToTemplate={model.handleReset}
        />
      </div>
    </>
  );
}
