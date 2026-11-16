import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbView } from './layout.types';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbsProps {
  items: BreadcrumbView[];
}

/** Where you are inside a project or site; every crumb but the last is a link back up. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items.length) {return null;}
  return (
    <nav aria-label="Breadcrumb" className={styles.bar}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${index}-${item.label}`}>
              <li className={styles.item}>
                {item.to && !isLast ? (
                  <Link to={item.to} className={styles.link}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && <ChevronRight className={styles.separator} aria-hidden />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
