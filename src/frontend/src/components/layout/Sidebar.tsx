import { NavLink } from 'react-router-dom';
import { Library, Upload, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { Logo } from '../ui/Logo';
import { classNames } from '../../lib/utils/layout';

export const Sidebar = () => {
  const { sidebarExpanded, toggleSidebar, contextualSidebar } = useLayoutStore();

  const navigation = [
    { name: 'Library', href: '/library', icon: Library },
    { name: 'Upload Book', href: '/upload', icon: Upload },
  ];

  const renderEntry = (item: typeof navigation[0]) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.name}
        to={item.href}
        title={sidebarExpanded ? undefined : item.name}
        className={({ isActive }) =>
          classNames(
            'flex min-h-10 items-center gap-2.5 whitespace-nowrap rounded-md border-0 bg-transparent px-2.5 text-sm font-medium text-text-muted no-underline hover:bg-[color-mix(in_srgb,var(--color-surface-muted)_70%,transparent)] hover:text-text transition-colors',
            isActive && 'bg-[color-mix(in_srgb,var(--color-surface-muted)_90%,transparent)] text-text',
            !sidebarExpanded && 'justify-center size-11 px-0'
          )
        }
      >
        <Icon className="flex w-5 shrink-0 items-center justify-center text-[1.05rem] text-inherit" />
        {sidebarExpanded && <span>{item.name}</span>}
      </NavLink>
    );
  };

  return (
    <aside className="min-w-0" id="readaloud-sidebar">
      {/* Mobile Backdrop */}
      <div
        className={classNames(
          'fixed inset-0 z-[90] bg-black/50 opacity-0 transition-opacity duration-300 pointer-events-none lg:hidden',
          sidebarExpanded && 'opacity-100 pointer-events-auto'
        )}
        onClick={toggleSidebar}
      />

      <div
        className={classNames(
          'fixed top-0 left-0 z-[100] h-svh w-[var(--sidebar-width)] overflow-x-hidden overflow-y-auto bg-surface opacity-0 transition-[width,opacity] duration-200 ease-in-out pointer-events-none lg:sticky lg:z-auto lg:opacity-100 lg:pointer-events-auto border-r border-border will-change-[width,opacity]',
          sidebarExpanded && 'opacity-100 pointer-events-auto',
        )}
      >
        <div className="flex min-h-svh w-[var(--sidebar-width)] flex-col gap-5 px-3 py-4">
          <div className={classNames('overflow-hidden shrink-0', !sidebarExpanded && 'flex justify-center')}>
            <Logo iconOnly={!sidebarExpanded} />
          </div>

          <nav className="grid flex-1 content-start gap-1 overflow-y-auto min-h-0 relative z-[101]">
            {contextualSidebar ? (
              <div className="flex flex-col gap-1 items-stretch">
                {contextualSidebar}
              </div>
            ) : (
              navigation.map(renderEntry)
            )}
          </nav>

          <div className="-mx-3 mt-auto grid gap-1 border-t border-border px-3 pt-4 shrink-0 relative z-[101]">
            <button
              className={classNames(
                'cursor-pointer transition-colors duration-200',
                sidebarExpanded
                  ? 'flex min-h-10 items-center gap-2.5 whitespace-nowrap rounded-md border-0 bg-transparent px-2.5 text-sm font-medium text-text-muted no-underline hover:bg-[color-mix(in_srgb,var(--color-surface-muted)_70%,transparent)] hover:text-text'
                  : 'flex size-11 items-center justify-center rounded-md border-0 bg-transparent text-text-muted no-underline hover:bg-[color-mix(in_srgb,var(--color-surface-muted)_70%,transparent)] hover:text-text'
              )}
              onClick={toggleSidebar}
              title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              type="button"
            >
              {sidebarExpanded ? (
                <>
                  <PanelLeftClose className="flex w-5 shrink-0 items-center justify-center text-[1.05rem] text-inherit" />
                  <span>Collapse</span>
                </>
              ) : (
                <PanelLeftOpen className="flex w-5 shrink-0 items-center justify-center text-[1.05rem] text-inherit" />
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
