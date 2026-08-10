import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import { backgroundById, type WidgetBackground } from './backgrounds';

// ─────────────────────────────────────────────────────────────────────────────
// THE HOME-SCREEN WIDGET.
//
// NOT a normal React Native tree: it renders to Android RemoteViews, so only
// react-native-android-widget primitives and their small style set exist here.
//
// ── IT DID NOT FIT, AND THE ARITHMETIC SAYS BY HOW MUCH ─────────────────────
//
// The widget's declared minimum is 110dp tall (app.json). The old card asked for:
//
//   padding 16×2                    32
//   header row                      12
//   rule + its margins              17
//   quote, 4 lines at 15sp          76
//   streak book + its label         66
//                                  ───
//                                  203dp
//
// — into 110. So on the smallest size, and on the default 4×2 cell, the bottom of
// the card was simply cut off: the streak book was sliced in half by the card
// edge and the attribution line, which sat beside it, never appeared at all. Both
// are visible in scripts/sheet-widget.mjs, and had been for as long as the book
// was 57dp tall inside a 110dp box.
//
// The book is gone. A 57dp illustration cannot live in a 110dp widget beside four
// lines of type — it was the single biggest thing in the card and the least
// informative. The streak is now one line of text in the footer, which is what it
// always was semantically.
//
//   padding 11×2                    22
//   header row                      12
//   rule + margins                  11
//   footer row                      12
//                                  ───
//                                   57dp of chrome, leaving 53 for the quote at
//                                   the SMALLEST size — three lines at 17.5.
//
// Everything above the minimum goes to the quote, so a taller widget simply shows
// more of it rather than re-laying anything out.
//
// ── THE ART IS FULL-BLEED; THE TYPE DOES NOT DEPEND ON IT ───────────────────
//
// The scene covers the whole card (the reader asked for exactly that), and the
// type's legibility is guaranteed by the scene's own construction rather than by
// hoping — see backgrounds.ts for the tone ramp and the veil, and
// `npm run check:widget` for the proof, which measures every text run against
// what is actually painted under it.
// ─────────────────────────────────────────────────────────────────────────────

export interface QuoteWidgetProps {
  text: string;
  author: string;
  dateLabel: string;
  philosopherId: string;
  streak: number;
  /** Omitted only by callers that predate scenes; falls back to the first. */
  background?: WidgetBackground;
}

/**
 * The streak mark: one solid shape, because 13dp is far too small for line art.
 *
 * The old book was drawn with eight strokes at 7-unit widths and read as a blot
 * at any size the card could actually spare. A filled leaf reads as a leaf at
 * 13dp, and that is the whole test.
 */
function markSvg(INK: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">`
    + `<path d="M12 2 C6 7 3 12 3 16 a9 9 0 0 0 18 0 c0-4-3-9-9-14 Z" fill="${INK}"/>`
    + `<path d="M12 7 C9 11 7.5 13.5 7.5 16 a4.5 4.5 0 0 0 9 0 c0-2.5-1.5-5-4.5-9 Z" fill="${INK}" opacity="0.28"/>`
    + `</svg>`;
}

export function QuoteWidget({ text, author, dateLabel, philosopherId, streak, background }: QuoteWidgetProps) {
  const bg = background ?? backgroundById(null);
  const { paper: PAPER, ink: INK, inkSoft: INK_SOFT, hairline: HAIRLINE } = bg;
  const days = Math.max(0, Math.min(999, streak));

  return (
    <OverlapWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `philosophize://thinker/${philosopherId}` }}
      style={{ height: 'match_parent', width: 'match_parent' }}
    >
      {/* 1 — the card itself. Its border is what keeps the card an object against
              a busy wallpaper, so a dark scene inverts it rather than losing it. */}
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: PAPER,
          borderWidth: 2,
          borderColor: bg.dark ? INK : '#1A1A1A',
          borderRadius: 18,
        }}
      />

      {/* 2 — the scene, FULL BLEED, sliced to cover at any widget size. */}
      <FlexWidget style={{ height: 'match_parent', width: 'match_parent' }}>
        <SvgWidget svg={bg.svg} style={{ height: 'match_parent', width: 'match_parent' }} />
      </FlexWidget>

      {/* 3 — content */}
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          paddingHorizontal: 13,
          paddingVertical: 11,
        }}
      >
        <FlexWidget
          style={{ flexDirection: 'row', justifyContent: 'space-between', width: 'match_parent' }}
        >
          <TextWidget
            text="DAILY QUOTE"
            style={{ fontSize: 9, color: INK, fontWeight: '700', letterSpacing: 2 }}
          />
          <TextWidget
            text={dateLabel}
            style={{ fontSize: 9, color: INK_SOFT, fontWeight: '500', letterSpacing: 1 }}
          />
        </FlexWidget>

        <FlexWidget
          style={{ height: 1, width: 'match_parent', backgroundColor: HAIRLINE, marginTop: 5, marginBottom: 5 }}
        />

        {/* The quote takes every dp the card can spare, so a bigger widget shows a
            longer quote rather than the same two lines in more white space. */}
        <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'center' }}>
          <TextWidget
            text={`“${text}”`}
            maxLines={4}
            truncate="END"
            style={{ fontSize: 14, color: INK, fontStyle: 'italic' }}
          />
        </FlexWidget>

        {/* One line. Attribution left, streak right — both 9sp, both on the
            baseline the header sets, so the card reads as three bands and not as
            a picture with things dropped on it. */}
        <FlexWidget
          style={{
            flexDirection: 'row',
            width: 'match_parent',
            alignItems: 'center',
            marginTop: 3,
          }}
        >
          <FlexWidget style={{ flex: 1 }}>
            <TextWidget
              text={`— ${author.toUpperCase()}`}
              maxLines={1}
              truncate="END"
              style={{ fontSize: 9, color: INK_SOFT, fontWeight: '700', letterSpacing: 1 }}
            />
          </FlexWidget>
          <SvgWidget
            svg={markSvg(INK_SOFT)}
            accessibilityLabel={`${days} day streak`}
            style={{ width: 11, height: 11, marginRight: 4 }}
          />
          <TextWidget
            text={days === 1 ? '1 DAY' : `${days} DAYS`}
            style={{ fontSize: 9, color: INK_SOFT, fontWeight: '700', letterSpacing: 1 }}
          />
        </FlexWidget>
      </FlexWidget>
    </OverlapWidget>
  );
}
