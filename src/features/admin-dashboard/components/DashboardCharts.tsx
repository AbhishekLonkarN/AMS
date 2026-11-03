import type { DayPoint, StatusCount } from '../utils/admin-dashboard.utils';
import styles from './DashboardCharts.module.css';

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  total: number;
  totalLabel: string;
}

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Donut with the total in the middle and a legend beside it; hovering a slice shows "Label - count". */
export function DonutChart({ segments, total, totalLabel }: DonutChartProps) {
  let offset = 0;
  const description = segments.map((s) => `${s.label}: ${s.value}`).join(', ');

  return (
    <div className={styles.donut}>
      <svg viewBox="0 0 120 120" className={styles.donutSvg} role="img" aria-label={description}>
        <circle cx="60" cy="60" r={RADIUS} className={styles.donutTrack} />
        {total > 0 &&
          segments.map((segment) => {
            const length = (segment.value / total) * CIRCUMFERENCE;
            const circle = (
              <circle
                key={segment.key}
                cx="60"
                cy="60"
                r={RADIUS}
                className={styles.donutSegment}
                stroke={segment.color}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
              >
                <title>{`${segment.label} - ${segment.value}`}</title>
              </circle>
            );
            offset += length;
            return circle;
          })}
        <text x="60" y="58" className={styles.donutTotal}>
          {total}
        </text>
        <text x="60" y="74" className={styles.donutCaption}>
          {totalLabel}
        </text>
      </svg>
      <ul className={styles.legend}>
        {segments.map((segment) => (
          <li key={segment.key} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: segment.color }} aria-hidden />
            <span className={styles.legendLabel}>{segment.label}</span>
            <span className={styles.legendValue}>{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ActivityChartProps {
  points: DayPoint[];
}

const W = 640;
const H = 250;
const PAD = { top: 16, right: 28, bottom: 34, left: 38 };
const GRID_STEPS = 4;

/** Line + area chart of actions per day, with a value axis, gridlines and dated x axis. */
export function ActivityChart({ points }: ActivityChartProps) {
  const max = Math.max(1, ...points.map((p) => p.count));
  const step = Math.max(1, Math.ceil(max / GRID_STEPS));
  const yMax = step * GRID_STEPS;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length > 1 ? (i / (points.length - 1)) * innerW : innerW / 2);
  const y = (value: number) => PAD.top + innerH * (1 - value / yMax);

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.count).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`;
  const ticks = Array.from({ length: GRID_STEPS + 1 }, (_, i) => i * step);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.chart}
      role="img"
      aria-label={points.map((p) => `${p.title}: ${p.count}`).join(', ')}
    >
      <defs>
        <linearGradient id="activity-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} className={styles.grid} />
          <text x={PAD.left - 8} y={y(tick) + 4} className={styles.axisY}>
            {tick}
          </text>
        </g>
      ))}

      <path d={area} fill="url(#activity-area)" />
      <path d={line} className={styles.line} />

      {points.map((point, i) => (
        <g key={point.key}>
          {point.count > 0 && <circle cx={x(i)} cy={y(point.count)} r="4.5" className={styles.dot} />}
          {/* wider invisible target so every day has a tooltip */}
          <circle cx={x(i)} cy={y(point.count)} r="9" className={styles.hit}>
            <title>{`${point.title}: ${point.count}`}</title>
          </circle>
          {(i % 5 === 4 || i === points.length - 1) && (
            <text x={x(i)} y={H - 10} className={styles.axisX}>
              {point.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

interface StatusBarsProps {
  items: StatusCount[];
}

/** Horizontal bars, one per status, relative to the largest group. */
export function StatusBars({ items }: StatusBarsProps) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className={styles.hbars}>
      {items.map((item) => (
        <li key={item.id} className={styles.hbarRow}>
          <span className={styles.hbarLabel}>{item.label}</span>
          <span className={styles.hbarTrack}>
            <span className={styles.hbarFill} style={{ width: `${(item.count / max) * 100}%` }} />
          </span>
          <span className={styles.hbarValue}>{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
