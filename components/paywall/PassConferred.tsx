import { useEffect, useMemo } from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withTiming, withSequence,
  interpolate, interpolateColor, Extrapolation, Easing,
} from 'react-native-reanimated';
import Button from '@/components/ui/Button';
import RankSeal from '@/components/shared/RankSeal';
import { MetalPlate } from '@/components/profile/Struck';
import Certificate, { ScheduleHead, ScheduleRow } from '@/components/paywall/Certificate';
import { INK, MID, PANEL_BASE, mix, ROYAL, PURPLE, BEIGE } from '@/components/shared/tone';
import TrialReminderAsk from '@/components/paywall/TrialReminderAsk';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { awardedRank, rankOrder, rankDegree } from '@/data/ranks';
import { PASS_LINES, longPass } from '@/lib/utils/passValue';
import { trialLengthPhrase, whenLabel } from '@/lib/utils/trial';
import { startedTerms } from '@/lib/utils/trialTerms';
import { BILLING_PERIOD_LABEL, FALLBACK_PRICE } from '@/constants/subscription';
import { C, SPACE } from '@/constants/design';
import { cue } from '@/lib/feedback';

// -----------------------------------------------------------------------------
// THE CONFERRAL — the Pass being handed over.
//
//   "after the payment goes through or after they click on that they want to do
//    a free trial ... a really cool almost uncovering or animation that shows
//    the scholar pass show up or light up ... showing what certificate the user
//    now has."
//
// ONE CEREMONY FOR BOTH DOORS. A trial and a purchase confer the SAME object --
// the trial is the Pass, for a few days -- so they get the same animation and
// differ only in the plate on the head and the terms under the button. Two
// ceremonies would be two chances for one of them to say something the other
// does not, which is the fault section 14 exists to prevent.
//
// == WHY THIS IS A SWEEP AND NOT A FADE ======================================
//
// A fade tells the reader something appeared. It does not tell them anything
// arrived. What the app already has, and what nothing else was using, is a
// LIGHT: every struck thing in here -- the rank pins, the badges, the metal
// plates, this certificate -- is lit from the top left and the direction never
// moves (see components/shared/tone.ts). So the reveal is that same light
// PASSING ACROSS the object: a band of gold travelling top-left to bottom-right,
// with the dark ahead of it and the finished certificate behind it.
//
// It is the app's own convention put in motion, which is why it reads as this
// product's ceremony rather than as a generic shine effect. It is also, and not
// incidentally, the cheapest thing on screen: the certificate is drawn ONCE and
// never redrawn, and two absolutely-positioned Views move over the top of it.
// Section 17's rule 7 -- an animated full-screen Svg costs ~10fps on an S24 --
// is respected by construction, because nothing under the sweep ever re-renders.
//
// == THE FIVE BEATS ==========================================================
//
//   1. THE DARK      the ground is near-black and the certificate is under it.
//   2. THE SWEEP     the light crosses; everything behind it is lit and gold.
//   3. THE STRIKE    a flash, two rings off the card's own edge, and the card
//                    settles -- 0.965 to 1.008 to 1. This is the beat the whole
//                    thing is built around and it is where the sound lands.
//   4. THE LIFT      the ground rises from near-black to the app's own paper, so
//                    the certificate ends up sitting where everything else in
//                    the app sits. Every other ceremony here -- the rank-up, the
//                    badge, the reward -- is on paper, and section 19 records
//                    the argument against a screen that is dark for its own
//                    sake. The dark is the BEFORE, not the house style.
//   5. THE WORDS     kicker, headline, terms, and then the button.
//
// == NO NEW COLOUR ===========================================================
//
// Same rule as Certificate and PassParts, and check-pass holds it: every value
// comes from `tone`, `METAL` or `C`. The light that sweeps across is the
// palette's BEIGE -- the surface the certificate's Pass rows are cut into -- so
// the light passing over it is a colour it already wears, moving.
// -----------------------------------------------------------------------------

/**
 * The same colour at zero alpha.
 *
 * PassParts states the reasoning in full and it is the reason this is derived
 * rather than written down: a gradient that fades to the bare keyword
 * `transparent` interpolates through transparent BLACK on iOS and the web, so
 * the leading edge of the sweep would carry a grey bloom across the card it is
 * supposed to be revealing.
 */
