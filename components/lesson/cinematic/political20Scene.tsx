import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political20Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
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

// ─────────────────────────────────────────────────────────────────────────────
// TWO FULL STACKS, THREE CANDIDATES, AND A SHELF WITH ROOM FOR ONE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO STACKS of four 96×22 blocks, at x 30…126 and x 274…370, tops 244 · 270 ·
//   296 · 322. They are drawn at FULL strength from beat one to the last frame
//   and nothing ever dims them — the lesson is that nobody has to give them up.
// · THE MIDDLE COLUMN is 108 wide at x 146…254 and holds the three candidate
//   reasons, 26 tall, at y 244 · 276 · 308, with a 6-unit gap to the shelf.
// · THE SHELF is the same 108 wide at y 340…368, a 2.5-thick rule along its top
//   at y 340 and its caption inside. It holds exactly one block, which is what
//   makes its narrowness an argument rather than a layout accident.
// · the WINNER drops 32 from its slot onto the shelf when `landed` runs, so the
//   reader sees which of the three went in.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, the shelf ends
//   at 368, so 29 units stay clear. The middle column is between the figure's two
//   stops, and the two never share a row.
//
// Ink runs y 232 (the stack captions) … y 500. BAND 226…512 = 286, with the
// 103-unit figure at 36%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const SOUND = BEATS.map((b) => b.sound ?? 0);
const ALWAYS = BEATS.map((b) => b.always ?? 0);
const BINDS = BEATS.map((b) => b.binds ?? 0);
const KEPT = BEATS.map((b) => b.kept ?? 0);
const BASE_TR = 0.85;

const STACK_X = [30, 274];
// 108, NOT 96. "his sense of freedom" overran the block's 81-unit content box, so
// the fourth thing on the liberal's shelf was the one the reader could not read.
// The right stack runs 274…382 and the left 30…138, which still clears the middle
// shelf at x 146.
const STACK_W = 108;
const BLOCK_H = 22;
const STACK_TOP = [244, 270, 296, 322];
const STACK_CAP = ['HER VIEW OF LIFE', 'HIS VIEW OF LIFE'];
const LEFT_BLOCKS = ['the sacred text', 'a duty to family', 'what her elders held', 'her sense of honour'];
const RIGHT_BLOCKS = ['nothing is sacred', 'a duty to himself', 'what he worked out', 'his sense of freedom'];

const MID_X = 146;
const MID_W = 108;
const CAND_TOP = [244, 276, 308];
const CAND_H = 26;
const CAND_ID = ['safety', 'scripture', 'nature'];
const CAND_TEXT = ['IT IS SAFER', 'MY BOOK SAYS SO', 'IT IS UNNATURAL'];

