import { forwardRef, useRef, useState, type KeyboardEvent } from 'react';
import {
  FloatingFocusManager,
  FloatingNode,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  size as sizeMiddleware,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useInteractions,
  useListNavigation,
  useMergeRefs,
  useRole,
} from '@floating-ui/react';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { SelectOption } from './form.types';
import { useDrawerPortalRoot } from '@/components/overlay/drawer.context';
import styles from './DropdownSelect.module.css';

const MAX_LIST_HEIGHT = 288;
const MIN_LIST_HEIGHT = 120;
const EMPTY_KEY = '__empty';

export interface DropdownSelectProps {
  /** '' means nothing chosen. */
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Label for the "nothing chosen" state (e.g. "All", "Select…"); also offered as the first option. */
  emptyLabel?: string;
  /** `sm` for toolbars / pagination / filters, `md` (default) for forms. */
  size?: 'sm' | 'md';
  /** Tint the trigger brand once a value is chosen (filters). */
  isValueHighlighted?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  id?: string;
  labelledBy?: string;
  describedBy?: string;
  /** Extra classes for the trigger (e.g. a fixed width). */
  className?: string;
}

/**
 * The app's single-select dropdown. Unlike a native <select>, the open list is ours:
 * a bordered card with a highlighted selection. Keyboard: ↑ ↓ Enter Space Esc.
 * Bare control — wrap it in FormField (or use SelectField) for a label and messages.
 */
export const DropdownSelect = forwardRef<HTMLButtonElement, DropdownSelectProps>(function DropdownSelect(
  {
    value,
    options,
    onChange,
    emptyLabel,
    size = 'md',
    isValueHighlighted,
    isInvalid,
    isDisabled,
    isRequired,
    id,
    labelledBy,
    describedBy,
    className,
  },
  ref,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  // Inside a drawer / modal the list must render in the dialog, or it would sit under the top layer.
  const portalRoot = useDrawerPortalRoot();
  const nodeId = useFloatingNodeId();

  const items: SelectOption[] = emptyLabel === undefined ? options : [{ value: '', label: emptyLabel }, ...options];
  const selectedIndex = items.findIndex((o) => o.value === value);
  const selected = items[selectedIndex];
  const isEmpty = !selected || selected.value === '';
  const triggerLabel = selected?.label ?? emptyLabel ?? '';

  const { refs, floatingStyles, context } = useFloating({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      sizeMiddleware({
        padding: 8,
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
            maxHeight: `${Math.min(MAX_LIST_HEIGHT, Math.max(MIN_LIST_HEIGHT, availableHeight))}px`,
          });
        },
      }),
    ],
  });
  const triggerRef = useMergeRefs([refs.setReference, ref]);

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    useClick(context, { enabled: !isDisabled }),
    useDismiss(context),
    useRole(context, { role: 'listbox' }),
    useListNavigation(context, {
      listRef,
      activeIndex,
      selectedIndex: selectedIndex < 0 ? null : selectedIndex,
      onNavigate: setActiveIndex,
      loop: true,
      enabled: !isDisabled,
    }),
  ]);

  const choose = (option: SelectOption) => {
    if (option.isDisabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  // Esc closes only the list, not the drawer / modal / popover around it
  // (preventDefault also stops a showModal() dialog's own Esc → cancel).
  const stopEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
    }
  };

  const handleItemKeyDown = (event: KeyboardEvent<HTMLElement>, option: SelectOption) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(option);
    }
  };

  return (
    <FloatingNode id={nodeId}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        title={triggerLabel}
        disabled={isDisabled}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={isInvalid || undefined}
        aria-required={isRequired || undefined}
        className={clsx(
          styles.trigger,
          size === 'sm' ? styles.sm : styles.md,
          isValueHighlighted && !isEmpty && styles.triggerSet,
          isInvalid && styles.triggerInvalid,
          isOpen && styles.triggerOpen,
          className,
        )}
        {...getReferenceProps({ onKeyDown: stopEscape })}
      >
        <span className={clsx(styles.value, isEmpty && styles.placeholder)}>{triggerLabel}</span>
        <ChevronDown className={clsx(styles.chevron, isOpen && styles.chevronOpen)} aria-hidden />
      </button>

      {isOpen && (
        <FloatingPortal root={portalRoot}>
          <FloatingFocusManager context={context} modal={false}>
            <ul
              ref={refs.setFloating}
              style={floatingStyles}
              className={clsx(styles.list, size === 'sm' && styles.listSm)}
              {...getFloatingProps({ onKeyDown: stopEscape })}
            >
              {items.map((option, index) => {
                const isSelected = index === selectedIndex;
                const isEmptyOption = emptyLabel !== undefined && option.value === '';
                return (
                  <li
                    key={isEmptyOption ? EMPTY_KEY : option.value}
                    ref={(node) => {
                      listRef.current[index] = node;
                    }}
                    role="option"
                    tabIndex={index === activeIndex ? 0 : -1}
                    aria-selected={isSelected}
                    aria-disabled={option.isDisabled}
                    className={clsx(
                      styles.option,
                      isEmptyOption && styles.optionEmpty,
                      index === activeIndex && styles.optionActive,
                      isSelected && styles.optionSelected,
                      option.isDisabled && styles.optionDisabled,
                    )}
                    {...getItemProps({
                      onClick: () => choose(option),
                      onKeyDown: (e) => handleItemKeyDown(e, option),
                    })}
                  >
                    <span className={styles.optionLabel}>
                      {option.label}
                      {option.description && <span className={styles.optionDescription}>{option.description}</span>}
                    </span>
                    {isSelected && <Check className={styles.check} aria-hidden />}
                  </li>
                );
              })}
            </ul>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </FloatingNode>
  );
});
