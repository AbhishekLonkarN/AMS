import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { DrawerContext } from './drawer.context';
import { OVERLAY_LABELS } from './overlay.constants';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  size?: ModalSize;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
};

/** Native <dialog> + daisyUI modal. Esc and backdrop click call onClose. */
export function Modal({ isOpen, title, description, size = 'md', onClose, children, footer }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // Same contract as Drawer: floating popups (dropdown lists) portal into the open dialog.
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const context = useMemo(() => ({ close: onClose, portalRoot }), [onClose, portalRoot]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
    setPortalRoot(isOpen ? dialog : null);
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {isOpen && (
        <DrawerContext.Provider value={context}>
          <div className={clsx('modal-box', styles.box, SIZE_CLASS[size])}>
            <div className={styles.header}>
              <div className="min-w-0">
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
                {description && <p className={styles.description}>{description}</p>}
              </div>
              <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={OVERLAY_LABELS.close} onClick={onClose}>
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className={styles.body}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </div>
        </DrawerContext.Provider>
      )}
      <div className="modal-backdrop" onClick={onClose} aria-hidden />
    </dialog>
  );
}
