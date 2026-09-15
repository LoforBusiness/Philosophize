import { useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { MetalPlate } from '@/components/profile/Struck';
import PassChart, { PlanTiles, usePassArrival } from '@/components/paywall/PassChart';
import PassDoor from '@/components/paywall/PassDoor';
import TrialStatus from '@/components/paywall/TrialStatus';
import { INK, MID, PAPER, mix, ROYAL, PURPLE, BEIGE } from '@/components/shared/tone';
import { useSubscriptionStore, usePassState } from '@/stores/subscriptionStore';
import { C, SPACE } from '@/constants/design';
import { BILLING_PERIOD_LABEL } from '@/constants/subscription';
import { TERMS_URL, PRIVACY_URL } from '@/constants/legal';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE PASS TAB.
//
// A tab of its own, between Insights and Profile, because a paywall that only
// appears when a reader is BLOCKED is an ambush and one at a permanent address
// is a shop they can walk out of.
//
// ── IT WAS TWO CERTIFICATES, AND THAT WAS THE PROBLEM ───────────────────────
//
//   "it's a little bit too confusing because a lot of information, and it's
//    pretty difficult to understand what the different benefits are of each
//    plan ... look at Brilliant's page ... it shows two different sections."
//
// The tab printed a herald, an engraved Scholar's Pass with eleven ruled rows,
// the wall in days, and then an engraved Day Pass with the same eleven rows
// again. It is one chart now, the way Brilliant draws it, then the door, then
// what both plans share. The chart and the tiles are `PassChart`, drawn in three
// places (this tab, the post-lesson trial offer and Settings); the door is
// `PassDoor`, which offers the free trial first while there is one to give.
//
// ── EVERY CELL AND EVERY FIGURE IS STILL DERIVED ────────────────────────────
//
// §14's rule. `npm run check:pass` re-derives the chart from the gates that
// enforce it and reads this file for any digit typed into its text.
// ─────────────────────────────────────────────────────────────────────────────


export default function PassTab() {
  const isPro = useSubscriptionStore((s) => s.isPro);
  // WHICH OF THE FIVE STATES, decided once in `passState`. `isPro` is true on the
  // free trial as well as on a paid Pass, and the two need opposite things on
  // this tab: the trial's end, what it becomes and its Cancel button at the top,
  // or the ACTIVE plate under the chart.
  const state = usePassState();
  const paying = state.kind === 'paid' || state.kind === 'reviewer';
  const onTrial = state.kind === 'trial' || state.kind === 'deviceTrial';
  const period = BILLING_PERIOD_LABEL;

  // Local consts: TypeScript will not carry a narrowing of an IMPORTED binding
  // into a callback, because it cannot know the module has not reassigned it.
  const terms = TERMS_URL;
  const privacy = PRIVACY_URL;

  const { play, replay } = usePassArrival();

  // ── ON FOCUS, NOT ON MOUNT, AND KEYED ON NOTHING THAT MOVES ─────────────────
  //
  // Every tab is built before it is visited (app/(app)/_layout.tsx), so a mount
  // animation would play once, at startup, behind the launch screen, and never
  // again. And the callback depends on nothing that can change while the reader
  // is looking: `available` flips when RevenueCat answers, and a callback that
  // listed it would replay the whole arrival under a reader who had not moved,
  // which is the Insights fault §19 records. It is read from the store instead.
  //
  // A REF for the analytics flag, not state: nothing on screen depends on it.
  const seen = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!seen.current) {
        seen.current = true;
        track('paywall_viewed', {
          available: useSubscriptionStore.getState().available,
          source: 'pass_tab',
        });
      }
      replay();
    }, [replay]),
  );

  return (
    <ScreenTransition bg={C.paper}>
      <SafeAreaView style={st.safe} edges={['top']}>
        {/* A warm light from the top left, the corner every struck thing in the
            app is lit from. It is fully paper well before the box ends: a
            diagonal that stopped at the box's bottom edge left a hard line
            across the chart. */}
        <LinearGradient
          pointerEvents="none"
          colors={[mix(BEIGE, PAPER, 0.15), PAPER, PAPER]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.55, y: 1 }}
          style={st.glow}
        />

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          {/* The name never breaks across a line: "Scholar’s / Pass" left the
              product's name split with one word stranded under the other. */}
          <Text style={st.h1}>
            {isPro ? 'You hold the ' : 'Every lesson, every day, with the '}
            <Text style={st.h1Accent}>{'Scholar’s Pass'}</Text>
          </Text>

          {/* THE TRIAL, FIRST, while one is running. The reminder notification
              lands on this tab, and "tap to cancel" has to mean the Cancel button
              is the first thing under the headline, not somewhere down the page. */}
          {onTrial ? (
            <View style={st.trial}>
              <TrialStatus source="pass_tab" />
            </View>
          ) : null}

          <View style={st.chart}>
            <PassChart play={play} />
          </View>

          <View style={st.door}>
            {paying ? (
              <View style={st.held}>
                <MetalPlate metal={ROYAL} label="ACTIVE" />
                <Text style={st.heldNote}>
                  Every lesson is open to you. Manage or cancel the Pass any time from Settings.
                </Text>
              </View>
            ) : (
              <PassDoor source="pass_tab" />
            )}
          </View>

          <Text style={st.kicker}>EVERY PLAN INCLUDES</Text>
          <PlanTiles />

          <Text style={st.legal}>The Scholar’s Pass renews every {period} until cancelled.</Text>
          <View style={st.links}>
            <Text style={st.link} onPress={() => terms && Linking.openURL(terms)}>Terms</Text>
            <Text style={st.linkDot}>·</Text>
            <Text style={st.link} onPress={() => privacy && Linking.openURL(privacy)}>Privacy</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenTransition>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  glow: { position: 'absolute', left: 0, right: 0, top: 0, height: 360 },
  body: { paddingHorizontal: SPACE[4], paddingTop: SPACE[4], paddingBottom: SPACE[5] * 2 },

  h1: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, lineHeight: 37, color: INK,
    textAlign: 'center', includeFontPadding: false, paddingHorizontal: SPACE[1],
  },
  h1Accent: { color: PURPLE },
  trial: { marginTop: SPACE[4] },

  chart: { marginTop: SPACE[5] },
  door: { marginTop: SPACE[4] },
  held: { alignItems: 'center', gap: SPACE[2] },
  heldNote: {
    fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: MID, textAlign: 'center',
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
