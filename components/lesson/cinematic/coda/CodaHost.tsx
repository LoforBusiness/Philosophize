// ─────────────────────────────────────────────────────────────────────────────
// EVERYTHING ELSE FADES OUT, SO IT IS JUST THE STICKMAN.
//
// The owner asked for exactly that, and it is the reason the coda is a full-bleed
// layer over the player rather than another thing in the deck. The header, the
// progress bar, the XP pill, the paragraph and the summary card all go; what is left
// is the floor, the figures, one line of words and whatever the reader can touch.
//
// IT COVERS THE PLAYER RATHER THAN REPLACING IT. The player still owns the lesson's
// state — the score, the answers, the reward hand-off — and unmounting it to show a
// coda would throw all of that away on the last tap of the lesson. So the player
// dims its own tree and mounts this on top; when the coda calls `onDone` the player
// finishes exactly as it always did.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { PAPER } from '../cinematicKit';
import { CODAS } from './index';

const IN_MS = 520;

export default function CodaHost({ lessonId, onDone }: { lessonId: string; onDone: () => void }) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withTiming(1, { duration: IN_MS, easing: Easing.out(Easing.cubic) });
  }, [o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  const Coda = CODAS[lessonId];
  if (!Coda) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.sheet, st]} nativeID="lesson-coda">
      <View style={styles.inner}>
        <Coda onDone={onDone} />
      </View>
    </Animated.View>
  );
}

/** Whether this lesson has a closing encounter at all. */
export function hasCoda(lessonId: string): boolean {
  return !!CODAS[lessonId];
}

const styles = StyleSheet.create({
  // ABOVE THE HEADER, WHICH CARRIES `zIndex: 5` OF ITS OWN. An absolutely-positioned
  // last child covers its siblings by paint order — but not one that has raised
  // itself, and the header did that so the Aa button's label could hang below it
  // (group AI). So the close button, the progress bar and the XP pill were still
  // sitting on top of the encounter, which is the opposite of "everything else
  // fades out". Found in the real player; the preview route has no header.
  sheet: { backgroundColor: PAPER, zIndex: 20 },
  inner: { flex: 1, paddingTop: 18, paddingBottom: 10 },
});
