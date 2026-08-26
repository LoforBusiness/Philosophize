import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, lerp, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics31Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A PLAYHEAD THAT RUNS THE MELODY — the first thing in the app that plays in time —
// and three answer targets that are three PARTS of one picture: the notes, the
// strings, and the player standing on a plate (E33). Their inners carry the ordinary
// answer state, so a correct pick still looks like every other one (H61).
//
// · the figure is at x 70 facing right. `emoteHold(40)` puts its working fist at
//   local (30, −40), i.e. stage (100, 426) with the pelvis at 466 — so the strings
//   are hung OFF THE POSE'S HAND rather than placed and hoped for (C22d).
// · the instrument is a target box x 76…154, y 308…452: a two-line label at the top,
//   then four strings at x 90 / 102 / 114 / 126 running y 348…446. When three go,
//   the one that stays is x 102, the one the hand is on.
// · the melody is a target box x 166…370, y 308…376: nine notes 14 wide on a contour
//   inside x 172…364, y 314…354, then its label at y 356…374. The playhead sweeps
//   that same span.
// · the applause meter is two bars at x 196…240 and x 268…312 growing UP off y 470,
//   to y 436 and y 394 — the taller one clears the melody box by 18.
// · the player's plate is x 22…118, y 466…498, centred under the figure and clear of
//   the instrument box by a hair under twenty.
//
// The bars are the only thing in the picture that ever changes between the two
// performances, which is the argument stated without a sentence (H64).

const FIG_X = 70;

const INST = { left: 76, top: 308, width: 78, height: 144 };
const STRING_X = [90, 102, 114, 126];
const STRING_KEEP = 1;              // the one under the hand
const STRING_T = 348;
const STRING_H = 98;

const MEL = { left: 166, top: 308, width: 204, height: 68 };
const NOTE_X0 = 172;
const NOTE_W = 14;
const NOTE_PITCH = 22;
const NOTE_H = 9;
const NOTE_TOP = 314;
// A contour, so the row reads as a phrase and not a barcode.
const NOTE_Y = [24, 16, 20, 8, 12, 4, 14, 22, 10];
const HEAD_SPAN = NOTE_PITCH * 8 + NOTE_W;      // 190

const CLAP_BASE = 470;
const CLAP = [
  { left: 196, h: 34, label: '4 STRINGS' },
  { left: 268, h: 76, label: '1 STRING' },
];

const PLATE = { left: 22, top: 466, width: 96, height: 32 };

