import { useState, type ReactNode } from 'react';
import {
  View, Text, Pressable, StyleSheet,
  type StyleProp, type ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import SketchIcon from '@/components/shared/SketchIcon';
import { plate as platePalette, INK } from '@/components/shared/tone';
import { ERA, C, type EraKey } from '@/constants/design';
import { eraGroupOfId } from '@/data/philosophers';
import { touch } from '@/lib/feedback';

// ─────────────────────────────────────────────────────────────────────────────
// ONE QUOTE, ONE OBJECT — used by every surface that shows a quotation.
//
// ── WHAT WAS WRONG ──────────────────────────────────────────────────────────
//
// A reader said quotes were "boring ... very dull ... no depth ... not
// gamified", and the cause was structural rather than a matter of taste. FOUR
// screens each drew their own rectangle — Quote of the Day, the saved
// collection, a thinker's profile, and the lesson deck — a hairline border,
// italic Playfair, the same two greys, in four files that had never been
// reconciled. So:
//
// · a quotation carried NO information about who said it or when. Twenty saved
//   quotes were twenty identical grey boxes, and a collection you cannot tell
//   apart is not a collection.
// · nothing about it changed when you KEPT it. The bookmark filled in; the
//   object did not. There was nothing to earn.
// · it was flat. Everything else in this app that is meant to feel like an
//   object — every button, every card, every rank pin — sits on a lip and is
//   lit from the top left. A quote was the one thing still drawn as an outline.
//
// ── WHAT IT IS NOW ──────────────────────────────────────────────────────────
//
// A STRUCK PLATE, in the material of the era it was written in.
//
// The colour is not decoration and is not new: `ERA` in constants/design.ts is
// the app's licensed "one place a hue means something", keyed on the five groups
// data/philosophers.ts already sorts 322 thinkers by, every one measured to
// 4.5:1 on paper. `tone.plate()` derives the five roles from that single hex by
// the same two mixes `ramp()` uses, so the light direction cannot drift.
//
// THE IDENTITY IS UNCHANGED, and this is the line worth holding: the rim is INK
// and the quotation is INK. The era lives in the SPINE, the printer's mark, the
// byline label and the ledge — edges and marks, never a flooded surface. It is
// the rule constants/design.ts states for `HUE`, applied to five hues, and it is
// why a shelf of these still reads as black-and-white printed matter rather than
// as a stack of coloured cards.
//
// ── THE TWO STATES YOU EARN ─────────────────────────────────────────────────
//
// · SAVED fills the spine. Unkept, a plate carries a 3px rail; kept, a 7px
//   struck spine with a lit edge. The object visibly gains material, which is
//   the difference between a toggle and a collection.
// · FEATURED folds the corner, in the era's own colour. One quote at a time
//   wears it, so it stays worth having.
//
// Both are drawn ON the plate rather than only in the button, so a list of
// twenty says at a glance which are yours — the thing the old grey boxes could
// never do.
// ─────────────────────────────────────────────────────────────────────────────

export type PlateSize = 'sm' | 'md' | 'lg';

// ── THE KICKER AND THE MARK CANNOT SHARE A BAND, SO ONE IS MADE ────────────
//
// The printer's mark is set in a 62px face whose INK sits roughly 20 to 44px
// below its own box top — a 24px band. With no kicker it bleeds up into the
// card's top padding and its foot just grazes the first line's ascenders, which
// is what a printer's mark does.
//
// Add a kicker and that padding is no longer empty, and there is NO offset that
// works: at +15 the mark landed across QUOTE OF THE DAY, and at +30 it landed
// across the quotation's first word. Both were rendered and looked at, and the
// two failures bracket a gap of 4px — the kicker's old bottom margin — into
// which a 24px glyph does not go. Nothing painted over a word is acceptable
// (D31, and it is the exact complaint that started this work), so the answer is
// not a better offset, it is to MAKE THE BAND: `kickerGap` opens the room and
// `markKick` drops the mark into it. Both are solved from the geometry above,
// not chosen — change one and re-render the contact sheet.
//
// SPINE WIDTHS ARE 3 AND 7 AND THE TEXT MUST NOT MOVE BETWEEN THEM. The left
// padding is always `padH + SPINE_MAX`, so a saved plate grows its spine INWARD
// into its own gutter. Padding it by the live width instead jogged every
// quotation 4px sideways the moment it was kept — and a thinker's profile shows
// saved and unsaved plates in one column, where that reads as a broken list.
const SPINE_MAX = 7;

const SIZE: Record<PlateSize, {
  quote: number; line: number; mark: number; markTop: number; markKick: number; kickerGap: number;
  padH: number; padTop: number; padBottom: number; author: number; lip: number; radius: number;
}> = {
  sm: { quote: 15.5, line: 24, mark: 50, markTop: -11, markKick: 20, kickerGap: 12, padH: 15, padTop: 16, padBottom: 13, author: 13.5, lip: 3, radius: 10 },
  md: { quote: 18, line: 28, mark: 62, markTop: -14, markKick: 25, kickerGap: 14, padH: 18, padTop: 19, padBottom: 15, author: 15, lip: 4, radius: 12 },
  lg: { quote: 21, line: 32, mark: 74, markTop: -17, markKick: 30, kickerGap: 16, padH: 20, padTop: 22, padBottom: 17, author: 16.5, lip: 5, radius: 14 },
};

interface Props {
  text: string;
  author: string;
  /** Whatever the surface knows: a work, a date, a place. Follows the era. */
  meta?: string | null;
  /** Drives the whole treatment. Unknown → the structural accent, so a plate
   *  without a thinker on record still looks like a plate. */
  philosopherId?: string | null;
  /** When the caller already knows the group, skip the lookup. */
  eraGroup?: EraKey | null;
  size?: PlateSize;
  onPress?: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
  featured?: boolean;
  onToggleFeature?: () => void;
  /** A short run of caps above the quotation, e.g. QUOTE OF THE DAY. */
  kicker?: string;
  /** Its right-hand counterpart, e.g. the date. */
  kickerRight?: string;
  /** Shown when `onPress` opens something — a hand-drawn forward chevron. */
  showChevron?: boolean;
  /** An extra strip below the byline (the pin-to-home-screen row). */
  footer?: ReactNode;
  /** Layout style for the outer box. */
  style?: StyleProp<ViewStyle>;
}

export default function QuotePlate({
  text, author, meta, philosopherId, eraGroup, size = 'md',
  onPress, saved, onToggleSave, featured, onToggleFeature,
  kicker, kickerRight, showChevron, footer, style,
}: Props) {
  const [down, setDown] = useState(false);
  const S = SIZE[size];

  const group = eraGroup ?? (philosopherId ? eraGroupOfId(philosopherId) : null);
  // No thinker on record — the structural accent, so the plate is still an
  // object. This is the only case where the colour says nothing, and it is rare.
  const hue = group ? ERA[group] : C.HUE;
  const P = platePalette(hue);

  const lip = onPress ? S.lip : 0;
  const drop = down ? lip : 0;
  const spineW = saved ? 7 : 3;

  const body = (
    <View style={[styles.outer, { paddingBottom: lip }]}>
      {/* The ledge: a solid slab of the era's shade, pinned behind the face and
          offset down by its own height — the idiom components/ui/Button.tsx
          documents at length. At rest the face covers all but the bottom
          sliver; pressed, it slides down and covers the slab entirely. */}
      {lip > 0 && (
        <View
          pointerEvents="none"
          style={[styles.slab, { top: lip, backgroundColor: P.lip, borderRadius: S.radius }]}
        />
      )}

      <MotiView
        animate={{ translateY: drop }}
        transition={{ type: 'timing', duration: 90, easing: Easing.out(Easing.quad) }}
        style={[styles.face, { borderRadius: S.radius }]}
      >
        {/* The face, along the one light: lit corner top-left, a breath of the
            era in the shaded corner. Absolute, so it never touches layout. */}
        <LinearGradient
          colors={P.face}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: S.radius }]}
          pointerEvents="none"
        />

        {/* The spine — the era, said as a turned edge. Lit at the top by the
            same light, so it reads as a raised band rather than a stripe. */}
        <LinearGradient
          colors={[P.spine.lit, P.spine.base, P.spine.shade]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: spineW }}
          pointerEvents="none"
        />

        {/* The featured fold: a rotated square clipped by the face's own corner.
            Nothing else in the app wears one, which is the point. */}
        {featured ? (
          <View pointerEvents="none" style={[styles.fold, { backgroundColor: P.spine.base }]} />
        ) : null}

        {/* THE PADDING LIVES HERE, NOT ON THE FACE, so that `footer` can reach
            the plate's own edges without knowing what the padding is. It used to
            get there with negative margins copied from the md size row — three
            magic numbers that would have gone silently wrong the first time a
            padding changed, on a strip that is only rendered on Android. */}
        <View
          style={{
            paddingLeft: S.padH + SPINE_MAX,
            paddingRight: S.padH,
            paddingTop: S.padTop,
            paddingBottom: S.padBottom,
          }}
        >
        {kicker || kickerRight ? (
          <View style={[styles.kickerRow, { marginBottom: S.kickerGap }]}>
            {kicker ? <Text style={[styles.kicker, { color: P.label }]}>{kicker}</Text> : <View />}
            {kickerRight ? <Text style={styles.kickerRight}>{kickerRight}</Text> : null}
          </View>
        ) : null}

        {/* A real opening mark, set big and pale BEHIND the first line — a
            printer's mark, not punctuation someone forgot to delete. It is
            measured rather than eyeballed: check-ui holds it under 2.2:1 on its
            own face, so a decorative glyph can never be read as a word (D31). */}
        <Text
          style={[
            styles.mark,
            {
              color: P.mark,
              fontSize: S.mark,
              lineHeight: S.mark * 1.16,
              top: S.markTop + (kicker || kickerRight ? S.markKick : 0),
              left: SPINE_MAX + 5,
            },
          ]}
          pointerEvents="none"
          allowFontScaling={false}
        >
          {'“'}
        </Text>

        <Text style={[styles.quote, { fontSize: S.quote, lineHeight: S.line }]}>{text}</Text>

        <View style={[styles.rule, { backgroundColor: P.rule }]} />

        <View style={styles.byline}>
          <View style={styles.bylineText}>
            <Text style={[styles.author, { fontSize: S.author }]} numberOfLines={1}>{author}</Text>
            <View style={styles.eraRow}>
              <View style={[styles.pip, { backgroundColor: P.spine.base }]} />
              {/* TWO LINES, because the LESSON deck passes a work as well as a date.
                  A profile's meta is a lifespan and never needs the second one; a
                  lesson cites "Famine, Affluence, and Morality, 1972", which ran 78px
                  past a one-line row and truncated the year off the citation. */}
              <Text style={[styles.era, { color: P.label }]} numberOfLines={2}>
                {group ?? 'QUOTED'}{meta ? `  ·  ${meta}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            {onToggleSave ? (
              <Pressable
                onPress={() => { touch(); onToggleSave(); }}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={saved ? 'Remove from saved quotes' : 'Save quote'}
                style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
              >
                <SketchIcon name={saved ? 'bookmark-filled' : 'bookmark'} size={19} color={saved ? INK : C.inkSoft} />
              </Pressable>
            ) : null}
            {onToggleFeature ? (
              <Pressable
                onPress={() => { touch(); onToggleFeature(); }}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={featured ? 'Unfeature this quote' : 'Feature this quote on your profile'}
                style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
              >
                <SketchIcon name={featured ? 'star-filled' : 'star'} size={19} color={featured ? INK : C.inkSoft} />
              </Pressable>
            ) : null}
            {showChevron ? (
              // mirrored "back" chevron → a hand-drawn forward chevron
              <View style={styles.chev}><SketchIcon name="back" size={13} color={C.inkSoft} /></View>
            ) : null}
          </View>
        </View>

        </View>

        {footer}
      </MotiView>
    </View>
  );

  if (!onPress) return <View style={style}>{body}</View>;

  return (
    <Pressable
      onPress={() => { touch(); onPress(); }}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      accessibilityRole="button"
      style={style}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { position: 'relative' },
  slab: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  face: {
    borderWidth: 1.5,
    borderColor: INK,
    // The gradient, the spine and the fold are all absolute children, so the
    // face must clip — otherwise the fold's rotated square hangs off the corner.
    overflow: 'hidden',
  },
  // marginBottom comes from `kickerGap` at render — it is the band the
  // printer's mark lives in. See the note on the size table.
  kickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.6 },
  kickerRight: { fontFamily: 'Inter_500Medium', fontSize: 9.5, letterSpacing: 1, color: C.inkSoft },
  mark: {
    position: 'absolute',
    fontFamily: 'PlayfairDisplay_700Bold',
    includeFontPadding: false,
  },
  quote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    color: INK,
  },
  rule: { height: 1, marginTop: 14, marginBottom: 11 },
  byline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bylineText: { flex: 1, minWidth: 0 },
  author: { fontFamily: 'PlayfairDisplay_700Bold', color: INK },
  eraRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  pip: { width: 6, height: 6, borderRadius: 1 },
  era: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.3, flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  chev: { transform: [{ scaleX: -1 }], opacity: 0.7 },
  // 26 at 45 degrees gives a ~18px triangle on the corner: readable at a glance
  // in a scrolling list, small enough that it never reaches the quotation.
  fold: { position: 'absolute', top: -13, right: -13, width: 26, height: 26, transform: [{ rotate: '45deg' }] },
});
