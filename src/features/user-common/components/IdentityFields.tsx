import type { ReactNode } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { SelectField, TextField } from '@/components/form';
import {
  PREFIX_SELECT_OPTIONS,
  STATUS_SELECT_OPTIONS,
  USER_FIELD_HINTS,
  USER_FIELD_LABELS as F,
} from '../constants/user-common.constants';

interface IdentityFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  hasOrganization?: boolean;
  /** Own account: status cannot be changed. */
  isStatusLocked?: boolean;
  /** Extra fields rendered after Organization (e.g. Account type). */
  children?: ReactNode;
}

const msg = (errors: FieldErrors<any>, name: string) => errors[name]?.message as string | undefined;

/** Pre-fix*, Name*, Email ID*, Organization*, User Status* — in a `.form-grid`. */
export function IdentityFields({ register, errors, hasOrganization = true, isStatusLocked, children }: IdentityFieldsProps) {
  return (
    <div className="form-grid">
      <SelectField
        label={F.prefix}
        isRequired
        options={PREFIX_SELECT_OPTIONS}
        error={msg(errors, 'prefix')}
        {...register('prefix')}
      />
      <TextField label={F.name} isRequired autoComplete="off" error={msg(errors, 'name')} {...register('name')} />
      <TextField
        label={F.email}
        type="email"
        isRequired
        autoComplete="off"
        error={msg(errors, 'email')}
        {...register('email')}
      />
      {hasOrganization && (
        <TextField label={F.organization} isRequired error={msg(errors, 'organization')} {...register('organization')} />
      )}
      {children}
      {isStatusLocked ? (
        // Disabled inputs drop out of RHF values, so keep the value in a hidden input.
        <>
          <input type="hidden" {...register('status')} />
          <SelectField
            label={F.status}
            isRequired
            placeholder={false}
            options={STATUS_SELECT_OPTIONS}
            value="active"
            disabled
            hint={USER_FIELD_HINTS.ownStatus}
          />
        </>
      ) : (
        <SelectField
          label={F.status}
          isRequired
          placeholder={false}
          options={STATUS_SELECT_OPTIONS}
          error={msg(errors, 'status')}
          {...register('status')}
        />
      )}
    </div>
  );
}
