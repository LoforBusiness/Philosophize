import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SPACE } from '@/constants/design';
import {
  INK, PAPER, PAPER_LIT, GHOST, SHADOW, METAL, ramp, mix, type Metal, type Ramp, PATINA,
  FLAT_FACE, FLAT_EDGE, FLOOR, FLOOR_CUT,
} from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// THE PROFILE'S STRUCK PARTS — bars, tiles and plates that are lit rather than
// outlined.
//
// This file exists because the profile was the flattest screen in the app: every
// reading on it was an ink rectangle on a hairline rectangle, so eleven separate
// facts all arrived with identical visual weight and none of them read as a
// thing you had EARNED. Fifty badges got the tonal treatment in §19 and then
// stopped at the badge grid; everything above it stayed a document.
//
// ── THE SAME ONE LIGHT, AND IT STILL NEVER MOVES ────────────────────────────
//
// Top-left, exactly as components/shared/tone.ts sets out. A bar's fill runs
// light→dark down-right; a tile's face does the same and drops a shadow to the
// bottom right; a track is the INVERSE, dark at the top-left, because a groove
// is bright where a dome is dark and that inversion is the only thing that says
// "cut in" rather than "raised". Get that backwards on one element and it stops
// being a set.
//
// ── WHY LinearGradient AND NOT SVG ──────────────────────────────────────────
//
// §17's performance rule: what costs is the AREA being repainted. These are
// static (nothing here animates), but the profile is the longest page in the app
// and it scrolls — so every one of them is repainted on every frame of a fling.
// expo-linear-gradient is a native view; an <Svg> per bar would put ~20 of them
// on the longest scroll surface in the app for a rectangle each.
//
// ── NO COLOUR IS DECIDED HERE ───────────────────────────────────────────────
//
// Every one of these takes its colour as a prop, from `BRANCH` (which branch) or
// `METAL` (which tier). A component that picked its own would be a fourteenth
// place colour is decided, and the whole argument for the two scales is that
// there are exactly two.
// ─────────────────────────────────────────────────────────────────────────────

/** The one light, as LinearGradient start/end points. Matches tone.LIGHT. */
const LIGHT_START = { x: 0.15, y: 0 } as const;
const LIGHT_END = { x: 0.85, y: 1 } as const;

// ── a struck progress bar ────────────────────────────────────────────────────

