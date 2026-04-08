import { Stack, useLocalSearchParams } from 'expo-router';
import { ArrowUpRight, MapPinned } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NativeMapView, NativeMarker } from '@/components/NativeMapView';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StateCard } from '@/components/StateCard';
import { theme } from '@/constants/theme';
import { useBuildings } from '@/hooks/useCampusData';
import { useDirections } from '@/hooks/useDirections';
import { useUserLocation } from '@/hooks/useUserLocation';
import { formatDistance } from '@/utils/geo';

export default function DirectionsScreen() {
  const params = useLocalSearchParams<{ buildingId: string }>();
  const { buildings } = useBuildings();
  const { location } = useUserLocation();
  const destination = useMemo(
    () => buildings.find((building) => building.id === params.buildingId),
    [buildings, params.buildingId],
  );

  const origin = location ?? buildings[0]?.coordinate;
  const directionsQuery = useDirections(origin, destination?.coordinate);

  if (!destination || !origin) {
    return (
      <SafeAreaView style={styles.container}>
        <StateCard title="Directions unavailable" description="Pick a destination from the map to start routing." />
      </SafeAreaView>
    );
  }

  const mapRegion = {
    latitude: (origin.latitude + destination.coordinate.latitude) / 2,
    longitude: (origin.longitude + destination.coordinate.longitude) / 2,
    latitudeDelta: Math.abs(origin.latitude - destination.coordinate.latitude) * 3 + 0.004,
    longitudeDelta: Math.abs(origin.longitude - destination.coordinate.longitude) * 3 + 0.004,
  };

  const markers: NativeMarker[] = [
    {
      id: destination.id,
      coordinate: destination.coordinate,
      title: destination.name,
      color: theme.colors.accent,
    },
  ];

  return (
    <SafeAreaView style={styles.container} testID="directions-screen">
      <Stack.Screen options={{ headerShown: false }} />
      <NativeMapView
        region={mapRegion}
        markers={markers}
        route={directionsQuery.data?.points ?? []}
        userLocation={origin}
        style={styles.map}
      />

      <View style={styles.overlayCard}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <MapPinned color={theme.colors.primary} size={20} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.routeLabel}>Walking to</Text>
            <Text style={styles.routeTitle}>{destination.name}</Text>
          </View>
        </View>

        {directionsQuery.isLoading ? (
          <StateCard title="Drawing route" description="Calculating the best walking path across campus." loading />
        ) : directionsQuery.data ? (
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{formatDistance(directionsQuery.data.distanceMeters)}</Text>
              <Text style={styles.metricLabel}>Distance</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{directionsQuery.data.durationMinutes} min</Text>
              <Text style={styles.metricLabel}>Walk time</Text>
            </View>
          </View>
        ) : (
          <StateCard title="Route fallback ready" description="A simplified path is shown while live routing is unavailable." />
        )}

        <View style={styles.tipRow}>
          <ArrowUpRight color={theme.colors.primary} size={18} />
          <Text style={styles.tipText}>Head toward the main path and follow the highlighted route line.</Text>
        </View>

        <PrimaryButton label="Refresh route" onPress={() => void directionsQuery.refetch()} testID="refresh-route-button" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
  overlayCard: {
    margin: 18,
    marginTop: -220,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.97)',
    padding: 18,
    gap: 16,
    ...theme.shadow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAlt,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  routeLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    textTransform: 'uppercase',
  },
  routeTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontFamily: 'Poppins_800ExtraBold',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceAlt,
    padding: 16,
    gap: 6,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontFamily: 'Poppins_800ExtraBold',
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'DMSans_400Regular',
  },
});
