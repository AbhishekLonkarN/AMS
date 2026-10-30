import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import clsx from 'clsx';
import { SIDEBAR_DRAWER_ID, LAYOUT_LABELS } from './layout.constants';
import styles from './AppShell.module.css';

interface AppShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  /** Changes when the user moves to another page; replays the page-enter animation. */
  pageKey?: string;
  children: ReactNode;
}

/** Sidebar + header + content. Below `lg` the sidebar becomes a daisyUI drawer. */
export function AppShell({ sidebar, header, pageKey, children }: AppShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Replay the enter animation on the same element (no remount, so page state is kept)
  // and start the new page at the top.
  useEffect(() => {
    const main = mainRef.current;
    if (!main || pageKey === undefined) return;
    main.classList.remove(styles.pageEnter);
    void main.offsetWidth;
    main.classList.add(styles.pageEnter);
    window.scrollTo({ top: 0 });
  }, [pageKey]);

  // Close the mobile drawer after following a link.
  const handleSideClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('a')) setIsDrawerOpen(false);
  };

  return (
    <div className="drawer lg:drawer-open">
      <input
        id={SIDEBAR_DRAWER_ID}
        type="checkbox"
        className="drawer-toggle"
        checked={isDrawerOpen}
        onChange={(e) => setIsDrawerOpen(e.target.checked)}
      />
      <div className={clsx('drawer-content', styles.content)}>
        {header}
        <main ref={mainRef} className={styles.main}>
          {children}
        </main>
      </div>
      <aside className={clsx('drawer-side', styles.side)} onClick={handleSideClick}>
        <label htmlFor={SIDEBAR_DRAWER_ID} aria-label={LAYOUT_LABELS.closeMenu} className="drawer-overlay" />
        {sidebar}
      </aside>
    </div>
  );
}
