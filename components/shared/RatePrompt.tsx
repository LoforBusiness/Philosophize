import { useEffect, useState } from 'react';
import {
  Modal, View, Text, Pressable, StyleSheet, Linking, Platform,
} from 'react-native';
import * as Application from 'expo-application';
import { useIsFocused } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import SketchIcon from './SketchIcon';
import Button from '@/components/ui/Button';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { mayAsk } from '@/lib/utils/rateCadence';
import { useTodayKey } from '@/lib/utils/useTodayKey';
import { C, SPACE, RADIUS } from '@/constants/design';
import { METAL } from '@/components/shared/tone';
import { track } from '@/lib/posthog';
import { touch } from '@/lib/feedback';

// -----------------------------------------------------------------------------
// THE RATING ASK — one sheet a day, from the bottom.
//
//   "after that whole onboarding process, when the email screen shows up, and
//    whether they sign up with the email or not. Right after that, and they
//    first arrive on the home screen, I want a rate to the app notification to
//    show up from the bottom, and the user can quickly put on any amount of
//    stars and then submit, or they can click x."
//
// == IT IS NOT THE PLAY DIALOG, AND THAT IS WHY IT CAN SHIP OVER THE AIR ======
//
// Google's own in-app review dialog needs `expo-store-review`, which is a NATIVE
// module -- and section 22's rule is absolute: an over-the-air update cannot add
// one to a binary that lacks it. This is drawn by us, and the only platform call
// it makes is `Linking.openURL`, so it reaches every existing reader on build 21
// without a new build.
//
// == EVERYONE IS OFFERED THE SAME DOOR ========================================
//
// The common version of this screen sends four- and five-star raters to the
// store and quietly diverts everyone else to a feedback form. That is review
// GATING: Apple prohibits it outright and Google's in-app review guidance says
// not to filter who is asked. So the stars are collected as feedback, and the
// thank-you offers the Play listing to whoever gave them, at any rating. Nothing
// here is conditional on the number.
//
// == WHEN IT APPEARS ==========================================================
//
// `RatePromptHost` below owns that, and it is deliberately not "on mount". It
// waits for the launch animation to have lifted, for onboarding to be finished,
// for Home to be the tab actually on the glass, and for no other overlay to be
// up -- a reader who is mid-reward or looking at the paywall is not somebody to
// interrupt. Then a beat, so it arrives after the home screen has settled rather
// than fighting the tab transition.
//
// == HOW OFTEN IT COMES BACK =================================================
//
//   "instead of being very seldom ... I want it to show up once per day. and it
//    will show up the first time the user opens the app each day."
//
// ONCE A CALENDAR DAY, until they answer. The policy, the argument for a
// calendar day over a rolling twenty-four hours, and where this leaves the two
// stores are all in lib/utils/rateCadence.ts.
//
// Somebody who actually submits a rating is never asked again. There is no
// counter for them: they answered the question.
// -----------------------------------------------------------------------------

/** How far the sheet travels. Larger than the sheet, so it starts fully clear. */
const RISE = 460;
const IN = 380;
const OUT = 240;

/** The Play listing, derived from the real package rather than typed twice. */
function storeUrl(): string {
  const id = Application.applicationId ?? 'com.philosophize.app';
  return `https://play.google.com/store/apps/details?id=${id}`;
}

