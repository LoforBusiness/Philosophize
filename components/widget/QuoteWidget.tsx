import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

// The Android home-screen widget UI. This is NOT a normal React Native tree — it
// renders to Android RemoteViews, so it can only use react-native-android-widget
// primitives and their limited style set. Layers (OverlapWidget):
//   1. paper card base (border + background)
//   2. faint hand-drawn scene — ground line + two bare trees, echoing the lesson art
//   3. content — kicker/date, the quote, attribution, and the streak book
// Tapping deep-links into the quoted thinker's profile.

import { backgroundById, type WidgetBackground } from './backgrounds';

// Colours are no longer constants here: they come from the chosen scene, because
// a scene decides whether the card is paper-with-ink-type or ink-with-cream-type
// and the two cannot share a palette. See components/widget/backgrounds.ts for
// the contrast arithmetic that says how bold each scene's art is allowed to be,
// and scripts/check-widget-contrast.mjs for the proof that it holds.

export interface QuoteWidgetProps {
  text: string;
  author: string;
  dateLabel: string;
  philosopherId: string;
  streak: number;
  /** Omitted only by callers that predate scenes; falls back to the first. */
  background?: WidgetBackground;
}

// The app's streak book (StreakBook.tsx paths), with the day count written on the
// cover. Stroke widths are heavier than in-app because the widget renders small.
function bookSvg(streak: number, INK: string, PAPER: string): string {
  const label = String(Math.max(0, Math.min(999, streak)));
  const fs = label.length >= 3 ? 56 : label.length === 2 ? 66 : 80;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <path d="M52 52 C 36 56 25 62 23 68 L 41 214 C 42 221 53 215 68 200 Z" fill="${PAPER}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M104 188 L100 250 L116 240 L131 251 L124 188 Z" fill="${PAPER}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M56 50 L162 28 Q171 26 173 35 L182 178 Q183 188 173 191 L72 200 Q62 201 60 191 L50 62 Q48 51 56 50 Z" fill="${PAPER}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M64 194 L72 212 Q74 216 80 214 L186 194 Q191 192 188 187 L181 178 Z" fill="${PAPER}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M76 205 L184 186" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.55"/>
  <path d="M80 211 L186 192" stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.4"/>
  <path d="M72 212 L78 221 L191 201 L188 192 Z" fill="${PAPER}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M86 150 L152 138" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M88 161 L148 150" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M90 172 L140 163" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <text x="116" y="126" font-family="serif" font-weight="bold" font-size="${fs}" fill="${INK}" text-anchor="middle" transform="rotate(-10 116 108)">${label}</text>
</svg>`;
}

export function QuoteWidget({ text, author, dateLabel, philosopherId, streak, background }: QuoteWidgetProps) {
  const bg = background ?? backgroundById(null);
  const { paper: PAPER, ink: INK, inkSoft: INK_SOFT, hairline: HAIRLINE } = bg;
  return (
    <OverlapWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `philosophize://thinker/${philosopherId}` }}
      style={{ height: 'match_parent', width: 'match_parent' }}
    >
      {/* 1 — card base. Also the border colour, which a dark scene has to invert
              or the card loses its edge against a dark wallpaper. */}
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: PAPER,
          borderWidth: 2,
          borderColor: bg.dark ? INK : '#1A1A1A',
          borderRadius: 16,
        }}
      />

      {/* 2 — the scene, FULL BLEED. It used to be a 216x99 vignette parked in the
              bottom-left corner; scenes are composed for the whole card and carry
              their own veil, so anything less would crop the composition and drop
              the very thing that guarantees the type stays readable. */}
      <FlexWidget style={{ height: 'match_parent', width: 'match_parent' }}>
        <SvgWidget svg={bg.svg} style={{ height: 'match_parent', width: 'match_parent' }} />
      </FlexWidget>

      {/* 3 — content */}
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          padding: 16,
        }}
      >
        {/* Header: kicker + date */}
        <FlexWidget
          style={{ flexDirection: 'row', justifyContent: 'space-between', width: 'match_parent' }}
        >
          {/* Deliberately NOT the app's name. A widget already sits under the app's
              own label in the picker, so the name here was only repeating it — and
              it made a rename a native change, because this string is also drawn
              into widget-preview.png. Naming the CONTENT instead is true whatever
              the app is called. Kept shorter than the name it replaced (11 chars
              vs 12) so it cannot overflow a row that already fit. */}
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
          style={{ height: 1, width: 'match_parent', backgroundColor: HAIRLINE, marginTop: 8, marginBottom: 8 }}
        />

        {/* Quote — fills the middle, vertically centered */}
        <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'center' }}>
          <TextWidget
            text={`“${text}”`}
            maxLines={4}
            truncate="END"
            style={{ fontSize: 15, color: INK, fontStyle: 'italic' }}
          />
        </FlexWidget>

        {/* Bottom row: attribution left, streak book right */}
        <FlexWidget
          style={{
            flexDirection: 'row',
            width: 'match_parent',
            alignItems: 'flex-end',
            marginTop: 4,
          }}
        >
          <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
            <TextWidget
              text={`— ${author.toUpperCase()}`}
              maxLines={1}
              truncate="END"
              style={{ fontSize: 10, color: INK_SOFT, fontWeight: '500', letterSpacing: 1, marginBottom: 6 }}
            />
          </FlexWidget>
          <FlexWidget style={{ flexDirection: 'column', alignItems: 'center' }}>
            <SvgWidget
              svg={bookSvg(streak, INK, PAPER)}
              accessibilityLabel={`${streak} day streak`}
              style={{ width: 44, height: 57 }}
            />
            <TextWidget
              text="DAY STREAK"
              style={{ fontSize: 7, color: INK_SOFT, fontWeight: '700', letterSpacing: 1, marginTop: 1 }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    </OverlapWidget>
  );
}
