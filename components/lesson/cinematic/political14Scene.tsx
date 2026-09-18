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
import { BEATS } from './political14Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('political-philosophy');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// THE WILT CHAMBERLAIN CASE AS THREE STAGES, and the answer targets are the stages —
// the reader answers by pointing at a MOMENT in a process rather than at a claim
// (E33). Laying the story out as three rows is what makes Nozick's move visible: you
// cannot object to a start you chose or to a result that is only where the trades
// led, so the middle row is the only thing left to reach into (H64).
//
// · three rows 288 × 44 at x 96, tops y 300 / 356 / 412. Inside each: its name in the
//   left 74, then the art from rel x 82 to rel x 280.
// · THE START is fourteen equal bars 8 wide on a 14 pitch. THE RESULT is the same
//   fourteen with thirteen cut to a stub and the last one tall — the same bars, so
//   the row reads as the first one after the trades rather than as a new chart (A1).
// · THE TRADES is six coins on one conveyor across the art, 190 units at an even
//   31.7 spacing, fading in at the left and out at the right, and running off the
//   monotonic clock so tapping through a beat never restarts them (H67).
// · a correct pick fills its row INK and turns its bars PAPER, which is how a target
//   this big keeps the standard answer state (H61).
// · the figure is at x 46 facing right; measured across its poses it reaches x 85,
//   eleven clear of the rows.

const ROW_L = 96;
const ROW_W = 288;
const ROW_H = 44;
const ROW_T = [300, 356, 412];

const ART_L = 82;
const ART_W = 198;
const BAR_N = 14;
const BAR_W = 8;
const BAR_PITCH = 14;
const COIN_N = 6;
// ONE BELT, NOT SIX LOOPS. Each coin used to wrap on its own 40-unit loop from a slot
// 34 apart, so the last one ran 12 units past the row's right border and each one
// snapped back 40 units in a frame, landing on its neighbour. On one shared span the
// spacing never changes, and a coin fades in and out at the ends instead of jumping.
const COIN_SPAN = 190;             // art rel x 82 … 280, less a coin's 8
const COIN_FADE = 14;

const FIG_X = 46;

// ── the two tap events (group AH) ───────────────────────────────────────────
//
// CONSENT — a bracket at each end of the trades row, marking the whole exchange
// as chosen (beat 2): the spectator's payment on the left, the star's choice on
// the right.
const CONSENT_L = ROW_L + ART_L - 10;
const CONSENT_R = ROW_L + ART_L + ART_W - 4;
const CONSENT_T = ROW_T[1] + 6;
const CONSENT_H = ROW_H - 12;

// QUERY — the open question settling below the three rows (beat 5), favouring
// none of them.
const QUERY_CX = ROW_L + ROW_W / 2;
const QUERY_T = ROW_T[2] + ROW_H + 8;

const STAGES = [
  { id: 'start', label: 'THE START', correct: false },
  { id: 'trades', label: 'THE TRADES', correct: true },
  { id: 'result', label: 'THE RESULT', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const ROWS = BEATS.map((b) => b.rows ?? 0);
// The two tap events (group AH) — each turns on and off within the run, so
// each is carried rather than switched (C20c).
const CONSENTV = BEATS.map((b) => ((b.consent ?? 0) > 0 ? 1 : 0));
const QUERYV = BEATS.map((b) => ((b.query ?? 0) > 0 ? 1 : 0));

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political14'));

// R7c — the stage follows the sort on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// WHICH STAGE OF THE STORY EACH CONCLUSION IS ABOUT, one table per row that ever
// rises, in the SORT'S OWN ORDER (never the shuffled bin order — see
// SceneApi.pickPos):
// stars are overpaid · equality is required · patterns stop exchange.
//   · "star athletes are paid far too much" is about THE RESULT, whose one tall
//     bar is the star's quarter of a million;
//   · "keeping any pattern requires stopping free exchanges" is about THE TRADES,
//     the free exchanges themselves.
//   · "only equal shares are fair" would point at THE START's equal bars — but it
//     is the middle bin, where the chip rests before the reader has moved it, so
//     raising a row there would point before the reader did (aesthetics11 has the
//     same constraint). It moves nothing.
// A raised row is only ever "this is the stage that answer is about", never a
// verdict: one right and one wrong conclusion both raise theirs.
const TRADES_AT = [0, 0, 1];
const RESULT_AT = [1, 0, 0];

export default function Political14Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(5);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // ── the two tap events (group AH) ──────────────────────────────────────────
  const consentFade = ((cur.consent ?? 0) > 0) !== ((prev?.consent ?? 0) > 0);
  const queryFade = ((cur.query ?? 0) > 0) !== ((prev?.query ?? 0) > 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 1.0);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      rows: carry(cv, 0, n, ROWS[p], ROWS[n], grow),
      coins: (t * 26) % COIN_SPAN,
      // R7c — how far each row is raised, per stage (TRADES_AT / RESULT_AT).
      // THE START has no table: nothing ever raises it.
      lifts: [
        0,
        carry(cv, 1, n, 0, reacting ? pickAt(TRADES_AT, pickPos.value) : 0, tr),
        carry(cv, 2, n, 0, reacting ? pickAt(RESULT_AT, pickPos.value) : 0, tr),
      ],
      // The two tap events (group AH) — each turns on and off within the run,
      // so each is carried rather than switched (C20c).
      consent: carry(cv, 3, n, CONSENTV[p], CONSENTV[n], consentFade ? grow : 1),
      query: carry(cv, 4, n, QUERYV[p], QUERYV[n], queryFade ? grow : 1),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const consentStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.consent }));
  const queryStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.query }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {STAGES.map((s, k) => (
        <Stage
          key={s.id}
          k={k}
          SCENE={SCENE}
          live={live}
          answered={answered}
          picked={picked}
          onPick={onPick}
        />
      ))}

      {/* CONSENT — a bracket at each end of the trades row: the payment and the choice to play, both freely made (beat 2). */}
      <Animated.View style={[styles.consentMark, { left: CONSENT_L, top: CONSENT_T, height: CONSENT_H }, consentStyle]} pointerEvents="none">
        <Text style={styles.consentText}>[</Text>
      </Animated.View>
      <Animated.View style={[styles.consentMark, { left: CONSENT_R, top: CONSENT_T, height: CONSENT_H }, consentStyle]} pointerEvents="none">
        <Text style={styles.consentText}>]</Text>
      </Animated.View>

      {/* QUERY — the open question below the three rows, favouring none of them (beat 5). */}
      <Animated.View style={[styles.queryWrap, { left: QUERY_CX - 20, top: QUERY_T }, queryStyle]} pointerEvents="none">
        <Text style={styles.queryText}>?</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One stage of the story. */
