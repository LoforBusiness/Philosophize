import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, type GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Stop } from 'react-native-svg';
import { INK, PAPER, ramp, mix } from '@/components/shared/tone';
import { C } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE RING — a real graph again, struck rather than flat.
//
// The reader liked having a chart here and said the replacement bars, while
// clearer, lost something. They were right: a ranking answers "which is
// biggest", and a ring answers "what is the shape of my reading", which is a
// different and more satisfying question. So the ring is back, and the two
// things that made the old pie dull are not.
//
// WHAT THE OLD PIE GOT WRONG:
//  · it was drawn in six GREYS, so a slice had to be matched to a legend one at
//    a time. These are the six measured `BRANCH` hues.
//  · it was FLAT — a filled wedge with a hairline. Every segment here runs
//    lit → base → shade along the one light from `tone.ts`, the same light every
//    rank pin, badge, quote plate and profile bar in this app uses, so the ring
//    reads as a turned object rather than a printed chart.
//  · it hung leader ticks and percentage labels around itself, which is what
//    made it need 50px of padding on every side and still look cramped. The
//    legend below carries the numbers instead, and it is also what you tap.
//
// ── NOT ONE SVG PROPERTY IS ANIMATED, AND THAT IS THE RULE ──────────────────
//
// §17: what costs is the AREA being repainted, and an animated <Svg> is the
// shape that rule is about. The ring is INERT — the arcs are computed once and
// never touched. Everything that moves is a transform on the wrapper, composited
// on the UI thread, which is how the old pie did its entrance too and the one
// thing about it worth keeping.
// ─────────────────────────────────────────────────────────────────────────────

export interface Segment { key: string; label: string; value: number; hue: string }

interface Props {
  segments: Segment[];
  /** The big number in the middle. */
  total: number;
  /** What that number is. */
  totalLabel: string;
  size?: number;
  selected?: string | null;
  onSelect?: (key: string) => void;
  /** Drives the entrance and the bounce — see `bounceTo` in InsightBoard. */
  pop: SharedValue<number>;
}

/** How thick the ring is, and how much of a paper gap sits between segments. */
const STROKE = 26;
const GAP_DEG = 2.2;

