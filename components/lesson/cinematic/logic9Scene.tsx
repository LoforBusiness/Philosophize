import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, emoteHold, emoteLive, lerp, moveTr, pose, travelStance,
  type Bundle,
} from './rig';
import { BEATS } from './logic9Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A claim on a board, an arguer standing by it, and a dodger who walks on and never
// once goes near it.
//
// COMPOSITION / OCCLUSION —
//   · the ARGUER is fixed at x = 96, facing right. Body span x ≈ 60 … 132.
//   · the DODGER walks in from x = 420 (well off the 400-wide stage, so he is at
//     full opacity before any of him is visible — C20b) and stops at x = 264,
//     facing left. Body span x ≈ 228 … 300.
//   · so the two stand 168 apart, and neither leans: comfortably past the ~100 at
//     which two heads read as one mass on a phone (B9).
//   · THE CLAIM board sits x 116 … 284, y 226 … 276 — between them and above both
//     crowns (a standing crown is y 397), so nobody ever occludes it.
//   · the smear label hangs over the ARGUER at x 26 … 150, y 292 … 328; the straw
//     copy stands over the DODGER at x 206 … 330, y 292 … 336 and tips 16° when it
//     is knocked. Each sits above its own man and over nobody else.
//   · the three replies replace both of those on the tap beat — and the CLAIM board
//     too, which that beat does not set — so the whole upper half is theirs:
//     x 40 … 360, y 205 … 389, stopping 8 clear of a crown. They were 27 tall on a
//     30 pitch, which is a 24dp target every 27dp against a ~45dp fingertip; they
//     are now 44 on a 70 pitch (E37b-2).
// Nothing is drawn above y 205 or below the ground line, hence band [200, 512] —
// still under the 330 units at which `fit` would fall below 0.90.

const BOARD_L = 116;
const BOARD_W = 168;
const BOARD_T = 226;
const BOARD_H = 50;

const SMEAR_L = 26;
const SMEAR_W = 124;
const SMEAR_T = 292;

const STRAW_L = 206;
const STRAW_W = 124;
const STRAW_T = 292;

const REPLY_L = 40;
const REPLY_W = 320;
// SIZED FOR A FINGER: 27 tall on a 30 pitch is a 24dp card every 27dp, against a
// fingertip covering ~45dp. The room came from ABOVE — the band started at 216, so
// everything higher was empty paper. The stack runs 205 → 389 now, stopping clear
// of the figure's crown at 397, and the band grows to 312 units, still under the
// 330 at which `fit` would drop below 0.90.
const REPLY_T = 205;
const REPLY_H = 44;
const REPLY_GAP = 70;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const REPLY_SLOP = (REPLY_GAP - REPLY_H) / 2;

const REPLIES = [
  { id: 'person', text: '“He failed maths at school.”', correct: true },
  { id: 'answer', text: '“Your third column double-counts rent.”', correct: false },
  { id: 'straw', text: '“So you want everyone to be poor?”', correct: false },
];

const A = BEATS.map((b) => b.a ?? 0);
const D = BEATS.map((b) => b.d ?? 0);
const DX = BEATS.map((b) => b.dx ?? 420);
const DDIR = dirsFrom(DX, -1);
const STRAW = BEATS.map((b) => b.straw ?? 0);

// The arguer never moves, so he never walks; his x is a constant and the rule about
// routing motion through travelStance simply does not apply to him (C18).
const ARG_X = 96;

