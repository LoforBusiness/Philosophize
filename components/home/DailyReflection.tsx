import { View, Text, Pressable, StyleSheet } from 'react-native';
import SketchIcon from '@/components/shared/SketchIcon';
import SectionHead from '@/components/home/SectionHead';

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
  return (
    <View style={style}>
      <SectionHead>DAILY REFLECTION</SectionHead>

      <Pressable onPress={onOpenAuthor} accessibilityRole="button">
        <Text style={[styles.quote, sizeFor(quote.text)]} numberOfLines={8}>
          {'“'}{quote.text}{'”'}
        </Text>
      </Pressable>

      {/* A byline, not a right-aligned caption. The short ink rule is the dash
          an attribution is set with in print; it reads as the same mark at any
          type size, where an em-dash character does not. */}
      <View style={styles.byline}>
        <Pressable style={styles.who} onPress={onOpenAuthor} accessibilityRole="button" hitSlop={6}>
          <View style={styles.dash} />
          <Text style={styles.author} numberOfLines={1}>{quote.author.toUpperCase()}</Text>
        </Pressable>
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
  // `flexShrink` so a long name gives way to the bookmark rather than pushing
  // it off the right edge — several of these run to four words.
  who: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, paddingRight: 12 },
  dash: { width: 18, height: 1.5, backgroundColor: INK, marginRight: 10 },
  author: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: INK_SOFT,
    letterSpacing: 1.8,
    flexShrink: 1,
  },
});
