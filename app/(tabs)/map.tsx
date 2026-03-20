import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LocateFixed, Search, Sparkles } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LeafletMapView, LeafletMarker } from '@/components/LeafletMapView';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { StateCard } from '@/components/StateCard';
import { categoryColors, theme } from '@/constants/theme';
import { useBuildings } from '@/hooks/useCampusData';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAppStore } from '@/store/useAppStore';
import { Building } from '@/types/domain';
import { getInitialRegion } from '@/utils/geo';

export default function MapScreen() {
  const { buildings, isLoading, isError } = useBuildings();
  const {
    location,
    locationPermissionStatus,
    requestPermission,
    refreshLocation,
    isLoading: isLocationLoading,
    error: locationError,
  } = useUserLocation();
  const lastMapRegion = useAppStore((state) => state.lastMapRegion);
  const setSelectedBuildingId = useAppStore((state) => state.setSelectedBuildingId);
  const [mapReady, setMapReady] = useState(false);

  const defaultCenter = getInitialRegion(lastMapRegion);

  const markers = useMemo<LeafletMarker[]>(
    () =>
      buildings.map((b) => ({
        id: b.id,
        coordinate: b.coordinate,
        title: b.name,
        color: categoryColors[b.category],
      })),
    [buildings],
  );

  const featuredBuildings = useMemo<Building[]>(() => buildings.slice(0, 4), [buildings]);

  const handleOpenSearch = (): void => {
    router.push('/search');
  };

  const handleMarkerPress = (buildingId: string): void => {
    setSelectedBuildingId(buildingId);
    router.push(`/building/${buildingId}`);
  };

  const centerOnUser = async (): Promise<void> => {
    if (locationPermissionStatus !== 'granted') {
      await requestPermission();
      return;
    }
    await refreshLocation();
  };

  return (
    <View style={styles.container}>
      <LeafletMapView
        center={defaultCenter}
        zoom={16}
        markers={markers}
        userLocation={location}
        onMarkerPress={handleMarkerPress}
        onMapReady={() => setMapReady(true)}
        style={styles.map}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Pressable style={styles.searchBar} onPress={handleOpenSearch} testID="open-search-button">
            <Search color={theme.colors.textMuted} size={18} />
            <Text style={styles.searchLabel}>Search buildings, departments, facilities</Text>
          </Pressable>
          <Pressable
            style={styles.locateButton}
            onPress={() => void centerOnUser()}
            testID="center-location-button"
          >
            <LocateFixed color={theme.colors.primary} size={18} />
          </Pressable>
        </View>

        <View style={styles.bottomSheet}>
          <SectionHeader
            title="Explore campus"
            subtitle="Live position, smart markers, and quick routes"
            actionLabel="Search"
            onPressAction={handleOpenSearch}
          />

          {locationPermissionStatus !== 'granted' ? (
            <StateCard
              title="Turn on your location"
              description="Get live positioning and quicker walking directions across campus."
              loading={isLocationLoading}
            />
          ) : null}

          {locationError ? (
            <StateCard title="Location update paused" description={locationError} />
          ) : null}

          {isError ? (
            <StateCard title="Campus data unavailable" description="We could not load the campus map data right now." />
          ) : null}

          <View style={styles.quickActionRow}>
            <PrimaryButton
              label={locationPermissionStatus === 'granted' ? 'Refresh my location' : 'Enable location'}
              onPress={() => void centerOnUser()}
              isLoading={isLocationLoading}
              style={styles.flexButton}
              testID="location-permission-button"
            />
            <PrimaryButton
              label="Upcoming events"
              variant="secondary"
              onPress={() => router.push('/(tabs)/events')}
              style={styles.flexButton}
              testID="open-events-button"
            />
          </View>

          <View style={styles.sectionSpacing}>
            <SectionHeader title="Featured places" subtitle="Most visited spaces this week" />
          </View>

          {isLoading ? (
            <StateCard title="Loading campus hotspots" description="Pulling in landmarks and student favorites." loading />
          ) : (
            <FlatList
              data={featuredBuildings}
              horizontal
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featureList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/building/${item.id}`)}
                  style={styles.placeCard}
                  testID={`featured-building-${item.id}`}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.placeImage} contentFit="cover" />
                  <View style={styles.placeContent}>
                    <View style={styles.placePill}>
                      <Sparkles color={theme.colors.primary} size={14} />
                      <Text style={styles.placePillText}>{item.code}</Text>
                    </View>
                    <Text style={styles.placeTitle}>{item.name}</Text>
                    <Text style={styles.placeSubtitle} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.mapTint,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 18,
    paddingVertical: 15,
    ...theme.shadow,
  },
  searchLabel: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  locateButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...theme.shadow,
  },
  bottomSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: 'rgba(244, 247, 242, 0.98)',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 14,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
  sectionSpacing: {
    marginTop: 4,
  },
  featureList: {
    paddingBottom: 8,
    gap: 14,
  },
  placeCard: {
    width: 236,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadow,
  },
  placeImage: {
    width: '100%',
    height: 140,
  },
  placeContent: {
    padding: 16,
    gap: 10,
  },
  placePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  placePillText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  placeTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  placeSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
});
