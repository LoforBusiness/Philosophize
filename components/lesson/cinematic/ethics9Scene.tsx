import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics9Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// Two claims pinned side by side on a board, stage right, with the figure working
// downstage left of them.
//
// COMPOSITION, in coordinates:
// · the figure WALKS x = 70 → 168 → 124. Body span is x ± 36, so its widest is
//   x 132…204 standing at 168; at gesture 41 the working fist reaches x 204.5
//   (168 + 31 + 5.5 fist radius).
// · both notes live at x 220…384, i.e. at least 15 units of clear paper from the
//   furthest thing the figure ever occupies. The figure never covers them and they
//   never cover it.
// · notes y 232…310, the STILL OWED tag y 318…336, the third answer card y 344…380.
//   A standing crown is y 397, so every prop clears the figure vertically as well.
// · pins sit at y 226; band top 218 holds them with 8 units of air.
//
// A5 — DELIBERATE: the notes are well above the figure's reach (its hand tops out
// at y 411, B11b) and it never touches them. They are an information surface, read
// by the reader, not handled by the figure (D32) — so no beat's text claims contact.
// He indicates; the board answers.

const NOTE_T = 232;
const NOTE_H = 78;
const NOTE_W = 78;
const NOTE_LX = 220;
const NOTE_RX = 306;

const OWED_T = 318;
const OWED_H = 18;

const THIRD_T = 344;
const THIRD_H = 36;
const THIRD_L = NOTE_LX;
const THIRD_W = NOTE_RX + NOTE_W - NOTE_LX;

const PIN_Y = 226;

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics9'));
const DIR = dirsFrom(X, 1);
const NOTES = BEATS.map((b) => b.notes ?? 0);

// The three targets for Q1. The left note is the claim he did NOT meet, so it is
// the one still owed an account; the third card is the tempting "nothing is owed",
// which is the position the whole lesson is arguing against (H66).
const TARGETS = [
  { id: 'mother', correct: true },
  { id: 'fight', correct: false },
  { id: 'neither', correct: false },
];

