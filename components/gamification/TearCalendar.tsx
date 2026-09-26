import { View, Text, StyleSheet } from 'react-native';
import { INK, PAPER_LIT, mix } from '@/components/shared/tone';
import { LINE, SHEET_SHADE } from '@/components/shared/drawn';

// ─────────────────────────────────────────────────────────────────────────────
// THE TEAR-OFF CALENDAR — the streak as an object.
//
// A streak is a count of days, and the object that counts days in a room is a
// tear-off pad: one sheet a day, the top one carrying today's number. It hangs
// on the streak screen's wall and stands at the head of the streak panel on Home
// and Profile, so the count is the same thing everywhere it is shown.
//
// It replaced a line-drawn book on the panel. The book is still the reward
// screen's (LessonReward), which is lesson territory and was left alone.
//
// Drawn in the parlour's construction (components/shared/drawn.tsx): a white
// sheet on an ink outline, a second sheet showing under it so it reads as a PAD,
// a binding band in the streak's own colour with two rings punched through it.
// The number takes the band's colour, because that colour is the state: ember
// alive, slate lapsed (constants/streak.ts).
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  value: number;
  /** Width of the front sheet. The pad is 1.28× as tall. */
  width: number;
  /** The band and the number: STREAK_EMBER alive, SLATE lapsed. */
  mark: string;
  /** Words across the binding band, or none on a small pad. */
  band?: string | null;
  /** The ground the pad sits on, for the ledge's shade. */
  onInk?: boolean;
}

/**
 * The band's type size, from the words and the room. `adjustsFontSizeToFit` does
 * nothing on the web, which is where this is looked at, so it is sized here: Inter
 * Bold capitals run about 0.74 of an em each, plus the 0.5 of tracking.
 */
function bandFs(text: string, w: number): number {
  const room = w - 10 - text.length * 0.5;
  return Math.max(6, Math.min(w * 0.1, room / (text.length * 0.74)));
}

export default function TearCalendar({ value, width, mark, band = null, onInk = false }: Props) {
  const w = width;
  const h = Math.round(w * 1.28);
  const line = Math.max(1.5, Math.min(LINE, w / 32));
  const r = Math.max(3, w * 0.07);
  const bandH = Math.round(h * 0.22);
  const digits = String(value).length;
  const fs = w * (digits <= 2 ? 0.56 : digits === 3 ? 0.44 : 0.35);
  const shade = onInk ? mix(INK, PAPER_LIT, 0.28) : SHEET_SHADE;
  const ring = Math.max(3, w * 0.07);

  return (
    <View style={{ width: w + 3, height: h + Math.max(4, w * 0.06) + 3 }} pointerEvents="none">
      {/* the sheet under today's, so it reads as a pad and not a card */}
      <View
        style={{
          position: 'absolute', left: 3, top: Math.max(4, w * 0.06), width: w, height: h,
          borderRadius: r, borderWidth: line, borderColor: INK, backgroundColor: PAPER_LIT,
          boxShadow: `0px ${Math.max(2, w * 0.035)}px 0px ${shade}`,
        }}
      />
      {/* today's sheet */}
      <View
        style={{
          position: 'absolute', left: 0, top: 0, width: w, height: h,
          borderRadius: r, borderWidth: line, borderColor: INK, backgroundColor: PAPER_LIT,
          overflow: 'hidden',
        }}
      >
        <View style={[styles.band, { height: bandH, backgroundColor: mark, borderBottomWidth: line }]}>
          {band ? (
            <Text
              style={[styles.bandText, { fontSize: bandFs(band, w), letterSpacing: 0.5 }]}
              numberOfLines={1}
            >
              {band}
            </Text>
          ) : null}
        </View>
        <View style={styles.face}>
          <Text
            style={[styles.num, { color: mark, fontSize: fs, lineHeight: fs * 1.08 }]}
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
      </View>
      {/* the two rings through the binding */}
      {[0.28, 0.72].map((f) => (
        <View
          key={f}
          style={{
            position: 'absolute', left: w * f - ring / 2, top: -ring * 0.9,
            width: ring, height: ring * 2.1, borderRadius: ring / 2,
            borderWidth: line * 0.8, borderColor: INK, backgroundColor: onInk ? mix(INK, PAPER_LIT, 0.6) : PAPER_LIT,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  band: { alignItems: 'center', justifyContent: 'center', borderBottomColor: INK, paddingHorizontal: 4 },
  bandText: { fontFamily: 'Inter_700Bold', color: PAPER_LIT, includeFontPadding: false },
  face: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  num: { fontFamily: 'PlayfairDisplay_700Bold', includeFontPadding: false, textAlign: 'center' },
});
