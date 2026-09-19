// ─────────────────────────────────────────────────────────────────────────────
// THE CLOSING ENCOUNTER FOR `logic-arguments-16`, "After It Is Not Because Of It".
//
// MECHANIC: THE READER TAPS THE MOMENT. A second stickman paces up and down building
// an argument out loud, one phrase at a time, and the reader has to catch it at the
// exact phrase where it stops being a story and becomes a claim. Tap too early and
// nothing is wrong yet — he has only told you what happened. Tap too late and it is
// already out of his mouth.
//
// WHY THIS LESSON GETS THE TIMING ONE. A post hoc fallacy is not a wrong sentence,
// it is a right sentence with one word too many, and WHERE it turns is the whole
// skill the lesson teaches. Every other way of asking this — pick the bad line, drag
// a slider — hands the reader the boundary they are supposed to find. Making them
// catch it in flight is the only version where they do the work.
//
// AND IT IS THE FUNNY ONE. The claim is red socks, which is a real thing real people
// really believe, and he is completely sincere about it.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { GROUND, INK, K_FIG, PAPER, SOFT, STAGE_W } from '../cinematicKit';
import { clamp01, ease01, lerp, mixStance, pose, strideStance, WALK, type Bundle } from '../rig';
import { emoteAny, emoteAnyLive } from '../moves';
import {
  type CodaWindow,
  CodaFigure, CodaFloor, CodaLand, CodaLine, CodaStage, useCodaRun,
} from './codaKit';
import type { CodaProps } from './types';

/**
 * THE ARGUMENT, A PHRASE AT A TIME.
 *
 * `turns` is true on the phrase where the story becomes a claim — the one the reader
 * is hunting. Everything before it is reporting and everything after it is the
 * conclusion, already made.
 */
const PHRASES: { text: string; secs: number; turns?: boolean; late?: boolean }[] = [
  { text: 'Right. Saturday.', secs: 1.5 },
  { text: 'I put on the red socks.', secs: 2.0 },
  { text: 'Kick-off, we go two down.', secs: 2.1 },
  { text: 'Second half — three goals.', secs: 2.1 },
  { text: 'So the socks did it.', secs: 2.2, turns: true },
  { text: 'I am never washing them.', secs: 2.2, late: true },
];

const LEAD_X = 132;
const HE_X = 262;
/** How close the reader is. Two figures 130 apart do not need the whole stage. */
const WIN: CodaWindow = [66, 250, 374, 548];
const PACE = 42;                 // how far the arguer paces either side of his mark

const POSE_LISTEN = 60;          // a living hold — the lead is following along
const POSE_DOUBT = 12;           // scratch head
const POSE_NOD = 19;             // adore — he is delighted with himself
const POSE_TALK = 1;             // explain
const POSE_FLAT = 46;            // slump — caught

