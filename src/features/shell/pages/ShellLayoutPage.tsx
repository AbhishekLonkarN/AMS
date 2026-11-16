import { Outlet } from 'react-router-dom';
import { AppShell, Breadcrumbs, ContextHeader, Sidebar, UserMenu } from '@/components/layout';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { useShellLayout } from '../hooks/useShellLayout';

export function ShellLayoutPage() {
  const { variant, brand, sections, pageKey, projectChip, siteChip, userMenu, handleSwitchUser, handleLogout } = useShellLayout();

  const breadcrumbs = useBreadcrumbs();

  return (
    <AppShell
      variant={variant}
      pageKey={pageKey}
      sidebar={<Sidebar brandName={brand.name} brandSubtitle={brand.subtitle} brandLogo={brand.logo} sections={sections} />}
      breadcrumbs={<Breadcrumbs items={breadcrumbs} />}
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
