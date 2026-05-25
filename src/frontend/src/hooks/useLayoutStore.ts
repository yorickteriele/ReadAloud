import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReactNode } from 'react';

interface LayoutState {
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  contextualSidebar: ReactNode | null;
  setContextualSidebar: (content: ReactNode | null) => void;
  breadcrumbLabel: string | null;
  setBreadcrumbLabel: (label: string | null) => void;
  headerVisible: boolean;
  setHeaderVisible: (visible: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarExpanded: true,
      toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      closeSidebar: () => set({ sidebarExpanded: false }),
      contextualSidebar: null,
      setContextualSidebar: (content) => set({ contextualSidebar: content }),
      breadcrumbLabel: null,
      setBreadcrumbLabel: (label) => set({ breadcrumbLabel: label }),
      headerVisible: true,
      setHeaderVisible: (visible) => set({ headerVisible: visible }),
    }),
    {
      name: 'layout-storage',
      partialize: (state) => ({ sidebarExpanded: state.sidebarExpanded }),
    }
  )
);
