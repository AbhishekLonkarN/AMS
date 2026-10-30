import type { ReactNode } from 'react';
import { SelectField } from '@/components/form';
import { PermissionMatrix } from '@/components/permission-matrix';
import type { AccessRightsFieldModel } from '../hooks/useAccessRightsField';
import { USER_FIELD_HINTS, USER_FIELD_LABELS } from '../constants/user-common.constants';

interface AccessRightsSectionProps {
  model: AccessRightsFieldModel;
  title?: string;
  isTemplateRequired?: boolean;
  /** Fields shown above the template select (e.g. Designation, Time-zone). */
  children?: ReactNode;
}

/** Template select (prefills) + editable permission matrix. */
export function AccessRightsSection({ model, title, isTemplateRequired = false, children }: AccessRightsSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="form-grid">
        {children}
        <SelectField
          label={isTemplateRequired ? USER_FIELD_LABELS.template : USER_FIELD_LABELS.templateOptional}
          isRequired={isTemplateRequired}
          hint={isTemplateRequired ? USER_FIELD_HINTS.template : USER_FIELD_HINTS.templateOptional}
          options={model.templateOptions}
          value={model.templateId}
          error={model.templateError}
          onChange={(e) => model.handleTemplateChange(e.target.value)}
        />
      </div>
      <PermissionMatrix
        title={title}
        matrix={model.matrix}
        scopeTypes={model.scopeTypes}
        value={model.permissions}
        onChange={model.handlePermissionsChange}
        templatePermissions={model.templatePermissions}
        templateName={model.templateName}
        onResetToTemplate={model.handleReset}
      />
    </div>
  );
}