export default function Logic9Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const claimOn = !!cur.claim;
  const claimFade = claimOn !== !!prev?.claim;
  const smearOn = !!cur.smear;
  const smearFade = smearOn !== !!prev?.smear;
  const strawOn = (cur.straw ?? 0) > 0;
  const strawFade = strawOn !== ((prev?.straw ?? 0) > 0);
  const dim = !!cur.untouched;
  const repliesOn = !!cur.replies;
  const repliesFade = repliesOn !== !!prev?.replies;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(DX[p], DX[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    // The arguer stands. His clock is offset from the dodger's so the two do not
    // breathe, rock and drift on the same frames — nothing in the choreography
    // looks wrong when they do, they just read as one puppet (B14).
    const aS = i > 0
      ? emoteLive(A[n], t + 4.3, bt.value)
      : emoteHold(A[n], t + 4.3);
    const aMix = travelStance(
      ARG_X, ARG_X,
      emoteHold(A[p], t + 4.3), emoteHold(A[n], t + 4.3), aS, tr, WALK, 3,
    );

    const dMix = travelStance(
      DX[p], DX[n],
      emoteHold(D[p], t), emoteHold(D[n], t), emoteLive(D[n], t, bt.value),
      tr, WALK, 1,
    );
    const dx = lerp(DX[p], DX[n], tr);

    // He arrives at FULL opacity: the fade is spent in the wing, over the first
    // fifth of a 156-unit walk, so the reader only ever sees a man walking on.
    const walkIn = DX[p] > 380 && DX[n] < 380 ? ease01(clamp01(tr / 0.2)) : (DX[n] < 380 ? 1 : 0);

    return {
      arg: pose(aMix, ARG_X, GROUND, K_FIG, 1, 1),
      dod: pose(dMix, dx, GROUND, K_FIG, DDIR[n], walkIn),
      claim: (claimOn ? 1 : 0) * (claimFade ? grow : 1),
      smear: (smearOn ? 1 : 0) * (smearFade ? grow : 1),
      straw: (strawOn ? 1 : 0) * (strawFade ? grow : 1),
      // The copy is knocked over on the same beat it is built, a beat after it
      // appears — the fall is DELAYED past the build so both are legible (C20d).
      tip: STRAW[n] === 2 ? ease01(clamp01((bt.value - 1.15) / 0.7)) : 0,
      dim: dim ? ease01(clamp01(bt.value / 0.7)) : 0,
      t,
    };
  });

  const AF = useDerivedValue<Bundle>(() => SCENE.value.arg);
  const DF = useDerivedValue<Bundle>(() => SCENE.value.dod);

  const claimStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.claim }));
  const smearStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.smear * (1 - SCENE.value.dim * 0.72) }));
  const strawStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.straw * (1 - SCENE.value.dim * 0.72),
    transform: [
      { translateY: SCENE.value.tip * 9 },
      { rotate: `${SCENE.value.tip * 16}deg` },
    ],
  }));
  const replyStyle = useAnimatedStyle(() => ({
    opacity: repliesOn ? (repliesFade ? ease01(bt.value / 0.6) : 1) : 0,
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the claim nobody answers ────────────────────────────────────────── */}
      <Animated.View style={[styles.board, claimStyle]} pointerEvents="none">
        <Text style={styles.boardTag}>THE CLAIM</Text>
        <Text style={styles.boardText}>THE BUDGET ADDS UP</Text>
      </Animated.View>
      <Animated.View style={[styles.post, styles.postL, claimStyle]} pointerEvents="none" />
      <Animated.View style={[styles.post, styles.postR, claimStyle]} pointerEvents="none" />

      {/* dodge one: thrown at the man */}
      <Animated.View style={[styles.tag, styles.smear, smearStyle]} pointerEvents="none">
        <Text style={styles.tagText}>HE FAILED{'\n'}MATHS</Text>
      </Animated.View>

      {/* dodge two: a flimsy copy, and then it is on the floor */}
      <Animated.View style={[styles.tag, styles.strawTag, strawStyle]} pointerEvents="none">
        <Text style={styles.tagText}>“NOBODY{'\n'}SHOULD PAY{'\n'}FOR ANYTHING”</Text>
      </Animated.View>

      {/* ── Q1: which reply goes at the man? ────────────────────────────────── */}
      {repliesOn &&
        REPLIES.map((r, k) => {
          const chosen = picked === r.id;
          return (
            <Animated.View key={r.id} style={[styles.replySlot, { top: REPLY_T + k * REPLY_GAP }, replyStyle]}>
              <Target id={r.id} correct={r.correct} picked={picked} onPick={onPick}
              hitSlop={{ top: REPLY_SLOP, bottom: REPLY_SLOP, left: REPLY_SLOP, right: REPLY_SLOP }} disabled={answered}>
                <View
                  style={[
                    styles.reply,
                    answered && r.correct && styles.replyRight,
                    answered && chosen && !r.correct && styles.replyWrong,
                  ]}
                >
                  <Text style={[styles.replyText, answered && r.correct && styles.replyTextOn]}>
                    {r.text}
                  </Text>
                </View>
              </Target>
            </Animated.View>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={AF} k={K_FIG} />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 20, top: GROUND, height: 1.5, backgroundColor: RULE },

  // The claim is the only thing on stage with a heavy border and legs under it —
  // it is a board that has been PUT UP, so knocking it over would be visible.
  board: {
    position: 'absolute', left: BOARD_L, top: BOARD_T, width: BOARD_W, height: BOARD_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  boardTag: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.6, color: SOFT,
    marginBottom: 3, includeFontPadding: false,
  },
  boardText: {
    fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  post: { position: 'absolute', top: BOARD_T + BOARD_H - 2, width: 2.5, height: 22, backgroundColor: SOFT },
  postL: { left: BOARD_L + 26 },
  postR: { left: BOARD_L + BOARD_W - 29 },

  // Both dodges are drawn as flimsy tags — thin border, no legs — so they never
  // look like the board. The straw one tips; the smear just hangs there.
  tag: {
    position: 'absolute', borderWidth: 1.5, borderColor: SOFT, borderRadius: 3,
    backgroundColor: PAPER, paddingVertical: 5, paddingHorizontal: 6, alignItems: 'center',
  },
  smear: { left: SMEAR_L, top: SMEAR_T, width: SMEAR_W },
  strawTag: { left: STRAW_L, top: STRAW_T, width: STRAW_W },
  tagText: {
    fontFamily: 'Inter_500Medium', fontSize: 9.5, lineHeight: 12.5, letterSpacing: 0.4,
    color: SOFT, textAlign: 'center', includeFontPadding: false,
  },

  replySlot: { position: 'absolute', left: REPLY_L, width: REPLY_W },
  reply: {
    height: REPLY_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  replyRight: { backgroundColor: INK, borderColor: INK },
  replyWrong: { borderColor: SOFT, opacity: 0.45 },
  replyText: {
    fontFamily: 'Inter_500Medium', fontSize: 11.5, color: INK, includeFontPadding: false,
  },
  replyTextOn: { color: PAPER, fontFamily: 'Inter_700Bold',
    includeFontPadding: false,
  },
});

// Art runs from the claim board (226) to the ground line (500). The dodger walks in
// from x 420, which is off the 400-wide stage and therefore outside the crop — that
// is the point of parking him there, and it costs the band nothing.
export function Logic9Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic9Scene} band={[200, 512]} />;
}
