import { Outlet } from 'react-router-dom';
import { AppShell, ContextHeader, Sidebar, UserMenu } from '@/components/layout';
import { useShellLayout } from '../hooks/useShellLayout';

export function ShellLayoutPage() {
  const { variant, brand, sections, pageKey, projectChip, siteChip, userMenu, handleSwitchUser, handleLogout } = useShellLayout();

  return (
    <AppShell
      variant={variant}
      pageKey={pageKey}
      sidebar={<Sidebar brandName={brand.name} brandSubtitle={brand.subtitle} sections={sections} />}
      header={
        <ContextHeader
          project={projectChip}
          site={siteChip}
          userMenu={userMenu && <UserMenu {...userMenu} onSwitchUser={handleSwitchUser} onLogout={handleLogout} />}
        />
      }
    >
      <Outlet />
    </AppShell>
  );
}
