import type { LucideIcon } from 'lucide-react';

export interface NavItemView {
  key: string;
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match the path exactly (for hub/overview links). */
  isEnd?: boolean;
  children?: NavItemView[];
}

export interface NavSectionView {
  key: string;
  title?: string;
  subtitle?: string;
  items: NavItemView[];
}

export interface TileView {
  key: string;
  label: string;
  description?: string;
  to: string;
  icon: LucideIcon;
}

export interface ContextChipView {
  label: string;
  detail?: string;
  to?: string;
}

export interface DemoUserOption {
  userId: string;
  roleLabel: string;
  name: string;
}
