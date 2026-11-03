import { useEffect, useMemo, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { DrawerContext } from './drawer.context';
import { useAnimatedDialog, useDialogEscape } from './useAnimatedDialog';
import styles from './Drawer.module.css';

export type DrawerSize = 'md' | 'lg';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  size?: DrawerSize;
  /** Usually a <DrawerPanel>. Content may change (e.g. view → edit) while the drawer stays open. */
  children: ReactNode;
}

const SIZE_CLASS: Record<DrawerSize, string> = {
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

/** Right-hand panel that slides in over a lightly dimmed page. Native <dialog>: focus trap, Esc. */
export function Drawer({ isOpen, onClose, size = 'lg', children }: DrawerProps) {
  const { dialogRef, isMounted, isShown } = useAnimatedDialog(isOpen);
  const escapeHandlers = useDialogEscape(dialogRef, isOpen, onClose);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalRoot(isMounted ? dialogRef.current : null), [isMounted, dialogRef]);
  const context = useMemo(() => ({ close: onClose, portalRoot }), [onClose, portalRoot]);

  return (
    <dialog ref={dialogRef} tabIndex={-1} className={clsx(styles.dialog, isShown && styles.shown)} {...escapeHandlers}>
      {isMounted && (
        <DrawerContext.Provider value={context}>
          <div className={styles.backdrop} onClick={onClose} aria-hidden />
          <div className={clsx(styles.panel, SIZE_CLASS[size])}>{children}</div>
        </DrawerContext.Provider>
      )}
    </dialog>
  );
}
