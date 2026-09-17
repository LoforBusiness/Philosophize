import { memo, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming, Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  INK, PAPER, PAPER_LIT, DEEP, TEAL, OLIVE, SAGE, EMBER, TINT, TINT_EDGE, mix,
} from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// THE FIVE TAB ICONS, DRAWN LIKE GAME STICKERS RATHER THAN LIKE A GRADIENT.
//
//   "in the five different icons on the bottom ... I'll have that background.
//    And, really, you can just tell their AI made." (2026-09-16)
//
// The previous set was a teal GRADIENT glyph sitting on a SAND GRADIENT tile.
// Those are the two loudest tells design writers list for AI-made UI — a
// default gradient, and a soft warm glow lit from nowhere in particular — and
// the tile was the gold the owner had just asked to be rid of everywhere.
//
// ── WHAT THE RESEARCH SAID, AND WHAT THIS TAKES FROM IT ─────────────────────
//
// · Duolingo's refreshed tab bar (their blog, 4 Feb 2026) keeps every icon in
//   FULL COLOUR whether or not it is chosen, and marks the chosen tab with a
//   flat tinted rounded tile: a 15% tint of their blue with a 2pt border at
//   about 50%. No gradient, no shadow. So does this bar, in the palette's teal.
// · Their icons are flat rounded shapes whose depth is ONE darker tone of the
//   same hue, hard-edged. Every icon here does the same: a body in TEAL with a
//   hard DEEP side, or a SAGE body with an olive side, and never a gradient.
// · One light, top left, as everywhere else in the app: the shade is on the
//   right or underneath, a small hard highlight on the upper left.
// · Unlike Duolingo, the shapes carry an INK OUTLINE, one weight on all five,
//   because this app is ink on paper and every other drawn thing in it has one.
//   The owner picked this over the unlined version from a sheet of both.
// · One small EMBER spark per icon — a door, a ribbon, a berry, a star, a
//   collar pin. The spark is only ever small (tone.ts), and at 28pt these are.
//
// Two symbols changed. LEARN is an open book: the thought cloud read as "ideas"
// or "help". THINKERS is a laurelled marble bust in SIDE profile on a plinth:
// the feathered hat read as a costume, and a FRONT-facing bust would be the
// Profile icon with a beard. Silhouette is what tells two heads apart at 28pt.
//
// ── THE BAR DRAWS EVERY ICON TWICE ──────────────────────────────────────────
//
// expo-router's TabBarIcon renders one copy with `focused: true` and one with
// `focused: false`, stacked, and switches between them by opacity. So neither
// copy ever sees `focused` change, and a bounce keyed on it would never play.
// `lit` is which copy this is; `open` is whether the tab is the one the reader is
// on, handed in from the layout, and it is what the tile and the bounce follow.
// Both copies draw the same coloured glyph; only the lit one carries the tile.
//
// ── COST ────────────────────────────────────────────────────────────────────
//
// One small <Svg> per copy, never animated: only the Views around it move, which
// is §17's rule 7. Ten 28pt bitmaps are a rounding error in the GPU budget §19
// measures; the full-bleed drawings that broke it were a thousand times larger.
// ─────────────────────────────────────────────────────────────────────────────

// 'insights' went with the statistics tab on 2026-09-15. Its art is deleted
// rather than left in the record: an unreachable icon is a thing the next person
// wires a tab to.
export type TabIconName = 'home' | 'learn' | 'thinkers' | 'pass' | 'profile';

const SIZE = 28;
/** One outline weight on all five, in the 32-unit drawing box: 1.9pt at 28pt. */
const STROKE = 2.2;
const TILE_W = 46;
const TILE_H = 36;

/** The colours a part may be filled with. Flat, every one of them. */
const FILL = {
  body: TEAL,
  bodyShade: DEEP,
  bodyLit: mix(TEAL, PAPER, 0.5),
  second: SAGE,
  secondShade: mix(SAGE, OLIVE, 0.55),
  paper: PAPER_LIT,
  paperShade: mix(SAGE, PAPER, 0.35),
  spark: EMBER,
} as const;
type Fill = keyof typeof FILL;

/**
 * One piece of a drawing. `d` or `c` is its geometry, `fill` its colour; `ink`
 * gives it the outline, at `w` if it wants a finer one. A `line` is a stroke with
 * no fill — a highlight, a perforation, a line of text on a page.
 */
