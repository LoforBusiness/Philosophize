import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Image, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming,
} from 'react-native-reanimated';
import Button from '@/components/ui/Button';
import AddWidgetSheet from '@/components/shared/AddWidgetSheet';
import { C, SPACE } from '@/constants/design';
import { useUIStore } from '@/stores/uiStore';
import { canPinWidget, requestPinWidget } from '@/lib/widget/pinWidget';
import { useWidgetPlaced } from '@/lib/widget/useWidgetPlaced';
import { track } from '@/lib/posthog';
import { touch } from '@/lib/feedback';

// ─────────────────────────────────────────────────────────────────────────────
// THE WIDGET OFFER (2026-10-02).
//
//   "instead of having the option to turn on the widget on the bottom of the
//    [home] screen, I don't want it there anymore. I want the new user first to
//    click the app. After around 20 seconds while they're in the app, I want a
//    smooth animation for a picture of a widget if the user would want to add
//    that to their own home screen."
//
// Duolingo's own write-up says their widget only took off once the app ASKED —
// a button nobody scrolls to is not an offer. So this asks every THREE DAYS (the
// owner's interval, 2026-10-02), twenty seconds of foreground into a session in
// the tab shell, until the widget is on the home screen, and it shows the widget doing
// the thing it does: three real renders of it (morning, late at night with the
// streak on the line, after the lesson) cross-fade in the card, each captioned,
// so the reader sees the mood change before deciding. The pictures are drawn by
// `npm run sheet:widget -- --offer` from the widget's own code, so they cannot
// drift from what lands on the home screen.
//
// WHEN IT MAY APPEAR, all at once: Android (the only platform with the widget);
// not asked on this device in the last three days; no widget already placed — a
// reader who has added it is never asked again; twenty seconds of
// the app actually in the foreground (backgrounded time does not count); on one
// of the four tab screens, never over a lesson, the intro or the paywall; and
// nothing else up — no reward, no paywall, no rating sheet (uiStore.promptUp;
// the two unasked-for sheets never stack). The ask is written down as it OPENS,
// so a reader who kills the app with it up is not asked again for three days —
// RatePrompt's rule. Settings › Display keeps a way to it in between.
// ─────────────────────────────────────────────────────────────────────────────

/** When the offer was last shown on this device, in epoch ms. Per device, not
 *  synced: a widget lives on one phone's home screen. */
const ASKED_KEY = 'ashmere-widget-offer-at';
/** How long between asks. */
export const OFFER_EVERY_MS = 3 * 86_400_000;
/** Foreground seconds before the offer. */
export const OFFER_AFTER_S = 20;
/** The tab screens it may rise over. */
const TAB_PATHS = new Set(['/', '/branches', '/profile', '/pass']);

const FRAMES = [
  { src: require('../../assets/images/widget-offer/morning.png'), caption: 'In the morning, he waits.' },
  { src: require('../../assets/images/widget-offer/night.png'), caption: 'By 11 pm, your streak is on the line.' },
  { src: require('../../assets/images/widget-offer/done.png'), caption: 'After your lesson, he can relax.' },
];
/** How long each picture holds. */
const HOLD_MS = 2600;
const FADE_MS = 520;
const ART_ASPECT = 150 / 320;

/** The host: decides WHEN. Mounted once, in the tab layout. */
export default function WidgetOffer({ force = false }: { force?: boolean }) {
  const pathname = usePathname();
  const placed = useWidgetPlaced();
  const reward = useUIStore((s) => s.reward);
  const paywallOpen = useUIStore((s) => s.paywallOpen);
  const launchDone = useUIStore((s) => s.launchDone);
  const promptUp = useUIStore((s) => s.promptUp);
  const setPromptUp = useUIStore((s) => s.setPromptUp);

  const eligibleDevice = force || Platform.OS === 'android';
  // Whether an ask is due: null until storage answers, which keeps it shut.
  const [due, setDue] = useState<boolean | null>(force ? true : null);
  const [elapsed, setElapsed] = useState(force ? OFFER_AFTER_S : 0);
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState(false);

  useEffect(() => {
    if (!eligibleDevice || force) return;
    AsyncStorage.getItem(ASKED_KEY)
      .then((v) => {
        const at = Number(v);
        setDue(!v || !Number.isFinite(at) || Date.now() - at >= OFFER_EVERY_MS);
      })
      .catch(() => setDue(false));
  }, [eligibleDevice, force]);

  // Foreground seconds only: a reader who opens the app and puts the phone down
  // has not spent twenty seconds in it.
  useEffect(() => {
    if (!eligibleDevice || due !== true || elapsed >= OFFER_AFTER_S) return;
    let active = AppState.currentState === 'active';
    const sub = AppState.addEventListener('change', (s) => { active = s === 'active'; });
    const t = setInterval(() => { if (active) setElapsed((e) => e + 1); }, 1000);
    return () => { clearInterval(t); sub.remove(); };
  }, [eligibleDevice, due, elapsed]);

  const clear = eligibleDevice
    && due === true
    && elapsed >= OFFER_AFTER_S
    && (force || placed === false)
    && launchDone
    && (force || TAB_PATHS.has(pathname))
    && !reward
    && !paywallOpen
    && promptUp === null;

  useEffect(() => {
    if (!clear || open) return;
    // A beat after the screen settles, never mid-transition.
    const t = setTimeout(() => {
      setOpen(true);
      setDue(false);
      if (!force) AsyncStorage.setItem(ASKED_KEY, String(Date.now())).catch(() => {});
    }, 700);
    return () => clearTimeout(t);
  }, [clear, open, force]);

  useEffect(() => {
    if (!open) return;
    setPromptUp('widget');
    return () => setPromptUp(null);
  }, [open, setPromptUp]);

  return (
    <>
      {open ? <OfferCard onClose={(manual) => { setOpen(false); if (manual) setSteps(true); }} /> : null}
      <AddWidgetSheet visible={steps} onClose={() => setSteps(false)} />
    </>
  );
}

