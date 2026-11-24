// src/features/home/model/location-store.ts
import { create } from 'zustand';

export type LatLng = { latitude: number; longitude: number };

type LocationState = {
  position: LatLng | null;
  backgroundActive: boolean;
  setPosition: (p: LatLng) => void;
  setBackgroundActive: (active: boolean) => void;
};

/** Written by the app-level location bridge, read by any screen that needs the position. */
export const useLocationStore = create<LocationState>((set) => ({
  position: null,
  backgroundActive: false,
  setPosition: (position) => set({ position }),
  setBackgroundActive: (backgroundActive) => set({ backgroundActive }),
}));
