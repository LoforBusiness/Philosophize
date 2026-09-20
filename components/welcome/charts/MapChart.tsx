// MapChart — the six branches, drawn the way the rest of the app draws them.
//
// It replaces a decorative exponential curve labelled "day 1 → day 7". That curve
// was drawn beautifully and asserted nothing: no reader learned a single true fact
// from it, and the line it illustrated ("and it adds up, fast") was a promise about
// the app rather than anything about philosophy. A beginner does not know what
// "epistemology" means, and being told in five seconds is worth more than any
// number of rising curves.
//
// Each name lands on the WORD that names it. The cue times come from cueTimes(),
// which reads them off the same beat table the speech bubble uses, so the picture
// cannot drift from the line — see the `cues` field in rig.ts.
//
// ── WHY THIS IS VIEWS AND NO LONGER SVG ─────────────────────────────────────
//
// It was `<G>`/`<SvgText>`/`<Path>` inside a board-sized <Svg>, under ../ease.ts's
// rule that SVG geometry cannot animate on this stack so every coordinate must be
// a module constant. That rule is real and it is the reason this board could never
// carry a single piece of the app's own furniture: a hue chip, an icon, a Meter,
// anything measured by a layout engine rather than typed as a number.
//
// So the board is Views. Three things follow, and all three were the complaint:
//
// · THE SIX BRANCHES HAVE SIX COLOURS and this screen was drawing them in ink.
//   `BRANCH` in constants/design.ts has carried six measured hues since the
//   redesign, used on the tab bar, the Learn cards, every lesson's controls and
//   Profile's reading rows. The first screen a reader ever saw ignored all six.
// · "POLITICAL PHILOSOPHY" WAS TWO LINES, tight enough to break the column it sat
//   in — and `components/shared/branchMarks.ts` has held the answer all along:
//   BRANCH_SHORT is 'POLITICS', under a comment saying "Fits a mastery row.
//   'Political Philosophy' does not". That file exists because "the paywall
//   drawing its own copy is precisely how 'Politics' becomes 'Political
//   Philosophy' on one screen and not the other", which is exactly what this
//   board was doing. Reading the shared table fixes the layout and the drift at
//   once.
// · SIX ROWS, NOT A 2×3 GRID. "That was one of six" is a list, and a list of six
//   full-width rows cannot have a column out of alignment. The grid only existed
//   because a 232-unit board had no room for a row; the board is 372 wide now.
//
// Rows are ordered by ALL_BRANCHES so the board cannot claim a seventh branch or
// leave one out, and the glosses are the host's own words — A1: what the text
// says, the picture must do.

import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import SketchIcon from '@/components/shared/SketchIcon';
import { C, BRANCH, type BranchKey } from '@/constants/design';
import { ramp } from '@/components/shared/tone';
import { BRANCH_SHORT, BRANCH_ICON } from '@/components/shared/branchMarks';
import { ALL_BRANCHES } from '@/data';
import { clamp01, easeOutCubic } from '@/components/welcome/ease';
import { cueTimes } from '@/components/welcome/rig';

/** What each branch asks, in the host's own words. Keyed on slug, not position. */
const GLOSS: Record<string, string> = {
  metaphysics: 'what is real',
  epistemology: 'how you know',
  logic: 'what follows',
  ethics: 'how to live',
  aesthetics: 'what is beautiful',
  'political-philosophy': 'who rules',
};

/**
 * The board's reading order, which is the order the host names them in — and NOT
 * the order `ALL_BRANCHES` happens to be declared in. The script says "What is
 * real. How you know. What follows." then "How to live. What is beautiful. Who
 * rules.", and `cueTimes('map')` returns the six word-times in that order, so a
 * row drawn out of order would light on the wrong word.
 */
const ORDER = ['metaphysics', 'epistemology', 'logic', 'ethics', 'aesthetics', 'political-philosophy'];

const ROWS = ORDER.map((slug) => {
  const b = ALL_BRANCHES.find((x) => x.slug === slug);
  return {
    slug,
    name: BRANCH_SHORT[slug] ?? (b?.name ?? slug).toUpperCase(),
    gloss: GLOSS[slug] ?? '',
    hue: BRANCH[slug as BranchKey] ?? C.ink,
    icon: BRANCH_ICON[slug] ?? 'frame',
  };
});

/** Absolute times the six names land on, read off the script itself. */
const CUES = cueTimes('map');

function Row({ clock, row, at }: {
  clock: SharedValue<number>;
  row: (typeof ROWS)[number];
  /** When this one lands. Negative if the script has no cue for it. */
  at: number;
}) {
  const r = ramp(row.hue);
  // Opacity AND transform only — the one thing the SVG version got right and the
  // reason it is safe to keep: these are the two properties that repaint without
  // re-rasterising anything (../ease.ts).
  const style = useAnimatedStyle(() => {
    const a = easeOutCubic(clamp01((clock.value - at) / 0.34));
    return { opacity: a, transform: [{ translateX: -10 * (1 - a) }] };
  });

  return (
    <Animated.View style={[s.row, style]}>
      <View style={[s.chip, { backgroundColor: r.track, borderColor: r.base }]}>
        <SketchIcon name={row.icon} size={13} color={r.shade} />
      </View>
      <Text style={s.name}>{row.name}</Text>
      {/* The gloss is pushed to the far RIGHT rather than sitting next to the
          name, so the row spans the board instead of huddling in its left third
          — a definition list, which is what six names and six senses are. The
          rule between them is what carries the eye across the gap. */}
      <View style={s.lead} />
      <Text style={s.gloss}>{row.gloss}</Text>
    </Animated.View>
  );
}

export default function MapChart({ p, clock }: {
  /** The board's own 0→1 draw progress; only the heading rides it. */
  p: SharedValue<number>;
  /** The absolute clock, because the six names are cued off the SPOKEN words. */
  clock: SharedValue<number>;
}) {
  const headStyle = useAnimatedStyle(() => ({
    opacity: easeOutCubic(clamp01(p.value / 0.09)),
  }));

  return (
    <View style={s.board}>
      <Animated.Text style={[s.head, headStyle]}>THE SIX BRANCHES</Animated.Text>
      {ROWS.map((row, i) => (
        <Row key={row.slug} clock={clock} row={row} at={CUES[i] ?? -1} />
      ))}
    </View>
  );
}

// The board is 372 × 200 stage units and lays out in them directly (see BOARD_BOX
// in rig.ts), so every number here is the number on the stage: a heading, then six
// rows of 29, which is 192 of the 200 available.
const s = StyleSheet.create({
  board: { width: 372, height: 200 },
  head: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 2.2,
    color: C.dim,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', height: 29 },
  chip: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  name: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.4, color: C.ink },
  lead: { flex: 1, height: 1, backgroundColor: C.edge, marginHorizontal: 10 },
  gloss: { fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 14, color: C.dim },
});
