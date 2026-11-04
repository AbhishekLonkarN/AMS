import { NavLink } from 'react-router-dom';
import { Activity } from 'lucide-react';
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
  return (
    <li>
      <NavLink to={item.to} end={item.isEnd} className={({ isActive }) => clsx(styles.link, isActive && 'menu-active')}>
        <Icon className={styles.icon} aria-hidden />
        <span className="truncate">{item.label}</span>
      </NavLink>
      {item.children && item.children.length > 0 && (
        <ul>
          {item.children.map((child) => (
            <SidebarLink key={child.key} item={child} />
          ))}
        </ul>
      )}
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
            {section.title && (
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>{section.title}</span>
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