type Part =
  | { d: string; fill: Fill | null; ink?: boolean; w?: number }
  | { c: [number, number, number]; fill: Fill | null; ink?: boolean; w?: number }
  | { line: string; tone: Fill; w: number };

const TICKET = 'M6.2 8 L25.8 8 C26.9 8 27.8 8.9 27.8 10 L27.8 13.1 C26.4 13.4 25.4 14.6 25.4 16 C25.4 17.4 26.4 18.6 27.8 18.9 L27.8 22 C27.8 23.1 26.9 24 25.8 24 L6.2 24 C5.1 24 4.2 23.1 4.2 22 L4.2 18.9 C5.6 18.6 6.6 17.4 6.6 16 C6.6 14.6 5.6 13.4 4.2 13.1 L4.2 10 C4.2 8.9 5.1 8 6.2 8 Z';
const SHOULDERS = 'M5.6 28.4 C5.6 21.8 10.2 19 16 19 C21.8 19 26.4 21.8 26.4 28.4 Z';

// Every drawing sits in a 32-unit box with a margin, and the heaviest mass sits
// low, so the five share a baseline and read as one set. Parts paint in order.
const ART: Record<TabIconName, Part[]> = {
  // A house: sage walls with a hard olive side, a teal roof that overhangs them,
  // a paper window and an ember door.
  home: [
    { d: 'M7 15 L16 7.4 L25 15 L25 26 C25 27.1 24.1 28 23 28 L9 28 C7.9 28 7 27.1 7 26 Z', fill: 'second', ink: true },
    { d: 'M20.6 11.3 L25 15 L25 26 C25 27.1 24.1 28 23 28 L20.6 28 Z', fill: 'secondShade' },
    { d: 'M7 15 L16 7.4 L25 15 L25 26 C25 27.1 24.1 28 23 28 L9 28 C7.9 28 7 27.1 7 26 Z', fill: null, ink: true },
    { d: 'M13.2 28 L13.2 22.2 C13.2 20.6 14.4 19.4 16 19.4 C17.6 19.4 18.8 20.6 18.8 22.2 L18.8 28 Z', fill: 'spark', ink: true },
    { d: 'M2.6 15.2 L16 3.8 L29.4 15.2 C29.9 15.7 29.9 16.5 29.4 17 L28.6 17.8 C28.1 18.3 27.3 18.3 26.8 17.8 L16 8.6 L5.2 17.8 C4.7 18.3 3.9 18.3 3.4 17.8 L2.6 17 C2.1 16.5 2.1 15.7 2.6 15.2 Z', fill: 'body', ink: true },
    { line: 'M6.2 14.6 L14.2 7.8', tone: 'bodyLit', w: 1.3 },
    { d: 'M9.6 18.6 H12 V21 H9.6 Z', fill: 'paper', ink: true, w: 1.2 },
  ],
  // An open book: a teal cover under two pages, the right one in shade, three
  // lines of text and an ember ribbon.
  learn: [
    { d: 'M3 11.2 L3 26.6 C8 25.6 12.6 26 16 28.2 C19.4 26 24 25.6 29 26.6 L29 11.2 Z', fill: 'body', ink: true },
    { d: 'M16 9.6 C12.6 7.4 8.2 7 4.8 8 L4.8 24.4 C8.2 23.4 12.6 23.8 16 26 Z', fill: 'paper', ink: true },
    { d: 'M16 9.6 C19.4 7.4 23.8 7 27.2 8 L27.2 24.4 C23.8 23.4 19.4 23.8 16 26 Z', fill: 'paperShade', ink: true },
    { line: 'M7.6 12.4 C9.6 12 11.6 12.2 13.4 13', tone: 'secondShade', w: 1.3 },
    { line: 'M7.6 15.8 C9.6 15.4 11.6 15.6 13.4 16.4', tone: 'secondShade', w: 1.3 },
    { line: 'M7.6 19.2 C9.2 18.9 10.6 19 12 19.5', tone: 'secondShade', w: 1.3 },
    { d: 'M20.4 7.9 L24.2 7.7 L24.2 17.2 L22.3 15.4 L20.4 17.2 Z', fill: 'spark', ink: true, w: 1.3 },
  ],
  // A marble bust in side profile, facing right, laurelled, on a teal plinth.
  thinkers: [
    { d: 'M7.8 25.4 H24.2 C25 25.4 25.6 26 25.6 26.8 V27.8 C25.6 28.6 25 29.2 24.2 29.2 H7.8 C7 29.2 6.4 28.6 6.4 27.8 V26.8 C6.4 26 7 25.4 7.8 25.4 Z', fill: 'body', ink: true },
    { d: 'M7.6 25.4 C7.6 22.4 9.8 20.6 13 20.6 L19 20.6 C22.2 20.6 24.4 22.4 24.4 25.4 Z', fill: 'paper', ink: true },
    { d: 'M20.8 20.9 C23 21.6 24.4 23.2 24.4 25.4 L21.4 25.4 Z', fill: 'paperShade' },
    // skull, brow, nose and lips, then down the neck, in one silhouette
    { d: 'M12 21 L12.2 18.2 C10.2 16.8 9.2 14.4 9.4 11.6 C9.8 7.2 12.8 4.6 16.8 4.6 C20.4 4.6 22.4 6.8 22.5 9.6 L22.6 10.9 L24.5 13.6 C24.7 14 24.5 14.4 24 14.4 L22.7 14.4 L22.9 15.4 L22.3 16 L22.6 16.8 C22.6 17.6 22 18 21.2 18 L18.6 18.2 L18.4 21 Z', fill: 'paper', ink: true },
    // the beard, under the jaw
    { d: 'M22.4 16.4 C22.8 19 21.4 21.2 18.8 21.2 C16.8 21.2 15.4 20 15.2 18 C16.8 17.4 18.2 16.6 18.8 15.4 C20 15.8 21.2 16.2 22.4 16.4 Z', fill: 'paperShade', ink: true, w: 1.3 },
    // the wreath, brow to nape, every leaf pointing back
    { d: 'M21.83 7.93 Q21.86 4.15 18.2 5.1 Q18.17 8.88 21.83 7.93 Z', fill: 'body', ink: true, w: 1 },
    { d: 'M19.34 5.58 Q17.48 2.29 14.79 4.94 Q16.65 8.23 19.34 5.58 Z', fill: 'body', ink: true, w: 1 },
    { d: 'M16.01 4.79 Q12.75 2.87 11.74 6.51 Q15 8.43 16.01 4.79 Z', fill: 'body', ink: true, w: 1 },
    { d: 'M12.73 5.77 Q8.95 5.74 9.9 9.4 Q13.68 9.43 12.73 5.77 Z', fill: 'body', ink: true, w: 1 },
    // the berry at the brow
    { c: [21.2, 6.2, 1.25], fill: 'spark', ink: true, w: 0.9 },
  ],
  // An admission ticket: teal, notched, a hard DEEP band along its foot, a
  // perforated stub and an ember star.
  pass: [
    { d: TICKET, fill: 'body' },
    { d: 'M4.2 20.6 L27.8 20.6 L27.8 22 C27.8 23.1 26.9 24 25.8 24 L6.2 24 C5.1 24 4.2 23.1 4.2 22 Z', fill: 'bodyShade' },
    { line: 'M11.4 10.4 V11.6 M11.4 13.4 V14.6 M11.4 16.4 V17.6 M11.4 19.4 V20', tone: 'bodyLit', w: 1.3 },
    { line: 'M7 10.8 H9', tone: 'bodyLit', w: 1.3 },
    { d: TICKET, fill: null, ink: true },
    { d: 'M19.4 10.6 L20.75 13.7 L24.1 13.95 L21.55 16.15 L22.35 19.4 L19.4 17.65 L16.45 19.4 L17.25 16.15 L14.7 13.95 L18.05 13.7 Z', fill: 'spark', ink: true, w: 1.2 },
  ],
  // Head and shoulders, front on: the universal "you". Teal, shaded on the
  // right, with a paper collar and an ember pin.
  profile: [
    { d: SHOULDERS, fill: 'body' },
    { d: 'M21.2 19.9 C24.4 21.2 26.4 23.9 26.4 28.4 L22.4 28.4 Z', fill: 'bodyShade' },
    { d: SHOULDERS, fill: null, ink: true },
    { d: 'M13.2 19.4 L16 23.4 L18.8 19.4 Z', fill: 'paper', ink: true, w: 1.2 },
    { d: 'M15 21.6 L16 23.4 L17 21.6 L16 20.8 Z', fill: 'spark' },
    { c: [16, 11.2, 5.8], fill: 'body' },
    { d: 'M18.4 6 C20.6 7 21.8 9 21.8 11.2 C21.8 13.8 20 16.2 17.6 16.8 C19.4 15.2 20 13.4 20 11.2 C20 9.2 19.4 7.4 18.4 6 Z', fill: 'bodyShade' },
    { line: 'M12.6 9.2 C13 8.2 13.8 7.4 14.8 7.1', tone: 'bodyLit', w: 1.4 },
    { c: [16, 11.2, 5.8], fill: null, ink: true },
  ],
};

