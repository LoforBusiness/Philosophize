import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import { INK, PAPER, PAPER_LIT } from '@/components/shared/tone';
import { orderFor } from './ChoiceCards';
import { LipPlate, useQuestionAccent, type PlateState } from './QuestionParts';
import { VERDICT } from './questionTone';
import { RULE, SOFT } from './cinematicKit';
import ObjectArt from './ObjectArt';
import { OBJECTS } from './objects';
import { squareIn } from './squareIn';
import type { OrderBlock } from './cinematicKit';
import type { ObjTone } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A SEQUENCE, MADE OF TAPS.
//
// This replaced the knob on a rail, which a reader threw out with the seam in a
// bar: "two sliding ones ... I want those removed." Both asked HOW MUCH, and both
// answered it by making the reader hold a finger down and hunt along a line for a
// boundary they could not see. What is left of that class of question is a
// TREND, which `plot` already draws, and an ORDER, which nothing did.
//
// Philosophy is full of order. Cause before effect, premise before conclusion,
// the rungs of the divided line, the stages of an argument somebody built. Every
// one of those used to be forced into a pick — "which comes first?" with two
// cards — which answers the interesting half of the question before it is asked.
//
// ── ONE TAP PER TILE, AND NOTHING ELSE ──────────────────────────────────────
//
// The whole control is three or four taps. No drag, no commit button (S4: a
// control's commit gesture is derived from how many values it holds, and the
// last tap IS the last value), and for three tiles only the first two taps are
// real decisions — the third is forced, which is the point of three.
//
// A NUMERAL IS STRUCK ONTO THE TILE as it is taken, with the streak seal's own
// physics: the die falls ACCELERATING (`Easing.in` — the half everyone gets
// backwards), squashes on contact, recoils, settles. That is the app's existing
// vocabulary for "this is now recorded", and it costs one shared value.
//
// ── TAPPING A NUMBERED TILE STARTS AGAIN ────────────────────────────────────
//
// There has to be a way back, and every clever one is worse. Taking back just
// the last tap needs the reader to work out which that was; taking back "this
// one and everything after it" is a rule nobody can see. Tapping a numbered tile
// clears the whole sequence, which is ONE rule, visible in the un-stamping, and
// it costs a reader who mis-tapped two taps rather than a wrong answer.
//
// ── THE SCENE BUILDS AS THE ORDER IS MADE (R7c) ─────────────────────────────
//
// `pos` (the scene's `dragPos`) is how much of the sequence is placed, 0..1. A
// scene can assemble its own subject one step at a time as the reader commits to
// it, which is what the rail's continuous value bought and the reason it is worth
// keeping a continuous value at all here. `sem` (the scene's `pickPos`) is the
// tile MOST RECENTLY taken, in the author's own order, so a scene can also follow
// what is being pointed at.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  order: OrderBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** How much of the sequence is placed, 0..1 — what a scene reads as `dragPos`. */
  pos: SharedValue<number>;
  /** The tile just taken, in the AUTHOR'S order, 0..1 — what a scene reads as `pickPos`. */
  sem?: SharedValue<number>;
  /** The question's own words, so the tile order is stable but not authored. */
  seed: string;
  /** The lesson's own stage tone, so a drawn item is struck in the branch hue. */
  tone: ObjTone;
}

