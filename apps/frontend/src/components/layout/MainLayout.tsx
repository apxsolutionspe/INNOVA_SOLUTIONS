import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useAuthStore } from '../../store/auth.store';
import { OfflineBanner } from '../feedback/OfflineBanner';
import { MobileBottomNav } from '../mobile/MobileBottomNav';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((current) => !current);

  useEffect(() => {
    if (!user) {
      void loadProfile();
    }
  }, [loadProfile, user]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="min-h-screen">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className={`min-w-0 transition-[padding] duration-300 ease-out ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
          <Header isMenuOpen={isSidebarOpen} onMenuClick={isSidebarOpen ? closeSidebar : openSidebar} onToggleSidebar={toggleSidebar} />
          <OfflineBanner />
          <main className="pb-20 lg:pb-0">
            <Outlet />
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
}
