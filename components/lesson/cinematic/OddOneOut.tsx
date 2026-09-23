import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import { INK, PAPER_LIT } from '@/components/shared/tone';
import { orderFor } from './ChoiceCards';
import { LipPlate, VerdictSeal, useQuestionAccent, type PlateState } from './QuestionParts';
import { VERDICT } from './questionTone';
import { RULE, SOFT } from './cinematicKit';
import ObjectArt from './ObjectArt';
import { OBJECTS } from './objects';
import { squareIn } from './squareIn';
import type { OddBlock } from './cinematicKit';
import type { ObjTone } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A STRANGER IN A SET, FOUND IN ONE TAP.
//
// The least reading of anything in this app. Four tiles, each a DRAWING struck in
// the lesson's own branch tone, and a prompt of about five words. Where a poll
// asks the reader to hold four sentences in their head and compare them, this
// asks them to notice — which is a different faculty and a much cheaper one.
//
// It is the second of the two controls that replaced the sliders, and the reason
// it earns its place beside `plot` (which is also four tiles and one tap) is the
// QUESTION SHAPE rather than the gesture. A trend pick asks "which shape is it";
// this asks "which of these is not one of the others", and philosophy asks that
// constantly: which of these is not a necessary truth, not a primary quality, not
// a case of the thing just defined. Asked as a four-option list it is four
// sentences; asked as four pictures it is a glance.
//
// ── THE THREE THAT BELONG ARE A FAMILY, AND THAT IS THE WHOLE DESIGN ────────
//
// A tile carries a drawing from `objects.ts`, so the set is a set by SIGHT before
// a word is read. Where a claim has no drawable thing the tile falls back to its
// own two or three words — still a set, still one tap — but a question whose four
// tiles are all words is a poll wearing tiles, and `check:controls` says so.
//
// ── WHAT ANSWERING DOES ─────────────────────────────────────────────────────
//
// The stranger CRACKS: a hairline splits it corner to corner, which is the one
// piece of feedback in the app that means "this one does not hold with the
// others". The three that belong draw together — they lift as a group, on one
// value, so they read as closing ranks rather than as three separate animations.
// A reader who tapped a belonger gets the seal on their own tile and the crack on
// the true one, so the answer is shown rather than merely withheld.
//
// ── THE SCENE FOLLOWS THE SET (R7c) ─────────────────────────────────────────
//
// `pos` (the scene's `dragPos`) goes to 1 when the stranger is found and to 0.35
// when it is not, so a scene can complete or fracture its own picture on the
// answer. `sem` (the scene's `pickPos`) is the tile taken in the author's own
// order, for a scene that draws the four things itself.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  odd: OddBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** 1 once the stranger is found, 0.35 if not — what a scene reads as `dragPos`. */
  pos: SharedValue<number>;
  /** The tile taken, in the AUTHOR'S order, 0..1 — what a scene reads as `pickPos`. */
  sem?: SharedValue<number>;
  /** The question's own words, so the tile order is stable but not authored. */
  seed: string;
  /** The lesson's own stage tone, so every drawing is struck in the branch hue. */
  tone: ObjTone;
}