const G = BEATS.map((b) => b.g ?? 0);
const STR = BEATS.map((b) => b.strings ?? 4);
const PLAY = BEATS.map((b) => b.playing ?? 0);
const CA = BEATS.map((b) => b.clapA ?? 0);
const CB = BEATS.map((b) => b.clapB ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.field ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics31'));

export default function Aesthetics31Scene({ clock, bt, bi, i, picked, onPick, dragPos, dragPos2 }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      // The playhead rides the MONOTONIC clock, not the beat clock, so tapping
      // through a beat never restarts the phrase mid-bar.
      play: (t * 0.385) % 1,
      playing: carry(cv, 0, n, PLAY[p], PLAY[n], grow),
      // R7c — the pad's x axis is how hard it is to play, and the instrument is what
      // makes it hard: strings drop away as the reader moves the token right.
      strings: carry(cv, 1, n, STR[p], reacting ? 4 - dragPos.value * 3 : STR[n], grow),
      clapA: carry(cv, 2, n, CA[p], CA[n], grow),
      clapB: carry(cv, 3, n, CB[p], CB[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const headStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.playing * 0.85,
    transform: [{ translateX: SCENE.value.play * HEAD_SPAN }],
  }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const wrong = (id: string) => answered && picked === id;

  return (
    <Animated.View style={styles.scene}>
      {/* the instrument */}
      <Target id={'hard'} correct={false} picked={picked} onPick={onPick}
              style={styles.inst} disabled={!live || answered}>
        <View style={[styles.instInner, wrong('hard') && styles.pickWrong]}>
          <Text style={styles.instText} numberOfLines={2}>THE{'\n'}DIFFICULTY</Text>
        </View>
      </Target>
      {STRING_X.map((x, k) => (
        <Strand key={x} index={k} left={x} SCENE={SCENE} />
      ))}

      {/* the melody, and the head that runs it */}
      <Target id={'music'} correct={false} picked={picked} onPick={onPick}
              style={styles.mel} disabled={!live || answered}>
        <View style={[styles.melInner, wrong('music') && styles.pickWrong]}>
          <Text style={styles.melText} numberOfLines={1}>THE MUSIC</Text>
        </View>
      </Target>
      {NOTE_Y.map((y, j) => (
        <Note key={j} j={j} top={NOTE_TOP + y} SCENE={SCENE} />
      ))}
      <Animated.View style={[styles.head, headStyle]} pointerEvents="none" />

      {/* the applause */}
      <Text style={styles.clapKick} numberOfLines={1}>APPLAUSE</Text>
      {CLAP.map((c, k) => (
        <Bar key={c.label} index={k} left={c.left} h={c.h} SCENE={SCENE} />
      ))}
      {CLAP.map((c) => (
        <Text key={c.label} style={[styles.clapLabel, { left: c.left - 6 }]} numberOfLines={1}>
          {c.label}
        </Text>
      ))}

      {/* the player */}
      <Target id={'player'} correct={true} picked={picked} onPick={onPick}
              style={styles.plate} disabled={!live || answered}>
        <View style={[styles.plateInner, answered && styles.pickRight]}>
          <Text style={[styles.plateText, answered && styles.onInk]} numberOfLines={1}>
            THE PLAYER
          </Text>
        </View>
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One string. Three of the four fade out and stay gone (C20c). */
function Strand({
  index, left, SCENE,
}: { index: number; left: number; SCENE: { value: { strings: number } } }) {
  const st = useAnimatedStyle(() => ({
    opacity: index === STRING_KEEP ? 1 : clamp01((SCENE.value.strings - 1) / 3),
  }));
  return <Animated.View style={[styles.strand, { left }, st]} pointerEvents="none" />;
}

/** One note. Lights only while the head is over it — a travelling spotlight, so the
 *  phrase never has to reset a row of lit notes in one frame. */
function Note({
  j, top, SCENE,
}: { j: number; top: number; SCENE: { value: { play: number; playing: number } } }) {
  const lit = useAnimatedStyle(() => {
    const centre = (j * NOTE_PITCH + NOTE_W / 2) / HEAD_SPAN;
    return { opacity: Math.max(0, 1 - Math.abs(SCENE.value.play - centre) * 14) * SCENE.value.playing };
  });
  return (
    <View style={[styles.note, { left: NOTE_X0 + j * NOTE_PITCH, top }]} pointerEvents="none">
      <Animated.View style={[styles.noteLit, lit]} />
    </View>
  );
}

/** One ovation. Grows off its baseline, never off its centre. */
function Bar({
  index, left, h, SCENE,
}: { index: number; left: number; h: number; SCENE: { value: { clapA: number; clapB: number } } }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ scaleY: index === 0 ? SCENE.value.clapA : SCENE.value.clapB }],
  }));
  return (
    <Animated.View
      style={[styles.clapBar, { left, top: CLAP_BASE - h, height: h }, st]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  inst: { position: 'absolute', ...INST },
  instInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', paddingTop: 8,
  },
  instText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10.5, letterSpacing: 0.3, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  strand: { position: 'absolute', top: STRING_T, width: 3, height: STRING_H, backgroundColor: INK },

  mel: { position: 'absolute', ...MEL },
  melInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    justifyContent: 'flex-end', paddingBottom: 5,
  },
  melText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  note: {
    position: 'absolute', width: NOTE_W, height: NOTE_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  noteLit: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: INK },
  head: { position: 'absolute', left: NOTE_X0, top: 310, width: 2, height: 44, backgroundColor: INK },

  clapKick: {
    position: 'absolute', left: 190, top: 378, width: 128,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },
  clapBar: { position: 'absolute', width: 44, backgroundColor: INK, transformOrigin: '50% 100%' },
  clapLabel: {
    position: 'absolute', top: 476, width: 56,
    fontFamily: 'Inter_500Medium', fontSize: 8.6, letterSpacing: 0.6, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  plate: { position: 'absolute', ...PLATE },
  plateInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the two target boxes (308) to the ground line (500). Band 302…512 = 210 (H59).
export function Aesthetics31Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics31Scene} band={[302, 512]} camera={CAM} />;
}
