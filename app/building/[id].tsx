import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Clock3, MapPinned } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { StateCard } from '@/components/StateCard';
import { theme } from '@/constants/theme';
import { useBuildings } from '@/hooks/useCampusData';

export default function BuildingDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { buildings, isLoading } = useBuildings();

  const building = useMemo(() => buildings.find((item) => item.id === params.id), [buildings, params.id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StateCard title="Loading building details" description="Gathering photos, departments, and wayfinding info." loading />
      </SafeAreaView>
    );
  }

  if (!building) {
    return (
      <SafeAreaView style={styles.container}>
        <StateCard title="Building not found" description="This campus place is no longer available in your local guide." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID="building-detail-screen">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: building.imageUrl }} style={styles.heroImage} contentFit="cover" />
        <View style={styles.copyWrap}>
          <Text style={styles.code}>{building.code}</Text>
          <Text style={styles.title}>{building.name}</Text>
          <Text style={styles.description}>{building.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Clock3 color={theme.colors.primary} size={18} />
              <Text style={styles.metaLabel}>{building.openingHours}</Text>
            </View>
            <View style={styles.metaCard}>
              <MapPinned color={theme.colors.primary} size={18} />
              <Text style={styles.metaLabel}>{building.category}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Departments</Text>
            {building.departments.map((department) => (
              <View key={department} style={styles.listPill}>
                <Text style={styles.listPillText}>{department}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facilities</Text>
            {building.facilities.map((facility) => (
              <View key={facility} style={styles.listPill}>
                <Text style={styles.listPillText}>{facility}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <PrimaryButton
          label="Get walking directions"
          onPress={() => router.push(`/directions?buildingId=${building.id}`)}
          testID="open-directions-button"
        />
        <PrimaryButton label="Back to map" variant="secondary" onPress={() => router.back()} testID="back-to-map-button" />
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 18,
    gap: 20,
  },
  heroImage: {
    width: '100%',
    height: 260,
    borderRadius: 30,
  },
  copyWrap: {
    gap: 16,
  },
  code: {
    color: theme.colors.primary,
    fontSize: 13,
    fontFamily: 'Poppins_800ExtraBold',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontFamily: 'Poppins_800ExtraBold',
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'DMSans_400Regular',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadow,
  },
  metaLabel: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: 'Poppins_800ExtraBold',
  },
  listPill: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  listPillText: {
    color: theme.colors.text,
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
  },
  footer: {
    gap: 10,
    paddingBottom: 12,
  },
});
