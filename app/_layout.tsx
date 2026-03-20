import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { theme } from '@/constants/theme';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

/** Apply Plus Jakarta Sans as the default font across all Text and TextInput
 *  elements without requiring per-component font style overrides. */
function applyGlobalFont(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TextAny = Text as any;
  TextAny.defaultProps = TextAny.defaultProps ?? {};
  TextAny.defaultProps.style = [
    { fontFamily: 'PlusJakartaSans_400Regular' },
    TextAny.defaultProps.style,
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const InputAny = TextInput as any;
  InputAny.defaultProps = InputAny.defaultProps ?? {};
  InputAny.defaultProps.style = [
    { fontFamily: 'PlusJakartaSans_400Regular' },
    InputAny.defaultProps.style,
  ];
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search" options={{ presentation: 'modal' }} />
      <Stack.Screen name="building/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="directions" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      if (fontsLoaded) {
      applyGlobalFont();
      }
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <AppErrorBoundary>
            <StatusBar style="dark" />
            <RootLayoutNav />
          </AppErrorBoundary>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
