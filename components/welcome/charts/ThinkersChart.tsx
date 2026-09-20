// ThinkersChart — five real thinkers on a real timeline, and the roll behind them.
//
// It replaces an abstract tree of branches spreading from the word "you", which
// said nothing a beginner could check. Five names, their dates, and two thousand
// years between the first and the last: the point of the board is that the
// argument is OLD and that the app has the whole of it.
//
// ── THE ERA IS A COLOUR, AND THIS BOARD WAS THE ONE PLACE IT WAS NOT ────────
//
// `ERA` in constants/design.ts is the app's licensed "one place a hue means
// something", keyed on the five groups `data/philosophers.ts` already sorts every
// thinker by. Every quote plate in the app is struck in its author's era colour —
// §19 argues it out at length: "Five recognisable colours is what makes a list of
// twenty quotes scannable; one tone is what made it a pile." This board drew five
// thinkers spanning four eras in one ink.
//
// So each name sits on its era's plate. Nothing else about the board's claim
// changes, and the reader who later meets Socrates on a quote plate meets him in
// the same colour he was introduced in.
//
// ── AND THE "MORE" IS COUNTED ───────────────────────────────────────────────
//
// `AND {n} MORE` is derived from ALL_PHILOSOPHERS, as it already was — this board
// got that right, and `check-thinkers` holds it. It is the one figure on any of
// the four boards that never rotted, which is worth saying next to the lesson
// count on the growth board, which was typed and did.

import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { C, ERA, type EraKey } from '@/constants/design';
import { ramp } from '@/components/shared/tone';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { clamp01, easeOutCubic } from '@/components/welcome/ease';

interface Thinker {
  name: string;
  dates: string;
  era: EraKey;
  /** 0→1 across the two thousand years, so the spacing is the real spacing. */
  at: number;
}

/**
 * "BEAUVOIR" rather than "DE BEAUVOIR": the full form overruns the plate, and the
 * SPOKEN line says "Beauvoir." too — A1 read the right way round, the board and
 * the host naming her the same way.
 */
const THINKERS: Thinker[] = [
  { name: 'SOCRATES', dates: '470–399 BCE', era: 'ANCIENT', at: 0.0 },
  { name: 'DESCARTES', dates: '1596–1650', era: 'MODERN', at: 0.46 },
  { name: 'KANT', dates: '1724–1804', era: 'MODERN', at: 0.62 },
  { name: 'NIETZSCHE', dates: '1844–1900', era: 'MODERN', at: 0.78 },
  { name: 'BEAUVOIR', dates: '1908–1986', era: 'CONTEMPORARY', at: 1.0 },
];

const MORE = ALL_PHILOSOPHERS.length - THINKERS.length;

// ── ALTERNATING, AND EVENLY SPACED, AND THE SECOND HALF IS A CORRECTION ─────
//
// Five plates side by side across 372 units is 74 each including gaps, which put
// "470–399 BCE" at ten points and left the board's whole height unused. A timeline
// has an axis and things hanging off BOTH sides of it — which the SVG version knew
// (it carried an `up` flag per thinker) and which a flex row cannot express. So
// each plate hangs above or below the axis in turn, on a stem.
//
// THE FIRST DRAFT PLACED THEM BY DATE AND THEY COLLIDED, which is not a spacing
// bug — it is what the real dates do. Socrates is 400 BCE and the other four are
// inside four centuries, so a true scale bunches them into the right-hand third
// and 104-wide plates overlap by sixty units. It rendered as a pile.
//
// It also went unreported, and that is the more useful half: `sheet:intro`
// measures WORD boxes, and a plate can be half under its neighbour while the
// centred names inside them stay clear of each other. A checker that measures
// type cannot see furniture collide.
//
// So the axis is a SEQUENCE, not a scale: five even slots, and the truth about
// the span is carried by the dates on the plates and by the "2,000 YEARS" label
// over them — which is what those were always for. Even slots also make the
// no-collision claim structural rather than lucky: same-side plates are two
// slots apart, and 2 × 74.4 is wider than any plate.
const SLOTS = 5;
const SLOT_W = 372 / SLOTS;
// 88 wide with 12 of padding leaves 76 for the name, and the widest of the five
// is DESCARTES at 69.0 units of Inter_700Bold 11 — measured against the real .ttf
// in plain Node (`scripts/lib/ttfwidth.mjs`), not estimated. The first draft used
// size 12, where the same name measures 75.1 against 72 of usable plate, and both
// DESCARTES and NIETZSCHE shipped as "DESCAR…" and "NIETZSC…": a word the reader
// does not get, which is the SPILL class §21 names. MapChart's own header records
// the identical mistake being made by character count.
const PLATE_W = 88;
const STEM = 16;
const AXIS_Y = 86;

