import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  ease01, lerp, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics12Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// A STREAM THAT NEVER STOPS, and a box drawn for its owner that stays empty all
// lesson. Hume's result is nowhere asserted — it is just the fact that nothing ever
// turns up in that box (H64). The answer targets are the stream, the empty box, and
// the overreach (E33).
//
// · the stream is x 106…390, y 322…388. Eight tiles 34 wide on a 44 pitch scroll
//   left inside it at 17 units/s, wrapping on a 352-unit span so the row never runs
//   out; the box clips them (overflow hidden). Its own label sits at y 366…384.
// · the owner's box is x 176…304, y 402…462 — its label at the top and nothing
//   underneath, which is the whole content of the shape.
// · the overreach plate is x 244…390, y 470…500, resting on the ground line.
// · the figure is at x 46 facing right; measured across its poses it reaches x 85,
//   twenty-one clear of the stream and ninety-one clear of the owner's box.
//
// The scroll rides the MONOTONIC clock, so tapping through a beat never restarts it
// — a stream that jumps back to the start on every tap is not a stream (H67).

const STR_L = 106;
const STR_W = 284;
const STR_T = 322;
const STR_H = 66;

const TILE_W = 34;
const TILE_PITCH = 44;
const TILE_N = 8;
const SPAN = TILE_N * TILE_PITCH;          // 352 — wider than the box plus a tile
const SPEED = 17;

const OWN = { left: 176, top: 402, width: 128, height: 60 };
const NONE = { left: 244, top: 470, width: 146, height: 30 };

const FIG_X = 46;

const G = BEATS.map((b) => b.g ?? 0);
const OWNER = BEATS.map((b) => b.owner ?? 0);
const NONES = BEATS.map((b) => b.none ?? 0);
// ── group AH: give the still taps their own events ─────────────────────────
const ASK = BEATS.map((b) => (b.ask ? 1 : 0));
const ANCHOR = BEATS.map((b) => (b.anchor ? 1 : 0));
const SEARCH = BEATS.map((b) => (b.search ? 1 : 0));
const STAY_EMPTY = BEATS.map((b) => (b.stayEmpty ? 1 : 0));

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
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics12'));

export default function Metaphysics12Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(6);
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      flow: (t * SPEED) % SPAN,
      // R7b — the knob draws the owner's box. Drag toward ONE UNCHANGING SOUL and a
      // container appears behind the stream of experiences; drag back and it goes,
      // leaving the stream to run with nobody holding it.
      owner: carry(cv, 0, n, OWNER[p], reacting ? dragPos.value : OWNER[n], grow),
      none: carry(cv, 1, n, NONES[p], NONES[n], grow),
      // "whether a self exists... as the one who has the experiences" — the open
      // question, hovering where the owner's box will appear.
      ask: carry(cv, 2, n, ASK[p], ASK[n], grow),
      // "persists while its particular thoughts come and go" — the box's own label
      // gets a rule under it, an anchor against the stream that keeps changing.
      anchor: carry(cv, 3, n, ANCHOR[p], ANCHOR[n], grow),
      // "searched... each time... found only a particular perception, never a
      // self" — a dashed arrow drops toward the box, never landing inside it.
      search: carry(cv, 4, n, SEARCH[p], SEARCH[n], grow),
      // "the place for an owner stays empty" — a dashed ring states it outright.
      stayEmpty: carry(cv, 5, n, STAY_EMPTY[p], STAY_EMPTY[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const ownStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.owner,
    transform: [{ translateY: (1 - SCENE.value.owner) * 8 }],
  }));
  const noneStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.none,
    transform: [{ translateY: (1 - SCENE.value.none) * 8 }],
  }));
  // ── group AH: the still taps' own events ───────────────────────────────────
  const askStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ask }));
  const anchorStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.anchor }));
  const searchStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.search }));
  const stayEmptyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stayEmpty }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const wrong = (id: string) => answered && picked === id;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* the perceptions, running */}
      <Target id={'stream'} correct={true} picked={picked} onPick={onPick}
              style={styles.stream} disabled={!live || answered}>
        <View style={[styles.streamInner, answered && styles.pickRight]}>
          {Array.from({ length: TILE_N }, (_, k) => (
            <Tile key={k} k={k} onInk={answered} SCENE={SCENE} />
          ))}
          <Text
            style={[styles.streamText, answered && styles.onInk]}
            numberOfLines={1}
          >
            THE STREAM ITSELF
          </Text>
        </View>
      </Target>

      {/* the box drawn for whoever is having them */}
      <Animated.View style={[styles.own, ownStyle]}>
        <Target id={'owner'} correct={false} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
          <View style={[styles.ownInner, wrong('owner') && styles.pickWrong]}>
            <Text style={styles.ownText} numberOfLines={1}>THE OWNER</Text>
          </View>
        </Target>
      </Animated.View>

      {/* the open question, before the box exists to hold anyone */}
      <Animated.View style={[styles.askWrap, askStyle]} pointerEvents="none">
        <Text style={styles.ask}>?</Text>
      </Animated.View>

      {/* the substance that persists, underlined against the changing stream */}
      <Animated.View style={[styles.anchorRule, anchorStyle]} pointerEvents="none" />

      {/* Hume searching — a mark that drops toward the box and never lands inside it */}
      <Animated.View style={[styles.searchArrow, searchStyle]} pointerEvents="none">
        <Text style={styles.searchText}>↓</Text>
      </Animated.View>

      {/* the emptiness, stated outright */}
      <Animated.View style={[styles.stayEmptyRing, stayEmptyStyle]} pointerEvents="none" />

      {/* the overreach */}
      <Animated.View style={[styles.none, noneStyle]}>
        <Target id={'nothing'} correct={false} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
          <View style={[styles.noneInner, wrong('nothing') && styles.pickWrong]}>
            <Text style={styles.ownText} numberOfLines={1}>NOTHING AT ALL</Text>
          </View>
        </Target>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One perception, drifting through. Wraps on SPAN so the row is endless. */
