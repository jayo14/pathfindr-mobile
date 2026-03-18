import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

import { useAppStore } from "@/store/useAppStore";
import { CampusCoordinate } from "@/types/domain";

export function useUserLocation() {
  const [location, setLocation] = useState<CampusCoordinate | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const locationPermissionStatus = useAppStore(
    (state) => state.locationPermissionStatus,
  );
  const setLocationPermissionStatus = useAppStore(
    (state) => state.setLocationPermissionStatus,
  );

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      const status = permission.status === "granted" ? "granted" : "denied";
      setLocationPermissionStatus(status);
      return permission.status === "granted";
    } catch (requestError) {
      console.log("PathFindr location permission error", requestError);
      setError("We could not request your location permission.");
      setLocationPermissionStatus("denied");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setLocationPermissionStatus]);

  const refreshLocation = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(undefined);

    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch (locationError) {
      console.log("PathFindr location fetch error", locationError);
      setError("Unable to get your live position right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (locationPermissionStatus === "granted") {
      void refreshLocation();
    }
  }, [locationPermissionStatus, refreshLocation]);

  return {
    location,
    isLoading,
    error,
    locationPermissionStatus,
    requestPermission,
    refreshLocation,
  };
}