export default function OrderTiles({ order, picked, onPick, pos, sem, seed, tone }: Props) {
  const accent = useQuestionAccent();
  const answered = picked !== null;
  const n = order.items.length;
  // THE TILES ARE SHUFFLED, for the reason every other control in this family
  // shuffles: authored in the correct order, they would be answered by tapping
  // left to right without reading a word (check:answers measures exactly this).
  const shown = orderFor(seed, n);
  const items = shown.map((k) => order.items[k]);

  /** Display slots the reader has taken, in the sequence they took them. */
  const [taken, setTaken] = useState<number[]>([]);
  // THE SEQUENCE LIVES IN A REF AS WELL, AND THAT IS NOT BELT AND BRACES.
  //
  // Two taps inside one React commit both read the same `taken` from their own
  // closure, so the second overwrites the first instead of appending: tapping
  // three tiles quickly left the control reading "1 OF 3" with one numeral on it.
  // A harness found it — it dispatches its clicks in a single tick — but a reader
  // tapping fast is the same event, and it is group L's complaint exactly
  // ("it got worse the faster you tapped"). The ref is the truth the handler
  // reads and writes; the state exists only so the tiles re-render.
  const seq = useRef<number[]>([]);

  useEffect(() => {
    seq.current = [];
    setTaken([]);
    pos.value = 0;
    if (sem) sem.value = 0.5;
  }, [order, pos, sem]);

  const tap = (d: number) => {
    if (answered) return;
    // A numbered tile is the way back: it clears the sequence rather than
    // unpicking one step, which is a rule the reader can see happening.
    if (seq.current.includes(d)) {
      seq.current = [];
      setTaken([]);
      pos.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
      touch();
      return;
    }
    const next = [...seq.current, d];
    seq.current = next;
    setTaken(next);
    touch();
    pos.value = withTiming(next.length / n, { duration: 220, easing: Easing.out(Easing.cubic) });
    if (sem) sem.value = withTiming(n > 1 ? shown[d] / (n - 1) : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
    if (next.length < n) return;
    // THE LAST TAP IS THE ANSWER. Correct when the sequence the reader built is
    // the order the author wrote, which is what `shown` maps back to.
    const asAuthored = next.map((slot) => shown[slot]);
    const right = asAuthored.every((v, i) => v === i);
    onPick(asAuthored.join('>'), right);
  };

  // Four items go two by two so each caption keeps a readable width; three sit in
  // one row, exactly as the trend tiles do.
  const perRow = n >= 4 ? 2 : n;
  // AND SO DOES THE CAPTION, which the first draft forgot. Three across is an
  // 87dp tile at 360dp, and two lines of 10.5pt holds about four short words —
  // `check:controls` found 34 of the corpus's own captions too long for it, most
  // of them ordinary four-word phrases. TrendPick solved the identical geometry
  // first: three across drops to 10pt and gets FOUR lines. Copying it is the fix,
  // because the copy was never the thing that was wrong.
  const lines = n >= 4 ? 2 : 4;
  const rows: number[][] = [];
  for (let d = 0; d < n; d += perRow) rows.push(items.slice(d, d + perRow).map((_, j) => d + j));

  return (
    <View style={styles.wrap} nativeID="order-tiles">
      <View style={styles.head}>
        <Text style={[styles.axis, { color: accent.text }]} numberOfLines={1}>{order.axis}</Text>
        <Text style={styles.count} numberOfLines={1}>{`${taken.length} OF ${n}`}</Text>
      </View>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((d) => (
            <Tile
              key={items[d].id}
              item={items[d]}
              place={taken.indexOf(d)}
              truth={shown[d]}
              lines={lines}
              answered={answered}
              tone={tone}
              onPress={() => tap(d)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function Tile({
  item, place, truth, lines, answered, tone, onPress,
}: {
  item: OrderBlock['items'][number];
  /** Where the reader put it, or -1 while it is still free. */
  place: number;
  /** Where it actually belongs, 0-based. */
  truth: number;
  /** How many lines its caption may run to — two across, four in a row of three. */
  lines: number;
  answered: boolean;
  tone: ObjTone;
  onPress: () => void;
}) {
  const accent = useQuestionAccent();
  const mine = place >= 0;
  // A tile is only RIGHT or WRONG once the whole sequence is in: until then a
  // numbered tile is simply taken, and colouring it would answer the question a
  // tap at a time (group O).
  const correct = answered && place === truth;
  const state: PlateState = !answered ? 'idle' : correct ? 'right' : mine ? 'wrong' : 'rest';

  const down = useSharedValue(0);
  useEffect(() => { down.value = withTiming(answered && mine && !correct ? 1 : 0, { duration: 90 }); },
    [answered, mine, correct, down]);

  // THE STRIKE. A die coming down onto paper: it falls accelerating, squashes on
  // contact at 0.94, recoils to 1.05 and settles. `Easing.out` decelerates INTO
  // the paper, which is what makes a stamp read as a pop (§7).
  const struck = useSharedValue(0);
  useEffect(() => {
    if (!mine && !answered) { struck.value = withTiming(0, { duration: 160 }); return; }
    struck.value = 0;
    struck.value = withSequence(
      withTiming(1, { duration: 130, easing: Easing.in(Easing.cubic) }),
      withTiming(0.94, { duration: 60, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 11, stiffness: 240 }),
    );
  }, [mine, answered, struck]);
  const stampStyle = useAnimatedStyle(() => ({
    opacity: struck.value <= 0 ? 0 : 1,
    transform: [
      { scale: struck.value <= 0 ? 1.6 : 1.6 - 0.6 * Math.min(1, struck.value / 1) },
    ],
  }));
  // The press ring leaves the stamp's edge on the frame it lands — one View, and
  // the whole difference between a stamp and a fade-in.
  const ringStyle = useAnimatedStyle(() => ({
    opacity: struck.value <= 0 ? 0 : Math.max(0, 1 - struck.value * 1.6),
    transform: [{ scale: 1 + struck.value * 0.9 }],
  }));

  // The tile that was in the right place lifts, answered or not taken, so a reader
  // who got it wrong is SHOWN the order rather than merely denied the point.
  const lift = useSharedValue(0);
  useEffect(() => {
    if (!(answered && correct)) { lift.value = 0; return; }
    lift.value = withDelay(80, withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }),
      withSpring(0.55, { damping: 12, stiffness: 180 }),
    ));
  }, [answered, correct, lift]);
  const liftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -4 * lift.value }] }));

  const stampInk = !answered ? accent.base : correct ? VERDICT.right.ink : VERDICT.wrong.ink;
  const draw = item.draw ? OBJECTS[item.draw] : null;
  const [box, setBox] = useState({ w: 0, h: 0 });

  return (
    <Animated.View style={[styles.slot, liftStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.reads}
        disabled={answered}
        onPress={onPress}
      >
        <LipPlate state={state} down={down} radius={10} faceStyle={styles.face}>
          {draw ? (
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
              {box.w > 0 ? (
                <ObjectArt
                  parts={draw(box.w / 2, box.h / 2, squareIn(box), squareIn(box))}
                  tone={tone}
                />
              ) : null}
            </View>
          ) : null}
          {/* Every caption reserves its full number of lines, so tiles in a row
              are one height whatever their captions run to. */}
          <Text
            style={[styles.caption, lines > 2 && styles.captionSmall, { minHeight: lines * (lines > 2 ? 12.5 : 13) }]}
            numberOfLines={lines}
          >
            {item.reads}
          </Text>
        </LipPlate>
        {/* THE NUMERAL, struck on the tile's top-left corner where a reader's eye
            already is after tapping it. Outside the plate's face so the lip and
            the caption never have to make room for it. */}
        <View style={styles.stampSlot} pointerEvents="none">
          <Animated.View style={[styles.ring, { borderColor: stampInk }, ringStyle]} />
          <Animated.View style={[styles.stamp, { backgroundColor: stampInk }, stampStyle]}>
            {/* ONCE IT IS ANSWERED THE NUMERAL IS THE TRUE ONE, on every tile.
                Showing the reader their own sequence back is the one thing this
                reveal must not do: they have just been told they were wrong and
                the tiles would still be reciting the wrong order, so the right
                one is nowhere on screen. The numerals now read the answer off
                left to right, and the plate's own colour says which of them the
                reader had already put there. */}
            <Text style={styles.stampT}>{String((answered ? truth : place) + 1)}</Text>
          </Animated.View>
        </View>
      </Pressable>
      {/* NO SEAL HERE, deliberately. Every tile is "picked" in an order, so a seal
          on each is three or four marks at once — and the plate is already struck
          right or wrong underneath. The seal earns its place where exactly one
          thing was chosen. */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, marginTop: 2 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5, gap: 8 },
  axis: { flexShrink: 1, fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1 },
  count: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 0.8, color: SOFT },
  row: { flexDirection: 'row', gap: 6, marginBottom: 3 },
  slot: { flex: 1 },
  face: { padding: 5, paddingTop: 6 },
  art: {
    height: 50, borderRadius: 6, backgroundColor: PAPER_LIT,
    borderWidth: 1, borderColor: RULE, overflow: 'hidden', marginBottom: 4,
  },
  caption: {
    fontFamily: 'Inter_500Medium', fontSize: 10.5, lineHeight: 13, color: INK,
    textAlign: 'center',
  },
  captionSmall: { fontSize: 10, lineHeight: 12.5 },
  stampSlot: { position: 'absolute', left: -5, top: -6, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 1.5 },
  stamp: {
    width: 19, height: 19, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  stampT: {
    fontFamily: 'Inter_700Bold', fontSize: 11, color: PAPER, includeFontPadding: false,
  },
});