const clear = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0)`;
};

/** The beige at a stated alpha, for the band. Same rule as above. */
const light = (a: number) => {
  const n = parseInt(BEIGE.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// -- the timeline, in ms ------------------------------------------------------
//
// Stated as constants rather than typed into the calls because three of them are
// derived from each other: the strike has to land on the frame the light clears
// the card, and the lift and the words hang off the strike. Retuning the sweep
// with the strike written as a literal is how a ceremony ends up flashing at a
// card that is still half covered.
const T_DARK = 220;
const T_SWEEP = 1120;
/**
 * WHERE THE LIGHT HAS ACTUALLY FINISHED, which is not where the timing does.
 *
 * The sweep runs on `inOut(cubic)`, so at 86% of its duration it has travelled
 * 98.9% of its distance -- the last 14% of the time moves the final 1% of the
 * band, which is off the card's edge already. Striking at the nominal end would
 * put the flash a seventh of a second after the reveal visibly completed, and
 * that gap is exactly long enough to read as two unrelated events.
 */
const T_STRIKE = T_DARK + T_SWEEP * 0.86;
const T_LIFT = 820;
const T_WORDS = 460;

interface Props {
  kind: 'trial' | 'purchase';
  onDone: () => void;
}

export default function PassConferred({ kind, onDone }: Props) {
  const displayName = useUserDataStore((s) => s.displayName);
  const rankIndex = useUserDataStore((s) => s.rankIndex);
  const totalXP = useUserDataStore((s) => s.totalXP);
  // THE TRIAL AS GOOGLE PLAY STARTED IT: when it ends, the price it becomes, and
  // how long the offer was. Read from the store, never from a constant, so the
  // terms under the certificate are the terms the reader just agreed to.
  const trialEndsAt = useSubscriptionStore((s) => (s.sub.onTrial ? s.sub.expiresAt : null));
  const offer = useSubscriptionStore((s) => s.monthly?.trial ?? null);
  const price = useSubscriptionStore((s) => s.monthly?.priceString ?? FALLBACK_PRICE);

  const { width: winW } = useWindowDimensions();
  const PAD = SPACE[4];
  const cardW = Math.min(winW - PAD * 2, 420);

  // The conferred rank, not what the XP alone would buy -- the same rule the Pass
  // tab states: a certificate showing a different rank from the Profile would be
  // the app disagreeing with itself in the reader's own name.
  const rank = awardedRank(rankIndex, totalXP);

  const sweep = useSharedValue(0);
  const flash = useSharedValue(0);
  const ring = useSharedValue(0);
  const settle = useSharedValue(0.965);
  const lift = useSharedValue(0);
  const words = useSharedValue(0);
  const cta = useSharedValue(0);

  useEffect(() => {
    sweep.value = withDelay(T_DARK, withTiming(1, {
      duration: T_SWEEP, easing: Easing.inOut(Easing.cubic),
    }));
    flash.value = withDelay(T_STRIKE, withSequence(
      withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 340, easing: Easing.out(Easing.cubic) }),
    ));
    ring.value = withDelay(T_STRIKE, withTiming(1, {
      duration: 680, easing: Easing.out(Easing.cubic),
    }));
    // 0.965 -> 1.008 -> 1: anticipation is deliberately absent. The card is not
    // reacting to a press, it is being struck, and a struck object rebounds --
    // it does not crouch first. The overshoot is small for the same reason the
    // reward screen's number lost its spring: a wobble reads as a toy.
    settle.value = withDelay(T_STRIKE, withSequence(
      withTiming(1.008, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }),
    ));
    lift.value = withDelay(T_STRIKE + 60, withTiming(1, {
      duration: T_LIFT, easing: Easing.inOut(Easing.quad),
    }));
    words.value = withDelay(T_STRIKE + 260, withTiming(1, {
      duration: T_WORDS, easing: Easing.out(Easing.cubic),
    }));
    cta.value = withDelay(T_STRIKE + 620, withTiming(1, {
      duration: T_WORDS, easing: Easing.out(Easing.cubic),
    }));

    // TWO SOUNDS, AND NOT THE FANFARE. `rankup` is described in lib/sound/types
    // as the only fanfare in the app and it belongs to the rank ladder; spending
    // it here would make both moments smaller. `reward` opens (the chime that
    // ends a lesson, which is what this follows) and `badge` -- a low bell under
    // a shimmer -- lands on the strike, which is what a certificate being struck
    // actually sounds like.
    cue('reward');
    const t = setTimeout(() => cue('badge'), T_STRIKE);
    return () => clearTimeout(t);
  }, [sweep, flash, ring, settle, lift, words, cta]);

  // -- the ground ------------------------------------------------------------
  const groundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(lift.value, [0, 1], [PANEL_BASE, C.paper]),
  }));

  // -- the sweep -------------------------------------------------------------
  //
  // ONE MOVING VIEW DOES THE WHOLE REVEAL. It is 1.9 card-widths across and
  // carries, left to right: nothing, the gold band, then solid dark for the rest
  // of its length. Slid from -0.9 widths (dark over the whole card) to +1 width
  // (entirely past it), the transparent half uncovers the card behind the band.
  //
  // Skewed, so the edge is a diagonal running with the app's one light rather
  // than a vertical wipe. The skew shifts y with x, which is why the view is
  // three card-heights tall and starts a height above the top -- a skewed box
  // sized to the card would ride off its own corners and leave two triangles of
  // certificate lit before the light ever reached them.
  const SW = cardW * 1.9;
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(sweep.value, [0, 1], [-cardW * 0.9, cardW]) },
      { skewY: '-13deg' },
    ],
  }));

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value * 0.34 }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: settle.value },
      { translateY: interpolate(sweep.value, [0, 1], [16, 0]) },
    ],
  }));

  // Two rings off the card's own edge, staggered. A ROUNDED RECT rather than a
  // circle: this is a printed object being struck, and its edge is what pulses
  // outward. A circular shockwave belongs to an explosion and would be the one
  // mark on the screen that is not about paper.
  // WRITTEN OUT TWICE RATHER THAN FACTORED INTO A HELPER. A `ringStyle(delay)`
  // that returns useAnimatedStyle() is a hook called from a plain function, and
  // the one rule this codebase has broken hardest (section 17, rule 1) is about
  // hooks whose call order is not obvious on the page. Two of them is not enough
  // duplication to be worth the risk.
  const ring1 = useAnimatedStyle(() => {
    const p = interpolate(ring.value, [0, 1], [0, 1], Extrapolation.CLAMP);
    return { opacity: (1 - p) * 0.7, transform: [{ scale: 1 + p * 0.15 }] };
  });
  const ring2 = useAnimatedStyle(() => {
    const p = interpolate(ring.value, [0.18, 1], [0, 1], Extrapolation.CLAMP);
    return { opacity: (1 - p) * 0.55, transform: [{ scale: 1 + p * 0.24 }] };
  });

  const wordStyle = useAnimatedStyle(() => ({
    opacity: words.value,
    transform: [{ translateY: interpolate(words.value, [0, 1], [14, 0]) }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: cta.value,
    transform: [{ translateY: interpolate(cta.value, [0, 1], [10, 0]) }],
  }));

  // The head plate and the terms are the ONLY difference between the two doors.
  const trial = kind === 'trial';
  // A TRIAL'S TERMS SAY WHAT HAPPENS AT THE END, in the words every other door
  // uses: free until the date, then a Scholar's Pass automatically, unless it is
  // cancelled. The ceremony is not the place to go quiet about the charge.
  const terms = useMemo(
    () =>
      trial
        ? startedTerms(
          trialEndsAt != null ? whenLabel(trialEndsAt) : 'the trial ends',
          price,
          BILLING_PERIOD_LABEL,
        )
        : 'Yours for as long as you keep it. Manage or cancel any time from Settings, and nothing you have earned ever goes away.',
    [trial, trialEndsAt, price],
  );

  const rows = useMemo(
    () =>
      PASS_LINES.map((l, i) => (
        <ScheduleRow
          key={l.id}
          grade="granted"
          label={l.label}
          detail={longPass(l)}
          last={i === PASS_LINES.length - 1}
          compact
        />
      )),
    [],
  );

  return (
    <Modal visible animationType="fade" transparent={false} onRequestClose={onDone}>
      {/* NAMED, THE WAY THE LESSON CONTROLS ARE. Section 17 gives every analogue
          control a `nativeID` because a harness that can only click is blind to
          a beat with no button on it; the same applies to an animation with no
          text in it. Finding these by their geometry is what a first probe did,
          and it latched onto the certificate's 5x5 rule-dot -- a ROTATION also
          has the off-diagonal terms a skew does -- and reported the sweep as
          never having moved. */}
      <Animated.View nativeID="pass-ground" style={[st.ground, groundStyle]}>
        <ScrollView
          contentContainerStyle={st.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* -- the object ------------------------------------------------ */}
          <View style={{ width: cardW }}>
            <Animated.View nativeID="pass-card" style={cardStyle}>
              {/* The rings sit OUTSIDE the clip so they can grow past the card.
                  Drawn behind it, so an expanding edge reads as coming from
                  under the object rather than being painted on top of it. */}
              <Animated.View pointerEvents="none" style={[st.ring, ring1]} />
              <Animated.View pointerEvents="none" style={[st.ring, ring2]} />

              {/* overflow:hidden clips the SWEEP to the card, and the shadow is
                  moved onto this wrapper because a view's own shadow is drawn
                  outside its bounds and is not clipped by its own overflow --
                  whereas the certificate's shadow, being a child, would be. */}
              <View style={st.clip}>
                <Certificate
                  compact
                  variant="scholar"
                  width={cardW}
                  title="THE SCHOLAR’S PASS"
                  motto="This pass admits you to the whole library."
                  holder={displayName || 'Philosopher'}
                  seal={
                    <RankSeal
                      glyph={rank.current.glyph}
                      state="current"
                      size={38}
                      order={rankOrder(rank.index)}
                      degree={rankDegree(rank.index)}
                    />
                  }
                  flag={
                    <MetalPlate
                      metal={ROYAL}
                      label={trial
                        ? (offer ? `${trialLengthPhrase(offer).toUpperCase()} FREE` : 'FREE TRIAL')
                        : 'ACTIVE'}
                    />
                  }
                >
                  <ScheduleHead
                    compact
                    label="THIS ADMITS YOU TO"
                    tint={PURPLE}
                  />
                  {rows}
                </Certificate>

                <Animated.View
                  nativeID="pass-sweep"
                  pointerEvents="none"
                  style={[st.sweepBox, { width: SW }, sweepStyle]}
                >
                  <LinearGradient
                    colors={[
                      clear(PANEL_BASE), clear(PANEL_BASE),
                      light(0.9), BEIGE,
                      PANEL_BASE, PANEL_BASE,
                    ]}
                    locations={[0, 0.40, 0.452, 0.468, 0.492, 1]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>

                <Animated.View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFill, { backgroundColor: BEIGE }, flashStyle]}
                />
              </View>
            </Animated.View>
          </View>

          {/* -- the words ------------------------------------------------- */}
          <Animated.View style={[st.words, { width: cardW }, wordStyle]}>
            <Text style={st.kicker}>CONFERRED</Text>
            <Text style={st.head}>The library is open.</Text>
            <Text style={st.terms}>{terms}</Text>
            {/* THE ASK FOR THE REMINDER, at the moment the trial exists to be
                reminded about. It says the date it would arrive. */}
            {trial ? (
              <View style={st.ask}>
                <TrialReminderAsk endsAt={trialEndsAt} source="conferral" />
              </View>
            ) : null}
          </Animated.View>

          <Animated.View style={[{ width: cardW }, ctaStyle]}>
            <Button label="Begin" onPress={onDone} size="lg" />
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const st = StyleSheet.create({
  ground: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACE[4],
    paddingVertical: SPACE[5],
    gap: SPACE[4],
  },

  clip: {
    borderRadius: 3,
    overflow: 'hidden',
    shadowColor: INK,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 1.2, height: 3 },
    elevation: 4,
  },
  ring: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: PURPLE,
  },
  // Three card-heights tall and pulled a height above the top, so the skew can
  // never expose a corner. `top`/`bottom` are stated as percentages of the clip
  // box, which is the card, so this needs no measured height.
  sweepBox: { position: 'absolute', top: '-100%', bottom: '-100%', left: 0 },

  words: { alignItems: 'center' },
  kicker: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 2.4,
    color: PURPLE,
  },
  head: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: INK,
    marginTop: SPACE[1], textAlign: 'center', includeFontPadding: false,
  },
  terms: {
    fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, color: MID,
    marginTop: SPACE[2], textAlign: 'center',
  },
  ask: { alignSelf: 'stretch', marginTop: SPACE[3] },
});