function Plate({ p, t, i }: { p: SharedValue<number>; t: Thinker; i: number }) {
  const r = ramp(ERA[t.era]);
  const up = i % 2 === 0;
  const style = useAnimatedStyle(() => {
    const a = easeOutCubic(clamp01((p.value - 0.12 - i * 0.1) / 0.3));
    return { opacity: a, transform: [{ translateY: (up ? -8 : 8) * (1 - a) }] };
  });
  // Centred in its own slot, then clamped to the board so the first and last
  // plates cannot hang off the edges — the ends are the two the eye goes to first.
  const cx = Math.max(0, Math.min(372 - PLATE_W,
    (i + 0.5) * SLOT_W - PLATE_W / 2));

  return (
    <Animated.View style={[s.slot, { left: cx, [up ? 'bottom' : 'top']: AXIS_Y + STEM }, style]}>
      <View style={[s.plate, { backgroundColor: r.track, borderColor: r.base }]}>
        <Text style={[s.name, { color: r.shade }]} numberOfLines={1}>{t.name}</Text>
        <Text style={s.dates} numberOfLines={1}>{t.dates}</Text>
      </View>
      <View style={[s.stem, { backgroundColor: r.base, [up ? 'bottom' : 'top']: -STEM }]} />
    </Animated.View>
  );
}

export default function ThinkersChart({ p }: { p: SharedValue<number> }) {
  // The axis draws itself across before the plates land on it, so the two
  // thousand years arrive as a span rather than as five separate facts.
  const axis = useAnimatedStyle(() => ({
    transform: [{ scaleX: easeOutCubic(clamp01(p.value / 0.22)) }],
  }));
  const span = useAnimatedStyle(() => ({
    opacity: easeOutCubic(clamp01((p.value - 0.2) / 0.2)),
  }));
  const more = useAnimatedStyle(() => ({
    opacity: easeOutCubic(clamp01((p.value - 0.7) / 0.25)),
  }));

  return (
    <View style={s.board}>
      <Animated.Text style={[s.span, span]}>— 2,000 YEARS —</Animated.Text>
      <Animated.View style={[s.axis, axis]} />
      {THINKERS.map((t, i) => <Plate key={t.name} p={p} t={t} i={i} />)}
      <Animated.Text style={[s.more, more]}>AND {MORE} MORE</Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  board: { width: 372, height: 200 },
  span: {
    fontFamily: 'Inter_500Medium', fontSize: 10.5, letterSpacing: 2,
    color: C.dim, textAlign: 'center', marginTop: 2,
  },
  // scaleX from the left, so it draws ACROSS rather than growing from the middle.
  axis: {
    position: 'absolute', left: 0, right: 0, top: AXIS_Y,
    height: 2, backgroundColor: C.edge, transformOrigin: 'left',
  },
  slot: { position: 'absolute', width: PLATE_W, alignItems: 'center' },
  plate: {
    width: PLATE_W, borderWidth: 1, borderRadius: 8,
    paddingVertical: 7, paddingHorizontal: 6, alignItems: 'center',
  },
  stem: { position: 'absolute', width: 1.5, height: STEM },
  name: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.3 },
  dates: {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 11, color: C.dim, marginTop: 1,
  },
  more: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    fontFamily: 'Inter_500Medium', fontSize: 10.5, letterSpacing: 2,
    color: C.dim, textAlign: 'center',
  },
});