/**
 * One tab's drawing, on its own. Exported so the stat stickers elsewhere can use
 * the SAME book and bust rather than a second, drifting copy of them; the tab
 * bar itself draws it at 28pt exactly as before.
 */
export function TabGlyph({ name, size = SIZE, line = INK }: { name: TabIconName; size?: number; line?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {ART[name].map((p, i) => {
        if ('line' in p) {
          return (
            <Path key={i} d={p.line} fill="none" stroke={FILL[p.tone]} strokeWidth={p.w} strokeLinecap="round" />
          );
        }
        const paint = {
          fill: p.fill ? FILL[p.fill] : 'none',
          stroke: p.ink ? line : 'none',
          strokeWidth: p.ink ? (p.w ?? STROKE) : 0,
          strokeLinejoin: 'round' as const,
          strokeLinecap: 'round' as const,
        };
        return 'c' in p
          ? <Circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.c[2]} {...paint} />
          : <Path key={i} d={p.d} {...paint} />;
      })}
    </Svg>
  );
}

/**
 * One copy of one tab's icon.
 *
 * `lit` is which of the bar's two copies this is; only the lit copy carries the
 * tile. `open` is whether the reader is on this tab: the tile fades in and the
 * icon bounces when the tab is CHOSEN, never on mount, because every tab is
 * built at startup and a mount animation would spend itself behind the launch
 * screen.
 */
