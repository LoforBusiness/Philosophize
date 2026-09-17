import { memo, useState } from 'react';
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import { C, RADIUS, LIP, SPACE, TYPE } from '@/constants/design';
import { TEAL, PAPER, mix } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// A FILTER CHIP: A RAISED PILL, AND THE CHOSEN ONE IS PRESSED IN (2026-09-16).
//
// The Thinkers filters were outlines, and the chosen one a solid ink pill, which
// is the loudest thing on that screen after the hero — for a control that only
// says "you are looking at all of them". Duolingo's selectable pieces are the
// reference the owner pointed at: an unchosen one is a white face with a 2px
// grey edge standing on a 2px ledge of the same grey, and a chosen one is a flat
// pale tint with a darker edge of the same hue and NO ledge — it has been
// pressed, so it sits down on its socket.
//
// The tint is built the way the tab bar's chosen tile is (tone.ts `TINT`): the
// hue at 15% on paper, edged at 50%. The hue is the teal unless the chip belongs
// to something with a colour of its own — an era filter tints in its era, which
// is what teaches the reader the colour code.
//
// Same construction as Card and Button: a slab BEHIND the face, the face sliding
// down onto it, and a container whose height never changes, so nothing below a
// row of chips moves when one is pressed.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** The label's colour while the chip is not chosen — an era, for instance. */
  color?: string;
  /** The hue the chosen chip is tinted in. Default: the palette's teal. */
  hue?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

function Chip({ label, selected = false, onPress, color = C.ink, hue = TEAL, style, accessibilityLabel }: Props) {
  const [down, setDown] = useState(false);
  const lip = LIP.chip;
  // Chosen means already pressed: the face rests on the ledge.
  const drop = selected || down ? lip : 0;
  return (
    <Pressable
      onPress={() => { touch(); onPress(); }}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={style}
    >
      <View style={{ paddingBottom: lip }}>
        <View pointerEvents="none" style={[styles.slab, { top: lip }]} />
        <MotiView
          animate={{ translateY: drop }}
          transition={{ type: 'timing', duration: 90, easing: Easing.out(Easing.quad) }}
          style={[styles.face, selected && { backgroundColor: mix(hue, PAPER, 0.85), borderColor: mix(hue, PAPER, 0.5) }]}
        >
          <Text style={[styles.label, { color: selected ? hue : color }]}>{label}</Text>
        </MotiView>
      </View>
    </Pressable>
  );
}

export default memo(Chip);

const styles = StyleSheet.create({
  slab: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: C.edge, borderRadius: RADIUS.pill,
  },
  face: {
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.edge,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACE[3],
    paddingVertical: SPACE[1] - 1,
  },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: TYPE.micro.fontSize,
    lineHeight: TYPE.micro.lineHeight,
    letterSpacing: 1,
  },
});
