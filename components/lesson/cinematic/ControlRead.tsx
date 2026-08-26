import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, type SharedValue } from 'react-native-reanimated';
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
// every frame). It is wrong for a sentence, because AN <input> CANNOT WRAP. There
// is no second line for a long reading to go to, so it can only be clipped.
//
// ── AND IT WAS INVISIBLE TO BOTH INSTRUMENTS AT ONCE ────────────────────────
//
// `check-controls` measures every label a control draws and did not list the
// readout. `check-readable` DOES scan the lower deck — it was extended to do
// exactly that after an earlier report — but it walks `div,span`, and an `<input>`
// is neither. Two checks, one blind spot each, and the two lined up precisely on
// the biggest word on the beat. Both green, for months, over a defect the reader
// could see from across the room. That is group S6 in the rule book.
//
// ── THE FIRST FIX MADE IT WRAP AND MADE IT STUTTER ──────────────────────────
//
//   "when you start to move them, the words above it that change as you move it
//    start to stutter and start to glitch, and you can't even read what's going
//    on … the lever looks okay … it's a lot with the line when you slide it"
//
// Right on both counts, and the difference between the two controls is the whole
// diagnosis. The first fix drove the reading from REACT STATE, updated on each
// boundary crossing. A lever has three or four detents, so a sweep crosses two or
// three of them and the reading changes two or three times. A RAIL is continuous:
// `drag` and `split` divide 0…1 into zones and a thumb travelling the width can
// cross every one of them in a few hundred milliseconds. Three faults, all
// hidden by the lever's coarseness:
//
//   1. EACH CHANGE WAS A HARD CUT. A whole sentence at 15pt replaced between one
//      frame and the next, several times a second, directly above the thumb.
//   2. THE BOX RE-CENTRED. One-line and two-line readings centre at different
//      heights, so the words also JUMPED vertically on every swap.
//   3. IT RE-RENDERED THE CONTROL MID-GESTURE. `DragScale` builds its `Gesture.Pan`
//      inline, so every reading change handed `GestureDetector` a new gesture
//      object while a finger was down on it.
//
// So the reading does not go through React at all any more. Every possible
// reading is mounted at once, stacked in one fixed box, and an index SharedValue
// cross-fades between them on the UI thread — no re-render, no cut, no jump, and
// the drag keeps the same gesture object for its whole life.
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

/**
 * How long one reading takes to hand over to the next.
 *
 * 130ms: long enough to read as a dissolve rather than a cut, short enough that a
 * thumb crossing three zones does not leave three readings on screen at once. The
 * deck's own crossfade is the same order, so the two agree.
 */
const XFADE = 130;

interface Props {
  /** Every reading this control can show, in the control's own index order. */
  texts: string[];
  /**
   * Which one is current, 0-based — a SharedValue, NOT a number.
   *
   * That is the fix rather than an implementation detail: a number would arrive
   * through a React render, which is what was stuttering. This is read on the UI
   * thread by each layer's own animated style.
   */
  idx: SharedValue<number>;
}

export default function ControlRead({ texts, idx }: Props) {
  return (
    // `nativeID` for the same reason every control carries one (S6): a harness
    // that has to guess which box is the reading will eventually guess a
    // neighbouring one and report a measurement of something else.
    <View style={styles.box} nativeID="control-read" pointerEvents="none">
      {texts.map((t, i) => (
        // Keyed on BOTH so a beat whose readings change length remounts cleanly,
        // and a beat that merely reorders them does not.
        <Layer key={`${i}:${t}`} text={t} i={i} idx={idx} />
      ))}
    </View>
  );
}

/** One reading, faded in when it is the current one. */
function Layer({ text, i, idx }: { text: string; i: number; idx: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({
    opacity: withTiming(Math.round(idx.value) === i ? 1 : 0, { duration: XFADE }),
  }));
  return (
    <Animated.View style={[styles.layer, st]} pointerEvents="none">
      <Text style={styles.word} numberOfLines={2}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { height: READ_H, marginBottom: 2, justifyContent: 'center' },
  // Every reading occupies the whole box and centres inside it, so the one that
  // arrives is already where the one that is leaving was.
  layer: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    justifyContent: 'center',
  },
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
