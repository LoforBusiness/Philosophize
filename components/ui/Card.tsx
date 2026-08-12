import { useState, type ReactNode } from 'react';
import { Pressable, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import { C, RADIUS, LIP, SPACE } from '@/constants/design';

// A surface. With `onPress` it becomes pressable and grows a 2px lip; without
// one it is flat.
//
// THAT IS THE WHOLE RULE, AND IT IS WHY IT EXISTS: a lip means you can press
// it. Nothing in this app distinguished a tappable card from a decorative one,
// so every surface looked equally inert and the interface read as a document
// rather than something to play. One consistent edge fixes it everywhere at
// once, without a single new colour.
//
// The parent's height is CONSTANT (paddingBottom: lip, never animated) — it
// reserves the lip's space permanently. Only the face's translateY animates,
// and translateY is paint-only, so Yoga never re-measures this box and
// nothing below the card shifts when it is pressed. (An earlier draft of
// this component animated `marginBottom` alongside translateY instead — the
// same mistake Button.tsx's lip made first: marginBottom is a layout
// property, so Yoga recomputed the container height on every press and every
// sibling below it jittered. Cards live in long scrolling lists, so that
// bug would have been worse here than it was there.)

interface Props {
  children: ReactNode;
  onPress?: () => void;
  /** Index into SPACE. Default 3 → 16. */
  pad?: 0 | 1 | 2 | 3 | 4 | 5;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, onPress, pad = 3, style }: Props) {
  const [down, setDown] = useState(false);
  const lip = onPress ? LIP.card : 0;
  const drop = down ? lip : 0;

  const face = (
    <MotiView
      animate={{ translateY: drop }}
      transition={{ type: 'timing', duration: 90, easing: Easing.out(Easing.quad) }}
      style={[styles.face, { padding: SPACE[pad] }, style]}
    >
      {children}
    </MotiView>
  );

  if (!onPress) return <View style={styles.flat}>{face}</View>;

  return (
    <Pressable
      onPress={() => { touch(); onPress(); }}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      accessibilityRole="button"
    >
      <View style={[styles.flat, { backgroundColor: C.HUE, paddingBottom: lip }]}>{face}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flat: { borderRadius: RADIUS.card },
  face: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: C.hairline,
  },
});
