import { cloneElement, useState, type ReactElement, type ReactNode } from 'react';
import {
  FloatingFocusManager,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useInteractions,
  useRole,
  type Placement,
} from '@floating-ui/react';
import styles from './Popover.module.css';

const VIEWPORT_PADDING = 8;
const MIN_HEIGHT = 160;

interface PopoverProps {
  /** Trigger element (must accept a ref). */
  trigger: ReactElement;
  placement?: Placement;
  /** Content, or a render function receiving `close`. */
  children: ReactNode | ((close: () => void) => ReactNode);
}

/**
 * Click-to-open panel. Esc / outside click closes; focus is managed.
 * Registered in a floating tree, so dropdowns opened inside it (e.g. DropdownSelect)
 * don't count as an outside click.
 */
export function Popover(props: PopoverProps) {
  const parentId = useFloatingParentNodeId();
  if (parentId === null) {
    return (
      <FloatingTree>
        <PopoverNode {...props} />
      </FloatingTree>
    );
  }
  return <PopoverNode {...props} />;
}

function PopoverNode({ trigger, placement = 'bottom-start', children }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const nodeId = useFloatingNodeId();
  const { refs, floatingStyles, context } = useFloating({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: VIEWPORT_PADDING }),
      shift({ padding: VIEWPORT_PADDING }),
      // Never taller than the space left in the viewport; the content scrolls instead.
      size({
        padding: VIEWPORT_PADDING,
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.max(MIN_HEIGHT, availableHeight)}px`;
        },
      }),
    ],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: 'dialog' }),
  ]);

  const close = () => setIsOpen(false);

  return (
    <FloatingNode id={nodeId}>
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
    </FloatingNode>
  );
}
