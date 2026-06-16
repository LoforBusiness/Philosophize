import { FlexWidget, TextWidget } from 'react-native-android-widget';

// The Android home-screen widget UI. This is NOT a normal React Native tree — it
// renders to Android RemoteViews, so it can only use react-native-android-widget
// primitives (FlexWidget / TextWidget) and their limited style set. Keeps the
// app's black-&-white "paper and ink" look. Tapping deep-links into the thinker.

const PAPER = '#FAF7F0';
const INK = '#1A1A1A';
const INK_SOFT = '#6B6B6B';
const HAIRLINE = '#D9D5CB';

export interface QuoteWidgetProps {
  text: string;
  author: string;
  dateLabel: string;
  philosopherId: string;
}

export function QuoteWidget({ text, author, dateLabel, philosopherId }: QuoteWidgetProps) {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `philosophize://thinker/${philosopherId}` }}
      accessibilityLabel={`Quote by ${author}. Tap to open their profile.`}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: PAPER,
        borderWidth: 2,
        borderColor: INK,
        borderRadius: 16,
        padding: 16,
      }}
    >
      {/* Header: kicker + date */}
      <FlexWidget
        style={{ flexDirection: 'row', justifyContent: 'space-between', width: 'match_parent' }}
      >
        <TextWidget
          text="PHILOSOPHIZE"
          style={{ fontSize: 9, color: INK, fontWeight: '700', letterSpacing: 2 }}
        />
        <TextWidget
          text={dateLabel}
          style={{ fontSize: 9, color: INK_SOFT, fontWeight: '500', letterSpacing: 1 }}
        />
      </FlexWidget>

      <FlexWidget
        style={{ height: 1, width: 'match_parent', backgroundColor: HAIRLINE, marginTop: 8, marginBottom: 10 }}
      />

      {/* Quote — fills the middle, vertically centered */}
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'center' }}>
        <TextWidget
          text={`“${text}”`}
          maxLines={5}
          truncate="END"
          style={{ fontSize: 15, color: INK, fontStyle: 'italic' }}
        />
      </FlexWidget>

      {/* Attribution */}
      <TextWidget
        text={`— ${author.toUpperCase()}`}
        maxLines={1}
        truncate="END"
        style={{ fontSize: 10, color: INK_SOFT, fontWeight: '500', letterSpacing: 1, marginTop: 10 }}
      />
    </FlexWidget>
  );
}
