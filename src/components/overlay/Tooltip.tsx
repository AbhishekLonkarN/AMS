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
  useTransitionStyles,
  type Placement,
} from '@floating-ui/react';
import { useDrawerPortalRoot } from './drawer.context';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: string;
  placement?: Placement;
  /** A single element that can hold a ref (button, link, span). */
  children: ReactElement;
}

export function Tooltip({ content, placement = 'top', children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Inside a drawer / modal (a top-layer <dialog>) the tooltip must render in the dialog,
  // otherwise it would sit behind it.
  const portalRoot = useDrawerPortalRoot();
  const { refs, floatingStyles, context } = useFloating({
    // top/left positioning, so the fade can use transform
    transform: false,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: { open: 140, close: 90 },
    initial: { opacity: 0, transform: 'translateY(3px) scale(0.97)' },
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
      {isMounted && (
        <FloatingPortal root={portalRoot}>
          <div ref={refs.setFloating} style={{ ...floatingStyles, ...transitionStyles }} className={styles.tooltip} {...getFloatingProps()}>
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