export default function OddOneOut({ odd, picked, onPick, pos, sem, seed, tone }: Props) {
  const accent = useQuestionAccent();
  const answered = picked !== null;
  const n = odd.tiles.length;
  // Shuffled for the reason every control in this family is: measured across the
  // corpus, an authored set puts its stranger first far more often than chance,
  // and four tiles in a fixed order is "always tap the top left".
  const shown = orderFor(seed, n);
  const tiles = shown.map((k) => odd.tiles[k]);

  useEffect(() => {
    pos.value = 0;
    if (sem) sem.value = 0.5;
  }, [odd, pos, sem]);

  const choose = (d: number) => {
    if (answered) return;
    const t = tiles[d];
    const right = Boolean(t.correct);
    pos.value = withTiming(right ? 1 : 0.35, { duration: 300, easing: Easing.out(Easing.cubic) });
    if (sem) sem.value = withTiming(n > 1 ? shown[d] / (n - 1) : 0, { duration: 300, easing: Easing.out(Easing.cubic) });
    touch();
    onPick(t.id, right);
  };

  const rows: number[][] = [];
  const perRow = n >= 4 ? 2 : n;
  for (let d = 0; d < n; d += perRow) rows.push(tiles.slice(d, d + perRow).map((_, j) => d + j));

  return (
    <View style={styles.wrap} nativeID="odd-one-out">
      <View style={styles.head}>
        <Text style={[styles.axis, { color: accent.text }]} numberOfLines={1}>{odd.axis}</Text>
        <Text style={styles.hint} numberOfLines={1}>ONE DOES NOT BELONG</Text>
      </View>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((d) => (
            <Tile
              key={tiles[d].id}
              tile={tiles[d]}
              index={d}
              answered={answered}
              mine={picked === tiles[d].id}
              tone={tone}
              onPress={() => choose(d)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function Tile({
  tile, index, answered, mine, tone, onPress,
}: {
  tile: OddBlock['tiles'][number];
  index: number;
  answered: boolean;
  mine: boolean;
  tone: ObjTone;
  onPress: () => void;
}) {
  const accent = useQuestionAccent();
  const isOdd = Boolean(tile.correct);
  const state: PlateState = !answered ? 'idle' : isOdd ? 'right' : mine ? 'wrong' : 'rest';

  const down = useSharedValue(0);
  useEffect(() => { down.value = withTiming(answered && mine && !isOdd ? 1 : 0, { duration: 90 }); },
    [answered, mine, isOdd, down]);

  // THE CRACK. It draws across the stranger once the answer is in: two hairlines
  // meeting off-centre, so it reads as a split rather than as a drawn X.
  const crack = useSharedValue(0);
  useEffect(() => {
    if (!(answered && isOdd)) { crack.value = 0; return; }
    crack.value = withDelay(120, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
  }, [answered, isOdd, crack]);
  const crackTop = useAnimatedStyle(() => ({ opacity: crack.value, transform: [{ scaleY: crack.value }] }));
  const crackLow = useAnimatedStyle(() => ({
    opacity: Math.max(0, crack.value * 2 - 1),
    transform: [{ scaleY: Math.max(0, crack.value * 2 - 1) }],
  }));

  // THE THREE THAT BELONG CLOSE RANKS, on one value so they move as a group.
  const hold = useSharedValue(0);
  useEffect(() => {
    if (!answered || isOdd) { hold.value = 0; return; }
    hold.value = withDelay(180, withSequence(
      withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) }),
      withSpring(0.6, { damping: 12, stiffness: 180 }),
    ));
  }, [answered, isOdd, hold]);
  const holdStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -3 * hold.value }] }));

  const [box, setBox] = useState({ w: 0, h: 0 });
  const draw = tile.draw ? OBJECTS[tile.draw] : null;
  // INK, NOT THE VERDICT GREEN. Drawn in green at a hairline the two segments
  // read as a pair of faint marks on the drawing rather than as a break, and
  // the plate underneath is already struck green — the crack's whole job is to
  // say THIS ONE DOES NOT HOLD, which is a fracture, which is dark.
  const crackInk = INK;

  return (
    <Animated.View style={[styles.slot, holdStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tile.reads}
        disabled={answered}
        onPress={onPress}
        onPressIn={() => { if (!answered) down.value = 1; }}
        onPressOut={() => { if (!answered) down.value = 0; }}
      >
        <LipPlate state={state} down={down} radius={10} faceStyle={styles.face}>
          <View
            style={styles.art}
            onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
          >
            {/* A SQUARE, BECAUSE EVERY OBJECT IS AUTHORED IN ONE. `objects.fit`
                scales x and y INDEPENDENTLY off a 100x100 design box, so a
                drawing handed a 158-by-38 tile is not merely small, it is
                stretched four to one: the owner saw it at once -- "the boxes
                that have the four object they seem to be squished". The box is
                taller now and the drawing is laid into the largest SQUARE that
                fits it, which is the only shape that cannot distort. */}
            {draw && box.w > 0 ? (
              <ObjectArt
                parts={draw(box.w / 2, box.h / 2, squareIn(box), squareIn(box))}
                tone={tone}
              />
            ) : null}
            {!draw ? (
              // Three lines, not two: the art box is 58 tall and three lines of 13
              // sit inside it, and a set whose tiles are all words is where the
              // longest ones live — there is no drawing to keep short for.
              <Text style={[styles.bare, { color: accent.text }]} numberOfLines={3}>{tile.reads}</Text>
            ) : null}
            <Animated.View pointerEvents="none" style={[styles.crackA, { backgroundColor: crackInk }, crackTop]} />
            <Animated.View pointerEvents="none" style={[styles.crackB, { backgroundColor: crackInk }, crackLow]} />
          </View>
          {draw ? <Text style={styles.caption} numberOfLines={2}>{tile.reads}</Text> : null}
        </LipPlate>
      </Pressable>
      {answered && mine ? <VerdictSeal correct={isOdd} size={20} style={styles.seal} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, marginTop: 2 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5, gap: 8 },
  axis: { flexShrink: 1, fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1 },
  hint: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 0.8, color: SOFT },
  row: { flexDirection: 'row', gap: 6, marginBottom: 3 },
  slot: { flex: 1 },
  face: { padding: 5, paddingTop: 6 },
  art: {
    height: 58, borderRadius: 6, backgroundColor: PAPER_LIT,
    borderWidth: 1, borderColor: RULE, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  bare: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 13,
    textAlign: 'center', paddingHorizontal: 4, includeFontPadding: false,
  },
  // Two hairlines meeting off-centre: a split, never a drawn X. Each grows from
  // its own end, the lower one starting once the upper has drawn.
  crackA: {
    position: 'absolute', left: '46%', top: 0, width: 2.2, height: '52%',
    transformOrigin: '50% 0%', transform: [{ rotate: '13deg' }],
  },
  crackB: {
    position: 'absolute', left: '53%', top: '48%', width: 2.2, height: '52%',
    transformOrigin: '50% 0%', transform: [{ rotate: '-9deg' }],
  },
  caption: {
    fontFamily: 'Inter_500Medium', fontSize: 10.5, lineHeight: 13, color: INK,
    textAlign: 'center', marginTop: 4, minHeight: 26,
  },
  seal: { top: -6, right: -4 },
});