export default function Ethics9Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // Each element fades in only on the beat that CHANGES it, and holds otherwise —
  // so the board does not re-reveal itself every time the reader taps forward.
  const notesFade = (cur.notes ?? 0) !== (prev?.notes ?? 0);
  const takenOn = (cur.taken ?? 0) > 0;
  const takenFade = (cur.taken ?? 0) !== (prev?.taken ?? 0);
  const owedOn = (cur.owed ?? 0) > 0;
  const owedFade = (cur.owed ?? 0) !== (prev?.owed ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      notes: lerp(NOTES[p], NOTES[n], tr) * (notesFade ? grow : 1),
      taken: takenOn ? (takenFade ? grow : 1) : 0,
      owed: owedOn ? (owedFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const notesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.notes }));
  // The chosen claim fills with ink rather than moving — the whole point is that
  // nothing leaves the board.
  const takenStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.taken }));
  const owedStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.owed,
    transform: [{ translateY: (1 - SCENE.value.owed) * -6 }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;
  const target = (id: string) => TARGETS.find((c) => c.id === id)!;

  // A note is a target only on the interact beat; everywhere else it is inert art.
  const noteState = (id: string) => {
    if (!answered) return null;
    const c = target(id);
    if (c.correct) return 'right' as const;
    return picked === id ? 'wrong' as const : null;
  };

  return (
    <Animated.View style={styles.scene}>
      {/* ── the two pinned claims ───────────────────────────────────────────── */}
      <Animated.View style={[styles.boardWrap, notesStyle]} pointerEvents="box-none">
        <View style={[styles.pin, { left: NOTE_LX + NOTE_W / 2 - 3 }]} pointerEvents="none" />
        <View style={[styles.pin, { left: NOTE_RX + NOTE_W / 2 - 3 }]} pointerEvents="none" />

        <Target id={'mother'} correct={target('mother').correct} picked={picked} onPick={onPick}
          style={[styles.note, { left: NOTE_LX }]}
          disabled={!showPick || answered}
        >
          <View
            style={[
              styles.noteInner,
              noteState('mother') === 'right' && styles.pickRight,
              noteState('mother') === 'wrong' && styles.pickWrong,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[styles.noteKicker, noteState('mother') === 'right' && styles.onInk]}
            >
              CLAIM ONE
            </Text>
            <Text style={[styles.noteText, noteState('mother') === 'right' && styles.onInk]}>
              Stay{'\n'}with{'\n'}her
            </Text>
          </View>
        </Target>

        <Target id={'fight'} correct={target('fight').correct} picked={picked} onPick={onPick}
          style={[styles.note, { left: NOTE_RX }]}
          disabled={!showPick || answered}
        >
          <View
            style={[
              styles.noteInner,
              noteState('fight') === 'right' && styles.pickRight,
              noteState('fight') === 'wrong' && styles.pickWrong,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[styles.noteKicker, noteState('fight') === 'right' && styles.onInk]}
            >
              CLAIM TWO
            </Text>
            <Text style={[styles.noteText, noteState('fight') === 'right' && styles.onInk]}>
              Join{'\n'}the{'\n'}fight
            </Text>
          </View>
        </Target>

        {/* the claim he acts on fills in — it does not come down */}
        <Animated.View style={[styles.actedRule, takenStyle]} pointerEvents="none" />
        <Animated.Text style={[styles.actedTag, takenStyle]} numberOfLines={1} pointerEvents="none">
          ACTED ON
        </Animated.Text>
      </Animated.View>

      {/* what the choice left behind */}
      <Animated.View style={[styles.owedTag, owedStyle]} pointerEvents="none">
        <Text style={styles.owedText} numberOfLines={1}>STILL OWED</Text>
      </Animated.View>

      {/* ── Q1's third option: the tempting "nothing is owed" ───────────────── */}
      {showPick && (
        <Target id={'neither'} correct={target('neither').correct} picked={picked} onPick={onPick}
          style={styles.third}
          disabled={answered}
        >
          <View
            style={[
              styles.thirdInner,
              answered && picked === 'neither' && styles.pickWrong,
            ]}
          >
            <Text style={styles.thirdText} numberOfLines={1}>NEITHER — HE CHOSE WELL</Text>
          </View>
        </Target>
      )}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  boardWrap: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  pin: { position: 'absolute', top: PIN_Y, width: 6, height: 6, borderRadius: 3, backgroundColor: INK },

  note: { position: 'absolute', top: NOTE_T, width: NOTE_W },
  noteInner: {
    height: NOTE_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  noteKicker: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT, marginBottom: 4,
    includeFontPadding: false,
  },
  // Hand-broken to one short word a line (D32b): the inner width is 78 − 4 border
  // − 12 padding = 62 units, and "fight" is the longest word at ~28.
  noteText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 14, color: INK, textAlign: 'center',
    includeFontPadding: false,
  },
  onInk: { color: PAPER },

  // The mark that says which claim was acted on. A rule under the right-hand note
  // plus its tag — deliberately UNDER the note rather than across it, so it cannot
  // cover a word (D31).
  actedRule: {
    position: 'absolute', left: NOTE_RX, top: NOTE_T + NOTE_H + 4, width: NOTE_W, height: 2.5,
    backgroundColor: INK,
  },
  actedTag: {
    position: 'absolute', left: NOTE_RX, top: NOTE_T + NOTE_H + 10, width: NOTE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },

  owedTag: {
    position: 'absolute', left: NOTE_LX, top: OWED_T, width: NOTE_W, height: OWED_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  owedText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },

  third: { position: 'absolute', left: THIRD_L, top: THIRD_T, width: THIRD_W },
  thirdInner: {
    height: THIRD_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  thirdText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.2, color: INK,
    includeFontPadding: false,
  },

  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Art runs from the pins (226) down to the ground line (500). Band 218…512 is 294
// units — inside the 280–300 the other lessons sit in (H59), so it renders at the
// same scale as its siblings rather than paying for empty rows.
export function Ethics9Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics9Scene} band={[218, 512]} camera={CAM} />;
}
