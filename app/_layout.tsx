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
// Display faces offered for the profile name only (see data/profileFonts.ts).
// Nothing else in the app uses these, so they exist purely to let someone make
// their own name look like theirs.
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { UnifrakturMaguntia_400Regular } from '@expo-google-fonts/unifrakturmaguntia';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { AbrilFatface_400Regular } from '@expo-google-fonts/abril-fatface';
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
import { useReminders } from '@/lib/notifications/useReminders';
import { consumeReloadedFlag, useFirstRunUpdate } from '@/lib/updates/firstRun';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { ads } from '@/lib/ads';
import { prepareFeedback } from '@/lib/feedback';
import { configureGoogleSignIn } from '@/lib/auth/social';
import PhilosopherSheet from '@/components/shared/PhilosopherSheet';
import RanksBadgesSheet from '@/components/shared/RanksBadgesSheet';
import SavedQuotesSheet from '@/components/shared/SavedQuotesSheet';
import PaywallSheet from '@/components/shared/PaywallSheet';
import LaunchScreen from '@/components/launch/LaunchScreen';
import UpdateGate from '@/components/shared/UpdateGate';
import OnboardingGate from '@/components/welcome/OnboardingGate';
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

/**
 * A SCREEN NAME IS A ROUTE, NOT A PATH.
 *
 * `usePathname()` returns the RESOLVED path, so every lesson, branch and thinker
 * arrived with its own `$screen_name`:
 *
 *   /branches/ethics/ethics-unit-1/lesson/ethics-ethics-8
 *   /branches/logic/logic-unit-3/lesson/logic-logic-14      … and 190 more
 *
 * With 192 lessons, 28 units and ~223 thinkers that is several thousand distinct
 * screens, and PostHog's screen report becomes a list too long to read with a
 * handful of views against each row — the one question it exists to answer
 * ("which screens do people use") is unanswerable. So the id is replaced by its
 * placeholder and carried alongside as a property instead, where it can still be
 * broken down or filtered on but does not shatter the aggregate.
 */
const ROUTE_PATTERNS: Array<[RegExp, string, string[]]> = [
  [/^\/branches\/([^/]+)\/([^/]+)\/lesson\/([^/]+)$/, '/branches/[branch]/[unit]/lesson/[lesson]',
    ['branch_slug', 'unit_slug', 'lesson_id']],
  [/^\/branches\/([^/]+)$/, '/branches/[branch]', ['branch_slug']],
  [/^\/thinker\/([^/]+)$/, '/thinker/[id]', ['philosopher_id']],
  [/^\/philosophers\/([^/]+)$/, '/philosophers/[id]', ['philosopher_id']],
];

// Not exported: every file under app/ is a route, and Expo Router inspects the
// module's exports.
function screenFor(pathname: string) {
  for (const [re, name, keys] of ROUTE_PATTERNS) {
    const m = pathname.match(re);
    if (!m) continue;
    const props: Record<string, string> = {};
    keys.forEach((k, i) => (props[k] = m[i + 1]));
    return { name, props };
  }
  return { name: pathname || '/', props: {} as Record<string, string> };
}

// Expo Router (React Navigation v7) is not supported by PostHog's screen
// autocapture, so we send a `$screen` event manually on every route change.
function ScreenTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const { name, props } = screenFor(pathname);
    track('$screen', { $screen_name: name, ...props });
  }, [pathname]);
  return null;
}