interface BarProps {
  /** 0…1. */
  pct: number;
  /** The ramp the FILL is struck in — a branch hue or a metal. */
  fill: Ramp;
  height?: number;
  /** Quarter marks along the track. Off for bars where 25% means nothing. */
  notches?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * A bar you could run a thumbnail over.
 *
 * THE TRACK IS A GROOVE, NOT A GAP. It was `C.hairline` — the same flat tone as
 * a rule — so an empty bar and a horizontal line were the same drawing, and the
 * six mastery bars in particular read as six lines with some ink on the left. A
 * groove has a dark top edge where the light does not reach into it and a pale
 * bottom edge where it catches the far wall, and those two hairlines are the
 * entire difference between a slot and a stripe.
 *
 * THE TRACK IS ALSO THE BRANCH'S OWN COLOUR at a tenth strength (`ramp().track`)
 * rather than grey. Six grey gutters say nothing; six tinted ones say which row
 * you are looking at even where the bar is empty, which is exactly the row a
 * reader most needs to identify.
 */
export function StruckBar({ pct, fill, height = 10, notches = false, style }: BarProps) {
  const p = Math.max(0, Math.min(1, pct));
  const r = height / 2;
  return (
    <View style={[{ height, borderRadius: r, backgroundColor: fill.track, overflow: 'hidden' }, style]}>
      {/* The groove: a dark lip at the top, a pale one at the bottom. */}
      <View style={[s.grooveTop, { backgroundColor: mix(fill.track, INK, 0.14) }]} />

      {notches && (
        <View style={s.notchRow} pointerEvents="none">
          {[0.25, 0.5, 0.75].map((n) => (
            <View key={n} style={[s.notch, { left: `${n * 100}%`, backgroundColor: mix(fill.track, INK, 0.2) }]} />
          ))}
        </View>
      )}

      {p > 0 && (
        <LinearGradient
          colors={[fill.lit, fill.base, fill.shade]}
          locations={[0, 0.52, 1]}
          start={LIGHT_START}
          end={LIGHT_END}
          style={{
            // A floor of 3% so a single finished lesson is a visible mark rather
            // than a bar that looks untouched.
            width: `${Math.max(p > 0 ? 3 : 0, p * 100)}%`,
            height: '100%',
            borderRadius: r,
          }}
        >
          {/* The lit rim along the top of the fill — what makes it sit PROUD of
              the groove rather than sit in it. */}
          <View style={[s.fillRim, { backgroundColor: mix(fill.lit, PAPER_LIT, 0.5) }]} />
        </LinearGradient>
      )}

      <View style={[s.grooveBottom, { backgroundColor: mix(fill.track, PAPER_LIT, 0.6) }]} />
    </View>
  );
}

// ── an embossed tile ─────────────────────────────────────────────────────────

/**
 * A raised paper tile, for the readings that used to be flat Cards.
 *
 * FLAT WHITE, WITH ITS DEPTH IN ITS EDGE AND ITS SHADOW. The face used to run
 * PAPER_LIT → PAPER → PAPER_SHADE along the one light, and PAPER_SHADE is a warm
 * tan, so every tile faded into beige at its bottom-right corner — the "gold
 * look" in the background the owner called AI-made (2026-09-16). A hairline and
 * a shadow falling down-right still say where the light is; the face says
 * nothing it does not need to.
 */
export function StruckTile({
  children, accent, style, pad = 3,
}: {
  children: React.ReactNode;
  /** An optional colour for the top edge — how a tile says what it is about. */
  accent?: string;
  style?: StyleProp<ViewStyle>;
  pad?: 0 | 1 | 2 | 3 | 4 | 5;
}) {
  return (
    <View style={[s.tileShadow, style]}>
      <View style={[s.tile, { padding: SPACE[pad] }]}>
        {accent ? <View style={[s.tileAccent, { backgroundColor: accent }]} /> : null}
        {children}
      </View>
    </View>
  );
}

// ── a niche cut into the paper ───────────────────────────────────────────────

/**
 * THE INVERSE OF StruckTile — a recess rather than a raised face.
 *
 * A tile and a niche are the same gradient run in opposite directions, and that
 * inversion is the whole of it: `StruckBar`'s track already records the rule —
 * "a groove is bright where a dome is dark, and that inversion is the only thing
 * that says CUT IN rather than raised". The dark hairline is at the TOP where
 * the light cannot reach into the cut, and the pale one is at the bottom where
 * it catches the far wall. It casts no shadow, because a hole does not cast onto
 * the surface it is cut into.
 *
 * THE FLOOR IS FLAT AND NEUTRAL. It ran PAPER_SHADE → PAPER → PAPER_LIT, a tan
 * corner that read as gold (see StruckTile). The two hairlines were always what
 * said "cut in"; the gradient only said "beige".
 *
 * WHAT IT IS FOR. Something struck, sitting in something. The profile's cabinet
 * puts a medal in each of three of these, so the medal reads as an object placed
 * in a socket rather than as a picture printed on a card — which is the whole
 * difference between a display case and a list.
 */
export function StruckNiche({
  children, style, empty = false,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Draw the socket as unfilled: a dashed inner outline, no shading. */
  empty?: boolean;
}) {
  if (empty) {
    return <View style={[s.niche, s.nicheEmpty, style]}>{children}</View>;
  }
  return (
    <View style={[s.niche, style]}>
      <View pointerEvents="none" style={[s.nicheTop, { backgroundColor: FLOOR_CUT }]} />
      <View pointerEvents="none" style={[s.nicheFoot, { backgroundColor: PAPER_LIT }]} />
      {children}
    </View>
  );
}

// ── a raised panel, for a whole section ──────────────────────────────────────

/**
 * LETTERPRESS, AND WHY IT IS AN INK SHADOW RATHER THAN A PAPER HIGHLIGHT.
 *
 * The obvious emboss — a PAPER_LIT highlight under the glyph, type pressed INTO
 * the sheet — cannot work on this palette. PAPER is #FAFAF7 and PAPER_LIT is
 * #FFFFFF, a 2% swing, and §19 already measured what that looks like: nothing.
 * So the type sits PROUD of the page instead and drops its shadow down-right,
 * along the one light every other struck object in the app is lit by. Same
 * direction as StruckTile's shadow, which is the point — a title that lifts off
 * a card lit from somewhere else is two objects, not one.
 *
 * ONE OBJECT ON PURPOSE. `textShadow*` is on CLAUDE.md §12's deliberately
 * un-swept deprecation list (a react-native-web warnOnce; Android supports it
 * unwarned). Keeping every use of it in this file behind one exported style is
 * what keeps that eventual sweep a one-line change rather than a hunt.
 *
 * Never put it on small type. Below about 13px the shadow stops reading as
 * depth and starts reading as a rendering fault.
 */
export const EMBOSS = {
  textShadowColor: 'rgba(26,26,26,0.20)',
  textShadowOffset: { width: SHADOW.dx * 0.8, height: SHADOW.dy * 0.8 },
  textShadowRadius: 1.6,
} as const;

/**
 * A WHOLE SECTION ON A RAISED CARD, with its heading cut into the top of it.
 *
 * The paper counterpart to components/stats/Instrument.tsx. Insights had one
 * instrument and then two bare runs of rows underneath it, so the tab went
 * "object, object, page" — and the two readings that are most personal to the
 * reader (who they read most, and which centuries they have actually met) were
 * the two with no edges at all.
 *
 * THE HEAD IS A RECESS AND THE BODY IS THE FACE, and that is the whole of the
 * depth. StruckNiche states the rule this obeys: a groove is bright where a dome
 * is dark. So the band's gradient runs the OPPOSITE way to the card's, it takes
 * the dark hairline along its top edge where the light cannot reach into the
 * cut, and the pale one along the bottom where it catches the far wall. Reverse
 * those two lines and the header stops being cut in and starts floating.
 */
export function StruckPanel({
  title, subtitle, accent, right, children, style,
}: {
  title: string;
  subtitle: string;
  /** The printer's rule above the title. One colour per box — see the call site. */
  accent?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.panelShadow, style]}>
      {/* FLAT. A big surface lit from one side barely shades at all, so its depth
          was always in its EDGES — the hairline and the shadow it sits on. The
          gradient it used to carry ended in a tan corner that read as gold. */}
      <View style={s.panel}>
        {/* THE HEAD IS A CUT: a neutral floor between a dark hairline and a white
            one. It was sand, which is the gold the owner asked to be rid of. */}
        <View style={s.panelBand}>
          <View pointerEvents="none" style={[s.bandTop, { backgroundColor: FLOOR_CUT }]} />
          <View style={s.bandBody}>
            {accent ? <View style={[s.bandRule, { backgroundColor: accent }]} /> : null}
            <Text style={[s.panelTitle, EMBOSS]}>{title}</Text>
            <Text style={s.panelSub}>{subtitle}</Text>
          </View>
          {right}
          <View pointerEvents="none" style={[s.bandFoot, { backgroundColor: PAPER_LIT }]} />
        </View>

