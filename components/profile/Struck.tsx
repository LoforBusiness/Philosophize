import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SPACE } from '@/constants/design';
import {
  INK, PAPER, PAPER_LIT, PAPER_SHADE, FAINT, GHOST, SHADOW,
  METAL, ramp, mix, type Metal, type Ramp,
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
 * The face runs PAPER_LIT → PAPER → PAPER_SHADE along the one light, so the tile
 * has a lit corner and a shaded one; a hairline rim picks up the same direction,
 * and it sits on its own shadow. It is the badge treatment applied to a
 * rectangle, which is the whole idea — a profile is a case of struck things, and
 * the numbers on it should be struck too.
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
      <LinearGradient
        colors={[PAPER_LIT, PAPER, PAPER_SHADE]}
        locations={[0, 0.55, 1]}
        start={LIGHT_START}
        end={LIGHT_END}
        style={[s.tile, { padding: SPACE[pad] }]}
      >
        {accent ? <View style={[s.tileAccent, { backgroundColor: accent }]} /> : null}
        {children}
      </LinearGradient>
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
 * · a GOLD PLATE at 100%, because a bar that is merely full looks the same as a
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
            <MetalPlate metal={METAL.GOLD} label="COMPLETE" style={s.mPlate} />
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
  const r = ramp(METAL.GOLD.base);
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
  tile: { borderRadius: 12, borderWidth: 1, borderColor: FAINT, overflow: 'hidden' },
  tileAccent: { position: 'absolute', left: 0, right: 0, top: 0, height: 3 },

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
});

/** Re-exported so callers do not have to import from two places to draw a row. */
export { ramp, METAL, GHOST };
