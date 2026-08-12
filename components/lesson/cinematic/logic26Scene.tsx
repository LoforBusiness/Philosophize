import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic26Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A four-link chain of reasoning, stage right; the figure downstage left.
//
// · figure WALKS x = 70 → 168 → 124; widest body span x 132…204 at 168, fist to
//   204.5 at gesture 41. All chain ink is at x ≥ 216.
// · links y 226…364 on a 36 pitch · answer stack y 380…484 on a 36 pitch.
//   A standing crown is y 397; the lower answer cards share that band at an x the
//   figure never occupies.
// · A5 — the chain is out of reach (hand tops out at y 411, B11b); read, not handled.

const CH_L = 216;
const CH_W = 176;

const LINK_T = 226;
const LINK_H = 30;
const LINK_PITCH = 36;

const ANS_T = 380;
const ANS_H = 32;
const ANS_PITCH = 36;
const ANS_SLOP = (ANS_PITCH - ANS_H) / 2;

const LINKS = [
  'ASSUME: N IS THE LARGEST',
  'BUT N + 1 IS A NUMBER',
  'AND N + 1 IS BIGGER THAN N',
  'SO N IS NOT THE LARGEST',
];

const ANSWERS = [
  { id: 'assume', label: 'THE ASSUMPTION', correct: true },
  { id: 'middle', label: 'A MIDDLE STEP', correct: false },
  { id: 'logic', label: 'THE RULES OF LOGIC', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic26'));
const DIR = dirsFrom(X, 1);
const NLINKS = BEATS.map((b) => b.links ?? 0);

export default function Logic26Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const shown = cur.links ?? 0;
  const prevShown = prev?.links ?? 0;
  const snapOn = (cur.snap ?? 0) > 0;
  const snapFade = (cur.snap ?? 0) !== (prev?.snap ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      fill: lerp(NLINKS[p], NLINKS[n], grow),
      snap: snapOn ? (snapFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // The break is drawn ON the assumption and nowhere else. There is no style in
  // this file that can mark a middle link, which is the claim the lesson makes.
  const snapStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.snap }] }));
  const falseTag = useAnimatedStyle(() => ({ opacity: SCENE.value.snap }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {LINKS.map((l, k) => (
        <Link key={l} index={k} label={l} shown={shown} prevShown={prevShown} SCENE={SCENE} />
      ))}

      {/* the break, on the top link */}
      <Animated.View style={[styles.snap, snapStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.falseTag, falseTag]} numberOfLines={1} pointerEvents="none">
        FALSE
      </Animated.Text>

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { top: ANS_T + k * ANS_PITCH }]} hitSlop={{ top: ANS_SLOP, bottom: ANS_SLOP, left: ANS_SLOP, right: ANS_SLOP }} disabled={answered}>
              <View
                style={[
                  styles.ansInner,
                  answered && a.correct && styles.pickRight,
                  answered && chosen && !a.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.ansText, answered && a.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
              </View>
            </Target>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One link. Draws on when its beat adds it, then holds (C20c). */
function Link({
  index, label, shown, prevShown, SCENE,
}: {
  index: number; label: string; shown: number; prevShown: number;
  SCENE: { value: { fill: number } };
}) {
  const held = index < prevShown;
  const arriving = index >= prevShown && index < shown;
  const st = useAnimatedStyle(() => {
    if (held) return { opacity: 1, transform: [{ translateY: 0 }] };
    if (!arriving) return { opacity: 0, transform: [{ translateY: -6 }] };
    const a = Math.max(0, Math.min(1, SCENE.value.fill - index));
    return { opacity: a, transform: [{ translateY: (1 - a) * -6 }] };
  });
  const last = index === 3;
  return (
    <Animated.View
      style={[styles.link, last && styles.linkLast, { top: LINK_T + index * LINK_PITCH }, st]}
      pointerEvents="none"
    >
      <Text style={[styles.linkText, last && styles.linkTextLast]} numberOfLines={1}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  link: {
    position: 'absolute', left: CH_L, width: CH_W, height: LINK_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  linkLast: { backgroundColor: INK, borderColor: INK },
  linkText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  linkTextLast: { color: PAPER },

  snap: {
    position: 'absolute', left: CH_L + 8, top: LINK_T + LINK_H / 2 - 1.25,
    width: CH_W - 16, height: 2.5, backgroundColor: INK, transformOrigin: '0% 50%',
  },
  falseTag: {
    position: 'absolute', left: CH_L, top: LINK_T - 13, width: CH_W, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', left: CH_L, width: CH_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the FALSE tag (213) to the ground line (500). Band 208…512 = 304 (H59).
export function Logic26Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic26Scene} band={[208, 512]} camera={CAM} />;
}
