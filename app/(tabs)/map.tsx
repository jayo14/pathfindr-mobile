import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LocateFixed, Search, Sparkles } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MapView, { Marker, Region, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { StateCard } from '@/components/StateCard';
import { theme } from '@/constants/theme';
import { useBuildings } from '@/hooks/useCampusData';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAppStore } from '@/store/useAppStore';
import { Building, StoredMapRegion } from '@/types/domain';
import { clusterBuildings } from '@/utils/clustering';
import { getInitialRegion } from '@/utils/geo';

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
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
  const setLastMapRegion = useAppStore((state) => state.setLastMapRegion);
  const setSelectedBuildingId = useAppStore((state) => state.setSelectedBuildingId);
  const [region, setRegion] = useState<StoredMapRegion>(getInitialRegion(lastMapRegion));

  const clusteredMarkers = useMemo(() => clusterBuildings(buildings, region), [buildings, region]);
  const featuredBuildings = useMemo<Building[]>(() => buildings.slice(0, 4), [buildings]);

  const handleOpenSearch = (): void => {
    router.push('/search');
  };

  const handleMarkerPress = (buildingId: string): void => {
    const marker = clusteredMarkers.find((item) => item.buildingIds[0] === buildingId || item.id === buildingId);

    if (marker?.isCluster) {
      const nextRegion: Region = {
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: Math.max(region.latitudeDelta * 0.55, 0.0022),
        longitudeDelta: Math.max(region.longitudeDelta * 0.55, 0.0022),
      };

      mapRef.current?.animateToRegion(nextRegion, 350);
      setRegion(nextRegion);
      setLastMapRegion(nextRegion);
      return;
    }

    setSelectedBuildingId(buildingId);
    router.push(`/building/${buildingId}`);
  };

  const handleRegionChangeComplete = (nextRegion: Region): void => {
    const storedRegion: StoredMapRegion = {
      latitude: nextRegion.latitude,
      longitude: nextRegion.longitude,
      latitudeDelta: nextRegion.latitudeDelta,
      longitudeDelta: nextRegion.longitudeDelta,
    };

    setRegion(storedRegion);
    setLastMapRegion(storedRegion);
  };

  const centerOnUser = async (): Promise<void> => {
    if (locationPermissionStatus !== 'granted') {
      await requestPermission();
      return;
    }

    await refreshLocation();

    if (location) {
      const nextRegion: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      };
      mapRef.current?.animateToRegion(nextRegion, 350);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={locationPermissionStatus === 'granted'}
        showsCompass
        showsMyLocationButton={false}
        testID="campus-map"
      >
        <UrlTile
          maximumZ={19}
          flipY={false}
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          zIndex={-1}
        />

        {clusteredMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            onPress={() => handleMarkerPress(marker.id)}
            pinColor={marker.color}
            testID={`map-marker-${marker.id}`}
          >
            {marker.isCluster ? (
              <View style={styles.clusterMarker}>
                <Text style={styles.clusterCount}>{marker.count}</Text>
              </View>
            ) : (
              <View style={[styles.singleMarker, { backgroundColor: marker.color }]} />
            )}
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Pressable style={styles.searchBar} onPress={handleOpenSearch} testID="open-search-button">
            <Search color={theme.colors.textMuted} size={18} />
            <Text style={styles.searchLabel}>Search buildings, departments, facilities</Text>
          </Pressable>
          <Pressable style={styles.locateButton} onPress={() => void centerOnUser()} testID="center-location-button">
            <LocateFixed color={theme.colors.primary} size={18} />
          </Pressable>
        </View>

        <View style={styles.bottomSheet}>
          <SectionHeader
            title="Explore campus"
            subtitle="Smart markers, live position, and quick routes"
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
    fontWeight: '800',
  },
  placeTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  placeSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  clusterMarker: {
    minWidth: 34,
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  clusterCount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  singleMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
