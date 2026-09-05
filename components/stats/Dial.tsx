import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, type GestureResponderEvent } from 'react-native';
import Animated, {
  useAnimatedStyle, useDerivedValue, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { EASE_REVEAL } from '@/components/stats/reveal';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { PANEL_BASE, disc, mix } from '@/components/shared/tone';
import { C } from '@/constants/design';
import { pressPoint, wedgeAt } from '@/lib/utils/dialHit';

// ─────────────────────────────────────────────────────────────────────────────
// THE DIAL — a struck rosette, seen straight on.
//
// ── THREE ROUNDS, AND EACH NOTE RULED OUT THE OBVIOUS FIX FOR THE LAST ──────
//
//   1. > "the graph is too kidesh … not just a bunch of colors that make the app
//      > feel cheep."
//
//      A flat pie of six saturated fills on paper. The answer was AREA and
//      GROUND: the same six branches at 14px on near-black, cut to jewel tones.
//
//   2. > "it looks a little bit doo kiddish … Looks very flat … I wanted to have
//      > depth."
//
//      A ring is a LINE, and a line cannot have a lit side and a shaded one. So
//      it became a solid — and, following a reference of 3D pie charts, a solid
//      seen at an ANGLE, with an extruded wall along its front.
//
//   3. > "I don't like how it looks further away on one end and closer on the
//      > other. This is not what I meant when I want a depth … right now, it
//      > looks sideways or like it's fallen over."
//
// ── PERSPECTIVE IS NOT THE ONLY KIND OF DEPTH, AND HERE IT IS THE WRONG ONE ──
//
// The tilt was doing two things at once and only one of them was wanted. It made
// the disc a solid — good — and it also put the wedges at DIFFERENT DISTANCES,
// which a chart of shares must not do: a tipped circle foreshortens the far side,
// so the same share drawn at 12 o'clock covers barely half the area it covers at
// 6 o'clock, and the reader compares areas whether they mean to or not. It also
// gives a wall to two wedges and none to the other four, so a third of the object
// is drawn in a vocabulary the rest of it does not have.
//
// Everything else premium in this app is a struck solid seen STRAIGHT ON — the
// rank pins, the badges, the certificates, the streak calendar — and none of them
// is tipped. They are solid because of how they are LIT, not because of where the
// camera is. That is the depth to use, and the whole of it is:
//
//   · every piece is CHAMFERED — a bevel band around its edge, running from `rim`
//     at the top left to `wall` at the bottom right across the whole disc, so the
//     pieces on the lamp's side catch their edge and the ones opposite lose it.
//     A gradient is exact for that, because on a circle the outward normal IS the
//     position;
//   · the two RADIAL CUTS are lit from their own normals instead, one per flat,
//     because a gradient lights a surface by where it is and both walls of a
//     groove are in the same place while facing opposite ways. Lit by position
//     they came out identical and every groove read as a black slot;
//   · the pieces are SEPARATE, parted by a groove of constant width, so they read
//     as six struck pieces set in a ring rather than slices of one painted circle;
//   · they sit in a SOCKET, whose gradient runs the opposite way — dark where a
//     dome is light — because that is what a cut in a surface does (the rule
//     StruckNiche already states), which also puts the disc's bright edge on the
//     socket's dark side and its dark edge on the socket's bright one;
//   · they cast a SHADOW down and right onto that socket, which is the one cue
//     that says they stand proud of it rather than being painted on it;
//   · and the whole thing sits on a pool of light, because on near-black a drop
//     shadow against the panel is invisible and grounding has to be done the
//     other way round.
//
// Nothing is further away than anything else. Every wedge of the same size is the
// same shape, wherever it sits, and a chosen one slides out along its own
// bisector by exactly the distance every other one would.
//
// ── ONE SVG PER PIECE, WHICH IS NOT WASTE ───────────────────────────────────
//
// §17's rule 7 forbids animating an SVG's properties; a transform on the View
// that CONTAINS the SVG is free, composites on the GPU, and re-rasterises
// nothing. So each piece gets its own surface and the selection is a spring on a
// translate — and painter's order can put the lifted piece over its neighbours.
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
  /**
   * THE ARRIVAL, 0 to 1, driven by the screen.
   *
   * The whole disc used to squeeze to 0.82 and spring 39% past itself on every
   * visit with news, which is the loudest thing that was on this tab and the
   * first thing the reader named. A rosette is SIX PIECES SET IN A RING — the
   * file says so at length a hundred lines up — so it arrives the way it is
   * built: each piece settles into its socket from a little way out, clockwise
   * from twelve, and stops. Nothing is ever the wrong size, which on a chart of
   * shares is not a stylistic preference.
   */
  enter: SharedValue<number>;
  /** 0→1→0, the reaction: one piece lifts and comes home. See `nudgeKey`. */
  nudge: SharedValue<number>;
  /**
   * Which piece the reaction is about — the branch whose lesson count moved.
   * The lift is the dial's OWN vocabulary for "this one": it is exactly what
   * being chosen does, held for a moment and then let go, so the tab gained no
   * new motion to learn.
   */
  nudgeKey?: string | null;
}

