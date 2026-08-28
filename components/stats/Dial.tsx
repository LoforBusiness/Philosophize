import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, type GestureResponderEvent } from 'react-native';
import Animated, {
  useAnimatedStyle, useDerivedValue, withSpring, type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';
import { PANEL_BASE, disc, mix } from '@/components/shared/tone';
import { C } from '@/constants/design';
import { pressPoint, wedgeAt } from '@/lib/utils/dialHit';

// ─────────────────────────────────────────────────────────────────────────────
// THE DIAL — a struck disc, seen at an angle.
//
// ── WHAT WAS HERE BEFORE, AND WHY IT WENT ───────────────────────────────────
//
// Two rounds of this chart have now been rejected by the same reader, and the
// second rejection is the useful one because it rules out the obvious fix.
//
//   > "the graph is too kidesh … not just a bunch of colors that make the app
//   > feel cheep."
//
// That was a flat pie of six saturated fills on paper, and the answer was AREA
// and GROUND: the same six branches at 14px on near-black, cut to jewel tones.
// It is a better object and it is still FLAT — a stroked circle with one linear
// gradient run across the whole ring, which is the same drawing the first one
// was, done quieter.
//
//   > "it looks a little bit doo kiddish, and a little bit too not very premium
//   > looking. Looks very flat … I wanted to have depth."
//
// ── SO IT IS A SOLID, AND IT HAS A SIDE ─────────────────────────────────────
//
// A disc lying at an angle with its wall showing. That is the reference the
// reader supplied and it is also, conveniently, the only kind of depth this app
// has ever drawn: the rank pins, the badges, the certificates and now the
// streak calendar are all struck things lit from ONE point at the top left
// (tone.ts). A ring cannot have a lit side and a shaded one, because a ring is
// a line. A solid can.
//
// Every segment is therefore three surfaces, not one fill:
//   · the TOP FACE, running the branch's jewel tone from lit to base along the
//     one light — so a wedge on the left of the disc is brighter than the same
//     wedge would be on the right, which is what makes it a lid and not a
//     coloured area;
//   · the WALL, the extruded side, drawn only where the segment's arc is on the
//     FRONT of the ellipse. Two steps darker than the face, because a vertical
//     surface under a light from above catches almost none of it;
//   · the RIM, a hairline where the two meet.
//
// ── ONE SVG PER SEGMENT, WHICH IS NOT WASTE ─────────────────────────────────
//
// The selected wedge slides OUT along its own bisector, which is the reference's
// exploded slice and the one gesture that makes a chart feel like an object
// rather than a picture of one. §17's rule 7 forbids animating an SVG's
// properties; a transform on the View that CONTAINS the SVG is free, composites
// on the GPU, and re-rasterises nothing. So each segment gets its own surface
// and the selection is a spring on a translate.
//
// Six small surfaces at 132px is nothing — the badge case draws fifty — and it
// buys the one thing a single `<Svg>` could not: painter's order that can put
// the lifted wedge in front of its neighbours.
//
// ── AND NO ARC COMMANDS ─────────────────────────────────────────────────────
//
// Every curve here is flattened to (x, y) pairs, the same rule the guilloché and
// `sceneArt` follow: the repo's offline rasteriser reads M/L/C/Z and nothing
// else (§21), and a shape built out of points stays inspectable in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

export interface Segment { key: string; label: string; value: number; hue: string }

interface Props {
  segments: Segment[];
  total: number;
  totalLabel: string;
  size?: number;
  selected?: string | null;
  onSelect?: (key: string) => void;
  pop: SharedValue<number>;
}

/**
 * HOW FAR THE DISC IS TIPPED, as the ratio of its short axis to its long one.
 *
 * 0.56 is a deliberate middle. Nearer 1 and the wall disappears, which is the
 * flat chart again; under about 0.45 the back segments squash into slivers and
 * the shares stop being comparable, which is the one thing a chart of shares
 * must not lose. The reference sits at roughly this angle.
 */
const TILT = 0.56;
/** The wall's height, as a fraction of the long radius. */
const DEPTH = 0.19;
/** How far a chosen wedge slides out, same units. */
const LIFT = 0.10;
/** Degrees per sampled point along an arc. Fine enough that no edge shows facets. */
const STEP = 2;

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Points along the ellipse between two angles, inclusive of both ends. */
function arcPoints(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number) {
  const out: [number, number][] = [];
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / STEP));
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + rx * Math.cos(rad(a)), cy + ry * Math.sin(rad(a))]);
  }
  return out;
}

const poly = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

