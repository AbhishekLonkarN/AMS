import type { ReactNode } from 'react';

interface TabPanelProps {
  /** Same prefix as the <Tabs> it belongs to. */
  idPrefix: string;
  tabKey: string;
  activeKey: string;
  children: ReactNode;
}

/**
 * Panel for a <Tabs> item. Inactive panels are hidden, not unmounted, so form
 * values and validation errors survive tab switches.
 */
export function TabPanel({ idPrefix, tabKey, activeKey, children }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${tabKey}`}
      aria-labelledby={`${idPrefix}-tab-${tabKey}`}
      hidden={tabKey !== activeKey}
      className="flex flex-col gap-6"
    >
      {children}
    </div>
  );
}