export default function Donut({
  segments, total, totalLabel, size = 190, selected, onSelect, pop,
}: Props) {
  const r = (size - STROKE) / 2 - 2;
  const circ = 2 * Math.PI * r;
  const sum = segments.reduce((a, s) => a + s.value, 0);

  // Geometry once. A segment carries its own angular span so a tap can be
  // resolved against it without re-deriving anything.
  const arcs = useMemo(() => {
    if (sum <= 0) return [];
    let acc = 0;
    return segments
      .filter((s) => s.value > 0)
      .map((s) => {
        const frac = s.value / sum;
        const startDeg = acc * 360;
        const endDeg = (acc + frac) * 360;
        acc += frac;
        // The gap is taken off the END of each arc, so the run still starts
        // where the previous one nominally finished and the ring stays closed.
        const drawn = Math.max(0.6, (endDeg - startDeg) - (segments.length > 1 ? GAP_DEG : 0));
        return {
          ...s,
          startDeg,
          endDeg,
          len: (drawn / 360) * circ,
          // THE QUARTER TURN LIVES HERE, not in a <G rotation>, and that is not
          // a preference. A `userSpaceOnUse` gradient inside a rotated group is
          // rotated with it, so putting the ring's -90 on a <G> silently spun
          // the ONE LIGHT with it and the whole ring rendered washed out with no
          // two segments agreeing. An SVG circle's dash starts at three o'clock
          // and runs clockwise; a positive dashoffset walks the pattern back, so
          // a quarter of the circumference moves the run to twelve o'clock and
          // leaves the gradient in plain, unrotated user space.
          offset: -(startDeg / 360) * circ + circ / 4,
          ramp: ramp(s.hue),
        };
      });
  }, [segments, sum, circ]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  // Which segment did that touch land on? Anything in the hole or outside the
  // ring is deliberately inert — a tap there means "none of them", not the
  // nearest one, which is the behaviour a stray thumb wants.
  const hit = (e: GestureResponderEvent) => {
    if (!onSelect || arcs.length === 0) return;
    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - size / 2;
    const dy = locationY - size / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < r - STROKE / 2 - 4 || dist > r + STROKE / 2 + 4) return;
    const deg = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
    const found = arcs.find((a) => deg >= a.startDeg && deg < a.endDeg);
    if (found) onSelect(found.key);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={hit} accessibilityRole="none">
        <Animated.View style={[{ width: size, height: size }, ringStyle]}>
          <Svg width={size} height={size}>
            <Defs>
              {/* USER SPACE, NOT THE OBJECT BOX.
                  A stroked circle's bounding box is the WHOLE circle however
                  little of it the dash actually paints, so an objectBoundingBox
                  gradient gives every arc its own private light and each one
                  samples whichever diagonal slice it happens to sit on — six
                  segments lit from six directions. Spanning the ring in user
                  space instead means ONE light across the whole object, which is
                  what tone.ts requires: an arc at eleven o'clock is lit, one at
                  five is shaded.

                  It only works because the quarter turn is in the dash offset
                  rather than on a <G rotation> — a userSpaceOnUse gradient is
                  rotated along with its group, which would spin the light with
                  the ring and undo the whole point. See `offset` above.

                  The lit end is pulled in from ramp().lit (34% toward paper) to
                  16%: across a whole ring that wider swing reads as a segment
                  that has not finished loading rather than one catching light. */}
              {arcs.map((a) => (
                <LinearGradient
                  key={`g-${a.key}`}
                  id={`seg-${a.key}`}
                  gradientUnits="userSpaceOnUse"
                  x1={size * 0.12} y1={0} x2={size * 0.88} y2={size}
                >
                  <Stop offset="0%" stopColor={mix(a.hue, PAPER, 0.16)} />
                  <Stop offset="52%" stopColor={a.ramp.base} />
                  <Stop offset="100%" stopColor={a.ramp.shade} />
                </LinearGradient>
              ))}
            </Defs>

            {/* The groove the ring sits in, so an empty reader still sees the
                shape of the thing they are about to fill. */}
            <Circle
              cx={size / 2} cy={size / 2} r={r}
              stroke={mix(PAPER, INK, 0.07)} strokeWidth={STROKE} fill="none"
            />

            {/* No rotation — see the dash offset above for why the run still
                starts at twelve o'clock. */}
            <G>
              {arcs.map((a) => {
                const on = selected === a.key;
                return (
                  <Circle
                    key={a.key}
                    cx={size / 2} cy={size / 2} r={r}
                    stroke={`url(#seg-${a.key})`}
                    strokeWidth={on ? STROKE + 7 : STROKE}
                    strokeDasharray={`${a.len} ${circ - a.len}`}
                    strokeDashoffset={a.offset}
                    strokeLinecap="butt"
                    fill="none"
                    // Dimmed, not drained: at 0.45 the unselected arcs lost their hue
                    // and the ring read as grey the moment anything was picked, which
                    // is the dullness this tab was rebuilt to get rid of.
                    opacity={selected && !on ? 0.62 : 1}
                  />
                );
              })}
            </G>
          </Svg>

          {/* The hub. Absolute so it never enters the SVG's layout, and so the
              ring can scale under it without dragging the type along. */}
          <View style={styles.hub} pointerEvents="none">
            <Text style={styles.hubValue}>{total}</Text>
            <Text style={styles.hubLabel}>{totalLabel}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  hub: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  hubValue: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 40, lineHeight: 46,
    color: INK,
  },
  hubLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6,
    color: C.inkSoft, marginTop: 1,
  },
});