/**
 * The stretches of a segment's arc that face the VIEWER — the only parts whose
 * wall can be seen.
 *
 * On a tipped ellipse that is where sin(angle) > 0, the bottom half. It has to be
 * computed as runs rather than as one range because a segment large enough to
 * span the whole back of the disc leaves TWO visible pieces, one at each side,
 * and a version that assumed a single contiguous piece would drop one of them —
 * silently, and only for a reader whose reading is concentrated in one branch.
 */
function frontRuns(a0: number, a1: number): [number, number][] {
  const runs: [number, number][] = [];
  let start: number | null = null;
  for (let a = a0; a <= a1 + 1e-6; a += STEP / 2) {
    const on = Math.sin(rad(a)) > 0;
    if (on && start === null) start = a;
    if (!on && start !== null) { runs.push([start, a]); start = null; }
  }
  if (start !== null) runs.push([start, a1]);
  return runs.filter(([s, e]) => e - s > 0.4);
}

export default function Dial({
  segments, total, totalLabel, size = 132, selected, onSelect, pop,
}: Props) {
  const sum = segments.reduce((a, x) => a + x.value, 0);

  const rx = size / 2 - 4;
  const ry = rx * TILT;
  const depth = rx * DEPTH;
  const cx = size / 2;
  // The box holds the lid, the wall under it, and a little air for the sheen.
  const height = Math.round(ry * 2 + depth + 14);
  const cy = ry + 4;

  const wedges = useMemo(() => {
    if (sum <= 0) return [];
    const drawn = segments.filter((x) => x.value > 0);
    let acc = -90;                                  // 12 o'clock, clockwise
    return drawn.map((x) => {
      const span = (x.value / sum) * 360;
      const a0 = acc;
      const a1 = acc + span;
      acc = a1;
      const mid = (a0 + a1) / 2;
      const d = disc(x.hue);
      return {
        ...x,
        a0,
        a1,
        mid,
        frac: x.value / sum,
        face: poly([[cx, cy], ...arcPoints(cx, cy, rx, ry, a0, a1)]) + ' Z',
        // THE OUTER ARC ON ITS OWN. Stroking the whole wedge put a bright line
        // down both radial cuts as well, and a radial cut is not an edge — it is
        // where two parts of one lid meet, and on a real object nothing catches
        // the light there. Only the rim where the lid turns into the wall does.
        edge: poly(arcPoints(cx, cy, rx, ry, a0, a1)),
        walls: frontRuns(a0, a1).map(([s, e]) => {
          const top = arcPoints(cx, cy, rx, ry, s, e);
          const bottom = [...top].reverse().map(([px, py]) => [px, py + depth] as [number, number]);
          return poly([...top, ...bottom]) + ' Z';
        }),
        // THE MATERIAL, and it is `disc` rather than `glow` — see the note on
        // both in tone.ts. `glow` is cut for a fourteen-pixel arc and forces
        // every branch to one lightness to get there; a solid has area and does
        // not need it, so this keeps the branch palette's own internal contrast,
        // which is the whole of what made a reader call the old one kiddish.
        lit: d.lit,
        base: d.face,
        wall: d.wall,
        rim: d.rim,
      };
    });
  }, [segments, sum, cx, cy, rx, ry, depth]);

  // The share worth printing on the disc, the way the reference prints one
  // figure on one slice: whichever wedge is chosen, or the biggest if none is.
  const shown = useMemo(() => {
    if (wedges.length === 0) return null;
    return wedges.find((w) => w.key === selected)
      ?? wedges.reduce((a, b) => (b.frac > a.frac ? b : a));
  }, [wedges, selected]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  // A thumb outside the lid means "none of them", not "the nearest one". The
  // arithmetic is in lib/utils/dialHit.ts, zero-import and checked offline —
  // because the version that lived here read `locationX`, which react-native-web
  // does not set, and every guard written against the resulting NaN passed. The
  // tap was received, computed and discarded, on every web render, silently.
  const hit = (e: GestureResponderEvent) => {
    if (!onSelect || wedges.length === 0) return;
    const p = pressPoint(e.nativeEvent as never);
    if (!p) return;
    const found = wedgeAt(p.x, p.y, { cx, cy, rx, ry, depth }, wedges);
    if (found) onSelect(found);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={hit} accessibilityRole="none">
        {/* A STABLE ID SO A HARNESS CAN FIND IT (§21, the same reasoning as
            `#beat-progress` and `#drag-strip`) — `document.querySelector('svg')`
            stopped being good enough the moment this panel had more than one. */}
        <Animated.View nativeID="dial" style={[{ width: size, height }, popStyle]}>
          {/* THE SHEEN, under the disc. The reference sets its pies on a pale
              ground and gets a reflection for free; on near-black a shadow is
              invisible, so the grounding has to be the other way round — a
              faint pool of light the disc sits in. Without it the disc floats
              off the panel, which is exactly what a flat chart does. */}
          <Svg width={size} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              <LinearGradient id="dial-sheen" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={mix(PANEL_BASE, C.paper, 0.16)} stopOpacity={1} />
                <Stop offset="100%" stopColor={PANEL_BASE} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Ellipse
              cx={cx}
              cy={cy + depth + 2}
              rx={rx * 0.96}
              ry={ry * 0.50}
              fill="url(#dial-sheen)"
            />
          </Svg>

          {/* The groove the disc sits in, so a reader on day one still sees the
              shape of the thing they are about to fill. */}
          {wedges.length === 0 ? (
            <Svg width={size} height={height} style={StyleSheet.absoluteFill}>
              <Path
                d={poly(arcPoints(cx, cy, rx, ry, 0, 360)) + ' Z'}
                fill={mix(PANEL_BASE, C.paper, 0.07)}
              />
            </Svg>
          ) : null}

          {wedges.map((w) => (
            <Wedge
              key={w.key}
              w={w}
              size={size}
              height={height}
              chosen={selected === w.key}
              dimmed={!!selected && selected !== w.key}
              lift={rx * LIFT}
            />
          ))}
        </Animated.View>
      </Pressable>

      {/* THE FIGURE, printed rather than hubbed. A solid disc has no hole to put
          it in, and it was the THIRD printing of the same number anyway — the
          ledger above says it and the legend beside it adds up to it. What the
          reference does instead is print ONE share on the chart, which says
          something the legend does not: how much of the whole this is. */}
      {shown ? (
        <Text style={styles.share} numberOfLines={1}>
          <Text style={styles.sharePct}>{Math.round(shown.frac * 100)}%</Text>
          <Text style={styles.shareOf}>{`  ${shown.label.toUpperCase()}`}</Text>
        </Text>
      ) : (
        <Text style={styles.share}>
          <Text style={styles.sharePct}>{total}</Text>
          <Text style={styles.shareOf}>{`  ${totalLabel}`}</Text>
        </Text>
      )}
    </View>
  );
}

function Wedge({
  w, size, height, chosen, dimmed, lift,
}: {
  w: {
    key: string; mid: number; face: string; edge: string; walls: string[];
    lit: string; base: string; wall: string; rim: string;
  };
  size: number; height: number; chosen: boolean; dimmed: boolean; lift: number;
}) {
  // THE ONLY THING THAT MOVES IS A TRANSFORM. §17's rule 7 is about the cost of
  // repainting an SVG surface every frame; a translate on the View around it is
  // composited and repaints nothing.
  const out = useDerivedValue(() => withSpring(chosen ? 1 : 0, {
    damping: 15, stiffness: 190, mass: 0.7,
  }), [chosen]);
  const slide = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.cos(rad(w.mid)) * lift * out.value },
      { translateY: Math.sin(rad(w.mid)) * lift * TILT * out.value },
    ],
    // Dimmed, not drained: below about 0.6 the unchosen wedges lose their hue
    // and the disc reads grey the moment anything is picked, which is the
    // dullness this was rebuilt to fix.
    opacity: dimmed ? 0.66 : 1,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, slide, chosen ? styles.front : null]}
    >
      <Svg width={size} height={height}>
        <Defs>
          <LinearGradient
            id={`face-${w.key}`}
            gradientUnits="userSpaceOnUse"
            x1={size * 0.12} y1={0} x2={size * 0.88} y2={height}
          >
            <Stop offset="0%" stopColor={w.lit} />
            <Stop offset="100%" stopColor={w.base} />
          </LinearGradient>
        </Defs>

        {/* The wall first: it hangs BELOW the lid's edge and can never cover it,
            so no z-order arithmetic is needed between the two. */}
        {w.walls.map((d, i) => (
          <Path key={`w${i}`} d={d} fill={w.wall} />
        ))}
        {/* The lid, unstroked. */}
        <Path d={w.face} fill={`url(#face-${w.key})`} />
        {/* And the rim, on the OUTER arc only — see `edge`. A struck edge is
            brighter than either surface it separates, and it is the one part of
            the disc that has to be seen against the panel on its own (6.85:1 at
            worst; the face sits at 2.89 and does not need to). */}
        <Path d={w.edge} fill="none" stroke={w.rim} strokeWidth={0.8} strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  // A chosen wedge is drawn over its neighbours, which is what "lifted" means.
  front: { zIndex: 2 },
  share: { marginTop: 4, textAlign: 'center', includeFontPadding: false },
  sharePct: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: C.paper },
  shareOf: { fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.4, color: C.dim },
});
