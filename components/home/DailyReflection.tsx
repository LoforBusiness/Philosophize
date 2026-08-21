import { View, Text, Pressable, StyleSheet } from 'react-native';
import SketchIcon from '@/components/shared/SketchIcon';
import SectionHead from '@/components/home/SectionHead';
import { plate as platePalette } from '@/components/shared/tone';
import { ERA, type EraKey } from '@/constants/design';
import { eraGroupOfId } from '@/data/philosophers';

// ─────────────────────────────────────────────────────────────────────────────
// THE QUOTE IS PRINTED ON THE PAGE, NOT PARCELLED INTO A CARD.
//
// It used to be a bordered, drop-shadowed, gradient-filled box — the first of
// three in a row, all the same width, all the same border, all the same hard
// 2/3 shadow. Three boxes of one size say the three things inside them matter
// equally, which was never true, and a stack of interchangeable rectangles is
// the single most templated shape an interface can take.
//
// So this one loses its box entirely. What is left is what a magazine does with
// a quotation: set it large, set it in the book face, and let the white space
// around it do the work the border was doing badly. It is also the only place
// on Home the ruled paper underneath is allowed to show through, which is the
// point of having drawn it.
//
// ── AND THE 46pt DECORATIVE QUOTE MARK IS GONE ──────────────────────────────
//
// A giant grey “ floating above a quotation is decoration standing in for
// typography — it says "this is a quote" to a reader who can already see the
// quotation marks and the attribution. The text now carries real typographic
// quotes at its own size, which is how a quotation has been marked for four
// hundred years, and the space that glyph occupied went to the type instead:
// 19pt → 23pt, which is the actual difference between reading it and skimming
// past it.
//
// ── THE ONE THING IT GAINED: WHEN ───────────────────────────────────────────
//
// It still has no box, and it is not getting one — see above. But the byline
// said only WHO, and a name with no date is the fact a beginner can do least
// with. The attribution rule is now drawn in the era's own colour and the era
// is named after the author, the same `ERA` scale every quote plate in the app
// is struck in (components/shared/QuotePlate.tsx). Two marks, no box, and Home
// reads as part of the same set as the collection.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const INK_SOFT = '#686868';

// ── THE QUOTE IS SET TO ITS OWN LENGTH ──────────────────────────────────────
//
// 1,780 quotes rotate through here and they are not one size of thing: the
// median is 80 characters and the longest is 282. One type size cannot serve
// both. At a size that does justice to "I think, therefore I am" a passage from
// Sextus Empiricus runs nine lines and gets cut off mid-clause, and a size that
// fits the passage makes the aphorism look like a caption.
//
// The old card set everything at 19pt and clipped at four lines, which silently
// truncated roughly one day in sixteen — a philosopher's sentence ending in an
// ellipsis because of a layout constant.
//
// So the block chooses its size from the text, the way a page does: an aphorism
// is set large because there is room to set it large. The steps are measured
// against a 342dp column (a 390dp phone, less its 24dp margins) at Playfair
// italic's ~0.46em average advance, and every one of them lands the longest
// quote in its band inside `numberOfLines` with a line to spare.
const STEPS = [
  { max: 90, fontSize: 25, lineHeight: 35 },    // ~29 chars a line → 4 lines
  { max: 165, fontSize: 21, lineHeight: 30 },   // ~35 chars a line → 5 lines
  { max: Infinity, fontSize: 17.5, lineHeight: 26 }, // ~42 a line → 7 lines
];

export function sizeFor(text: string) {
  return STEPS.find((s) => text.length <= s.max) ?? STEPS[STEPS.length - 1];
}

export interface ReflectionQuote {
  id: string;
  text: string;
  author: string;
  philosopherId: string;
}

interface Props {
  quote: ReflectionQuote;
  saved: boolean;
  onOpenAuthor: () => void;
  onToggleSave: () => void;
  style?: object;
}

export default function DailyReflection({ quote, saved, onOpenAuthor, onToggleSave, style }: Props) {
  const group = (eraGroupOfId(quote.philosopherId) as EraKey | null) ?? null;
  // No thinker on record: the rule falls back to plain ink, which is what it
  // always was, and no era is named. Nothing invented for a fact we lack.
  const tint = group ? platePalette(ERA[group]).label : INK;
  return (
    <View style={style}>
      <SectionHead>DAILY REFLECTION</SectionHead>

      <Pressable onPress={onOpenAuthor} accessibilityRole="button">
        <Text style={[styles.quote, sizeFor(quote.text)]} numberOfLines={8}>
          {'“'}{quote.text}{'”'}
        </Text>
      </Pressable>

      {/* A byline, not a right-aligned caption. The short rule is the dash an
          attribution is set with in print; it reads as the same mark at any type
          size, where an em-dash character does not — and it carries the era's
          colour, so the same thinker is the same colour here, in the collection
          and on their own profile. */}
      <View style={styles.byline}>
        <Pressable style={styles.who} onPress={onOpenAuthor} accessibilityRole="button" hitSlop={6}>
          <View style={[styles.dash, { backgroundColor: tint }]} />
          <Text style={styles.author} numberOfLines={1}>{quote.author.toUpperCase()}</Text>
        </Pressable>
        {/* THE ERA SITS AT THE OTHER END, not after the name. Trailing the
            author it added about a hundred points to a row that already
            ellipsised the longest names — Maurice Merleau-Ponty overran it — and
            the name is the half worth keeping whole. Opposite the bookmark it
            uses space that was empty, and reads as a tag on a byline. */}
        {group ? <Text style={[styles.era, { color: tint }]}>{group}</Text> : null}
        <Pressable
          hitSlop={12}
          onPress={onToggleSave}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved quotes' : 'Save this quote'}
        >
          <SketchIcon name={saved ? 'bookmark-filled' : 'bookmark'} size={19} color={saved ? INK : INK_SOFT} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // fontSize and lineHeight come from `sizeFor` at render — see the note above.
  quote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    color: INK,
    marginTop: 16,
  },
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  // `flex: 1` rather than bare `flexShrink`, so the byline SWALLOWS the slack
  // and the era tag lands beside the bookmark instead of floating in the middle
  // of the row — which is where space-between puts a lone middle child. It still
  // shrinks (flex:1 is grow 1, shrink 1), so a long name gives way to the
  // bookmark rather than pushing it off the right edge; several run to four
  // words.
  who: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 },
  // Colour is set at render from the era — see the header. 1.5px of a hue that
  // clears 4.5:1 on paper is comfortably above the 3:1 floor a non-text mark is
  // held to.
  dash: { width: 18, height: 1.5, marginRight: 10 },
  era: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9.5,
    letterSpacing: 1.3,
    flexShrink: 0,
    marginRight: 14,
  },
  author: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: INK_SOFT,
    letterSpacing: 1.8,
    flexShrink: 1,
  },
});
