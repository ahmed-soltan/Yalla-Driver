// src/shared/model/tab-bar-store.ts
import { useEffect } from 'react';
import { create } from 'zustand';

type TabBarState = {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
};

export const useTabBarStore = create<TabBarState>((set) => ({
  hidden: false,
  setHidden: (hidden) => set({ hidden }),
}));

/** Call from a screen that must hide the bar while `active` (e.g. the incoming offer). */
export function useHideTabBar(active: boolean) {
  const setHidden = useTabBarStore((s) => s.setHidden);
  useEffect(() => {
    setHidden(active);
    return () => setHidden(false);
  }, [active, setHidden]);
}
