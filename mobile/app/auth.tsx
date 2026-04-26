import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, MapPinned } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

type AuthMode = 'login' | 'register';

/** Mock credential store – in production this is replaced by Supabase auth. */
const MOCK_USERS_KEY = 'pathfindr-mock-users';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setIsAuthenticated = useAppStore((state) => state.setIsAuthenticated);
  const setIsGuest = useAppStore((state) => state.setIsGuest);
  const setUserEmail = useAppStore((state) => state.setUserEmail);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  /** Navigate after a successful auth event. */
  const proceedAfterAuth = (): void => {
    if (hasCompletedOnboarding) {
      router.replace('/(tabs)/map');
    } else {
      router.replace('/onboarding');
    }
  };

  const handleGuestContinue = (): void => {
    setIsGuest(true);
    setIsAuthenticated(false);
    setUserEmail(undefined);
    proceedAfterAuth();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isValidEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      // Attempt Supabase auth if configured, otherwise use mock auth
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

      if (supabaseUrl) {
        const { supabase } = await import('@/services/supabase');
        if (supabase) {
          if (mode === 'register') {
            const { error } = await supabase.auth.signUp({ email: email.trim(), password });
            if (error) throw error;
          } else {
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            if (error) throw error;
          }
        }
      } else {
        // Mock auth: simulate a small network delay
        await new Promise<void>((resolve) => setTimeout(resolve, 600));
      }

      setIsAuthenticated(true);
      setIsGuest(false);
      setUserEmail(email.trim());
      proceedAfterAuth();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
      Alert.alert(mode === 'register' ? 'Registration failed' : 'Login failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (): void => {
    Alert.alert('Forgot password', 'Password reset is coming soon. Contact campus support for help.');
  };

  const isLogin = mode === 'login';

  return (
    <LinearGradient colors={['#E9F7EE', '#F4F7F2']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} testID="auth-screen">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Brand mark */}
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <MapPinned color="#FFFFFF" size={28} />
              </View>
              <Text style={styles.brandName}>PathFindr</Text>
            </View>

            {/* Headline */}
            <View style={styles.headlineWrap}>
              <Text style={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? 'Sign in to access your campus map, routes, and events.'
                  : 'Join PathFindr to navigate campus smarter.'}
              </Text>
            </View>

            {/* Form card */}
            <View style={styles.card}>
              {/* Email */}
              <View style={styles.inputWrap}>
                <Mail color={theme.colors.textMuted} size={18} style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  testID="auth-email-input"
                />
              </View>

              {/* Password */}
              <View style={styles.inputWrap}>
                <Lock color={theme.colors.textMuted} size={18} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password (min 6 chars)"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, styles.passwordInput]}
                  testID="auth-password-input"
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} testID="toggle-password-visibility">
                  {showPassword
                    ? <EyeOff color={theme.colors.textMuted} size={18} />
                    : <Eye color={theme.colors.textMuted} size={18} />}
                </Pressable>
              </View>

              {/* Forgot password (login only) */}
              {isLogin ? (
                <Pressable onPress={handleForgotPassword} testID="forgot-password-button">
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              ) : null}

              {/* Primary action */}
              <Pressable
                style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
                onPress={() => void handleSubmit()}
                disabled={isLoading}
                testID="auth-submit-button"
              >
                {isLoading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.primaryBtnText}>{isLogin ? 'Sign in' : 'Create account'}</Text>}
              </Pressable>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Guest CTA */}
              <Pressable
                style={styles.guestBtn}
                onPress={handleGuestContinue}
                testID="continue-as-guest-button"
              >
                <Text style={styles.guestBtnText}>Continue as guest</Text>
              </Pressable>
            </View>

            {/* Mode toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <Pressable
                onPress={() => setMode(isLogin ? 'register' : 'login')}
                hitSlop={8}
                testID="toggle-auth-mode-button"
              >
                <Text style={styles.toggleAction}>{isLogin ? 'Sign up' : 'Sign in'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
    gap: 28,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    ...theme.shadow,
  },
  brandName: {
    fontSize: 26,
    fontFamily: 'Poppins_800ExtraBold',
    color: theme.colors.text,
  },
  headlineWrap: {
    gap: 8,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: 'Poppins_800ExtraBold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'DMSans_400Regular',
    color: theme.colors.textMuted,
  },
  card: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    padding: 20,
    gap: 14,
    ...theme.shadow,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
  },
  passwordInput: {
    flex: 1,
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    alignSelf: 'flex-end',
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
  guestBtn: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.pill,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  guestBtnText: {
    color: theme.colors.text,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  toggleLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  toggleAction: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
  },
});
