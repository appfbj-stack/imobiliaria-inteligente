import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { NAV_ITEMS } from '../../config/navigation';
import { AionPanel } from '../../aion/AionPanel';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aionOpen, setAionOpen] = useState(false);
  const location = useLocation();

  const current = NAV_ITEMS.find((item) => item.path === location.pathname);
  const title = current?.label ?? 'Kairós';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} onOpenMobileMenu={() => setMobileOpen(true)} onOpenAion={() => setAionOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      <AionPanel open={aionOpen} onClose={() => setAionOpen(false)} />
    </div>
  );
}
