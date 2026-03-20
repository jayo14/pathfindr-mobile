import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MapPinned } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function SplashScreen() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)/map');
        return;
      }

      router.replace('/onboarding');
    }, 1500);

    return () => clearTimeout(timeout);
  }, [hasCompletedOnboarding]);

  return (
    <LinearGradient colors={['#E9F7EE', '#F9FBF7']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} testID="splash-screen">
        <View style={styles.brandMark}>
          <MapPinned color="#FFFFFF" size={38} />
        </View>
        <View style={styles.copyBlock}>
          <Text style={styles.title}>PathFindr</Text>
          <Text style={styles.subtitle}>Your smart guide to campus routes, events, and student essentials.</Text>
        </View>
        <View style={styles.footerPill}>
          <Text style={styles.footerText}>Built for campus movement</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 56,
    paddingHorizontal: 28,
  },
  brandMark: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadow,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 40,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  footerPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
  },
  footerText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
