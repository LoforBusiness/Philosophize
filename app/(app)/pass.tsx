import { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Image, Pressable, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import ScreenTransition from '@/components/shared/ScreenTransition';
import DoodleGround from '@/components/shared/DoodleGround';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import PassChart, { PlanTiles, usePassArrival } from '@/components/paywall/PassChart';
import PassDoor from '@/components/paywall/PassDoor';
import PassCard, { type StampTone } from '@/components/paywall/PassCard';
import TrialStatus from '@/components/paywall/TrialStatus';
import { READING_ROOM_ART } from '@/components/shared/profileSceneArt';
import { sceneLayout } from '@/components/shared/profileSceneGeometry';
import { INK, MID, PATINA, TEAL, TINT, TINT_EDGE, WALL, SAND, PAPER, mix } from '@/components/shared/tone';
import { useSubscriptionStore, usePassState } from '@/stores/subscriptionStore';
import { useUserDataStore } from '@/stores/userDataStore';
import { compareRows } from '@/lib/utils/passCompare';
import { trialLengthPhrase, trialLabel, trialLeft } from '@/lib/utils/trial';
import { C, LIP, SPACE } from '@/constants/design';
import { BILLING_PERIOD_LABEL } from '@/constants/subscription';
import { TERMS_URL, PRIVACY_URL } from '@/constants/legal';
import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// THE PASS TAB.
//
// A tab of its own, because a paywall that only appears when a reader is BLOCKED
// is an ambush and one at a permanent address is a shop they can walk out of.
//
// ── IT WAS A CHART ON A WALLPAPER, AND THE OWNER ASKED FOR MORE (2026-10-01) ──
//
//   "The information is good on it, but it's visually not very good. You can use
//    any colors you like, gamify it, make it look visually really nice. Both for
//    if the user is paid or not paid."
//
// So the top of the tab is a PLACE now — a reading room at night, drawn in the
// app's editorial style like every other picture (components/shared/
// profileScenes.ts) — and in it, on the floor, the Pass itself: a member's card in
// the reader's own name, stamped with where they stand. Below it the tab says what
// matters to THAT reader:
//
//   · not holding it: the Free-against-Pass chart and the door, then what stays
//     free — the same chart and door the paywall and Settings draw (§14);
//   · on the trial: the trial's end and its Cancel button FIRST (the reminder
//     lands on this tab), then what the Pass opens;
//   · holding it: what the Pass opens, ticked, and where to manage it. A
//     Free-against-Pass chart is a sales sheet, and a holder has already bought.
//
// ── EVERY CELL AND EVERY FIGURE IS STILL DERIVED ────────────────────────────
//
// §14's rule. `npm run check:pass` re-derives the chart from the gates that
// enforce it and reads this file for any digit typed into its text. The card's
// stamp comes from the store: the trial's own length, or the days actually left.
// ─────────────────────────────────────────────────────────────────────────────

/** Where the room's floor meets its wall, below the status bar. */
const HORIZON = 250;
/** The least ground under it; the headline's own height can make it more. */
const FLOOR = 140;

const ROW_ICON: Record<string, SketchIconName> = {
  lessons: 'book', narrated: 'volume-on', reviews: 'reload', units: 'grad',
};

export default function PassTab() {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const canTrial = useSubscriptionStore((s) => s.canStartTrial());
  const name = useUserDataStore((s) => s.displayName) || 'Philosopher';
  // WHICH OF THE FIVE STATES, decided once in `passState`. `isPro` is true on the
  // free trial as well as on a paid Pass, and the two need opposite things here.
  const state = usePassState();
  const paying = state.kind === 'paid' || state.kind === 'reviewer';
  const onTrial = state.kind === 'trial' || state.kind === 'deviceTrial';
  const period = BILLING_PERIOD_LABEL;
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const onWidth = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  // Local consts: TypeScript will not carry a narrowing of an IMPORTED binding
  // into a callback, because it cannot know the module has not reassigned it.
  const terms = TERMS_URL;
  const privacy = PRIVACY_URL;

  const { play, replay } = usePassArrival();

  // ── ON FOCUS, NOT ON MOUNT, AND KEYED ON NOTHING THAT MOVES ─────────────────
  //
  // Every tab is built before it is visited, so a mount animation would play once,
  // behind the launch screen, and never again. And the callback depends on nothing
  // that can change while the reader is looking: `available` flips when RevenueCat
  // answers, and a callback that listed it would replay the whole arrival under a
  // reader who had not moved. It is read from the store instead.
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

  // THE STAMP, from the store: the free days Google would give, the days a trial
  // has left, or ACTIVE. Never a typed figure.
  const now = Date.now();
  const stamp: { label: string; tone: StampTone } =
    paying ? { label: 'ACTIVE', tone: 'active' }
    : state.kind === 'trial' || state.kind === 'deviceTrial'
      ? { label: trialLabel(trialLeft(state.endsAt, now)).toUpperCase(), tone: 'trial' }
    : state.kind === 'free' && state.offer && canTrial
      ? { label: `${trialLengthPhrase(state.offer).toUpperCase()} FREE`, tone: 'offer' }
    : { label: 'NOT YET ISSUED', tone: 'closed' };

  const top = insets.top + HORIZON;
  const room = width ? sceneLayout(width, top) : null;
  const cardW = width ? Math.min(312, width - SPACE[4] * 2 - 8) : 0;

  return (
    <ScreenTransition bg={WALL}>
      <View style={st.root} onLayout={onWidth}>
        <DoodleGround />

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          {/* THE READING ROOM, with the Pass laid on its floor and the headline on
              the boards below. Full-bleed, with the rounded foot the Profile and
              Home tops share, so the three tabs open the same way. */}
          <View style={[st.hero, { paddingTop: top + 86, minHeight: top + FLOOR, backgroundColor: READING_ROOM_ART.ground }]}>
            {room ? (
              <>
                <View style={[st.sky, { height: Math.max(0, room.top + 2), backgroundColor: READING_ROOM_ART.sky }]} />
                <Image
                  source={READING_ROOM_ART.source}
                  resizeMode="stretch"
                  style={{ position: 'absolute', left: room.left, top: room.top, width: room.w, height: room.h }}
                />
              </>
            ) : null}
            {cardW ? (
              <View style={[st.cardSlot, { top: top + 64 - Math.round(cardW / 1.586) }]}>
                <PassCard width={cardW} name={name} stamp={stamp.label} tone={stamp.tone} play={play} />
              </View>
            ) : null}
            <View style={st.heroWords}>
              {/* The name never breaks across a line: "Scholar’s / Pass" left the
                  product's name split with one word stranded under the other. */}
              <Text style={st.h1}>
                {isPro ? 'You hold the ' : 'Every lesson, every day, with the '}
                <Text style={st.h1Accent}>{'Scholar’s Pass'}</Text>
              </Text>
            </View>
          </View>

          <View style={st.page}>
            {/* THE TRIAL, FIRST, while one is running. The reminder notification
                lands on this tab, and "tap to cancel" has to mean the Cancel button
                is the first thing under the headline, not somewhere down the page. */}
            {onTrial ? (
              <View style={st.trial}>
                <TrialStatus source="pass_tab" />
              </View>
            ) : null}

            {isPro ? (
              // WHAT THE PASS OPENS, held. The same rows the chart is built from
              // (`compareRows`), each a struck tick: a holder is shown what they
              // have, not sold it again.
              <View style={st.panel}>
                <Text style={st.kickerOn}>YOUR PASS OPENS</Text>
                {compareRows().map((r) => (
                  <View key={r.id} style={st.heldRow}>
                    <View style={st.heldIcon}>
                      <SketchIcon name={ROW_ICON[r.id] ?? 'check'} size={17} color={PATINA.base} />
                    </View>
                    <Text style={st.heldLabel} numberOfLines={2}>{r.label}</Text>
                    <View style={st.heldTick}>
                      <SketchIcon name="check" size={13} color={PAPER} />
                    </View>
                  </View>
                ))}
                {paying ? (
                  <>
                    <Text style={st.heldNote}>
                      Every lesson is open to you. Manage or cancel the Pass any time from Settings.
                    </Text>
                    <Pressable
                      onPress={() => router.push('/(app)/settings')}
                      accessibilityRole="button"
                      style={st.manageBox}
                    >
                      {({ pressed }) => (
                        <View style={st.manageWrap}>
                          <View style={st.manageLedge} />
                          <View style={[st.manage, pressed && st.manageDown]}>
                            <SketchIcon name="settings" size={16} color={INK} />
                            <Text style={st.manageText}>Manage the Pass</Text>
                          </View>
                        </View>
                      )}
                    </Pressable>
                  </>
                ) : null}
              </View>
            ) : (
              // THE CHART AND ITS DOOR ON ONE WHITE PANEL. On the wallpaper a doodle
              // ran behind every benefit label. The panel reaches out by exactly its
              // own padding and border, so the chart keeps the width check:pass measures.
              <View style={st.panel}>
                <View>
                  <PassChart play={play} />
                </View>
                <View style={st.door}>
                  <PassDoor source="pass_tab" />
                </View>
              </View>
            )}

            <Text style={st.kicker}>FREE FOR EVERYONE</Text>
            <PlanTiles />

            <Text style={st.legal}>The Scholar’s Pass renews every {period} until cancelled.</Text>
            <View style={st.links}>
              <Text style={st.link} onPress={() => terms && Linking.openURL(terms)}>Terms</Text>
              <Text style={st.linkDot}>·</Text>
              <Text style={st.link} onPress={() => privacy && Linking.openURL(privacy)}>Privacy</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenTransition>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: WALL },
  body: { paddingBottom: SPACE[5] * 2 },

  hero: {
    overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  sky: { position: 'absolute', top: 0, left: 0, right: 0 },
  cardSlot: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  // In the flow, not pinned: on a narrow phone the headline takes a third line and
  // the room grows to hold it rather than cutting it off.
  heroWords: { paddingHorizontal: SPACE[4], paddingBottom: SPACE[5] },
  h1: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 27, lineHeight: 34, color: PAPER,
    textAlign: 'center', includeFontPadding: false,
  },
  // SAND AS A WORD, never a fill: on the room's dark floor it is the warm light
  // from the lamp, and 11:1 against the ground.
  h1Accent: { color: SAND },

  page: { paddingHorizontal: SPACE[4] },
  trial: { marginTop: SPACE[4] },

  panel: {
    marginTop: SPACE[4], marginHorizontal: -(SPACE[3] + 2), paddingHorizontal: SPACE[3],
    paddingTop: SPACE[3], paddingBottom: SPACE[4], borderRadius: 18, borderWidth: 2,
    borderColor: C.edge, backgroundColor: C.surface,
  },
  door: { marginTop: SPACE[4] },

  kickerOn: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: PATINA.base, marginBottom: SPACE[2],
  },
  heldRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE[2], paddingVertical: SPACE[2],
    borderBottomWidth: 1, borderBottomColor: C.hairline,
  },
  heldIcon: {
    width: 34, height: 34, borderRadius: 11, backgroundColor: TINT, borderWidth: 1.5, borderColor: TINT_EDGE,
    alignItems: 'center', justifyContent: 'center',
  },
  heldLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: INK },
  heldTick: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center',
  },
  heldNote: {
    fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: MID, textAlign: 'center', marginTop: SPACE[3],
  },
  manageBox: { alignSelf: 'center', marginTop: SPACE[3] },
  manageWrap: { paddingBottom: LIP.card },
  manageLedge: {
    position: 'absolute', left: 0, right: 0, top: LIP.card, bottom: 0, borderRadius: 14, backgroundColor: C.edge,
  },
  manage: {
    flexDirection: 'row', alignItems: 'center', gap: SPACE[1], paddingHorizontal: SPACE[4], paddingVertical: SPACE[2],
    borderRadius: 14, borderWidth: 2, borderColor: C.edge, backgroundColor: C.surface,
  },
  manageDown: { transform: [{ translateY: LIP.card }] },
  manageText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: INK },

  kicker: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: MID,
    marginTop: SPACE[5], marginBottom: SPACE[2],
  },

  legal: {
    fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 16, color: mix(MID, INK, 0.3),
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
