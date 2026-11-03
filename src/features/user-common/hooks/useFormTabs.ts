import { useId, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';

/**
 * Tab state for a tabbed drawer form. `fieldTabs` maps form fields to the tab
 * that shows them; on a failed submit the first tab with an error is opened.
 */
export function useFormTabs<TTab extends string>(tabs: readonly TTab[], fieldTabs: Partial<Record<string, TTab>>) {
  const idPrefix = useId();
  const [activeTab, setActiveTab] = useState<TTab>(tabs[0]);

  const showFirstError = (errors: FieldErrors) => {
    const tabsWithErrors = new Set(Object.keys(errors).map((field) => fieldTabs[field]));
    const target = tabs.find((tab) => tabsWithErrors.has(tab));
    if (target) setActiveTab(target);
  };

  return {
    idPrefix,
    activeTab,
    setActiveTab: (key: string) => setActiveTab(key as TTab),
    showFirstError,
  };
}

export type FormTabsModel = ReturnType<typeof useFormTabs>;
