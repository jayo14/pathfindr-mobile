import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CalendarClock, Compass, ShieldCheck } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

const highlights = [
  {
    title: 'Navigate smarter',
    description: 'Find lecture halls, offices, labs, and student spots without wandering.',
    icon: Compass,
  },
  {
    title: 'Stay in the loop',
    description: 'Catch upcoming campus events and key gatherings in one polished feed.',
    icon: CalendarClock,
  },
  {
    title: 'Recover faster',
    description: 'Report lost or found items with place context and clear next steps.',
    icon: ShieldCheck,
  },
] as const;

export default function OnboardingScreen() {
  const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);

  const handleContinue = (): void => {
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)/map');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#DFF5E6', '#F4F7F2']} style={styles.hero}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.headlineWrap}>
              <Text style={styles.eyebrow}>Welcome to PathFindr</Text>
              <Text style={styles.title}>Move around campus with clarity.</Text>
              <Text style={styles.subtitle}>
                Built for busy students who need fast routing, smarter discovery, and campus context that actually helps.
              </Text>
            </View>

            <View style={styles.cardList}>
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <View key={item.title} style={styles.featureCard} testID={`onboarding-card-${item.title}`}>
                    <View style={styles.featureIconWrap}>
                      <Icon color={theme.colors.primary} size={20} />
                    </View>
                    <View style={styles.featureCopy}>
                      <Text style={styles.featureTitle}>{item.title}</Text>
                      <Text style={styles.featureDescription}>{item.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <PrimaryButton label="Enter campus map" onPress={handleContinue} testID="continue-onboarding-button" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 30,
  },
  headlineWrap: {
    gap: 12,
    paddingTop: 16,
  },
  eyebrow: {
    fontSize: 13,
    fontFamily: 'Poppins_800ExtraBold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.colors.primary,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    fontFamily: 'Poppins_800ExtraBold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 25,
    color: theme.colors.textMuted,
    fontFamily: 'DMSans_400Regular',
  },
  cardList: {
    gap: 14,
  },
  featureCard: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: '#FFFFFF',
    padding: 18,
    ...theme.shadow,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAlt,
  },
  featureCopy: {
    flex: 1,
    gap: 6,
  },
  featureTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontFamily: 'Poppins_800ExtraBold',
  },
  featureDescription: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'DMSans_400Regular',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: theme.colors.background,
  },
});
