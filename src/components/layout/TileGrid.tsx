import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { TileView } from './layout.types';
import styles from './TileGrid.module.css';

interface TileGridProps {
  tiles: TileView[];
}

/** Hub overview tiles (the PDF tile menus). */
export function TileGrid({ tiles }: TileGridProps) {
  return (
    <ul className={styles.grid}>
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <li key={tile.key}>
            <Link to={tile.to} className={styles.tile}>
              <span className={styles.iconWrap}>
                <Icon className="size-5" aria-hidden />
              </span>
              <span className={styles.text}>
                <span className={styles.label}>{tile.label}</span>
                {tile.description && <span className={styles.description}>{tile.description}</span>}
              </span>
              <ChevronRight className={styles.chevron} aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
