import { cloneElement, useState, type ReactElement, type ReactNode } from 'react';
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  type Placement,
} from '@floating-ui/react';
import styles from './Popover.module.css';

interface PopoverProps {
  /** Trigger element (must accept a ref). */
  trigger: ReactElement;
  placement?: Placement;
  /** Content, or a render function receiving `close`. */
  children: ReactNode | ((close: () => void) => ReactNode);
}

/** Click-to-open panel. Esc / outside click closes; focus is managed. */
export function Popover({ trigger, placement = 'bottom-start', children }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: 'dialog' }),
  ]);

  const close = () => setIsOpen(false);

  return (
    <>
      {cloneElement(trigger, { ref: refs.setReference, ...getReferenceProps(trigger.props) })}
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div ref={refs.setFloating} style={floatingStyles} className={styles.panel} {...getFloatingProps()}>
              {typeof children === 'function' ? children(close) : children}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
