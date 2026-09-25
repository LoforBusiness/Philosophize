import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SketchIcon from '@/components/shared/SketchIcon';
import Button from '@/components/ui/Button';
import { MetalPlate } from '@/components/profile/Struck';
import PassChart, { PlanTiles, usePassArrival } from '@/components/paywall/PassChart';
import PassDoor from '@/components/paywall/PassDoor';
import TrialStatus from '@/components/paywall/TrialStatus';
import { INK, MID, PATINA } from '@/components/shared/tone';
import { useSubscriptionStore, usePassState } from '@/stores/subscriptionStore';
import { C, SPACE } from '@/constants/design';
import { BILLING_PERIOD_LABEL } from '@/constants/subscription';
import { TERMS_URL, PRIVACY_URL } from '@/constants/legal';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE PAYWALL, AND THE ONLY ONE.
//
// A HARD PAYWALL SINCE 2026-09-25: every lesson needs the Scholar's Pass or its
// trial, and everything else in the app is free. This screen is what a reader
// meets in front of any lesson or review without the Pass, after the professor's
// intro, and from the old paywall route. It replaced three screens — the daily
// limit, the locked lesson and `PaywallContent` — that each argued a different
// case for the same purchase.
//
// It is the Pass tab's own pieces and nothing new: the chart (`PassChart`), the
// door (`PassDoor`, which runs every purchase), the trial's panel while one is
// running (`TrialStatus`), and what is free for everyone (`PlanTiles`). One
// chart, one door, one purchase path, so a claim cannot be true on one screen
// and stale on another. `check:pass` holds all of them.
//
// `onUnlocked` fires once, the moment the Pass arrives while this is on screen
// (a trial started, a purchase landed or one was restored), so the caller can
// take the reader on to what they were trying to open.
// ─────────────────────────────────────────────────────────────────────────────

export type PaywallSource = 'intro' | 'locked_lesson' | 'locked_review' | 'route';

