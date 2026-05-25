import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuthStore } from '../../modules/identity/store/auth.store';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { buildBreadcrumbs, getInitials, classNames } from '../../lib/utils/layout';

type ProfileMenuPosition = {
  right: number;
  top: number;
};

export const Header = () => {
  const { user, clearAuth } = useAuthStore();
  const { sidebarExpanded, toggleSidebar, breadcrumbLabel, headerVisible } = useLayoutStore();
  const location = useLocation();
  const breadcrumbs = buildBreadcrumbs(location.pathname, 'ReadAloud', breadcrumbLabel);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileMenuPosition, setProfileMenuPosition] = useState<ProfileMenuPosition>({ right: 12, top: 64 });

  const updateProfileMenuPosition = useCallback(() => {
    if (typeof window === 'undefined') return;

    const triggerBounds = profileTriggerRef.current?.getBoundingClientRect();
    if (!triggerBounds) return;

    setProfileMenuPosition({
      right: Math.max(12, window.innerWidth - triggerBounds.right),
      top: triggerBounds.bottom + 10,
    });
  }, []);

  useLayoutEffect(() => {
    if (isProfileMenuOpen) {
      updateProfileMenuPosition();
    }
  }, [isProfileMenuOpen, updateProfileMenuPosition]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (profileMenuRef.current?.contains(target) || profileTriggerRef.current?.contains(target)) {
        return;
      }

      setIsProfileMenuOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', updateProfileMenuPosition);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', updateProfileMenuPosition);
    };
  }, [isProfileMenuOpen, updateProfileMenuPosition]);

  const handleSignOut = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const profileInitials = getInitials(user?.username || 'User');

  const profileMenu =
    isProfileMenuOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed grid min-w-[220px] gap-3.5 rounded-2xl border border-[color-mix(in_srgb,var(--color-border)_86%,transparent)] bg-surface p-3.5 shadow-xl z-[var(--layer-profile-menu)]"
            ref={profileMenuRef}
            style={profileMenuPosition as CSSProperties}
          >
            <div className="grid gap-2">
              <span className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Profile</span>
              <strong>{user?.username}</strong>
            </div>

            <div className="grid gap-2 border-t border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] pt-3">
              <Link
                className="inline-flex min-h-10 items-center justify-start rounded-[10px] border border-border bg-muted px-3 text-text hover:bg-muted/80 transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
                to="/profile"
              >
                Profile
              </Link>

              <Link
                className="inline-flex min-h-10 items-center justify-start rounded-[10px] border border-border bg-muted px-3 text-text hover:bg-muted/80 transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
                to="/settings"
              >
                Settings
              </Link>

              <button
                className="inline-flex min-h-10 cursor-pointer items-center justify-start rounded-[10px] border border-border bg-muted px-3 text-text hover:bg-muted/80 transition-colors"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  handleSignOut();
                }}
                type="button"
              >
                Sign out
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <header 
      className={classNames(
        "sticky top-0 z-[var(--layer-header)] flex h-14 shrink-0 items-center justify-between gap-3 bg-surface px-3 min-[640px]:px-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform",
        !headerVisible && "-translate-y-full"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted px-3 text-text lg:hidden"
          onClick={toggleSidebar}
          type="button"
        >
          <span aria-hidden="true" className="text-base leading-none">
            {sidebarExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </span>
          <span className="text-sm font-semibold hidden sm:inline">Menu</span>
        </button>

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-text-muted">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            // On mobile, show only the last two parts.
            const isHiddenOnMobile = index < breadcrumbs.length - 2;

            return (
              <div
                className={classNames('flex min-w-0 items-center gap-1.5', isHiddenOnMobile && 'hidden sm:flex')}
                key={`${crumb.to}-${crumb.label}`}
              >
                {index > 0 && (
                  <span className={classNames('text-text-muted opacity-50', isHiddenOnMobile && 'hidden sm:inline')}>/</span>
                )}
                <Link
                  aria-current={isLast ? 'page' : undefined}
                  className={classNames(
                    'block truncate transition-colors hover:text-text',
                    isLast ? 'font-black text-text' : 'text-text-muted text-sm',
                    isLast ? 'max-w-[120px] min-[400px]:max-w-[180px] sm:max-w-none' : 'max-w-[60px] min-[400px]:max-w-[100px] sm:max-w-none',
                  )}
                  title={crumb.label}
                  to={crumb.to}
                >
                  {crumb.label}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      <button
        aria-expanded={isProfileMenuOpen}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        className={classNames(
          'inline-flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-semibold text-text transition-all',
          isProfileMenuOpen && 'border-primary ring-2 ring-primary/20',
        )}
        onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
        ref={profileTriggerRef}
        type="button"
      >
        {profileInitials}
      </button>

      {profileMenu}
    </header>
  );
};