export default function RootLayout() {
  // FONTS LOAD IN TWO STAGES, AND ONLY THE FIRST ONE HOLDS THE APP UP.
  //
  // All nineteen faces used to sit in one `useFonts`, and the render below returned a
  // bare spinner until every one of them had registered. So the first thing on screen
  // after the native splash was a grey spinner, and the launch animation could not
  // even begin until the last decorative face — a blackletter used on one screen —
  // was ready. Nothing on that spinner needed any of them.
  //
  // Stage one is the two families the whole app is set in. It gates the render,
  // because text in the wrong face and then reflowing is worse than waiting.
  const [coreFonts] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_700Bold_Italic,
  });
  // Stage two is every accent face. It gates NOTHING — it loads while the launch
  // animation plays, and the launch screen simply will not hand over until it is
  // done (see `ready` below). So the reader never sees a fallback face pop, and the
  // wait happens behind an animation instead of behind a spinner.
  const [accentFonts] = useFonts({
    Caveat_400Regular,
    Caveat_700Bold,
    IMFellEnglish_400Regular,
    IMFellEnglish_400Regular_Italic,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    Cinzel_700Bold,
    UnifrakturMaguntia_400Regular,
    SpecialElite_400Regular,
    AbrilFatface_400Regular,
  });
  const fontsLoaded = coreFonts;
  const [authChecked, setAuthChecked] = useState(false);
  // The animated launch screen covers the whole boot (auth check + routing);
  // it lifts away only when the app underneath is ready AND its 0→100% ink
  // stroke has finished drawing. This lives in uiStore rather than local state
  // because index.tsx mounts *underneath* this screen and the welcome animation
  // must not start its timeline until the launch screen has actually lifted.
  const setLaunchDone = useUIStore((s) => s.setLaunchDone);

  // TAKE THE NEWEST BUNDLE BEFORE DECIDING WHAT A NEW READER SEES FIRST.
  //
  // A fresh install runs the JS inside the APK, so whatever it meets first is
  // frozen at build time — and the welcome screen is exactly that. See
  // lib/updates/firstRun.ts. Held inside the launch animation, bounded, and only
  // ever for a genuinely first-run reader on the embedded bundle.
  const welcomeVersion = useUserDataStore((s) => s.welcomeVersion);
  const hasSeenWelcome = useUserDataStore((s) => s.hasSeenWelcome);
  const hasHydratedForUpdate = useUserDataStore((s) => s._hasHydrated);
  const isFirstRun = welcomeVersion === 0 && !hasSeenWelcome;
  const updateSettled = useFirstRunUpdate(hasHydratedForUpdate, isFirstRun);

  // …and if we DID restart into one, do not play the launch animation a second
  // time on the same cold start. Without this the reader's first ever launch
  // shows the ink scene, blinks, and shows it again, which reads as a crash.
  const [skipLaunchAnim, setSkipLaunchAnim] = useState(false);
  // Local, not in the store: nothing outside this file needs to know the launch
  // screen is still fading — what everything else wants is `launchDone`, which
  // now means "the app underneath may start", and that is true a second earlier.
  const [launchGone, setLaunchGone] = useState(false);
  // …EXCEPT THAT `launchDone` IS ALSO THE HARNESS ESCAPE HATCH (§21). Every
  // preview route in this repo releases the gate with
  // `useUIStore.setState({ launchDone: true })`, and splitting lift from unmount
  // silently took that away: the mount used to be gated on `launchDone` and is
  // now gated on local state nothing outside can reach, so a preview would
  // photograph the launch screen instead of the page under it — which is exactly
  // what happened on the first run of the intro sweep. `liftedHere` is what tells
  // the two cases apart: if the flag went true and it was not us who set it, this
  // screen was never wanted.
  const liftedHere = useRef(false);
  const launchReleased = useUIStore((s) => s.launchDone);
  useEffect(() => {
    if (launchReleased && !liftedHere.current) setLaunchGone(true);
  }, [launchReleased]);
  useEffect(() => {
    consumeReloadedFlag().then((did) => {
      if (did) setSkipLaunchAnim(true);
    });
  }, []);

  // Gate analytics on the user's saved preference, but only once the store has
  // hydrated so we never capture before we know their real choice.
  const usageAnalytics = useUserDataStore((s) => s.settings.usageAnalytics);
  const hasHydrated = useUserDataStore((s) => s._hasHydrated);
  const installReported = useUserDataStore((s) => s.installReported);
  const markInstallReported = useUserDataStore((s) => s.markInstallReported);
  const openSent = useRef(false);
  useEffect(() => {
    if (!hasHydrated) return;
    setAnalyticsConsent(usageAnalytics);
    if (!usageAnalytics) return;

    // AND SEND THE SESSION EVENTS OURSELVES, because the SDK's own are gone by now.
    //
    // posthog-react-native fires `Application Installed` / `Application Opened` when
    // the CLIENT is constructed, which happens at import time — long before
    // AsyncStorage has hydrated and told us whether we are allowed to capture
    // anything. And an event captured while opted out is not queued, it is dropped:
    //
    //     enqueue(type, msg) { if (this.optedOut) return void emit(
    //       "Library is disabled. Not sending event.") }
    //
    // So on a fresh install those two events are thrown away every time, and
    // `Application Installed` — the one anchor for "did this person ever come
    // back" — can never be recovered afterwards. These two fire at the first
    // moment consent is actually known, which is the earliest point at which they
    // can be honest.
    if (!installReported) {
      track('app_installed');
      markInstallReported();
    }
    if (!openSent.current) {
      openSent.current = true;
      track('app_opened');
    }
  }, [hasHydrated, usageAnalytics, installReported, markInstallReported]);

  // Local-first cloud sync: pull/merge/push progress while signed in.
  useCloudSync();

  // Keep the scheduled reminders in step with the settings and the streak. No-op
  // on web, in Expo Go, and in any binary without the notifications module.
  useReminders();

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

  // Decode the sound clips before anything asks for one. Without this the FIRST
  // tap of a session is silent — the player is still being built when the cue
  // arrives, so the one sound a reader is most likely to be listening for is the
  // one they do not get. Costs 68KB of already-bundled audio and no network.
  useEffect(() => { prepareFeedback(); }, []);

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
      {!launchGone && (
        <LaunchScreen
          ready={authChecked && hasHydrated && accentFonts && updateSettled}
          skipAnimation={skipLaunchAnim}
          // TWO SIGNALS, AND THEY ARE A SECOND APART. `onLift` says the screen
          // underneath may start; `onDone` says this one has finished fading and
          // can come out of the tree. They used to be one, which meant the welcome
          // could not begin until the launch art was entirely gone — so it was
          // revealed at clock zero, and the welcome at clock zero is a blank page
          // for a full second while its host walks in from off-stage.
          onLift={() => { liftedHere.current = true; setLaunchDone(true); }}
          onDone={() => setLaunchGone(true)}
        />
      )}
      {/* The three welcome questions. Above the app, below UpdateGate — a binary
          held behind the update wall should not be asking anyone anything. It
          gates itself on hydration and on the launch screen having lifted. */}
      <OnboardingGate />
      {/* Last in the tree, so it sits above the launch screen and every sheet:
          a build too old to run has nothing else worth showing. */}
      <UpdateGate />
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
