import { View, Text, StyleSheet } from 'react-native';
import { INK } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// THE READING ABOVE AN ANALOGUE CONTROL — THE ONE WORD NOTHING COULD SEE.
//
// Every control in the analogue family (drag · lever · plot · split · field)
// prints a sentence over itself that changes as the reader moves it: "a hunch" →
// "a good bet" → "knowledge". §17 calls it the whole reason the family teaches —
// the reader finds the boundary by hunting for the flip. It is the largest type
// on the beat and the thing the question is actually about.
//
// It was also, for its entire life, CUT OFF AT THE RIGHT-HAND EDGE on 285 of the
// 1,127 readings in the corpus. "two things, and the bundle cannot say what makes
// them two" is 465dp of Playfair in a 308dp box, so a third of the sentence ran
// off the screen and the reader reported exactly that, twice:
//
//   "still words are cut off the screen from the left and the right"
//   "letters are cut off to the right"
//
// ── WHY IT WAS AN <input>, AND WHY THAT IS THE WHOLE BUG ────────────────────
//
// It was an `ACounter` — `Animated.createAnimatedComponent(TextInput)` — chosen
// so Reanimated could write it from the UI thread and the drag would cost zero
// React renders. That reasoning is sound for a NUMBER (see ACounter's header, and
// SplitBar still uses it for its two running percentages, which genuinely do move
// every frame). It is wrong for a sentence, for two separate reasons:
//
//   1. AN <input> CANNOT WRAP. There is no second line for a long reading to go
//      to, so it can only be clipped. No amount of tuning fixes that.
//   2. THE READING DOES NOT CHANGE EVERY FRAME. It changes when the value crosses
//      into a new ZONE — a stop, a quadrant, a nearest profile. All five controls
//      were already detecting that crossing, because that is when they fire the
//      haptic tick. So the value that needs to reach React changes a handful of
//      times per gesture, not sixty times a second, and a `<Text>` driven by
//      state on the same crossing costs about four renders of one small leaf.
//
// So the performance argument that made it a TextInput never applied to it. What
// it bought was one clipped line where two wrapped ones were free.
//
// ── AND IT WAS INVISIBLE TO BOTH INSTRUMENTS AT ONCE ────────────────────────
//
// This is the part worth carrying. `check-controls` measures every label a control
// draws and did not list the readout. `check-readable` DOES scan the lower deck —
// it was extended to do exactly that after the last report — but it walks
// `div,span`, and an `<input>` is neither. Two checks, one blind spot each, and
// the two lined up precisely on the biggest word on the beat. Both green, for
// months, over a defect the reader could see from across the room.
//
// The general form, which §21 keeps relearning: A CHECK THAT WALKS A LIST OF
// ELEMENT KINDS IS A CHECK THAT CANNOT SEE A NEW KIND. Both are fixed — the slot
// is in `check-controls` now, and `check-readable` walks inputs too.
//
// ── THE HEIGHT IS FIXED, AND THAT IS NOT A DETAIL ───────────────────────────
//
// Two lines' worth, always, whether the reading uses one or two. The reading
// changes UNDER THE READER'S THUMB, so a box that grew with it would resize the
// deck mid-drag — and the deck's height is what `styles.lower` hands out, so the
// stage would rescale on the frame a word got longer. That is L6 exactly, the
// camera cut nobody wrote, arriving through a text box instead of a control.
// ─────────────────────────────────────────────────────────────────────────────

/** Both lines, always — see the note above on why this may not be content-sized. */
const LINE = 19;
export const READ_H = LINE * 2;

export default function ControlRead({ text }: { text: string }) {
  return (
    <View style={styles.box} pointerEvents="none">
      <Text style={styles.word} numberOfLines={2}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: READ_H, justifyContent: 'center', marginBottom: 2 },
  word: {
    // 15, NOT 17. Two lines of 17 would have cost the deck 44px of the room its
    // prompt and explanation live in, and that box is `overflow: hidden`. At 15
    // every one of the 1,127 readings in the corpus fits in two lines at 360dp,
    // measured with the real face by `npm run check:controls`.
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    lineHeight: LINE,
    color: INK,
    textAlign: 'center',
  },
});