function Stage({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { rows: number; coins: number; lifts: number[] } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const s = STAGES[k];
  const on = answered && s.correct;

  const wrap = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.rows - k);
    // R7c — the row the reader's chip is on rises 5 and comes forward 3%: into the
    // 12-unit gap above it, and 4 units sideways, still clear of the figure at 85.
    const up = SCENE.value.lifts[k];
    return { opacity: a, transform: [{ translateY: (1 - a) * 8 - 5 * up }, { scale: 1 + 0.03 * up }] };
  });

  return (
    <Animated.View style={[styles.row, { top: ROW_T[k] }, wrap]}>
      <Target id={s.id} correct={s.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View
          style={[
            styles.rowInner,
            on && styles.pickRight,
            answered && picked === s.id && !s.correct && styles.pickWrong,
          ]}
        >
          <Text style={[styles.name, on && styles.onInk]} numberOfLines={1}>{s.label}</Text>

          {k !== 1
            ? Array.from({ length: BAR_N }, (_, j) => {
                // THE RESULT is the START's own bars after the trades: thirteen cut
                // to a stub, the last one tall.
                const h = k === 0 ? 20 : j === BAR_N - 1 ? 26 : 5;
                return (
                  <View
                    key={j}
                    style={[
                      styles.bar,
                      on && styles.barOnInk,
                      { left: ART_L + j * BAR_PITCH, height: h },
                    ]}
                    pointerEvents="none"
                  />
                );
              })
            : Array.from({ length: COIN_N }, (_, j) => (
                <Coin key={j} j={j} onInk={on} SCENE={SCENE} />
              ))}
        </View>
      </Target>
    </Animated.View>
  );
}

/** One dollar, on its way across. */
function Coin({ j, onInk, SCENE }: { j: number; onInk: boolean; SCENE: { value: { coins: number } } }) {
  const st = useAnimatedStyle(() => {
    const x = (j * COIN_SPAN / COIN_N + SCENE.value.coins) % COIN_SPAN;
    return {
      opacity: Math.max(0, Math.min(1, x / COIN_FADE, (COIN_SPAN - x) / COIN_FADE)),
      transform: [{ translateX: x }],
    };
  });
  return (
    <Animated.View style={[styles.coinSlot, { left: ART_L }, st]} pointerEvents="none">
      <View style={[styles.coin, onInk && styles.coinOnInk]} />
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

  row: { position: 'absolute', left: ROW_L, width: ROW_W, height: ROW_H },
  rowInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE, boxShadow: LIP,
  },
  name: {
    position: 'absolute', left: 10, top: 17, width: 70,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  bar: { position: 'absolute', bottom: 8, width: BAR_W, backgroundColor: INK },
  barOnInk: { backgroundColor: PAPER },
  coinSlot: { position: 'absolute', top: 17, width: 8, height: 8 },
  coin: { width: 8, height: 8, borderRadius: 4, backgroundColor: INK },
  coinOnInk: { backgroundColor: PAPER },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },

  // ── the two tap events (group AH) ────────────────────────────────────────
  //
  // CONSENT — a bracket at each end of the belt, marking the whole exchange as
  // chosen. No fill: it is a mark, not an object.
  consentMark: { position: 'absolute', width: 10, alignItems: 'center', justifyContent: 'center' },
  consentText: { fontFamily: 'Inter_700Bold', fontSize: 20, color: INK, includeFontPadding: false },

  // QUERY — the open question, a bare mark rather than a caption.
  queryWrap: { position: 'absolute', width: 40, alignItems: 'center' },
  queryText: { fontFamily: 'Inter_700Bold', fontSize: 20, color: INK, includeFontPadding: false },
});

// Ink runs from the first row (300) to the ground line (500). Band 294…512 = 218 (H59).
export function Political14Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political14Scene} band={[294, 512]} camera={CAM} />;
}
