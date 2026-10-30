import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FolderKanban, Hospital, Menu } from 'lucide-react';
import type { ContextChipView } from './layout.types';
import { LAYOUT_LABELS, SIDEBAR_DRAWER_ID } from './layout.constants';
import styles from './ContextHeader.module.css';

interface ContextHeaderProps {
  project?: ContextChipView;
  site?: ContextChipView;
  userMenu: ReactNode;
}

function Chip({ chip, icon, srLabel }: { chip: ContextChipView; icon: ReactNode; srLabel: string }) {
  const content = (
    <>
      {icon}
      <span className="sr-only">{srLabel}: </span>
      <span className={styles.chipLabel}>{chip.label}</span>
      {chip.detail && <span className={styles.chipDetail}>{chip.detail}</span>}
    </>
  );
  return chip.to ? (
    <Link to={chip.to} className={styles.chip}>
      {content}
    </Link>
  ) : (
    <span className={styles.chip}>{content}</span>
  );
}

/** Top bar: drawer toggle, project badge + site/PI banner, user menu. */
export function ContextHeader({ project, site, userMenu }: ContextHeaderProps) {
  return (
    <header className={styles.header}>
      <label htmlFor={SIDEBAR_DRAWER_ID} className="btn btn-square btn-ghost lg:hidden" aria-label={LAYOUT_LABELS.openMenu}>
        <Menu className="size-5" aria-hidden />
      </label>

      <div className={styles.context}>
        {project && (
          <Chip
            chip={project}
            srLabel={LAYOUT_LABELS.projectContext}
            icon={<FolderKanban className={styles.projectIcon} aria-hidden />}
          />
        )}
        {project && site && <ChevronRight className="size-4 shrink-0 text-ink-400" aria-hidden />}
        {site && (
          <Chip chip={site} srLabel={LAYOUT_LABELS.siteContext} icon={<Hospital className={styles.siteIcon} aria-hidden />} />
        )}
      </div>

      {userMenu}
    </header>
  );
}