        <View style={s.panelBody}>{children}</View>
      </View>
    </View>
  );
}

// ── a struck plate in a metal ────────────────────────────────────────────────

/**
 * A small metal plate — the rank chip, a tier caption, a "complete" flag.
 *
 * `on` comes from the metal itself rather than being chosen at the call site,
 * because which of ink and paper is readable on a given metal is a measured fact
 * (check-ui asserts it) and not something a caller should be guessing per use.
 */
export function MetalPlate({
  metal, label, icon, style,
}: {
  metal: Metal;
  label: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.plateShadow, style]}>
      <LinearGradient
        colors={[metal.lit, metal.base, metal.shade]}
        locations={[0, 0.52, 1]}
        start={LIGHT_START}
        end={LIGHT_END}
        style={[s.plate, { borderColor: metal.rim }]}
      >
        {icon}
        <Text style={[s.plateText, { color: metal.on }]}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

// ── a mastery row ────────────────────────────────────────────────────────────

/**
 * ONE BRANCH, AND WHAT IT LOOKS LIKE TO BE FINISHED WITH IT.
 *
 * The old row was an ink icon, a name, a grey track with ink in it and a
 * percentage — six of those in a column, distinguishable only by reading the
 * label on each. Three things changed and each one is a different kind of fact:
 *
 * · the branch's HUE identifies the row before the name is read;
 * · the COUNT ("12 / 34") is what a percentage was hiding — 68% of an unknown
 *   number is not a thing anyone can act on, and "22 of 34 done" is;
 * · a STRUCK PLATE at 100%, because a bar that is merely full looks the same as a
 *   bar that is nearly full at a glance, and finishing a branch is the largest
 *   single thing a reader does in this app.
 */
