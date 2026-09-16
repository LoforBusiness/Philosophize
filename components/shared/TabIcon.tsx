import { memo, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { INK, PAPER, PAPER_LIT, PAPER_SHADE, FAINT, mix, PATINA, EMBER_INK, SAND, SAND_SHADE, SAND_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// THE SIX TAB ICONS, AS THINGS YOU CAN HOLD.
//
//   "the six on the very bottom of the app ... They're pretty flat and boring."
//
// They were hairline drawings from SketchIcon, the same two-point ink stroke as
// every small mark in the app, told apart only by colour: ink when chosen, a pale
// grey when not. That grey measured about 1.9:1 on paper, under the 3:1 WCAG asks
// of a mark that carries meaning, and with the labels hidden, colour was the ONLY
// thing saying which tab was open.
//
// ── WHAT THE RESEARCH SAID, AND WHAT THIS KEEPS OF IT ───────────────────────
//
// · A chosen tab is a FILLED shape and an unchosen one an outline. Apple's tab
//   bar guidance and Material's fill axis both say it, and it means the state is
//   carried by SHAPE, so it survives colour blindness and a sunlit screen.
// · Rounded, chunky forms with no sharp points: Duolingo's shape language.
// · The chosen icon sits on a tile, as in Duolingo's refreshed tab bar (January
//   2026). Here the tile is pressed INTO the paper, a recess, because a raised
//   tile with a lip is how this app says "press me", and this tab is already
//   pressed.
// · One bounce when it is chosen, once. Apple's own advice is a spring damped
//   around 0.5 to 0.6: less reads as a toy, more stops reading as a bounce.
//
// And what it deliberately does NOT copy: Duolingo gives each tab its own hue.
// The six branch colours already mean "this branch" on Insights, and §19 records
// six saturated colours at once as the thing that made a screen look cheap. So
// the fill is the app's accent, the palette's slate teal (tone.ts), lit from the
// top left like every struck thing here, with an ink rim, sand details inside the
// body and a sand recess behind it. It was gold until the owner called it "pretty
// AI" (2026-09-15).
//
// ── THE BAR DRAWS EVERY ICON TWICE ──────────────────────────────────────────
//
// expo-router's TabBarIcon renders one copy with `focused: true` and one with
// `focused: false`, stacked, and switches between them by opacity. So neither
// copy ever sees `focused` change, and a bounce keyed on it would never play.
// `lit` is which copy this is; `open` is whether the tab is the one the reader is
// on, handed in from the layout, and it is what the tile and the bounce follow.
//
// ── COST ────────────────────────────────────────────────────────────────────
//
// One small <Svg> per copy, never animated: only the Views around it move, which
// is §17's rule 7. Twelve 28pt bitmaps are a rounding error in the GPU budget §19
// measures; the full-bleed drawings that broke it were a thousand times larger.
// ─────────────────────────────────────────────────────────────────────────────

// 'insights' went with the statistics tab on 2026-09-15. Its art is deleted
// rather than left in the record: an unreachable icon is a thing the next person
// wires a tab to.
export type TabIconName = 'home' | 'learn' | 'thinkers' | 'pass' | 'profile';


/**
 * The unchosen glyph: ink, faded only as far as a meaningful mark can afford.
 * It measures 4.2:1 on paper, against the 1.9:1 of the grey it replaced.
 */
export const TAB_IDLE = mix(INK, PAPER, 0.42);

const SIZE = 28;
const STROKE = 2.2;
const TILE_W = 46;
const TILE_H = 36;

interface Art {
  /** The shape that fills with the accent when chosen and is outlined when not. */
  body: string[];
  /** Round parts of the body, as [cx, cy, r]. */
  bodyDots?: [number, number, number][];
  /** Solid details: ink when chosen, the idle grey when not. */
  solid?: string[];
  solidDots?: [number, number, number][];
  /**
   * Details INSIDE the body: sand when chosen, the idle grey when not. Ink on the
   * teal is 1.64:1, so a detail drawn in ink on the chosen body disappears.
   */
  inset?: string[];
  insetDots?: [number, number, number][];
  insetLines?: string[];
  /** Lines drawn the same way in both states. */
  lines?: string[];
  /** A paper-white part with an ink edge when chosen; an outline when not. */
  paper?: string[];
  /** Only there when chosen: the one flourish a tab earns for being open. */
  flourish?: string[];
}

// Every drawing sits in a 32-unit box with a 2-unit margin, and the heaviest
// mass sits low, so the six share a baseline and read as one set.
const ART: Record<TabIconName, Art> = {
  // A house with its roof overhanging the walls, and a dark door.
  home: {
    body: ['M7 14.6 L16 6.8 L25 14.6 L25 25.2 C25 26.3 24.1 27.2 23 27.2 L9 27.2 C7.9 27.2 7 26.3 7 25.2 Z'],
    // The door stops at the wall's inner edge, so a sand door does not notch
    // the ink outline under it.
    inset: ['M13.2 26.1 L13.2 21.4 C13.2 20.3 14.1 19.4 15.2 19.4 L16.8 19.4 C17.9 19.4 18.8 20.3 18.8 21.4 L18.8 26.1 Z'],
    lines: ['M3.8 16.4 L16 5.4 L28.2 16.4'],
  },
  // The thought cloud with a question in it: curiosity, which is what the Learn
  // tab has always been drawn as, so the reader keeps their bearings.
  learn: {
    body: ['M9.4 23.2 C5.6 23.2 3.8 20.2 5.4 17.4 C4.4 13.8 7.6 11.2 10.7 12.2 C11.9 8.1 18.2 7.4 20.3 11.2 C24.2 10.2 27.6 13.3 26.5 16.9 C29.1 18.1 28.4 23.2 24.5 23.2 Z'],
    // Clear of the cloud by a stroke's width: closer than that and the two
    // outlines met and the bubbles read as a smudge at tab size.
    bodyDots: [[7.6, 28.2, 1.6], [4.6, 30, 0.9]],
    insetLines: ['M13.9 14.9 C13.9 12.8 18.3 12.7 18.3 15 C18.3 16.7 16.2 16.9 16.2 18.8'],
    insetDots: [[16.2, 21, 1.2]],
  },
  // The philosopher's hat: a teal crown, a dark brim, a sand feather.
  thinkers: {
    body: ['M8.6 20.4 C8.6 12.8 11.6 8.6 16 8.6 C20.4 8.6 23.4 12.8 23.4 20.4 Z'],
    paper: ['M21.6 14.2 C22.6 10 24.6 6.2 27.8 3.6 C29 8.4 26.2 12.6 22.4 15.4 Z'],
    solid: ['M3.4 21.4 C3.4 18.7 28.6 18.7 28.6 21.4 C28.6 24.2 3.4 24.2 3.4 21.4 Z'],
    insetLines: ['M9.2 17.4 C12.4 19 19.6 19 22.8 17.4'],
  },
  // An admission ticket, notched at both sides, with a star struck on it.
  pass: {
    body: ['M6.2 8 L25.8 8 C26.9 8 27.8 8.9 27.8 10 L27.8 13.1 C26.4 13.4 25.4 14.6 25.4 16 C25.4 17.4 26.4 18.6 27.8 18.9 L27.8 22 C27.8 23.1 26.9 24 25.8 24 L6.2 24 C5.1 24 4.2 23.1 4.2 22 L4.2 18.9 C5.6 18.6 6.6 17.4 6.6 16 C6.6 14.6 5.6 13.4 4.2 13.1 L4.2 10 C4.2 8.9 5.1 8 6.2 8 Z'],
    inset: ['M16 10.9 L17.35 14.2 L20.9 14.45 L18.2 16.75 L19.05 20.2 L16 18.35 L12.95 20.2 L13.8 16.75 L11.1 14.45 L14.65 14.2 Z'],
  },
  // A bust: head and shoulders.
  profile: {
    body: ['M6.4 27.6 C6.4 20.9 10.8 18.7 16 18.7 C21.2 18.7 25.6 20.9 25.6 27.6 Z'],
    bodyDots: [[16, 11.2, 5.2]],
  },
};

function Glyph({ name, lit }: { name: TabIconName; lit: boolean }) {
  const a = ART[name];
  const id = `tabplate-${name}`;
  const edge = lit ? INK : TAB_IDLE;
  const line = {
    stroke: edge, strokeWidth: STROKE, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  const body = { ...line, fill: lit ? `url(#${id})` : 'none' };
  const solid = { fill: edge, stroke: edge, strokeWidth: lit ? 0.6 : 0.4, strokeLinejoin: 'round' as const };
  // A detail inside the chosen body is sand; unchosen, it is the outline's grey.
  const mark = lit ? SAND : edge;

  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 32 32">
      {lit ? (
        <Defs>
          <SvgGradient id={id} x1="15%" y1="0%" x2="85%" y2="100%">
            <Stop offset="0%" stopColor={PATINA.lit} />
            <Stop offset="55%" stopColor={PATINA.base} />
            <Stop offset="100%" stopColor={PATINA.shade} />
          </SvgGradient>
        </Defs>
      ) : null}
      {a.body.map((d) => <Path key={d} d={d} {...body} />)}
      {(a.bodyDots ?? []).map(([cx, cy, r]) => <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} {...body} />)}
      {(a.paper ?? []).map((d) => (
        <Path key={d} d={d} {...line} fill={lit ? SAND : 'none'} />
      ))}
      {(a.solid ?? []).map((d) => <Path key={d} d={d} {...solid} />)}
      {(a.solidDots ?? []).map(([cx, cy, r]) => <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={edge} />)}
      {(a.inset ?? []).map((d) => (
        <Path key={d} d={d} fill={mark} stroke={mark} strokeWidth={lit ? 0.6 : 0.4} strokeLinejoin="round" />
      ))}
      {(a.insetDots ?? []).map(([cx, cy, r]) => <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={mark} />)}
      {(a.lines ?? []).map((d) => <Path key={d} d={d} {...line} fill="none" />)}
      {(a.insetLines ?? []).map((d) => <Path key={d} d={d} {...line} stroke={mark} fill="none" />)}
      {lit
        ? (a.flourish ?? []).map((d) => (
          <Path key={d} d={d} fill={EMBER_INK} stroke={EMBER_INK} strokeWidth={0.6} strokeLinejoin="round" />
        ))
        : null}
    </Svg>
  );
}

/**
 * One copy of one tab's icon.
 *
 * `lit` picks the drawing: the bar's focused copy is struck, the other an outline.
 * `open` is whether the reader is on this tab, and only the lit copy acts on it:
 * the tile fades in and the icon bounces when the tab is CHOSEN, never on mount,
 * because every tab is built at startup and a mount animation would spend itself
 * behind the launch screen.
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
    // overshoot, the two halves that make a bounce read as a reaction.
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
    transform: [{ translateY: -1 * on.value }, { scale: pop.value }],
  }));

  return (
    <View style={st.box} pointerEvents="none">
      {lit ? (
        <Animated.View style={[st.tile, tile]}>
          {/* A RECESS: the gradient runs a tile's lit corner BACKWARDS and the
              dark hairline sits along the top, where light cannot reach into a
              cut. StruckNiche's rule, at tab size. */}
          <LinearGradient
            colors={[SAND_SHADE, SAND, SAND_LIT]}
            locations={[0, 0.5, 1]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={st.tileCut} />
        </Animated.View>
      ) : null}
      <Animated.View style={icon}>
        <Glyph name={name} lit={lit} />
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
  tile: {
    position: 'absolute',
    left: (SIZE - TILE_W) / 2,
    top: (SIZE - TILE_H) / 2,
    width: TILE_W,
    height: TILE_H,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SAND_SHADE,
    overflow: 'hidden',
  },
  // Inset from both corners. Run edge to edge, the tile's own radius clipped it
  // into a grey band across the top rather than a line inside the cut.
  tileCut: {
    position: 'absolute', left: 9, right: 9, top: 0, height: 1,
    backgroundColor: mix(SAND_SHADE, INK, 0.2),
  },
});
