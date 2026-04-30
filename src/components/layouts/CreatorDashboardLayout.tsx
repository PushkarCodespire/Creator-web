import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CreatorSidebar from './CreatorSidebar';
import CreatorHeader from './CreatorHeader';
import { DashboardFilterProvider } from './DashboardFilterContext';

export default function CreatorDashboardLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const sidebarWidth = sidebarExpanded ? 212 : 82;

  return (
    <DashboardFilterProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#fbf7f4', fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <CreatorSidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(v => !v)} />
        <main style={{
          flex: 1,
          marginLeft: sidebarWidth,
          padding: '0 32px 40px',
          maxWidth: `calc(100vw - ${sidebarWidth}px)`,
          overflow: 'hidden',
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <CreatorHeader />
          <Outlet />
        </main>
      </div>
    </DashboardFilterProvider>
  );
}
