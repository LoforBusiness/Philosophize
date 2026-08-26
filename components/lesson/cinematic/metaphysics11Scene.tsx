import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, headAt, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics11Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// Two men on two low stands, each stand carrying a name, and a plate reading
// MEMORIES hanging over one head on a short leader line. The plate travels from
// the prince's head to the cobbler's, and then the two NAMES cross the floor and
// trade stands. The bodies never move: that is the whole argument.
//
// COMPOSITION / OCCLUSION —
//   · both men stand on their stands, so their feet are at y = 454, not on the
//     ground line at 500. A standing crown is therefore y ≈ 351 (measured 348 …
//     358 across the poses this lesson holds) and the head centre y ≈ 371.
//   · the PRINCE is fixed at x = 110 facing right. Measured across every pose this
//     lesson holds, and across each one's live overlay, his span is x 78 … 142.
//   · the COBBLER walks in from x = 440 — well off the 400-wide stage, so he is
//     at full opacity before any of him is visible (C20b) — and stops at x = 290
//     facing left. His measured span is x 256 … 322.
//   · so at their closest the two bodies leave 115 units of clear paper between
//     them, on marks 180 apart: comfortably past the ~100 at which two heads read
//     as one mass on a phone (B9). Spans are measured off the rig at the poses the
//     beats actually hold, not off the nominal ±36 (B9a).
//   · the two STANDS are x 44 … 176 and x 224 … 356, y 454 … 500. Each figure's
//     span sits inside its own stand's width, so nobody straddles the gap. Both
//     are on the floor from the first beat — the right one simply stands empty
//     until the cobbler walks onto it, and only his NAME is written up on arrival.
//   · the names sit at y 469 … 485, mid-stand. The lowest ink either figure draws
//     is an ankle dot reaching y 459.5, which stops 9.5 clear of them (D31).
//   · the MEMORIES plate is 96 × 26 with a 14-unit leader down to the crown, so
//     its top edge rides at y ≈ 311, and 279 at the top of its travel arc (that
//     is the measured worst case over every pose and every frame of the arc). It
//     is the highest thing the scene ever draws — hence band [268, 510].
//
// DELIBERATE, so a later audit does not "fix" them (A5) —
//   · NEITHER FIGURE MOVES after the cobbler walks on. That is the lesson: the
//     bodies stay exactly where they are while the identity crosses the stage. A
//     walk here would be under 60 units and is banned anyway (C18), so the life
//     comes from the gestures instead (H67).
//   · THE MEN STAND ON THE NAME PLATES. D24 bans a wide slab the figure stands
//     INSIDE; this is the other case — a plinth they stand ON TOP of. Their
//     lowest ink is an ankle dot at y 459.5, which crosses the plate's top edge
//     by 5.5 exactly as a foot resting on a surface does, and still stops 9.5
//     clear of the name. The plate has to be 46 units tall to be a legal touch
//     target (E37b-2): a name strip painted on the floor would have been about
//     12 units, i.e. 10dp, and untappable.

const PLINTH_H = 46;
const PLINTH_W = 132;
const PLINTH_T = GROUND - PLINTH_H;         // 454 — the surface both men stand on
const PRI_X = 110;
const COB_X = 290;
// TOUCH TARGET ARITHMETIC (E37b-2). The band below is 242 units, so on a 360dp
// phone the stage is width-limited and fit ≈ 0.88dp per design unit. Each stand is
// then 116 × 40dp, and the PITCH — the number that decides whether a fingertip can
// tell them apart — is 180 units = 158dp, against the ~45dp a fingertip covers.
// The slop is exactly half the 48-unit gutter, so the two hit areas meet and never
// overlap; any more and the topmost would silently win.
const PITCH = COB_X - PRI_X;                // 180
const SLOP = (PITCH - PLINTH_W) / 2;        // 24
const SLOP_BOX = { top: SLOP, bottom: SLOP, left: SLOP, right: SLOP };

const NAME_H = 16;
const NAME_T = PLINTH_T + (PLINTH_H - NAME_H) / 2;   // 469
/** How far the two names part vertically as they cross, so they never overlap. */
const NAME_SEP = 13;

const TOK_W = 96;
const TOK_H = 26;
const LEADER = 14;                          // plate → crown
const ARC = 26;                             // how high the plate rides mid-flight
// Rig landmarks, in rig units (B10): the pelvis stands 34 above the feet and the
// head is a disc of radius 20. Everything pinned to a figure is derived from these
// rather than hand-placed, or it rots the moment a pose changes the head's height.
const PELVIS_UP = 34;
const HEAD_R = 20;