function Tile({ k, onInk, SCENE }: { k: number; onInk: boolean; SCENE: { value: { flow: number } } }) {
  const st = useAnimatedStyle(() => {
    const x = ((k * TILE_PITCH - SCENE.value.flow) % SPAN + SPAN) % SPAN;
    return { transform: [{ translateX: x - TILE_W }] };
  });
  return (
    <Animated.View style={[styles.tile, onInk && styles.tileOnInk, st]} pointerEvents="none">
      <View style={[styles.dot, onInk && styles.dotOnInk, { left: 7, top: 8 }]} />
      <View style={[styles.dot, onInk && styles.dotOnInk, { left: 20, top: 14 }]} />
      <View style={[styles.dot, onInk && styles.dotOnInk, { left: 13, top: 21 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),
  fill: { flex: 1 },

  stream: { position: 'absolute', left: STR_L, top: STR_T, width: STR_W, height: STR_H },
  streamInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    overflow: 'hidden',
  },
  tile: {
    position: 'absolute', left: 0, top: 6, width: TILE_W, height: 34,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  tileOnInk: { borderColor: PAPER, backgroundColor: INK },
  dot: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: INK },
  dotOnInk: { backgroundColor: PAPER },
  streamText: {
    position: 'absolute', left: 0, right: 0, top: 46,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  own: { position: 'absolute', ...OWN },
  // Empty by design: the label at the top and clear paper below it is the argument.
  ownInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', paddingTop: 7,
  },
  ownText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  none: { position: 'absolute', ...NONE },
  noneInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },

  // ── group AH: the still taps' own events ───────────────────────────────────
  // The open question, hovering in the owner box's own footprint before the box
  // itself exists to stay empty.
  askWrap: { position: 'absolute', left: 220, top: 412, width: 40, alignItems: 'center' },
  ask: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: INK, includeFontPadding: false },
  // A rule under THE OWNER label — the one still mark on a stage that otherwise
  // keeps scrolling.
  anchorRule: { position: 'absolute', left: 196, top: 421, width: 88, height: 1.5, backgroundColor: SHADE },
  // A downward mark in the gap between the stream and the box — a search that
  // stops short of the box's own clear interior (H64: nothing may fill it).
  searchArrow: {
    position: 'absolute', left: 233, top: 389, width: 14, alignItems: 'center',
  },
  searchText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: SOFT, includeFontPadding: false },
  // Dashed, the app's own "a place reserved" grammar (Plato's frame, §17) — round
  // the box that this beat says stays empty.
  stayEmptyRing: {
    position: 'absolute', left: 172, top: 398, width: 136, height: 68,
    borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 6,
  },
});

// Ink runs from the stream (322) to the ground line (500). Band 316…512 = 196 (H59).
export function Metaphysics12Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics12Scene} band={[316, 512]} camera={CAM} />;
}