export function MasteryRow({
  name, hue, done, total, icon,
}: {
  name: string;
  hue: string;
  done: number;
  total: number;
  icon: React.ReactNode;
}) {
  const pct = total > 0 ? done / total : 0;
  const r = ramp(hue);
  const complete = total > 0 && done >= total;
  return (
    <View style={s.mRow}>
      <View style={[s.mChip, { backgroundColor: r.track, borderColor: r.base }]}>{icon}</View>
      <View style={s.mBody}>
        <View style={s.mTop}>
          <Text style={[s.mName, { color: r.shade }]} numberOfLines={1}>{name}</Text>
          {complete ? (
            <MetalPlate metal={PATINA} label="COMPLETE" style={s.mPlate} />
          ) : (
            <Text style={s.mCount}>
              <Text style={[s.mDone, { color: r.base }]}>{done}</Text>
              <Text style={s.mTotal}> / {total}</Text>
            </Text>
          )}
        </View>
        <StruckBar pct={pct} fill={r} height={9} notches style={{ marginTop: 5 }} />
      </View>
    </View>
  );
}

// ── a locked-or-lit count, for the badge shelf ───────────────────────────────

/**
 * "12 OF 50 STRUCK" — a trophy-case caption with the proportion drawn under it.
 *
 * The badge grid showed eight medals and no total, so the one question a case of
 * fifty actually raises — how much of it is mine — was the one thing not on the
 * page.
 */
export function ShelfCount({ earned, total }: { earned: number; total: number }) {
  const r = ramp(PATINA.base);
  return (
    <View style={s.shelf}>
      <View style={s.shelfTop}>
        <Text style={s.shelfNum}>
          <Text style={s.shelfEarned}>{earned}</Text>
          <Text style={s.shelfTotal}> of {total} struck</Text>
        </Text>
        <Text style={s.shelfPct}>{total > 0 ? Math.round((earned / total) * 100) : 0}%</Text>
      </View>
      <StruckBar pct={total > 0 ? earned / total : 0} fill={r} height={7} style={{ marginTop: SPACE[1] }} />
    </View>
  );
}

// ── the condensed statistics, after the Insights tab went ────────────────────

/**
 * FOUR NUMBERS IN A ROW — the whole of what the statistics tab's ledger said.
 *
 * The tab drew these as four struck tiles the size of playing cards, each with an
 * icon, a caption and an entrance animation, and then three charts under them.
 * The owner asked for "a much more condensed version of the statistics", and the
 * condensing is mostly this: a count does not need furniture, it needs to be
 * READABLE AND SMALL. Four figures on one line is the form a passport or a
 * scoreboard uses, and it is about a fifth of the height.
 *
 * NO ANIMATION AND NO COUNT-UP, on purpose. §19 records what a count-up costs on
 * this data: "a count-up is a flourish; 'your figures are gone' is a fright", and
 * every figure on the old tab had to be taught to start at its real value rather
 * than climb from zero. A number that is simply drawn cannot have that bug.
 */
