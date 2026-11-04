import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useDrawerClose } from './drawer.context';
import { OVERLAY_LABELS } from './overlay.constants';
import styles from './DrawerPanel.module.css';

interface DrawerPanelProps {
  title: ReactNode;
  /** Small text under the title (e.g. email). */
  subtitle?: ReactNode;
  /** Shown at the right of the title row (e.g. status badge). */
  headerExtra?: ReactNode;
  /** Row of secondary action buttons under the header (Edit, Deactivate…). */
  toolbar?: ReactNode;
  /** <Tabs> for very big content. */
  tabs?: ReactNode;
  /** Usually <DrawerActions>. */
  footer?: ReactNode;
  children: ReactNode;
}

/** Drawer layout: header (× close + title), optional toolbar and tabs, scrolling body, sticky footer. */
export function DrawerPanel({ title, subtitle, headerExtra, toolbar, tabs, footer, children }: DrawerPanelProps) {
  const close = useDrawerClose();
  return (
    <>
      <header className={styles.header}>
        <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={OVERLAY_LABELS.close} onClick={close}>
          <X className="size-5 text-ink-500" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {headerExtra}
      </header>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      {tabs && <div className={styles.tabs}>{tabs}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </>
  );
}