export default function HardPaywall({ source, onClose, onUnlocked, inSheet = false }: {
  source: PaywallSource;
  onClose: () => void;
  onUnlocked?: () => void;
  /** Drawn inside `PaywallSheet`, which already sits below the status bar. */
  inSheet?: boolean;
}) {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const available = useSubscriptionStore((s) => s.available);
  const restore = useSubscriptionStore((s) => s.restore);
  const state = usePassState();
  const onTrial = state.kind === 'trial' || state.kind === 'deviceTrial';
  const { play, replay } = usePassArrival();

  const [restoring, setRestoring] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // ONCE, ON MOUNT. `refresh` re-reads the store, so a reader whose trial was
  // bought on another device is not asked to buy it again.
  useEffect(() => {
    track('paywall_viewed', { available: useSubscriptionStore.getState().available, source });
    void useSubscriptionStore.getState().refresh();
    // After the screen has settled: cells stamped during a slide-in are stamped
    // where nobody can see them.
    replay(260);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // THE PASS ARRIVING WHILE THIS IS UP, and only that. A reader who already held
  // it when the screen mounted is shown the ACTIVE state and a Done button, not
  // hurried off somewhere they did not ask to go.
  const heldAtMount = useRef(isPro);
  const fired = useRef(false);
  useEffect(() => {
    if (!isPro || heldAtMount.current || fired.current) return;
    fired.current = true;
    onUnlocked?.();
  }, [isPro, onUnlocked]);

  const onRestore = async () => {
    if (restoring) return;
    setNotice(null);
    setRestoring(true);
    const outcome = await restore();
    setRestoring(false);
    if (outcome === 'restored') setNotice('Your Scholar’s Pass has been restored.');
    else if (outcome === 'none') setNotice('No previous purchase found on this account.');
    else if (outcome === 'unavailable') setNotice('Restoring works in the installed Ashmere app only.');
    else setNotice('Could not restore right now. Please try again.');
  };

  const terms = TERMS_URL;
  const privacy = PRIVACY_URL;
  const paying = isPro && !onTrial;

  return (
    <SafeAreaView style={st.safe} edges={inSheet ? [] : ['top', 'bottom']} nativeID="hard-paywall">
      <View style={st.header}>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          style={st.close}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <SketchIcon name="close" color={C.ink} size={22} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
        <Text style={st.h1}>
          {isPro ? 'You hold the ' : 'Unlock every lesson with the '}
          <Text style={st.h1Accent}>{'Scholar’s Pass'}</Text>
        </Text>
        {!isPro ? (
          <Text style={st.sub}>Everything else in Ashmere stays free, for everyone.</Text>
        ) : null}

        {onTrial ? (
          <View style={st.trial}>
            <TrialStatus source="paywall" />
          </View>
        ) : null}

        <View style={st.chart}>
          <PassChart play={play} />
        </View>

        <View style={st.door}>
          {paying ? (
            <View style={st.held}>
              <MetalPlate metal={PATINA} label="ACTIVE" />
              <Text style={st.heldNote}>Every lesson is open to you.</Text>
            </View>
          ) : (
            <PassDoor source={source} />
          )}
          {isPro ? (
            <Button label="Done" size="lg" onPress={onClose} style={st.done} />
          ) : (
            <Pressable onPress={() => void onRestore()} disabled={restoring} hitSlop={8} style={st.restore}>
              <Text style={st.restoreText}>{restoring ? 'Checking…' : 'Restore purchase'}</Text>
            </Pressable>
          )}
          {notice ? <Text style={st.notice}>{notice}</Text> : null}
          {!available && !isPro ? (
            <Text style={st.preview}>
              This is the web preview. Real purchases work in the installed app.
            </Text>
          ) : null}
        </View>

        <Text style={st.kicker}>FREE FOR EVERYONE</Text>
        <PlanTiles />

        <Text style={st.legal}>
          The Scholar’s Pass renews every {BILLING_PERIOD_LABEL} until cancelled.
        </Text>
        <View style={st.links}>
          <Text style={st.link} onPress={() => terms && Linking.openURL(terms)}>Terms</Text>
          <Text style={st.linkDot}>·</Text>
          <Text style={st.link} onPress={() => privacy && Linking.openURL(privacy)}>Privacy</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  header: { height: 48, justifyContent: 'center', paddingHorizontal: SPACE[2] },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: SPACE[4], paddingBottom: SPACE[5] * 2 },

  // The Pass tab's headline, at the same size, so the two screens read as one.
  h1: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, lineHeight: 35, color: INK,
    textAlign: 'center', includeFontPadding: false, paddingHorizontal: SPACE[1],
  },
  h1Accent: { color: PATINA.base },
  sub: {
    fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, color: MID,
    textAlign: 'center', marginTop: SPACE[2],
  },
  trial: { marginTop: SPACE[4] },

  chart: { marginTop: SPACE[4] },
  door: { marginTop: SPACE[4], gap: SPACE[2] },
  held: { alignItems: 'center', gap: SPACE[2] },
  heldNote: {
    fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: MID, textAlign: 'center',
  },
  done: { marginTop: SPACE[2] },
  restore: { alignSelf: 'center', paddingVertical: SPACE[1] },
  restoreText: {
    fontFamily: 'Inter_500Medium', fontSize: 13, color: C.ink, textDecorationLine: 'underline',
  },
  notice: {
    fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 19, color: C.ink, textAlign: 'center',
  },
  preview: {
    fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 16, color: MID, textAlign: 'center',
  },

  kicker: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: MID,
    marginTop: SPACE[5], marginBottom: SPACE[2],
  },

  legal: {
    fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 16, color: MID,
    textAlign: 'center', marginTop: SPACE[5],
  },
  links: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACE[2],
    marginTop: SPACE[1],
  },
  link: {
    fontFamily: 'Inter_500Medium', fontSize: 11, color: C.ink, textDecorationLine: 'underline',
  },
  linkDot: { fontFamily: 'Inter_400Regular', fontSize: 11, color: MID },
});
