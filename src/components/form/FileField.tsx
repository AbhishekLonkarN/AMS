import { useId, type ChangeEvent } from 'react';
import { Paperclip } from 'lucide-react';
import type { FieldChromeProps } from './form.types';
import { FORM_LABELS } from './form.constants';
import { FormField } from './FormField';

interface FileFieldProps extends FieldChromeProps {
  fileName?: string;
  accept?: string;
  isDisabled?: boolean;
  /** Receives the chosen file name only (no upload in the prototype). */
  onFileNameChange?: (fileName: string) => void;
}

export function FileField({ fileName, accept, isDisabled, onFileNameChange, hint = FORM_LABELS.fileUiOnly, ...chrome }: FileFieldProps) {
  const inputId = useId();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.files?.[0]?.name;
    if (name) onFileNameChange?.(name);
  };

  return (
    <FormField {...chrome} hint={hint} htmlFor={inputId}>
      <input id={inputId} type="file" accept={accept} disabled={isDisabled} className="file-input w-full" onChange={handleChange} />
      {fileName && (
        <span className="flex items-center gap-1.5 text-caption text-ink-500">
          <Paperclip className="size-3.5" aria-hidden /> {fileName}
        </span>
      )}
    </FormField>
  );
}