export default function RatePrompt({
  onClose, onSettled, askNumber,
}: {
  onClose: () => void;
  /** They gave a rating. Distinct from closing: this one is permanent. */
  onSettled: () => void;
  /** Which ask this is: 1 for the first, counting up. Sent with the events. */
  askNumber: number;
}) {
  const [stars, setStars] = useState(0);
  const [sent, setSent] = useState(false);

  const y = useSharedValue(RISE);
  const dim = useSharedValue(0);

  useEffect(() => {
    y.value = withTiming(0, { duration: IN, easing: Easing.out(Easing.cubic) });
    dim.value = withTiming(1, { duration: IN });
    track('rate_prompt_shown', { ask_number: askNumber });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [y, dim]);

  // The sheet leaves before the flag is written, so the reader sees it go rather
  // than seeing it vanish. `onClose` is what marks it asked.
  const leave = (then?: () => void) => {
    y.value = withTiming(RISE, { duration: OUT, easing: Easing.in(Easing.cubic) });
    dim.value = withDelay(60, withTiming(0, { duration: OUT }));
    setTimeout(() => { then?.(); onClose(); }, OUT + 60);
  };

  const submit = () => {
    if (!stars) return;
    touch();
    track('rate_prompt_answered', { stars, went_to_store: false, ask_number: askNumber });
    onSettled();
    setSent(true);
  };

  const toStore = () => {
    track('rate_prompt_answered', { stars, went_to_store: true, ask_number: askNumber });
    leave(() => { void Linking.openURL(storeUrl()); });
  };

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const dimStyle = useAnimatedStyle(() => ({ opacity: dim.value * 0.42 }));

  return (
    <Modal visible transparent animationType="none" onRequestClose={() => leave()}>
      <View style={st.root}>
        <Animated.View style={[st.scrim, dimStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => leave()} />
        </Animated.View>

        <Animated.View style={[st.sheet, sheetStyle]}>
          <Pressable
            onPress={() => leave()}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={st.close}
          >
            <SketchIcon name="close" size={18} color={C.ink} />
          </Pressable>

          {!sent ? (
            <>
              <Text style={st.title}>Enjoying Ashmere?</Text>
              <Text style={st.body}>
                Tap a star. It takes a second, and it genuinely helps other people
                find the app.
              </Text>

              <View style={st.stars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => { touch(); setStars(n); }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`${n} star${n === 1 ? '' : 's'}`}
                    style={st.star}
                  >
                    <SketchIcon
                      name={n <= stars ? 'star-filled' : 'star'}
                      size={34}
                      color={n <= stars ? METAL.GOLD.base : C.dim}
                    />
                  </Pressable>
                ))}
              </View>

              <Button label="Submit" onPress={submit} size="lg" disabled={!stars} />
            </>
          ) : (
            <>
              <Text style={st.title}>Thank you.</Text>
              <Text style={st.body}>
                If you have a moment, leaving it on Google Play is what actually
                helps other people find it.
              </Text>
              <Button label="Rate on Google Play" onPress={toStore} size="lg" />
              <Button label="Not now" onPress={() => leave()} variant="ghost" />
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * WHEN THE ASK IS ALLOWED TO HAPPEN.
 *
 * Split from the sheet so the sheet has no opinion about timing, and so the
 * conditions are readable in one place. Mounted by the home screen, and it only
 * raises while Home is the screen being looked at.
 */
export function RatePromptHost() {
  const hydrated = useUserDataStore((s) => s._hasHydrated);
  const onboardingVersion = useUserDataStore((s) => s.onboardingVersion);
  const rateSettled = useUserDataStore((s) => s.rateSettled);
  const rateAskedAt = useUserDataStore((s) => s.rateAskedAt);
  const rateAsks = useUserDataStore((s) => s.rateAsks);
  const noteRateAsk = useUserDataStore((s) => s.noteRateAsk);
  const markRateSettled = useUserDataStore((s) => s.markRateSettled);

  // NO `conferral` HERE, and that is deliberate rather than an oversight.
  //
  // It reads three fields of the UI store, and every one of them predates this
  // feature. An earlier draft also checked `conferral` -- the Scholar's Pass
  // ceremony -- which made this component impossible to ship without the trial
  // work, because the field would not exist. An OTA bundles the working tree, so
  // one import is enough to weld two unrelated features together.
  //
  // Nothing is lost by dropping it: the conferral is a Modal mounted at the root
  // and this is a Modal mounted on Home, so the ceremony covers the sheet rather
  // than colliding with it, and a purchase is not a moment this can arrive at
  // anyway.
  const launchDone = useUIStore((s) => s.launchDone);
  const reward = useUIStore((s) => s.reward);
  const paywallOpen = useUIStore((s) => s.paywallOpen);

  // HOME STAYS MOUNTED BEHIND EVERY OTHER TAB -- all five are built at startup
  // and none of them unmounts for the session -- and a Modal raised from a
  // mounted screen covers whatever is on the glass, not the screen that raised
  // it. At sixty days that was a rare landing on the wrong tab. Once a day it
  // would be a regular one, so the sheet waits for Home to be the screen the
  // reader is actually looking at.
  const onHome = useIsFocused();

  // Re-renders this host when the calendar day turns over across a foreground,
  // so a phone left open past midnight raises the new day's ask on the next
  // resume instead of waiting for something unrelated to re-render. `due` is
  // computed from `Date.now()` at render, and nothing else here would move.
  useTodayKey();

  // ONCE RAISED IT STAYS UP UNTIL THE READER CLOSES IT, and that has to be a
  // latch rather than a re-derivation: the ask is recorded the instant it opens,
  // which immediately makes `due` false, so a sheet rendered straight off `due`
  // would vanish on the frame it appeared.
  const [open, setOpen] = useState(false);

  const due = hydrated
    && mayAsk({ settled: rateSettled, askedAt: rateAskedAt }, Date.now(), onboardingVersion > 0);

  const clear = due && launchDone && onHome && !reward && !paywallOpen;

  // NOT ON MOUNT. The home screen is still settling out of the tab transition on
  // the frame it appears, and a sheet rising through that reads as a glitch --
  // the same class of thing section 19 records for the launch screen's first
  // four seconds. A beat, then it arrives on a still screen.
  //
  // AND THE ASK IS NOTED HERE, AS IT OPENS, RATHER THAN WHEN IT CLOSES. That was
  // harmless at sixty days and is not harmless daily: a reader who backgrounds
  // the app or force-quits with the sheet up has nothing written down, so the
  // next open the same day raises it again and "once a day" becomes "every
  // launch until you dismiss it properly". rateCadence.ts's last section, and
  // check-rate.mjs reads this line to hold it here.
  useEffect(() => {
    if (!clear || open) return;
    const t = setTimeout(() => { noteRateAsk(); setOpen(true); }, 900);
    return () => clearTimeout(t);
  }, [clear, open, noteRateAsk]);

  // Android only: the copy names Google Play, and there is no iOS build.
  if (Platform.OS === 'ios') return null;
  if (!open) return null;
  return (
    <RatePrompt
      // Counted up before the sheet mounts, so this is already THIS ask's number.
      askNumber={rateAsks || 1}
      onSettled={markRateSettled}
      onClose={() => setOpen(false)}
    />
  );
}

const st = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: C.ink,
  },
  sheet: {
    backgroundColor: C.paper,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1.5,
    borderColor: C.ink,
    paddingHorizontal: SPACE[4],
    paddingTop: SPACE[5],
    paddingBottom: SPACE[5],
    gap: SPACE[2],
  },
  close: {
    position: 'absolute', top: SPACE[3], right: SPACE[3],
    width: 30, height: 30, borderRadius: RADIUS.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 23, color: C.ink,
    includeFontPadding: false,
  },
  body: {
    fontFamily: 'Inter_400Regular', fontSize: 13.5, lineHeight: 20, color: C.dim,
  },
  stars: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACE[2],
    paddingVertical: SPACE[3],
  },
  star: { padding: 2 },
});
