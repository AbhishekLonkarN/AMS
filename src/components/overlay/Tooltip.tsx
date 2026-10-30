import { cloneElement, useState, type ReactElement } from 'react';
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  type Placement,
} from '@floating-ui/react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: string;
  placement?: Placement;
  /** A single element that can hold a ref (button, link, span). */
  children: ReactElement;
}

export function Tooltip({ content, placement = 'top', children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false, delay: { open: 250 } }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: 'tooltip' }),
  ]);

  return (
    <>
      {cloneElement(children, { ref: refs.setReference, ...getReferenceProps(children.props) })}
      {isOpen && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} className={styles.tooltip} {...getFloatingProps()}>
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
