import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { StoredMapRegion } from "@/types/domain";

interface AppStoreState {
  hasCompletedOnboarding: boolean;
  lastMapRegion?: StoredMapRegion;
  selectedBuildingId?: string;
  locationPermissionStatus: "unknown" | "granted" | "denied";
  setHasCompletedOnboarding: (value: boolean) => void;
  setLastMapRegion: (region: StoredMapRegion) => void;
  setSelectedBuildingId: (buildingId?: string) => void;
  setLocationPermissionStatus: (
    status: "unknown" | "granted" | "denied",
  ) => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      lastMapRegion: undefined,
      selectedBuildingId: undefined,
      locationPermissionStatus: "unknown",
      setHasCompletedOnboarding: (value: boolean) =>
        set({ hasCompletedOnboarding: value }),
      setLastMapRegion: (region: StoredMapRegion) =>
        set({ lastMapRegion: region }),
      setSelectedBuildingId: (buildingId?: string) =>
        set({ selectedBuildingId: buildingId }),
      setLocationPermissionStatus: (status: "unknown" | "granted" | "denied") =>
        set({ locationPermissionStatus: status }),
    }),
    {
      name: "pathfindr-app-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        lastMapRegion: state.lastMapRegion,
        locationPermissionStatus: state.locationPermissionStatus,
      }),
    },
  ),
);