export function CountStrip({ items }: { items: { label: string; value: number }[] }) {
  return (
    <View style={s.cStrip}>
      {items.map((it, i) => (
        <View key={it.label} style={[s.cCell, i > 0 && s.cCellRule]}>
          <Text style={s.cValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {it.value.toLocaleString()}
          </Text>
          <Text style={s.cLabel} numberOfLines={1}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * ONE BRANCH'S SHARE OF THE READING — the icon, the name, a bar and the count.
 *
 * THIS IS NOT THE MASTERY ROW ABOVE, AND THE DIFFERENCE IS THE DENOMINATOR.
 * `MasteryRow` draws `done / total`, which §19 spends a section explaining is the
 * one shape a target must never take here: the curriculum has gone 60 → 192 →
 * 246 lessons, so a bar measured against the library MOVES AWAY from a reader who
 * has done nothing wrong every time content ships. The owner removed that section
 * ("I don't want the branch of mastery") and kept its furniture ("I like the
 * icons on the branch mastery for all the six branches").
 *
 * So the bar is measured against the reader's OWN leading branch instead. Both
 * ends of that fraction are theirs, nothing the library does can shrink it, and
 * the question it answers — where does my reading actually go — is the one a
 * profile is for. It is the same rule `lib/utils/statsMilestone`'s OVERTAKE and
 * MARK shapes were built on, which is the only part of that file worth keeping.
 */
export function ReadingRow({
  name, hue, lessons, lead, icon,
}: {
  name: string;
  hue: string;
  lessons: number;
  /** The reader's own strongest branch, so the bar is a share rather than a score. */
  lead: number;
  icon: React.ReactNode;
}) {
  const r = ramp(hue);
  const pct = lead > 0 ? lessons / lead : 0;
  return (
    <View style={s.rRow}>
      <View style={[s.rChip, { backgroundColor: r.track, borderColor: r.base }]}>{icon}</View>
      <View style={s.rBody}>
        <View style={s.rTop}>
          <Text style={[s.rName, { color: r.shade }]} numberOfLines={1}>{name}</Text>
          <Text style={[s.rCount, { color: r.base }]}>{lessons}</Text>
        </View>
        <StruckBar pct={pct} fill={r} height={8} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // ── bar ──
  grooveTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 1 },
  grooveBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1 },
  fillRim: { position: 'absolute', left: 0, right: 0, top: 0, height: 1, opacity: 0.55 },
  notchRow: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  notch: { position: 'absolute', top: 0, bottom: 0, width: 1 },

  // ── tile ──
  tileShadow: {
    borderRadius: 12,
    // The same direction the gradient is lit from, so the object and its shadow
    // agree about where the light is.
    shadowColor: INK,
    shadowOffset: { width: SHADOW.dx, height: SHADOW.dy + 1 },
    shadowOpacity: SHADOW.opacity,
    shadowRadius: 3,
    elevation: 2,
  },
  tile: { borderRadius: 12, borderWidth: 1, borderColor: FLAT_EDGE, backgroundColor: FLAT_FACE, overflow: 'hidden' },
  tileAccent: { position: 'absolute', left: 0, right: 0, top: 0, height: 3 },

  // ── niche ──
  niche: {
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', borderWidth: 1, borderColor: FLAT_EDGE, backgroundColor: FLOOR,
  },
  // A CUT, not a rim: dark along the top edge, pale along the bottom. Reversing
  // these two lines is the one change that turns this back into a tile.
  nicheTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 1.5 },
  nicheFoot: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1 },
  nicheEmpty: { borderStyle: 'dashed', borderColor: GHOST, backgroundColor: 'transparent' },

  // ── panel ──
  panelShadow: {
    borderRadius: 14,
    shadowColor: INK,
    shadowOffset: { width: SHADOW.dx, height: SHADOW.dy + 2 },
    shadowOpacity: SHADOW.opacity + 0.04,
    shadowRadius: 5,
    elevation: 3,
  },
  panel: { borderRadius: 14, borderWidth: 1, borderColor: FLAT_EDGE, backgroundColor: FLAT_FACE, overflow: 'hidden' },
  panelBand: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACE[3],
    paddingTop: SPACE[3],
    paddingBottom: SPACE[2],
    backgroundColor: FLOOR,
  },
  bandTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 1.5 },
  bandFoot: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1 },
  bandBody: { flex: 1 },
  bandRule: { width: 26, height: 2, borderRadius: 1, marginBottom: 7 },
  // INK, NOT THE SPARK. A 19px Playfair title is exactly the “larger text” the
  // owner asked to keep tame, and the ember reads 4.85:1 where ink reads 16.6:1.
  // The accent belongs on the band and the rule above this title, not in it.
  panelTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: C.ink },
  panelSub: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    // Ink a third of the way to paper: about 6:1 on the band's floor.
    fontSize: 12, color: mix(INK, PAPER, 0.3), marginTop: 2,
  },
  panelBody: { paddingHorizontal: SPACE[3], paddingTop: SPACE[3] + 2, paddingBottom: SPACE[3] },

  // ── plate ──
  plateShadow: {
    shadowColor: INK,
    shadowOffset: { width: SHADOW.dx, height: SHADOW.dy },
    shadowOpacity: SHADOW.opacity,
    shadowRadius: 2,
    elevation: 1,
  },
  plate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1, includeFontPadding: false,
  },

  // ── mastery row ──
  mRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2] },
  mChip: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  mBody: { flex: 1 },
  mTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mName: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.1, includeFontPadding: false, flex: 1,
  },
  mPlate: { marginLeft: SPACE[1] },
  mCount: { includeFontPadding: false },
  mDone: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  mTotal: { fontFamily: 'Inter_400Regular', fontSize: 11, color: C.inkSoft },

  // ── shelf ──
  shelf: { marginBottom: SPACE[2] },
  shelfTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  shelfNum: { includeFontPadding: false },
  shelfEarned: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: C.ink },
  shelfTotal: { fontFamily: 'Inter_400Regular', fontSize: 12, color: C.inkSoft },
  shelfPct: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1, color: C.inkSoft,
    includeFontPadding: false,
  },

  // ── the four counts ──
  cStrip: { flexDirection: 'row', alignItems: 'stretch' },
  cCell: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  // A hairline BETWEEN cells, never around them: four boxes is a dashboard, four
  // figures divided by rules is a readout.
  cCellRule: { borderLeftWidth: 1, borderLeftColor: C.hairline },
  cValue: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: C.ink,
    includeFontPadding: false,
  },
  // 9.5 and tracked, because the longest of these is THINKERS and it has to fit a
  // quarter of a 320dp card without wrapping. `check:ui` holds the type scale at
  // 11 for `micro`, and this is a caption under a figure rather than a label in
  // the scale — it is the same exception "PER ACTIVE DAY" needed in §19.
  cLabel: {
    fontFamily: 'Inter_500Medium', fontSize: 9.5, letterSpacing: 0.7,
    color: C.inkSoft, marginTop: 3, includeFontPadding: false,
  },

  // ── the reading row ──
  rRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2] },
  rChip: {
    width: 30, height: 30, borderRadius: 7, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  rBody: { flex: 1 },
  rTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rName: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1, includeFontPadding: false, flex: 1,
  },
  rCount: { fontFamily: 'Inter_700Bold', fontSize: 13, includeFontPadding: false },
});

/** Re-exported so callers do not have to import from two places to draw a row. */
export { ramp, METAL, GHOST };
