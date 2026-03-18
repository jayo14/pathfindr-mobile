import { useQuery } from "@tanstack/react-query";

import { CampusCoordinate, RouteSummary } from "@/types/domain";
import {
    createFallbackRoute,
    estimateWalkingMinutes,
    getDistanceMeters,
} from "@/utils/geo";

async function fetchWalkingRoute(
  origin: CampusCoordinate,
  destination: CampusCoordinate,
): Promise<RouteSummary> {
  const url = `https://router.project-osrm.org/route/v1/foot/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const payload = (await response.json()) as {
      routes?: Array<{
        distance: number;
        duration: number;
        geometry: {
          coordinates: [number, number][];
        };
      }>;
    };

    const route = payload.routes?.[0];

    if (!route) {
      throw new Error("Missing route");
    }

    return {
      distanceMeters: route.distance,
      durationMinutes: Math.max(1, Math.round(route.duration / 60)),
      points: route.geometry.coordinates.map(([longitude, latitude]) => ({
        latitude,
        longitude,
      })),
    };
  } catch (error) {
    console.log("PathFindr route fallback", error);
    const distanceMeters = getDistanceMeters(origin, destination);

    return {
      distanceMeters,
      durationMinutes: estimateWalkingMinutes(distanceMeters),
      points: createFallbackRoute(origin, destination),
    };
  }
}

export function useDirections(
  origin?: CampusCoordinate,
  destination?: CampusCoordinate,
) {
  return useQuery({
    queryKey: [
      "directions",
      origin?.latitude,
      origin?.longitude,
      destination?.latitude,
      destination?.longitude,
    ],
    enabled: Boolean(origin && destination),
    queryFn: async () =>
      fetchWalkingRoute(
        origin as CampusCoordinate,
        destination as CampusCoordinate,
      ),
  });
}
