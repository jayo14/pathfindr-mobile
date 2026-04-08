import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';

import { categoryColors, theme } from '@/constants/theme';
import { CampusCoordinate, RouteSegment, StoredMapRegion } from '@/types/domain';

export interface NativeMarker {
  id: string;
  coordinate: CampusCoordinate;
  title: string;
  color?: string;
  isCluster?: boolean;
  clusterCount?: number;
}

interface NativeMapViewProps {
  region: StoredMapRegion;
  markers?: NativeMarker[];
  route?: RouteSegment[];
  userLocation?: CampusCoordinate;
  onMarkerPress?: (markerId: string) => void;
  onRegionChangeComplete?: (region: StoredMapRegion) => void;
  onMapReady?: () => void;
  style?: object;
  showsUserLocation?: boolean;
  followsUserLocation?: boolean;
}

/** Individual building/cluster marker – memoized to avoid re-renders. */
const BuildingMarker = memo(function BuildingMarker({
  marker,
  onPress,
}: {
  marker: NativeMarker;
  onPress?: (id: string) => void;
}) {
  const color = marker.color ?? theme.colors.primary;

  return (
    <Marker
      key={marker.id}
      identifier={marker.id}
      coordinate={marker.coordinate}
      title={marker.title}
      onPress={() => onPress?.(marker.id)}
    >
      <View style={[styles.markerDot, { backgroundColor: color }]}>
        {marker.isCluster && marker.clusterCount && marker.clusterCount > 1 ? (
          <Text style={styles.clusterText}>{marker.clusterCount}</Text>
        ) : null}
      </View>
    </Marker>
  );
});

export const NativeMapView = memo(function NativeMapView({
  region,
  markers = [],
  route = [],
  userLocation,
  onMarkerPress,
  onRegionChangeComplete,
  onMapReady,
  style,
  showsUserLocation = false,
  followsUserLocation = false,
}: NativeMapViewProps) {
  const routeCoords = useMemo<RouteSegment[]>(() => route, [route]);

  const hasRoute = routeCoords.length > 1;

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        showsUserLocation={showsUserLocation}
        followsUserLocation={followsUserLocation}
        showsMyLocationButton={false}
        showsCompass
        rotateEnabled={false}
        onMapReady={onMapReady}
        onRegionChangeComplete={(r) =>
          onRegionChangeComplete?.({
            latitude: r.latitude,
            longitude: r.longitude,
            latitudeDelta: r.latitudeDelta,
            longitudeDelta: r.longitudeDelta,
          })
        }
      >
        {/* Building / cluster markers */}
        {markers.map((marker) => (
          <BuildingMarker key={marker.id} marker={marker} onPress={onMarkerPress} />
        ))}

        {/* Walking route polyline */}
        {hasRoute ? (
          <Polyline
            coordinates={routeCoords}
            strokeColor={theme.colors.primary}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        ) : null}

        {/* Route start dot */}
        {hasRoute ? (
          <Circle
            center={routeCoords[0]}
            radius={6}
            fillColor={theme.colors.primaryDark}
            strokeColor="#FFFFFF"
            strokeWidth={2}
          />
        ) : null}

        {/* Route end dot */}
        {hasRoute ? (
          <Circle
            center={routeCoords[routeCoords.length - 1]}
            radius={6}
            fillColor={theme.colors.accent}
            strokeColor="#FFFFFF"
            strokeWidth={2}
          />
        ) : null}

        {/* Manual user location pulse (when showsUserLocation is false) */}
        {userLocation && !showsUserLocation ? (
          <>
            <Circle
              center={userLocation}
              radius={18}
              fillColor="rgba(33,150,243,0.15)"
              strokeColor="transparent"
            />
            <Circle
              center={userLocation}
              radius={7}
              fillColor="#2196F3"
              strokeColor="#FFFFFF"
              strokeWidth={2.5}
            />
          </>
        ) : null}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  markerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  clusterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
  },
});

/** Re-export categoryColors so callers can pick marker colours. */
export { categoryColors };
