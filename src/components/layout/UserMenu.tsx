import { Link } from 'react-router-dom';
import { ChevronDown, Info, LogOut, Palette, Repeat } from 'lucide-react';
import clsx from 'clsx';
import type { DemoUserOption } from './layout.types';
import { LAYOUT_LABELS } from './layout.constants';
import styles from './UserMenu.module.css';

interface UserMenuProps {
  name: string;
  email: string;
  roleLabel: string;
  initials: string;
  currentUserId: string;
  demoUsers: DemoUserOption[];
  assumptionsTo: string;
  uiKitTo: string;
  onSwitchUser: (userId: string) => void;
  onLogout: () => void;
}

export function UserMenu(props: UserMenuProps) {
  const { name, email, roleLabel, initials, currentUserId, demoUsers, assumptionsTo, uiKitTo, onSwitchUser, onLogout } =
    props;

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className={clsx('btn btn-ghost', styles.trigger)}
        aria-label={LAYOUT_LABELS.userMenu}
      >
        <span className={styles.avatar}>{initials}</span>
        <span className={styles.identity}>
          <span className={styles.name}>{name}</span>
          <span className={styles.role}>{roleLabel}</span>
        </span>
        <ChevronDown className="size-4 text-ink-500" aria-hidden />
      </button>

      <div tabIndex={0} className={clsx('dropdown-content', styles.panel)}>
        <div className={styles.panelHeader}>
          <span className={styles.name}>{name}</span>
          <span className={styles.role}>{email}</span>
        </div>

        <p className={styles.groupTitle}>
          <Repeat className="size-3.5" aria-hidden /> {LAYOUT_LABELS.switchDemoUser}
        </p>
        <ul className="menu w-full p-0">
          {demoUsers.map((option) => (
            <li key={option.userId}>
              <button
                type="button"
                className={clsx(styles.demoOption, option.userId === currentUserId && 'menu-active')}
                onClick={() => onSwitchUser(option.userId)}
              >
                <span className={styles.demoRole}>{option.roleLabel}</span>
                <span className={styles.demoName}>{option.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <ul className={clsx('menu', styles.footer)}>
          <li>
            <Link to={uiKitTo}>
              <Palette className="size-4" aria-hidden /> {LAYOUT_LABELS.uiKit}
            </Link>
          </li>
          <li>
            <Link to={assumptionsTo}>
              <Info className="size-4" aria-hidden /> {LAYOUT_LABELS.assumptions}
            </Link>
          </li>
          <li>
            <button type="button" onClick={onLogout}>
              <LogOut className="size-4" aria-hidden /> {LAYOUT_LABELS.logout}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