function TabIcon({ name, lit, open }: { name: TabIconName; lit: boolean; open: boolean }) {
  const on = useSharedValue(lit && open ? 1 : 0);
  const pop = useSharedValue(1);
  const mounted = useRef(false);

  useEffect(() => {
    if (!lit) return;
    const first = !mounted.current;
    mounted.current = true;
    if (!open) {
      // The bar has already hidden this copy, so nothing is seen leaving; reset
      // at once so the next arrival starts from an empty tile.
      on.value = 0;
      pop.value = 1;
      return;
    }
    on.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    if (first) return;
    // A squeeze, then a spring past full size and back: anticipation and
    // overshoot, the two halves that make a bounce read as a reaction. Apple's
    // own advice for a bounce is a damping ratio around 0.5 to 0.6.
    pop.value = withSequence(
      withTiming(0.82, { duration: 90, easing: Easing.out(Easing.quad) }),
      withSpring(1, { duration: 440, dampingRatio: 0.5 }),
    );
  }, [lit, open, on, pop]);

  const tile = useAnimatedStyle(() => ({
    opacity: on.value,
    transform: [{ scale: 0.8 + 0.2 * on.value }],
  }));
  const icon = useAnimatedStyle(() => ({
    transform: [{ translateY: -1 * on.value }, { scale: pop.value * (1 + 0.06 * on.value) }],
  }));

  return (
    <View style={st.box} pointerEvents="none">
      {lit ? <Animated.View style={[st.tile, tile]} /> : null}
      <Animated.View style={icon}>
        <TabGlyph name={name} />
      </Animated.View>
    </View>
  );
}

export default memo(TabIcon);

const st = StyleSheet.create({
  // The icon's own box stays 28pt, the size the bar lays out for; the tile is
  // centred on it and allowed to overhang, the way the old focused icon grew past
  // its box without disturbing the bar.
  box: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  // FLAT: a tint of the teal with a teal edge, nothing lit and nothing cast.
  tile: {
    position: 'absolute',
    left: (SIZE - TILE_W) / 2,
    top: (SIZE - TILE_H) / 2,
    width: TILE_W,
    height: TILE_H,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: TINT_EDGE,
    backgroundColor: TINT,
  },
});