/** The socket the rosette is set into, drawn outside it. */
const RING = 3.5;
/** The chamfer at the outer edge, and the narrower one at the spindle. */
const BEVEL = 5.5;
const IN_BEVEL = 1.5;
/** The chamfer on the two radial CUTS. */
const CUT = 3;
/** The groove between two pieces. Half of it comes off each neighbour. */
const GAP = 1.2;
/**
 * WHERE THE LIGHT IS, in the same screen degrees everything else here uses: the
 * top left, as it is for every struck thing in this app (tone.ts).
 *
 * It has to be stated as a NUMBER, not left implicit in a gradient, because a
 * gradient can only light a surface by WHERE IT IS. That is exact for the outer
 * arc — on a circle the outward normal is the position — and exactly wrong for
 * the two radial cuts, whose faces point in opposite directions from the same
 * place. Lit by position they came out the same tone, so a groove had no lit
 * side and no shaded side and read as a black slot cut through the disc.
 */
const LAMP = -135;
/** The spindle the pieces are set around, so six points never meet at one. */
const HOLE = 8;
/** How far a chosen piece slides out, as a fraction of the radius. */
const LIFT = 0.085;
/** Degrees per sampled point along an arc. Fine enough that no edge shows facets. */
const STEP = 2;

// A WORKLET, because `Piece`'s `useAnimatedStyle` calls it — and a plain function
// reaching a worklet's closure is not a slow path, it is a THROW. Reanimated packs
// it as a `RemoteFunction` whose only behaviour on the UI thread is
// `Tried to synchronously call a non-worklet function \`rad\` on the UI thread`
// (react-native-worklets/memory/valueUnpacker.native.js). §17's rule 6.
//
// IT IS INVISIBLE IN A BROWSER AND ONLY IN A BROWSER. react-native-web runs every
// worklet on the JS thread with a real closure, so `rad` is simply called and the
// chart is perfect — which is how this shipped past a mounted-and-measured sweep,
// a contact sheet and `check:ui`. It is still an ordinary function to JS callers,
// so `arcPoints` below needs no change.
const rad = (deg: number) => { 'worklet'; return (deg * Math.PI) / 180; };
const deg = (r: number) => (r * 180) / Math.PI;

/** A real black. `C.ink` is #1A1A1A and the panel is #0E0E0E — see the socket. */
const BLACK = '#000000';

/** Points along a circle between two angles, inclusive of both ends. */
function arcPoints(cx: number, cy: number, r: number, a0: number, a1: number) {
  const out: [number, number][] = [];
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / STEP));
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))]);
  }
  return out;
}

const poly = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