/** The card: the widget, living its day, and two buttons. */
function OfferCard({ onClose }: { onClose: (openSteps: boolean) => void }) {
  const { width } = useWindowDimensions();
  const canPin = useMemo(() => canPinWidget(), []);
  const artW = Math.min(width - SPACE[4] * 2 - 32, 360);
  const artH = Math.round(artW * ART_ASPECT);

  const rise = useSharedValue(1);   // 1 = below the screen
  const dim = useSharedValue(0);
  const art = useSharedValue(0);    // the picture's own arrival, after the card
  const [frame, setFrame] = useState(0);
  const leaving = useRef(false);

  useEffect(() => {
    track('widget_offer_shown', { can_pin: canPin });
    dim.value = withTiming(1, { duration: 320 });
    rise.value = withSpring(0, { damping: 17, stiffness: 150, mass: 0.9 });
    art.value = withDelay(260, withSpring(1, { damping: 13, stiffness: 120 }));
    const t = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), HOLD_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leave = (added: boolean) => {
    if (leaving.current) return;
    leaving.current = true;
    track('widget_offer_answered', { added, can_pin: canPin });
    rise.value = withTiming(1, { duration: 260, easing: Easing.in(Easing.cubic) });
    dim.value = withDelay(60, withTiming(0, { duration: 260 }));
    setTimeout(async () => {
      let manual = false;
      if (added) manual = canPin ? !(await requestPinWidget()) : true;
      onClose(manual);
    }, 320);
  };

  const scrim = useAnimatedStyle(() => ({ opacity: dim.value * 0.45 }));
  const card = useAnimatedStyle(() => ({ transform: [{ translateY: rise.value * 520 }] }));
  const artStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, art.value * 1.4),
    transform: [{ translateY: (1 - art.value) * 18 }, { rotate: `${(1 - art.value) * -5}deg` }, { scale: 0.92 + art.value * 0.08 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[st.scrim, scrim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => leave(false)} accessibilityLabel="Not now" />
      </Animated.View>
      <Animated.View style={[st.card, card]} accessibilityViewIsModal>
        <Text style={st.kicker}>NEW · FOR YOUR HOME SCREEN</Text>
        <Text style={st.title}>Keep him on your home screen</Text>
        <Text style={st.body}>
          A fact from a different subject every few hours, and a word from him when you haven’t been in.
        </Text>

        <Animated.View style={[st.artWrap, { width: artW, height: artH }, artStyle]}>
          {FRAMES.map((f, i) => <Frame key={i} src={f.src} on={i === frame} w={artW} h={artH} />)}
        </Animated.View>
        <View style={st.captionRow}>
          {FRAMES.map((f, i) => (
            <View key={i} style={[st.dot, i === frame && st.dotOn]} />
          ))}
          <Text style={st.caption} numberOfLines={1}>{FRAMES[frame].caption}</Text>
        </View>

        <Button label={canPin ? 'Add widget' : 'Show me how'} size="lg" onPress={() => { touch(); leave(true); }} />
        <Button label="Not now" variant="ghost" onPress={() => leave(false)} />
      </Animated.View>
    </View>
  );
}

/** One picture of the widget, cross-fading on `on`. */
function Frame({ src, on, w, h }: { src: number; on: boolean; w: number; h: number }) {
  const o = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    o.value = withTiming(on ? 1 : 0, { duration: FADE_MS, easing: Easing.inOut(Easing.quad) });
  }, [on, o]);
  const s = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: 0.985 + o.value * 0.015 }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, s]}>
      <Image source={src} style={{ width: w, height: h }} resizeMode="contain" accessibilityIgnoresInvertColors />
    </Animated.View>
  );
}

const st = StyleSheet.create({
  scrim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.ink },
  card: {
    position: 'absolute', left: SPACE[3], right: SPACE[3], bottom: SPACE[4],
    backgroundColor: C.paper,
    borderRadius: 24,
    borderWidth: 2, borderColor: C.edge,
    paddingHorizontal: SPACE[4], paddingTop: SPACE[4], paddingBottom: SPACE[3],
    gap: SPACE[2],
    boxShadow: `0px 4px 0px ${C.edge}`,
  },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.6, color: C.HUE },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 23, lineHeight: 29, color: C.ink, includeFontPadding: false },
  body: { fontFamily: 'Inter_400Regular', fontSize: 13.5, lineHeight: 20, color: C.inkSoft },
  artWrap: { alignSelf: 'center', marginTop: SPACE[2] },
  captionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginBottom: SPACE[1] },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.edge },
  dotOn: { width: 16, backgroundColor: C.HUE },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 12.5, color: C.inkSoft, marginLeft: 4 },
});