const SHELF_Y = 340;
const SHELF_H = 28;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const STACKS = BEATS.map((b) => b.stacks ?? 0);
const CANDS = BEATS.map((b) => b.cands ?? 0);
const SHELF = BEATS.map((b) => b.shelf ?? 0);
const LANDED = BEATS.map((b) => b.landed ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political20'));

// R7c — LEFT STILL ON PURPOSE: the bins (legal restraint · silence · an open mind) are what
// toleration asks of you, and nothing on this stage shows any of them. The two stacks are
// drawn at full strength by rule, so the only picture a bin could drive, dimming a view, is
// the one the lesson says nobody has to give up.
export default function Political20Scene({ clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(9);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      stacks: carry(cv, 1, n, STACKS[p], STACKS[n], tr),
      cands: carry(cv, 2, n, CANDS[p], CANDS[n], tr),
      shelf: carry(cv, 3, n, SHELF[p], SHELF[n], tr),
      landed: carry(cv, 4, n, LANDED[p], LANDED[n], tr),
      // The four tap events, carried, so each fades out as well as in (group L).
      sound: carry(cv, 5, n, SOUND[p], SOUND[n], tr),
      always: carry(cv, 6, n, ALWAYS[p], ALWAYS[n], tr),
      binds: carry(cv, 7, n, BINDS[p], BINDS[n], tr),
      kept: carry(cv, 8, n, KEPT[p], KEPT[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const stackStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stacks }));
  const shelfStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shelf }));
  const candStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cands }));
  // Only the winner moves, and only downward onto the shelf.
  const winStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (SHELF_Y + 1 - CAND_TOP[0]) * SCENE.value.landed }],
  }));

  const rows = [0, 1, 2, 3];

  // ── the four tap events ────────────────────────────────────────────────────
  //
  // Both neighbours reasoned soundly, and the two badges arrive in turn: the
  // sentence says it of one and then of the other (AH5).
  const sound0Style = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.sound / 0.55) }));
  const sound1Style = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.sound - 0.4) / 0.55) }));
  const soundStyles = [sound0Style, sound1Style];
  // The bracket DRAWS OUT from the middle across both stacks, because what it is
  // claiming is that this holds of the pair.
  const alwaysStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.always,
    transform: [{ scaleX: SCENE.value.always }],
  }));
  const alwaysCapStyle = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.always - 0.5) / 0.5) }));
  const bindsStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.binds,
    transform: [{ translateY: (1 - SCENE.value.binds) * 8 }],
  }));
  // DASHED, and only a boundary: a fill would hide the blocks it is drawn around,
  // and what the beat says is that they stay exactly as they are (AH7).
  const keptStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.kept,
    transform: [{ scale: 0.97 + 0.03 * SCENE.value.kept }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, stackStyle]} pointerEvents="none">
        {STACK_X.map((sx, side) => (
          <View key={`s${sx}`}>
            <Text style={[styles.stackCap, { left: sx }]}>{STACK_CAP[side]}</Text>
            {rows.map((r) => (
              <View key={r} style={[styles.block, { left: sx, top: STACK_TOP[r] }]}>
                <Text style={styles.blockText} numberOfLines={1}>
                  {(side === 0 ? LEFT_BLOCKS : RIGHT_BLOCKS)[r]}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, shelfStyle]} pointerEvents="none">
        <View style={styles.shelfTop} />
        <View style={styles.shelfBox} />
        <Text style={styles.shelfCap}>WHAT BOTH CAN WEIGH</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, candStyle]}>
        {CAND_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={id === 'safety'}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.candHit, { top: CAND_TOP[k] }]}
          >
            <Animated.View style={k === 0 ? winStyle : undefined}>
              <View
                style={[
                  styles.cand,
                  answered && id === 'safety' && styles.candRight,
                  answered && picked === id && id !== 'safety' && styles.candWrong,
                ]}
                pointerEvents="none"
              >
                <Text
                  style={[styles.candText, answered && id === 'safety' && styles.onInk]}
                  numberOfLines={1}
                >
                  {CAND_TEXT[k]}
                </Text>
              </View>
            </Animated.View>
          </Target>
        ))}
      </Animated.View>

      {/* Neither of them reasoned badly. */}
      {STACK_X.map((sx, k) => (
        <Animated.View key={`snd${k}`} style={[styles.soundTag, { left: sx }, soundStyles[k]]} pointerEvents="none">
          <Text style={styles.soundText} numberOfLines={1}>REASONED WELL</Text>
        </Animated.View>
      ))}

      {/* And a free society will always hold both. */}
      <Animated.View style={[styles.alwaysRule, alwaysStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.alwaysCap, alwaysCapStyle]} pointerEvents="none">
        ALWAYS, IN A FREE SOCIETY
      </Animated.Text>

      {/* What a reason has to clear to go on the shelf. */}
      <Animated.View style={[styles.bindsCap, bindsStyle]} pointerEvents="none">
        <Text style={styles.bindsText} numberOfLines={1}>JUSTIFIABLE TO BOTH</Text>
      </Animated.View>

      {/* Neither is asked to give any of it up. */}
      {STACK_X.map((sx, k) => (
        <Animated.View key={`kp${k}`} style={[styles.keptBox, { left: sx - 4 }, keptStyle]} pointerEvents="none" />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  // ── the four tap events (group AH) ─────────────────────────────────────────
  // Under each stack's own column, below its last block at STACK_TOP[3] + BLOCK_H.
  soundTag: {
    position: 'absolute', top: STACK_TOP[3] + BLOCK_H + 6, width: STACK_W, height: 24,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  soundText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.7, color: INK,
    includeFontPadding: false,
  },
  // Across both stacks, a row below the badges, drawn from its own middle.
  alwaysRule: {
    position: 'absolute', left: STACK_X[0], top: STACK_TOP[3] + BLOCK_H + 38,
    width: STACK_X[1] + STACK_W - STACK_X[0], height: 2,
    borderTopWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
    transformOrigin: '50% 50%',
  },
  alwaysCap: {
    position: 'absolute', left: STACK_X[0], top: STACK_TOP[3] + BLOCK_H + 44,
    width: STACK_X[1] + STACK_W - STACK_X[0], textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT,
    includeFontPadding: false,
  },
  // Under the shelf, in the middle column the candidates and the shelf share.
  bindsCap: {
    position: 'absolute', left: MID_X, top: SHELF_Y + SHELF_H + 6, width: MID_W, height: 24,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  bindsText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  keptBox: {
    position: 'absolute', top: STACK_TOP[0] - 6, width: STACK_W + 8,
    height: STACK_TOP[3] + BLOCK_H - STACK_TOP[0] + 12,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 8,
  },

  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  stackCap: {
    position: 'absolute', top: 232, width: STACK_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },
  block: {
    position: 'absolute', width: STACK_W, height: BLOCK_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 2, backgroundColor: STONE, boxShadow: LIP,
    justifyContent: 'center', paddingHorizontal: 6,
  },
  blockText: {
    fontFamily: 'Inter_400Regular', fontSize: 8.6, color: INK, includeFontPadding: false,
  },

  shelfTop: { position: 'absolute', left: MID_X, top: SHELF_Y, width: MID_W, height: 2.5, backgroundColor: INK },
  shelfBox: {
    position: 'absolute', left: MID_X, top: SHELF_Y, width: MID_W, height: SHELF_H,
    backgroundColor: STONE, boxShadow: LIP,
    borderWidth: 1, borderColor: RULE, borderRadius: 2,
  },
  shelfCap: {
    position: 'absolute', left: MID_X, top: SHELF_Y + SHELF_H + 3, width: MID_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT, includeFontPadding: false,
  },

  candHit: { position: 'absolute', left: MID_X, width: MID_W, height: CAND_H },
  cand: {
    width: MID_W, height: CAND_H, borderWidth: 2, borderColor: INK, borderRadius: 8,
    backgroundColor: PLATE_FACE, boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  candRight: { backgroundColor: INK },
  candWrong: { borderColor: SOFT },
  candText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  onInk: { color: PAPER },
});

export function Political20Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political20Scene} band={[226, 512]} camera={CAM} />;
}
