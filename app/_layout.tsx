import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
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
import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from 'posthog-react-native';
import { supabase } from '@/lib/supabase/client';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { posthog, setAnalyticsConsent, track } from '@/lib/posthog';
import { useCloudSync } from '@/lib/supabase/useCloudSync';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { ads } from '@/lib/ads';
import { configureGoogleSignIn } from '@/lib/auth/social';
import PhilosopherSheet from '@/components/shared/PhilosopherSheet';
import RanksBadgesSheet from '@/components/shared/RanksBadgesSheet';
import SavedQuotesSheet from '@/components/shared/SavedQuotesSheet';
import PaywallSheet from '@/components/shared/PaywallSheet';
import LaunchScreen from '@/components/launch/LaunchScreen';
import LessonReward from '@/components/lesson/LessonReward';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// The lesson-complete reward, hosted GLOBALLY (not by the lesson screen) so that
// finishing a lesson pops its screen off the tab stack right away. A finished
// lesson screen that stayed on the Learn stack used to re-show this reward on
// every return to the tab and block the branches list.
function LessonRewardHost() {
  const reward = useUIStore((s) => s.reward);
  const seq = useUIStore((s) => s.rewardSeq);
  const dismiss = useUIStore((s) => s.dismissReward);
  if (!reward) return null;
  return <LessonReward key={seq} {...reward} onDone={dismiss} />;
}

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
    PlayfairDisplay_700Bold_Italic,
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
  // The animated launch screen covers the whole boot (auth check + routing);
  // it lifts away only when the app underneath is ready AND its 0→100% ink
  // stroke has finished drawing. This lives in uiStore rather than local state
  // because index.tsx mounts *underneath* this screen and the welcome animation
  // must not start its timeline until the launch screen has actually lifted.
  const launchDone = useUIStore((s) => s.launchDone);
  const setLaunchDone = useUIStore((s) => s.setLaunchDone);

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

  // Keep the home-screen widget honest whenever the app is used: refresh it on
  // launch and on every return to the foreground, so the streak/quote it shows
  // never lags a session. Lazy-required, best-effort, no-op off Android.
  useEffect(() => {
    const refresh = () => {
      try {
        const { refreshQuoteWidget } = require('@/lib/widget/render');
        refreshQuoteWidget();
      } catch {}
    };
    refresh();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, []);

  // Re-check the subscription entitlement whenever the app returns to the
  // foreground — catches a purchase that completed in the App Store / Play sheet,
  // a renewal, or an expiry while the app was backgrounded. No-op on web/Expo Go.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') useSubscriptionStore.getState().refresh();
    });
    return () => sub.remove();
  }, []);

  // Initialize ads (consent + preload an interstitial) only for FREE users —
  // subscribers never see ads, so we don't even gather consent for them. No-op
  // stub on web/Expo Go. initialize() is idempotent.
  const subReady = useSubscriptionStore((s) => s.ready);
  const isPro = useSubscriptionStore((s) => s.isPro);
  useEffect(() => {
    if (subReady && !isPro) ads.initialize();
  }, [subReady, isPro]);

  // The user id we last routed on. Supabase re-fires SIGNED_IN not only on a real
  // sign-in but on app resume / token refresh / re-subscription — and blindly
  // `router.replace('/(app)')` on every one of those teleports an active user to
  // Home mid-lesson (leaving the finished lesson stranded on the Learn stack as a
  // blank screen). So we only redirect when the user *actually changes*, mirroring
  // the same guard already used in useCloudSync.
  const routedUidRef = useRef<string | null>(null);
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const sub = useSubscriptionStore.getState();
      const uid = session?.user?.id ?? null;
      if (!authChecked) {
        setAuthChecked(true);
        routedUidRef.current = uid;
        // Configure RevenueCat once, tied to the current user (no-op stub on
        // web/Expo Go). init() is internally guarded against double-calls. The
        // email lets reviewer/tester accounts unlock Pro without a purchase.
        sub.init(session?.user?.id ?? null, session?.user?.email ?? null);
        // Returning (signed-in) users go straight in; otherwise show onboarding.
        // If a widget deep link already parked a thinker (cold start races this
        // redirect), land on the Thinkers tab so the profile sheet still opens —
        // otherwise this replace would stomp the deep link back to Home.
        if (session) {
          const pendingThinker = useUIStore.getState().pendingPhilosopherId;
          router.replace(pendingThinker ? '/(app)/philosophers' : '/(app)');
        }
      } else if (event === 'SIGNED_IN') {
        // Keep RevenueCat in sync every time (idempotent), but only route into the
        // app on a genuine new sign-in — never on a spurious same-user re-fire.
        const changedUser = uid !== routedUidRef.current;
        routedUidRef.current = uid;
        sub.setUser(session?.user?.id ?? null, session?.user?.email ?? null);
        // Only a genuinely new user gets routed into the app; a spurious same-user
        // SIGNED_IN (app resume / session recovery / token reissue) is ignored so it
        // can't teleport an active player to Home.
        if (changedUser) router.replace('/(app)');
      } else if (event === 'SIGNED_OUT') {
        routedUidRef.current = null;
        sub.setUser(null, null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [authChecked]);

  // Hand off from the static native splash (the feather) to the animated launch
  // screen as soon as fonts exist — the launch screen then covers the rest of
  // the boot (hydration, auth check, initial route) until it counts to 100%.
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAF7', alignItems: 'center', justifyContent: 'center' }}>
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
      <LessonRewardHost />
      {/* Animated cold-start loading screen: ink scene + drawing stroke + quote.
          Sits over everything until the boot is ready and the count hits 100%. */}
      {!launchDone && (
        <LaunchScreen ready={authChecked && hasHydrated} onDone={() => setLaunchDone(true)} />
      )}
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