/**
 * One piece of the rosette: an outer arc, an inner arc, and the two cuts between.
 *
 * `inset` is a WIDTH, not an angle, and it is converted separately at each radius
 * — which is the whole point. A groove of constant width is what an inlay looks
 * like; one angular inset used at both radii gives a groove that is four times
 * wider at the rim than at the spindle, which reads as six petals rather than six
 * pieces of one disc.
 *
 * It is clamped to leave a third of the piece standing, because the smallest
 * branch on a real reader's chart is one lesson in thirty-six — ten degrees — and
 * an inset allowed to eat more than the piece inverts the polygon rather than
 * merely looking thin.
 */
function pads(rOut: number, rIn: number, a0: number, a1: number, inset: number) {
  const cap = (a1 - a0) * 0.33;
  return [Math.min(deg(inset / rOut), cap), Math.min(deg(inset / rIn), cap)];
}

function pieceAt(cx: number, cy: number, rOut: number, rIn: number, a0: number, a1: number, inset: number) {
  const [pO, pI] = pads(rOut, rIn, a0, a1, inset);
  const outer = arcPoints(cx, cy, rOut, a0 + pO, a1 - pO);
  const inner = arcPoints(cx, cy, rIn, a1 - pI, a0 + pI);
  return poly([...outer, ...inner]) + ' Z';
}

/**
 * How much light a flat face whose outward normal points along `n` catches:
 * 0 turned fully away from the lamp, 1 facing it square on.
 */
const litness = (n: number) => (Math.cos(rad(n - LAMP)) + 1) / 2;

/**
 * One of a piece's two cut faces: the quad between where the bevel's edge starts
 * and where the face's edge starts, at both radii. `end` picks the `a1` side.
 */
function cutFace(
  cx: number, cy: number, rOut: number, rIn: number, a0: number, a1: number, end: boolean,
) {
  const [bO, bI] = pads(rOut, rIn, a0, a1, GAP / 2);
  const [fO, fI] = pads(rOut - BEVEL, rIn + IN_BEVEL, a0, a1, GAP / 2 + CUT);
  const s = end ? -1 : 1;
  const base = end ? a1 : a0;
  const at = (rr: number, aa: number): [number, number] =>
    [cx + rr * Math.cos(rad(aa)), cy + rr * Math.sin(rad(aa))];
  return poly([
    at(rOut, base + s * bO),
    at(rOut - BEVEL, base + s * fO),
    at(rIn + IN_BEVEL, base + s * fI),
    at(rIn, base + s * bI),
  ]) + ' Z';
}