const NAMES = ['PRINCE', 'COBBLER'];
const SIDES = [
  { id: 'left', cx: PRI_X, correct: false },
  { id: 'right', cx: COB_X, correct: true },   // the cobbler's body — it carries the memories
];

const P = BEATS.map((b) => b.p ?? 0);
const C = BEATS.map((b) => b.c ?? 0);
const CX = BEATS.map((b) => b.cx ?? COB_X);
const CDIR = dirsFrom(CX, -1);
const TOK = BEATS.map((b) => b.tok ?? 0);
const SWAP = BEATS.map((b) => b.swap ?? 0);

/**
 * The crown (top of the head) of a figure in this stance, in stage units — derived
 * from the rig's own landmarks so the plate tracks the head instead of floating
 * above a literal (B10). A leaning or slumping head carries it with them.
 *
 * Declared above the component: a worklet that calls a worklet declared later in
 * the file captures it as undefined and blanks the screen (G47).
 */
function crownOf(tilt: number, neck: number, bob: number, x: number, dir: number) {
  'worklet';
  const h = headAt(tilt, neck);
  return {
    x: x + dir * h.x * K_FIG,
    y: PLINTH_T - (PELVIS_UP + bob) * K_FIG + h.y * K_FIG - HEAD_R * K_FIG,
  };
}

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Beats that do not set `x` stand at PRI_X.
const X = BEATS.map((b) => b.x ?? PRI_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics11'));

export default function Metaphysics11Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldCS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // The cobbler's name is written up only once he is on stage; on every other beat
  // it holds instead of re-revealing itself behind the reader (C20c).
  const twoOn = (cur.cx ?? COB_X) < 380;
  const twoFade = twoOn !== ((prev?.cx ?? COB_X) < 380);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  // Which stand each name is standing on right now — they trade places on the swap
  // beat, which is after the question, so on the question beat this is the identity.
  const swapped = (cur.swap ?? 0) > 0;
  const standOf = (k: number) => (swapped ? 1 - k : k);
  const nameLit = (k: number) => live && answered && SIDES[standOf(k)].correct;
  const nameDim = (k: number) =>
    live && answered && picked === SIDES[standOf(k)].id && !SIDES[standOf(k)].correct;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(CX[p], CX[n], 0.85));
    const t = clock.value;

    // The prince never leaves his stand, so his x is a constant and travelStance
    // simply blends gesture into gesture (C18). His clock is offset from the
    // cobbler's: two figures idling on the same clock breathe, rock and drift on
    // identical frames and read as one puppet (B14).
    const pLive = i > 0 ? emoteLive(P[n], t + 4.3, bt.value) : emoteHold(P[n], t + 4.3);
    const pS = travelStance(
      PRI_X, PRI_X,
      emoteHold(P[p], t + 4.3), emoteHold(P[n], t + 4.3), pLive, tr, WALK, 3,
    );
    const cS = keepHeld(heldCS, travelStance(
      CX[p], CX[n],
      carryFrom(heldCS, n, emoteHold(C[p], t)), emoteHold(C[n], t), emoteLive(C[n], t, bt.value),
      tr, WALK, 1,
    ));
    const cx = carry(cv, 0, n, CX[p], CX[n], tr);
    // He arrives at FULL opacity: the fade is spent in the wing, over the first
    // fifth of a 150-unit walk, so the reader only ever sees a man walking on.
    const walkIn = CX[p] > 380 && CX[n] < 380 ? ease01(clamp01(tr / 0.2)) : (CX[n] < 380 ? 1 : 0);

    // The plate rides the two HEADS, not the two marks (B9b), and takes its own
    // unhurried 1.6s to cross rather than the beat's transition.
    const cr0 = crownOf(pS.tilt, pS.neck, pS.bob, PRI_X, 1);
    const cr1 = crownOf(cS.tilt, cS.neck, cS.bob, cx, CDIR[n]);
    // R7c — the seam is MEMORY's share of the person, and the MEMORIES plate is
    // memory. Slide it right and the plate rides across to whoever woke up with the
    // recollections; slide it left and it stays over the body it started in.
    const uTo = reacting ? dragPos.value : TOK[n];
    const u = TOK[p] === uTo ? uTo : carry(cv, 1, n, TOK[p], uTo, ease01(clamp01(bt.value / 1.6)));

    // The names cross a beat later, and start a touch after the line does, so the
    // reader is looking at the floor by the time they move (C22c).
    const sw = SWAP[p] === SWAP[n]
      ? SWAP[n]
      : carry(cv, 2, n, SWAP[p], SWAP[n], ease01(clamp01((bt.value - 0.2) / 1.5)));
    const part = Math.sin(Math.PI * sw);

    return {
      pri: pose(pS, PRI_X, PLINTH_T, K_FIG, 1, 1),
      cob: pose(cS, cx, PLINTH_T, K_FIG, CDIR[n], walkIn),
      tokX: lerp(cr0.x, cr1.x, u) - TOK_W / 2,
      tokY: lerp(cr0.y, cr1.y, u) - LEADER - TOK_H - ARC * Math.sin(Math.PI * u),
      n0x: lerp(PRI_X, COB_X, sw) - PLINTH_W / 2,
      n0y: NAME_T - NAME_SEP * part,
      n1x: lerp(COB_X, PRI_X, sw) - PLINTH_W / 2,
      n1y: NAME_T + NAME_SEP * part,
      two: (twoOn ? 1 : 0) * (twoFade ? ease01(clamp01((bt.value - 1.1) / 0.8)) : 1),
    };
  });

  const PF = useDerivedValue<Bundle>(() => SCENE.value.pri);
  const CF = useDerivedValue<Bundle>(() => SCENE.value.cob);

  const tokStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: SCENE.value.tokX }, { translateY: SCENE.value.tokY }],
  }));
  const name0Style = useAnimatedStyle(() => ({
    transform: [{ translateX: SCENE.value.n0x }, { translateY: SCENE.value.n0y }],
  }));
  const name1Style = useAnimatedStyle(() => ({
    opacity: SCENE.value.two,
    transform: [{ translateX: SCENE.value.n1x }, { translateY: SCENE.value.n1y }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* ── the two stands: name plates, and on Q2 the answer targets ────────── */}
      {SIDES.map((s) => (
        // box-none so the wrapper never eats a tap meant for the stand under it,
        // and never eats one meant for the body Pressable behind it (E36).
        <View key={s.id} style={[styles.slot, { left: s.cx - PLINTH_W / 2 }]} pointerEvents="box-none">
          <Target id={s.id} correct={s.correct} picked={picked} onPick={onPick}
              style={styles.slotFill} hitSlop={SLOP_BOX} disabled={!live || answered}>
            <View
              style={[
                styles.face,
                live && answered && s.correct && styles.faceRight,
                live && answered && picked === s.id && !s.correct && styles.faceWrong,
              ]}
            />
          </Target>
        </View>
      ))}

      {/* the two names, which are what actually move at the end */}
      <Animated.View style={[styles.namePad, name0Style]} pointerEvents="none">
        <Text style={[styles.nameText, nameLit(0) && styles.nameOn, nameDim(0) && styles.nameOff]}>
          {NAMES[0]}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.namePad, name1Style]} pointerEvents="none">
        <Text style={[styles.nameText, nameLit(1) && styles.nameOn, nameDim(1) && styles.nameOff]}>
          {NAMES[1]}
        </Text>
      </Animated.View>

      {/* ── the consciousness, hung over whichever head is carrying it ───────── */}
      <Animated.View style={[styles.tokWrap, tokStyle]} pointerEvents="none">
        <View style={styles.tokBadge}>
          <Text style={styles.tokText}>MEMORIES</Text>
        </View>
        <View style={styles.tokLeader} pointerEvents="none" />
      </Animated.View>

      <Stickman D={PF} k={K_FIG} />
      <Stickman D={CF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 20, top: GROUND, height: 1.5, backgroundColor: RULE },

  slot: { position: 'absolute', top: PLINTH_T, width: PLINTH_W, height: PLINTH_H },
  slotFill: { width: '100%', height: '100%' },
  face: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  faceRight: { backgroundColor: INK, borderColor: INK },
  faceWrong: { borderColor: SOFT, opacity: 0.45 },

  namePad: {
    position: 'absolute', left: 0, top: 0, width: PLINTH_W, height: NAME_H,
    alignItems: 'center', justifyContent: 'center',
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 1.6, color: INK,
    includeFontPadding: false,
  },
  nameOn: { color: PAPER },
  nameOff: { color: SOFT, opacity: 0.45 },

  tokWrap: { position: 'absolute', left: 0, top: 0, width: TOK_W, alignItems: 'center' },
  tokBadge: {
    width: TOK_W, height: TOK_H, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  tokText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4, color: PAPER,
    includeFontPadding: false,
  },
  tokLeader: { width: 2, height: LEADER, backgroundColor: INK, opacity: 0.55 },
});

// Art runs from the MEMORIES plate at the top of its arc (measured worst case
// y 279, and 268 leaves it a little air) down to the ground line at 500. Nothing
// else is drawn above the crowns at y 351, and the stands stop on the floor — so
// the band is 242 units, inside the ~280 below which a tighter crop buys nothing
// and above which every single thing in the scene renders smaller (H59).
export function Metaphysics11Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics11Scene} band={[268, 510]} camera={CAM} />;
}
