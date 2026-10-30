import { useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import { Check, Search } from 'lucide-react';
import clsx from 'clsx';
import type { FieldChromeProps, SelectOption } from './form.types';
import { FORM_LABELS } from './form.constants';
import { FormField } from './FormField';
import styles from './SearchSelect.module.css';

interface SearchSelectProps extends FieldChromeProps {
  options: SelectOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  isDisabled?: boolean;
}

/** Type-ahead select (e.g. email search on Affiliate forms). Keyboard: ↑ ↓ Enter Esc. */
export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = FORM_LABELS.searchPlaceholder,
  emptyLabel = FORM_LABELS.noMatches,
  isDisabled,
  ...chrome
}: SearchSelectProps) {
  const inputId = useId();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLElement | null>>([]);

  const selected = options.find((o) => o.value === value);
  const needle = query.trim().toLowerCase();
  const filtered = options.filter((o) => `${o.label} ${o.description ?? ''}`.toLowerCase().includes(needle));

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          elements.floating.style.width = `${rects.reference.width}px`;
        },
      }),
    ],
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    useRole(context, { role: 'listbox' }),
    useDismiss(context),
    useListNavigation(context, { listRef, activeIndex, onNavigate: setActiveIndex, virtual: true, loop: true }),
  ]);

  const select = (option: SelectOption) => {
    if (option.isDisabled) return;
    onChange(option.value);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && activeIndex !== null && filtered[activeIndex]) {
      event.preventDefault();
      select(filtered[activeIndex]);
    }
  };

  return (
    <FormField {...chrome} htmlFor={inputId}>
      <label className={clsx('input w-full', chrome.error && 'input-error')}>
        <Search className="size-4 text-ink-400" aria-hidden />
        <input
          id={inputId}
          ref={refs.setReference}
          className="grow"
          autoComplete="off"
          disabled={isDisabled}
          placeholder={placeholder}
          value={isOpen ? query : (selected?.label ?? '')}
          aria-invalid={!!chrome.error}
          aria-autocomplete="list"
          {...getReferenceProps({
            onFocus: () => setIsOpen(true),
            onClick: () => setIsOpen(true),
            onChange: (e) => {
              setQuery((e.target as HTMLInputElement).value);
              setIsOpen(true);
              setActiveIndex(0);
            },
            onKeyDown: handleKeyDown,
          })}
        />
      </label>

      {isOpen && (
        <FloatingPortal>
          <ul ref={refs.setFloating} style={floatingStyles} className={styles.list} {...getFloatingProps()}>
            {filtered.length === 0 && <li className={styles.empty}>{emptyLabel}</li>}
            {filtered.map((option, index) => (
              <li
                key={option.value}
                ref={(node) => {
                  listRef.current[index] = node;
                }}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.isDisabled}
                className={clsx(styles.option, index === activeIndex && styles.active, option.isDisabled && styles.disabled)}
                {...getItemProps({ onClick: () => select(option) })}
              >
                <span className="min-w-0 flex-1">
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.description && <span className={styles.optionDescription}>{option.description}</span>}
                </span>
                {option.value === value && <Check className="size-4 text-primary" aria-hidden />}
              </li>
            ))}
          </ul>
        </FloatingPortal>
      )}
    </FormField>
  );
}
