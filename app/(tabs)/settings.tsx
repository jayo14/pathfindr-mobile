import { router } from 'expo-router';
import { DatabaseZap, Download, MapPinned, ShieldCheck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionHeader } from '@/components/SectionHeader';
import { theme } from '@/constants/theme';
import { useCampusData } from '@/hooks/useCampusData';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsScreen() {
  const campusDataQuery = useCampusData();
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const locationPermissionStatus = useAppStore((state) => state.locationPermissionStatus);
  const lastMapRegion = useAppStore((state) => state.lastMapRegion);
  const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);

  return (
    <SafeAreaView style={styles.container} testID="settings-screen">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Preferences</Text>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage onboarding, offline readiness, and your campus app status.</Text>
        </View>

        <View style={styles.sectionCard}>
          <SectionHeader title="Offline support" subtitle="Basic cache for map context and campus data" />
          <View style={styles.row}>
            <Download color={theme.colors.primary} size={18} />
            <Text style={styles.rowText}>
              Last data sync: {campusDataQuery.data?.updatedAt ? new Date(campusDataQuery.data.updatedAt).toLocaleString() : 'Waiting for first sync'}
            </Text>
          </View>
          <View style={styles.row}>
            <MapPinned color={theme.colors.primary} size={18} />
            <Text style={styles.rowText}>
              Last map area: {lastMapRegion ? `${lastMapRegion.latitude.toFixed(4)}, ${lastMapRegion.longitude.toFixed(4)}` : 'Not saved yet'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <SectionHeader title="Permissions" subtitle="Keep guidance clear when location is not available" />
          <View style={styles.row}>
            <ShieldCheck color={theme.colors.primary} size={18} />
            <Text style={styles.rowText}>Location access: {locationPermissionStatus}</Text>
          </View>
          <View style={styles.row}>
            <DatabaseZap color={theme.colors.primary} size={18} />
            <Text style={styles.rowText}>Supabase mode: {process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Configured' : 'Mock-ready fallback'}</Text>
          </View>
        </View>

        <Pressable
          style={styles.primaryAction}
          onPress={() => void campusDataQuery.refetch()}
          testID="refresh-campus-data-button"
        >
          <Text style={styles.primaryActionText}>Refresh campus data</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryAction}
          onPress={() => {
            setHasCompletedOnboarding(false);
            router.replace('/onboarding');
          }}
          testID="replay-onboarding-button"
        >
          <Text style={styles.secondaryActionText}>
            {hasCompletedOnboarding ? 'Replay onboarding' : 'Open onboarding'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionCard: {
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    padding: 18,
    gap: 16,
    ...theme.shadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryAction: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryAction: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});
