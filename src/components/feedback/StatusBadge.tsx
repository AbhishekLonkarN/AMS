import { CircleCheck, CircleMinus, CircleSlash, PencilLine, FileClock, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { STATUS_BADGE_LABELS, type StatusKind } from './feedback.constants';

interface StatusBadgeProps {
  status: StatusKind;
  /** Overrides the default label. */
  label?: string;
  size?: 'sm' | 'md';
}

// Icon + text so status is never conveyed by colour alone.
const STATUS_STYLE: Record<StatusKind, { className: string; icon: LucideIcon }> = {
  active: { className: 'badge-success', icon: CircleCheck },
  inactive: { className: 'badge-neutral', icon: CircleMinus },
  deaffiliated: { className: 'badge-error', icon: CircleSlash },
  customised: { className: 'badge-warning', icon: PencilLine },
  draft: { className: 'badge-info', icon: FileClock },
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const { className, icon: Icon } = STATUS_STYLE[status];
  return (
    <span className={clsx('badge badge-soft gap-1 whitespace-nowrap', className, size === 'sm' && 'badge-sm')}>
      <Icon className="size-3.5" aria-hidden />
      {label ?? STATUS_BADGE_LABELS[status]}
    </span>
  );
}