export default function PostHocCoda({ onDone }: CodaProps) {
  const { t, phase, tries, resolve, again } = useCodaRun(1500);
  const [step, setStep] = useState(0);
  const [verdict, setVerdict] = useState<'early' | 'late' | 'got' | null>(null);
  const ring = useSharedValue(0);
  const flat = useSharedValue(0);

  // ── THE ARGUMENT RUNS ON ITS OWN CLOCK AND THE READER INTERRUPTS IT ────────
  useEffect(() => {
    if (phase !== 'ask') return;
    setStep(0);
    setVerdict(null);
    ring.value = 0;
    flat.value = 0;
    let k = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let at = 0;
    for (const p of PHRASES) {
      at += p.secs * 1000;
      const mine = (k += 1);
      timers.push(setTimeout(() => setStep(mine), at));
    }
    return () => timers.forEach(clearTimeout);
  }, [phase, tries, ring, flat]);

  const catchIt = useCallback(() => {
    if (phase !== 'ask') return;
    const p = PHRASES[Math.min(step, PHRASES.length - 1)];
    const got = !!p.turns;
    setVerdict(got ? 'got' : p.late ? 'late' : 'early');
    if (got) {
      ring.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.back(2)) });
      flat.value = withTiming(1, { duration: 700 });
    }
    resolve(got, got ? 2000 : 1700);
  }, [phase, step, resolve, ring, flat]);

  const shown = PHRASES[Math.min(step, PHRASES.length - 1)];
  const live = phase === 'ask';

  // The arguer: paces while he talks, freezes when he is caught.
  const HIM = useDerivedValue<Bundle>(() => {
    const now = t.value;
    const caught = phase === 'play' && verdict === 'got';
    const code = caught ? POSE_FLAT : POSE_TALK;
    const hold = emoteAny(code, now + 3);
    const lv = emoteAnyLive(code, now + 3, now);
    // He paces on his own mark rather than crossing the stage — the lead is the one
    // being talked AT, and a speaker who wanders off is a speaker nobody is listening
    // to. A triangle wave through `strideStance`, so the gait is the app's own.
    const cyc = caught ? 0 : (now * 0.34) % 2;
    const swing = cyc < 1 ? cyc : 2 - cyc;
    const from = HE_X - PACE / 2;
    const to = HE_X + PACE / 2;
    const dir = caught ? -1 : (cyc < 1 ? 1 : -1);
    const s = caught
      ? mixStance(hold, lv, 0.6)
      : strideStance(from, to, mixStance(hold, lv, 0.5), swing, WALK);
    const px = caught ? HE_X : lerp(from, to, swing);
    return pose(s, px, GROUND, K_FIG, dir, 1);
  }, [phase, verdict]);

  // The lead: listening, then reacting to what the reader did.
  const ME = useDerivedValue<Bundle>(() => {
    const now = t.value;
    const code = phase === 'arrive' ? POSE_LISTEN
      : phase === 'play' && verdict === 'got' ? POSE_NOD
        : phase === 'play' ? POSE_DOUBT
          : phase === 'again' ? POSE_DOUBT
            : phase === 'land' ? POSE_NOD
              : POSE_LISTEN;
    const hold = emoteAny(code, now + 3);
    const lv = emoteAnyLive(code, now + 3, now);
    const tr = phase === 'arrive' ? ease01(Math.min(now / 1.2, 1)) : 1;
    const s = phase === 'arrive'
      ? strideStance(-30, LEAD_X, mixStance(hold, lv, 0.5), tr, WALK)
      : mixStance(hold, lv, 0.6);
    const px = phase === 'arrive' ? lerp(-30, LEAD_X, tr) : LEAD_X;
    return pose(s, px, GROUND, K_FIG, 1, 1);
  }, [phase, verdict]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value,
    transform: [{ scale: 0.86 + ring.value * 0.14 }],
  }));
  const bubbleStyle = useAnimatedStyle(() => ({ opacity: 1 - flat.value * 0.35 }));

  const line = phase === 'arrive' ? 'Someone has a theory.'
    : phase === 'ask' ? (tries ? 'Again. Stop him on the word that does the damage.' : 'Stop him the moment the story turns into a claim.')
      : phase === 'play' && verdict === 'early' ? 'Too soon — nothing is wrong yet. That all happened.'
        : phase === 'play' && verdict === 'late' ? 'Just past it. The damage was the line before.'
          : phase === 'play' ? ''
            : phase === 'again' ? 'He starts again. He has not noticed.'
              : '';

  return (
    <>
      {phase === 'land' ? null : <CodaLine text={line} />}
      <CodaStage win={WIN}>
        <CodaFloor />
        {/* HIS ARGUMENT, IN THE AIR. One plate, one phrase, replaced as he speaks —
            a stack would let the reader read ahead, and reading ahead is the whole
            question. */}
        <Animated.View style={[styles.say, bubbleStyle]} pointerEvents="none">
          <View style={styles.sayPlate}>
            <Text style={styles.sayText}>{shown.text}</Text>
            <Animated.View style={[styles.catchRing, ringStyle]} pointerEvents="none" />
          </View>
          <View style={styles.sayTail} />
        </Animated.View>
        <CodaFigure D={ME} />
        <CodaFigure D={HIM} role="second" />
      </CodaStage>
      {phase === 'land'
        ? (
          <CodaLand
            idea="After is not because."
            note="You stopped him on the word that turned a sequence into a cause. That word is where every post hoc lives, and you can hear it now."
            onDone={onDone}
          />
        )
        : (
          <>
            {/* THE CONTROL IS THE WHOLE SCREEN, because the answer is WHEN and not
                WHERE. A small button would make the reader aim as well as listen. */}
            <Pressable
              onPress={live ? catchIt : phase === 'again' ? again : undefined}
              disabled={!live && phase !== 'again'}
              style={styles.catch}
              accessibilityRole="button"
              accessibilityLabel={live ? 'Stop him' : 'Go again'}
              nativeID="coda-catch"
            >
              <Text style={[styles.catchText, !live && phase !== 'again' && styles.catchOff]}>
                {live ? 'STOP HIM' : phase === 'again' ? 'GO AGAIN' : ' '}
              </Text>
            </Pressable>
          </>
        )}
    </>
  );
}

const styles = StyleSheet.create({
  // Just above his own head — his crown is at about y 397, and a bubble floating a
  // hundred units over it is a caption rather than something he is saying.
  say: { position: 'absolute', left: 150, top: 268, width: 206, alignItems: 'flex-start' },
  sayPlate: {
    borderRadius: 14, borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
    paddingVertical: 10, paddingHorizontal: 13, boxShadow: '0px 3px 0px rgba(26,26,26,0.9)',
  },
  sayText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, lineHeight: 20, color: INK },
  sayTail: {
    width: 0, height: 0, marginLeft: 26, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 11,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },
  catchRing: {
    position: 'absolute', left: -6, right: -6, top: -6, bottom: -6,
    borderRadius: 18, borderWidth: 3, borderColor: '#D35E36',
  },
  catch: {
    alignSelf: 'center', marginTop: 4, marginBottom: 8,
    paddingVertical: 15, paddingHorizontal: 54, borderRadius: 13,
    backgroundColor: INK, boxShadow: '0px 3px 0px rgba(26,26,26,0.35)',
  },
  catchText: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 2, color: PAPER },
  catchOff: { color: SOFT },
});
