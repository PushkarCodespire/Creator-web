import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Grid } from 'antd';
import CreatorSidebar from './CreatorSidebar';
import CreatorHeader from './CreatorHeader';
import { DashboardFilterProvider } from './DashboardFilterContext';

const { useBreakpoint } = Grid;

export default function CreatorDashboardLayout() {
  const screens = useBreakpoint();
  const isMobile = screens.md === false; // false on mobile, undefined on first paint (defaults to desktop)
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarWidth = sidebarExpanded ? 212 : 82;

  // Lock body scroll while mobile menu is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isMobile && mobileMenuOpen ? 'hidden' : '';
  }

  return (
    <DashboardFilterProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#fbf7f4', fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* Desktop sidebar */}
        {!isMobile && (
          <CreatorSidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(v => !v)} />
        )}

        {/* Mobile overlay sidebar */}
        {isMobile && mobileMenuOpen && (
          <CreatorSidebar
            expanded
            onToggle={() => {}}
            isMobile
            onClose={() => setMobileMenuOpen(false)}
          />
        )}

        <main style={{
          flex: 1,
          marginLeft: isMobile ? 0 : sidebarWidth,
          padding: isMobile ? '0 16px 40px' : '0 32px 40px',
          maxWidth: isMobile ? '100vw' : `calc(100vw - ${sidebarWidth}px)`,
          overflow: 'hidden',
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <CreatorHeader
            isMobile={isMobile}
            onMenuOpen={isMobile ? () => setMobileMenuOpen(true) : undefined}
          />
          <Outlet />
        </main>
      </div>
    </DashboardFilterProvider>
  );
}