export default function Dial({
  segments, total, totalLabel, size = 132, selected, onSelect, enter, nudge, nudgeKey,
}: Props) {
  const sum = segments.reduce((a, x) => a + x.value, 0);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - RING - 2;
  const height = size;

  const wedges = useMemo(() => {
    if (sum <= 0) return [];
    const drawn = segments.filter((x) => x.value > 0);
    let acc = -90;                                  // 12 o'clock, clockwise
    return drawn.map((x) => {
      const span = (x.value / sum) * 360;
      const a0 = acc;
      const a1 = acc + span;
      acc = a1;
      const d = disc(x.hue);
      return {
        ...x,
        a0,
        a1,
        mid: (a0 + a1) / 2,
        frac: x.value / sum,
        // THE WHOLE PIECE, in the bevel's material. What shows of it after the
        // face is laid on top is the chamfer — a band of constant width at the
        // rim, tapering along the cuts, exactly as a struck edge does.
        bevel: pieceAt(cx, cy, r, HOLE, a0, a1, GAP / 2),
        face: pieceAt(cx, cy, r - BEVEL, HOLE + IN_BEVEL, a0, a1, GAP / 2 + CUT),
        // THE TWO CUT FACES, each a flat quad with its own tone. The `a0` edge
        // faces a quarter turn back from where the piece begins and the `a1` edge
        // a quarter turn on from where it ends, so on any one groove one wall
        // catches the lamp and the other loses it — which is what a groove looks
        // like, and what the gradient could not say.
        cuts: [
          cutFace(cx, cy, r, HOLE, a0, a1, false),
          cutFace(cx, cy, r, HOLE, a0, a1, true),
        ] as const,
        cutTone: [
          mix(d.wall, d.rim, litness(a0 - 90)),
          mix(d.wall, d.rim, litness(a1 + 90)),
        ] as const,
        // THE MATERIAL, and it is `disc` rather than `glow` — see the note on
        // both in tone.ts. `glow` is cut for a fourteen-pixel arc and forces
        // every branch to one lightness to get there; a solid has area and does
        // not need it, so this keeps the branch palette's own internal contrast,
        // which is the whole of what made a reader call the old one kiddish.
        lit: d.lit,
        base: d.face,
        deep: mix(d.face, PANEL_BASE, 0.22),
        // The two ends of the chamfer: `rim` where it faces the lamp, `wall`
        // where it turns away from it. Same two roles the extruded wall used,
        // which is why the palette needed no changing when the tilt went.
        edgeLit: d.rim,
        edgeDim: d.wall,
      };
    });
  }, [segments, sum, cx, cy, r]);

  // The share worth printing under the disc, the way the reference prints one
  // figure on one slice: whichever piece is chosen, or the biggest if none is.
  const shown = useMemo(() => {
    if (wedges.length === 0) return null;
    return wedges.find((w) => w.key === selected)
      ?? wedges.reduce((a, b) => (b.frac > a.frac ? b : a));
  }, [wedges, selected]);

  // A thumb outside the socket means "none of them", not "the nearest one". The
  // arithmetic is in lib/utils/dialHit.ts, zero-import and checked offline —
  // because the version that lived here read `locationX`, which react-native-web
  // does not set, and every guard written against the resulting NaN passed. The
  // tap was received, computed and discarded, on every web render, silently.
  const hit = (e: GestureResponderEvent) => {
    if (!onSelect || wedges.length === 0) return;
    const p = pressPoint(e.nativeEvent as never);
    if (!p) return;
    const found = wedgeAt(p.x, p.y, { cx, cy, rx: r, ry: r, slop: RING + 2 }, wedges);
    if (found) onSelect(found);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={hit} accessibilityRole="none">
        {/* A STABLE ID SO A HARNESS CAN FIND IT (§21, the same reasoning as
            `#beat-progress` and `#drag-strip`) — document.querySelector on the
            tag stopped being good enough the moment this panel had more than
            one surface. */}
        {/* NO TRANSFORM ON THE WHOLE DISC ANY MORE. Every arrival and every
            reaction now belongs to a PIECE, so the object itself never changes
            size — see the note on `enter` in Props. */}
        <View nativeID="dial" style={{ width: size, height }}>
          <Svg width={size} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              {/* THE POOL OF LIGHT the disc sits on. The reference sets its pies
                  on a pale ground and gets a reflection for free; on near-black a
                  shadow is invisible, so the grounding has to be the other way
                  round. Without it the disc floats off the panel, which is
                  exactly what a flat chart does. */}
              <LinearGradient id="dial-sheen" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={mix(PANEL_BASE, C.paper, 0.15)} stopOpacity={1} />
                <Stop offset="100%" stopColor={PANEL_BASE} stopOpacity={0} />
              </LinearGradient>
              {/* THE SOCKET, and its gradient runs the OPPOSITE way to every
                  piece in it: a groove is dark where a dome is light, because
                  the near wall of a cut shades the side the light comes from.
                  Reverse this and the rosette reads as sitting on a coaster.
                  BOTH STOPS ARE MIXED TOWARD BLACK, NOT TOWARD `C.ink` — ink is
                  #1A1A1A and the panel is #0E0E0E, so mixing toward it LIGHTENS,
                  and the first draft of this groove had its shaded end paler than
                  the surface it was supposed to be cut into. */}
              <LinearGradient
                id="dial-socket"
                gradientUnits="userSpaceOnUse"
                x1={size * 0.12} y1={0} x2={size * 0.88} y2={height}
              >
                <Stop offset="0%" stopColor={mix(PANEL_BASE, BLACK, 0.85)} />
                <Stop offset="100%" stopColor={mix(PANEL_BASE, C.paper, 0.20)} />
              </LinearGradient>
              {/* The spindle: quiet, and lit the same way everything else is. */}
              <LinearGradient
                id="dial-pin"
                gradientUnits="userSpaceOnUse"
                x1={cx - HOLE} y1={cy - HOLE} x2={cx + HOLE} y2={cy + HOLE}
              >
                <Stop offset="0%" stopColor={mix(PANEL_BASE, C.paper, 0.22)} />
                <Stop offset="100%" stopColor={mix(PANEL_BASE, BLACK, 0.45)} />
              </LinearGradient>
            </Defs>
            <Circle cx={cx} cy={cy + 4} r={r + RING + 1} fill="url(#dial-sheen)" />
            <Circle cx={cx} cy={cy} r={r + RING} fill="url(#dial-socket)" />
            {/* THE CAST SHADOW. The rosette's own silhouette, dropped down-right
                onto the socket — the one cue that says the pieces stand PROUD of
                what they are set in rather than being painted on it. It shows
                only in the grooves and as a crescent on the ring, because the
                pieces cover the rest of it. */}
            <Circle cx={cx + 1.6} cy={cy + 2.4} r={r} fill={mix(PANEL_BASE, BLACK, 0.9)} />
            <Circle cx={cx} cy={cy} r={HOLE - 1.6} fill="url(#dial-pin)" />
            {/* Day one: the shape of the thing the reader is about to fill. */}
            {wedges.length === 0 ? (
              <Path
                d={pieceAt(cx, cy, r, HOLE, 0, 360, 0)}
                fill={mix(PANEL_BASE, C.paper, 0.07)}
              />
            ) : null}
          </Svg>

          {wedges.map((w, i) => (
            <Piece
              key={w.key}
              w={w}
              size={size}
              height={height}
              index={i}
              count={wedges.length}
              chosen={selected === w.key}
              dimmed={!!selected && selected !== w.key}
              marked={nudgeKey === w.key}
              enter={enter}
              nudge={nudge}
              lift={r * LIFT}
            />
          ))}
        </View>
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

function Piece({
  w, size, height, index, count, chosen, dimmed, marked, enter, nudge, lift,
}: {
  w: {
    key: string; mid: number; face: string; bevel: string;
    cuts: readonly string[]; cutTone: readonly string[];
    lit: string; base: string; deep: string; edgeLit: string; edgeDim: string;
  };
  size: number; height: number; index: number; count: number;
  chosen: boolean; dimmed: boolean; marked: boolean;
  enter: SharedValue<number>; nudge: SharedValue<number>; lift: number;
}) {
  // THE ONLY THING THAT MOVES IS A TRANSFORM. §17's rule 7 is about the cost of
  // repainting an SVG surface every frame; a translate on the View around it is
  // composited and repaints nothing.
  //
  // BEING CHOSEN IS AN ANSWER TO A TAP, SO IT DOES NOT OVERSHOOT. It used to
  // spring at damping 15 / stiffness 190 / mass 0.7 — a ratio of 0.65, so the
  // piece slid 7% too far out and came back every single time one was picked.
  // A tap carries no momentum for a spring to spend; a flick does, and there
  // are none on this screen.
  const out = useDerivedValue(() => withTiming(chosen ? 1 : 0, {
    duration: 320, easing: EASE_REVEAL,
  }), [chosen]);

  const slide = useAnimatedStyle(() => {
    // ITS OWN WINDOW ON THE SHARED ARRIVAL. Clockwise from twelve, each piece
    // takes the same length of time and starts a little later than the one
    // before it — a stagger of about 90ms across six, inside the published
    // 50–100ms band, and self-scaling if a branch is ever added or removed.
    const lead = (index / Math.max(1, count)) * 0.55;
    const e = Math.min(1, Math.max(0, (enter.value - lead) / (1 - lead)));

    // Three sources, one distance along the bisector, and they simply add:
    // the piece SETTLING IN from outside its socket, the piece being CHOSEN,
    // and the piece being MARKED because its branch is what moved. All three
    // are the same gesture at different amplitudes, which is why the disc reads
    // as one object with one behaviour rather than three animations.
    // 2.2 lifts and 1.0 lifts, and both were picked off the geometry rather
    // than by feel. A LIFT is 8.5% of the radius -- about 5px on the 132px
    // disc -- which is right for "this one is chosen" and far too small to
    // read as a piece arriving, so the entrance travels a little over two of
    // them. The MARK is exactly one, because being marked and being chosen are
    // the same statement about the same piece and the dial should not have two
    // amplitudes for it. The piece furthest out is also the most transparent,
    // so nothing ever draws visibly outside the socket on the way in.
    const d = lift * (
      (1 - e) * 2.2
      + out.value
      + (marked ? nudge.value : 0)
    );

    return {
      // STRAIGHT OUT ALONG ITS OWN BISECTOR, and the y is not scaled by
      // anything. That is the whole difference from the tipped version: every
      // piece travels the same distance, so being chosen means the same thing
      // at 12 o'clock as at 6, and nothing is nearer the reader than anything
      // else.
      transform: [
        { translateX: Math.cos(rad(w.mid)) * d },
        { translateY: Math.sin(rad(w.mid)) * d },
      ],
      // Dimmed, not drained: below about 0.6 the unchosen pieces lose their hue
      // and the disc reads grey the moment anything is picked, which is the
      // dullness this was rebuilt to fix.
      opacity: (dimmed ? 0.66 : 1) * e,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, slide, chosen ? styles.front : null]}
    >
      <Svg width={size} height={height}>
        <Defs>
          {/* Both gradients run the same way, across the WHOLE box rather than
              across each piece — one light for the whole object, so a piece on
              the left is brighter than the same piece would be on the right and
              the six read as one struck thing rather than six coloured shapes. */}
          {/* THREE STOPS, and the third is what makes a piece read as a domed
              surface rather than a coloured area. The branch's own tone has to
              hold most of the face — it is what the legend beside it is matched
              against — so the fall into shade is kept to the last third, where
              the light genuinely would not reach. Two stops over an 11% swing is
              the "7% tonal range is invisible" note in tone.ts, one size up. */}
          <LinearGradient
            id={`face-${w.key}`}
            gradientUnits="userSpaceOnUse"
            x1={size * 0.12} y1={0} x2={size * 0.88} y2={height}
          >
            <Stop offset="0%" stopColor={w.lit} />
            <Stop offset="62%" stopColor={w.base} />
            <Stop offset="100%" stopColor={w.deep} />
          </LinearGradient>
          <LinearGradient
            id={`bev-${w.key}`}
            gradientUnits="userSpaceOnUse"
            x1={size * 0.12} y1={0} x2={size * 0.88} y2={height}
          >
            <Stop offset="0%" stopColor={w.edgeLit} />
            <Stop offset="100%" stopColor={w.edgeDim} />
          </LinearGradient>
        </Defs>

        {/* The chamfer first, at full size; the two cut walls over it; the face
            last, covering everything but the band. No stroke anywhere: a stroke
            is a line drawn ON a shape, and these are surfaces the shape TURNS
            into. */}
        <Path d={w.bevel} fill={`url(#bev-${w.key})`} />
        {w.cuts.map((d, i) => (
          <Path key={`c${i}`} d={d} fill={w.cutTone[i]} />
        ))}
        <Path d={w.face} fill={`url(#face-${w.key})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  // A chosen piece is drawn over its neighbours, which is what "lifted" means.
  front: { zIndex: 2 },
  share: { marginTop: 2, textAlign: 'center', includeFontPadding: false },
  sharePct: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: C.paper },
  shareOf: { fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.4, color: C.dim },
});
