import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { classNames } from '../../lib/utils/layout';

export const MainLayout = () => {
  const { sidebarExpanded, closeSidebar, headerVisible, setHeaderVisible } = useLayoutStore();
  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);

  function handleScroll(e: React.UIEvent<HTMLElement>) {
    if (!scrollTicking.current) {
      const currentScrollY = e.currentTarget.scrollTop;

      window.requestAnimationFrame(() => {
        // Only auto-hide on mobile/tablet
        if (window.innerWidth < 1024) {
          if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
            if (headerVisible) setHeaderVisible(false);
          } else if (currentScrollY < lastScrollY.current) {
            if (!headerVisible) setHeaderVisible(true);
          }
        }
        lastScrollY.current = currentScrollY;
        scrollTicking.current = false;
      });

      scrollTicking.current = true;
    }
  }

  function closeMobileSidebarFromPagePress() {
    if (!sidebarExpanded || typeof window === 'undefined') {
      return;
    }

    if (!window.matchMedia('(min-width: 1024px)').matches) {
      closeSidebar();
    }
  }

  return (
    <div className="h-svh bg-background overflow-hidden selection:bg-primary/30">
      <div
        className={classNames(
          'grid h-svh items-stretch transition-[grid-template-columns] duration-200 ease-in-out will-change-[grid-template-columns]',
          '[--sidebar-width:0px] sm:[--sidebar-width:68px]',
          sidebarExpanded && '[--sidebar-width:280px] sm:[--sidebar-width:280px] lg:[--sidebar-width:280px]',
          '[grid-template-columns:var(--sidebar-width)_minmax(0,1fr)]'
        )}
      >
        <Sidebar />

        <div className="relative flex min-w-0 flex-col bg-surface overflow-hidden">
          <Header />

          <main
            className={classNames(
              "flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto rounded-tl-2xl bg-background p-4 min-[640px]:p-6 lg:p-8 transition-[margin-top] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              !headerVisible && "-mt-14"
            )}
            onScroll={handleScroll}
            onPointerDown={closeMobileSidebarFromPagePress}
          >
            <div className="max-w-6xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
  };
