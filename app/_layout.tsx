import '../global.css';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Caveat_400Regular,
  Caveat_700Bold,
} from '@expo-google-fonts/caveat';
import {
  IMFellEnglish_400Regular,
  IMFellEnglish_400Regular_Italic,
} from '@expo-google-fonts/im-fell-english';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
} from '@expo-google-fonts/eb-garamond';
import { useFonts } from 'expo-font';
import { Stack, router, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from 'posthog-react-native';
import { supabase } from '@/lib/supabase/client';
import { useUserDataStore } from '@/stores/userDataStore';
import { posthog, setAnalyticsConsent, track } from '@/lib/posthog';
import { useCloudSync } from '@/lib/supabase/useCloudSync';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { ads } from '@/lib/ads';
import { configureGoogleSignIn } from '@/lib/auth/social';
import PhilosopherSheet from '@/components/shared/PhilosopherSheet';
import RanksBadgesSheet from '@/components/shared/RanksBadgesSheet';
import SavedQuotesSheet from '@/components/shared/SavedQuotesSheet';
import PaywallSheet from '@/components/shared/PaywallSheet';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Expo Router (React Navigation v7) is not supported by PostHog's screen
// autocapture, so we send a `$screen` event manually on every route change.
function ScreenTracker() {
  const pathname = usePathname();
  useEffect(() => {
    track('$screen', { $screen_name: pathname });
  }, [pathname]);
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Caveat_400Regular,
    Caveat_700Bold,
    IMFellEnglish_400Regular,
    IMFellEnglish_400Regular_Italic,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
  });
  const [authChecked, setAuthChecked] = useState(false);

  // Gate analytics on the user's saved preference, but only once the store has
  // hydrated so we never capture before we know their real choice.
  const usageAnalytics = useUserDataStore((s) => s.settings.usageAnalytics);
  const hasHydrated = useUserDataStore((s) => s._hasHydrated);
  useEffect(() => {
    if (hasHydrated) setAnalyticsConsent(usageAnalytics);
  }, [hasHydrated, usageAnalytics]);

  // Local-first cloud sync: pull/merge/push progress while signed in.
  useCloudSync();

  // Configure Google sign-in once at launch (no-op stub on web/Expo Go, and a
  // no-op until the Google Web client id env var is set). Idempotent.
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // Initialize ads (consent + preload an interstitial) only for FREE users —
  // subscribers never see ads, so we don't even gather consent for them. No-op
  // stub on web/Expo Go. initialize() is idempotent.
  const subReady = useSubscriptionStore((s) => s.ready);
  const isPro = useSubscriptionStore((s) => s.isPro);
  useEffect(() => {
    if (subReady && !isPro) ads.initialize();
  }, [subReady, isPro]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const sub = useSubscriptionStore.getState();
      if (!authChecked) {
        setAuthChecked(true);
        // Configure RevenueCat once, tied to the current user (no-op stub on
        // web/Expo Go). init() is internally guarded against double-calls. The
        // email lets reviewer/tester accounts unlock Pro without a purchase.
        sub.init(session?.user?.id ?? null, session?.user?.email ?? null);
        // Returning (signed-in) users go straight in; otherwise show onboarding.
        if (session) router.replace('/(app)');
      } else if (event === 'SIGNED_IN') {
        sub.setUser(session?.user?.id ?? null, session?.user?.email ?? null);
        router.replace('/(app)');
      } else if (event === 'SIGNED_OUT') {
        sub.setUser(null, null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [authChecked]);

  useEffect(() => {
    if (fontsLoaded && authChecked) SplashScreen.hideAsync();
  }, [fontsLoaded, authChecked]);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-paper items-center justify-center">
        <ActivityIndicator color="#1A1A1A" />
      </View>
    );
  }

  const tree = (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
        <Stack.Screen name="thinker/[id]" />
      </Stack>
      {/* Global bottom sheets — opened from anywhere via uiStore */}
      <SavedQuotesSheet />
      <PhilosopherSheet />
      <RanksBadgesSheet />
      <PaywallSheet />
    </>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        {posthog ? (
          <PostHogProvider client={posthog} autocapture={{ captureScreens: false, captureTouches: false }}>
            <ScreenTracker />
            {tree}
          </PostHogProvider>
        ) : (
          tree
        )}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
