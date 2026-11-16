import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Activity, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { NavItemView, NavSectionView } from './layout.types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  brandName: string;
  brandSubtitle: string;
  /** Logo shown in the brand tile instead of the default icon. */
  brandLogo?: string;
  sections: NavSectionView[];
}

function SidebarLink({ item }: { item: NavItemView }) {
  const Icon = item.icon;
  const { pathname } = useLocation();
  const hasChildren = !!item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children!.some((c) => pathname === c.to || pathname.startsWith(`${c.to}/`));
  const [isOpen, setIsOpen] = useState(isChildActive);
  const submenuRef = useRef<HTMLUListElement>(null);

  // Opens when navigation lands inside it (e.g. the Masters redirect); the user can still collapse it.
  useEffect(() => {
    if (isChildActive) {setIsOpen(true);}
  }, [isChildActive]);

  if (!hasChildren) {
    return (
      <li>
        <NavLink to={item.to} end={item.isEnd} className={({ isActive }) => clsx(styles.link, isActive && 'menu-active')}>
          <Icon className={styles.icon} aria-hidden />
          <span className="truncate">{item.label}</span>
        </NavLink>
      </li>
    );
  }

  // A dropdown: it only expands/collapses; the selected tab is always the child page, never the parent.
  return (
    <li>
      <button type="button" className={styles.link} aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
        <Icon className={styles.icon} aria-hidden />
        <span className="truncate">{item.label}</span>
        <ChevronDown className={clsx(styles.chevron, isOpen && styles.chevronOpen)} aria-hidden />
      </button>
      <ul
        ref={submenuRef}
        className={clsx(styles.submenu, isOpen && styles.submenuOpen)}
        // Explicit pixel heights so the browser can animate between closed and open.
        style={{ maxHeight: isOpen ? (submenuRef.current?.scrollHeight ?? 480) : 0 }}
        aria-hidden={!isOpen}
      >
        {item.children!.map((child) => (
          <SidebarLink key={child.key} item={child} />
        ))}
      </ul>
    </li>
  );
}

export function Sidebar({ brandName, brandSubtitle, brandLogo, sections }: SidebarProps) {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>
          {brandLogo ? <img src={brandLogo} alt="" className={styles.brandLogo} /> : <Activity aria-hidden />}
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandName}>{brandName}</span>
          <span className={styles.brandSubtitle}>{brandSubtitle}</span>
        </span>
      </div>

      <div className={styles.sections}>
        {sections.map((section) => (
          <div key={section.key}>
            {(section.title || section.subtitle) && (
              <div className={styles.sectionHeader}>
                {section.title && <span className={styles.sectionTitle}>{section.title}</span>}
                {section.subtitle && <span className={styles.sectionSubtitle}>{section.subtitle}</span>}
              </div>
            )}
            <ul className={clsx('menu', styles.menu)}>
              {section.items.map((item) => (
                <SidebarLink key={item.key} item={item} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
