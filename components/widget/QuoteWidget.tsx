import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

// The Android home-screen widget UI. This is NOT a normal React Native tree — it
// renders to Android RemoteViews, so it can only use react-native-android-widget
// primitives and their limited style set. Layers (OverlapWidget):
//   1. paper card base (border + background)
//   2. faint hand-drawn scene — ground line + two bare trees, echoing the lesson art
//   3. content — kicker/date, the quote, attribution, and the streak book
// Tapping deep-links into the quoted thinker's profile.

const PAPER = '#FAF7F0';
const INK = '#1A1A1A';
const INK_SOFT = '#6B6B6B';
const HAIRLINE = '#D9D5CB';
const SKETCH = '#DCD7CA'; // background scene strokes — light enough to sit behind text

export interface QuoteWidgetProps {
  text: string;
  author: string;
  dateLabel: string;
  philosopherId: string;
  streak: number;
}

// The bare-trees-on-a-hill vignette from the lesson scenes, drawn faint so the
// quote stays perfectly legible on top of it.
const SCENE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110">
  <path d="M6 104 Q120 86 234 102" stroke="${SKETCH}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M20 100 L20 95 M34 98 L34 92 M50 96 L50 91" stroke="${SKETCH}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M70 98 L70 30 M70 54 L52 34 M70 68 L90 44 M70 44 L85 27" stroke="${SKETCH}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M160 100 L160 12 M160 36 L138 16 M160 56 L184 28 M160 76 L136 58 M160 27 L177 10" stroke="${SKETCH}" stroke-width="4.4" fill="none" stroke-linecap="round"/>
</svg>`;

// The app's streak book (StreakBook.tsx paths), with the day count written on the
// cover. Stroke widths are heavier than in-app because the widget renders small.
function bookSvg(streak: number): string {
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

export function QuoteWidget({ text, author, dateLabel, philosopherId, streak }: QuoteWidgetProps) {
  return (
    <OverlapWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `philosophize://thinker/${philosopherId}` }}
      style={{ height: 'match_parent', width: 'match_parent' }}
    >
      {/* 1 — paper card base */}
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: PAPER,
          borderWidth: 2,
          borderColor: INK,
          borderRadius: 16,
        }}
      />

      {/* 2 — faint scene, resting on the card's bottom-left */}
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          padding: 8,
        }}
      >
        <SvgWidget svg={SCENE_SVG} style={{ width: 216, height: 99 }} />
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
              svg={bookSvg(streak)}
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
