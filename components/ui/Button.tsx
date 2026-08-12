import { useState } from 'react';
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import { C, TYPE, RADIUS, LIP } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE CHUNK.
//
// The button sits on a solid lip of its own colour. Pressing it moves the face
// down by exactly the lip's height and collapses the lip to nothing, so the
// button lands on its own shadow instead of merely dimming. That single
// mechanic is most of what makes a game UI feel tactile, and it costs one
// translateY and one height.
//
// THE PRIMARY IS INK, NOT PETROL. The accent appears only as the edge. The
// loudest thing on any screen stays black on paper — the app is still printed
// matter that happens to be pressable, not a toy.
//
// No sound. See PressableScale for the incident: navigation sounds fired on
// press-in, before the gesture was disambiguated, and machine-gunned down every
// card a scrolling thumb crossed. The haptic does the useful half.
// ─────────────────────────────────────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

const FACE: Record<Variant, { bg: string; fg: string; border?: string; lip?: string }> = {
  primary:     { bg: C.ink,   fg: C.paper, lip: C.HUE },
  secondary:   { bg: C.paper, fg: C.ink,   border: C.HUE,   lip: C.HUE },
  ghost:       { bg: 'transparent', fg: C.ink },
  destructive: { bg: C.paper, fg: C.wrong, border: C.wrong, lip: C.wrong },
};

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'lg' | 'md';
  disabled?: boolean;
  icon?: SketchIconName;
  style?: StyleProp<ViewStyle>;
}

export default function Button({
  label, onPress, variant = 'primary', size = 'md', disabled, icon, style,
}: Props) {
  const [down, setDown] = useState(false);
  const f = FACE[variant];
  const lip = disabled ? 0 : (f.lip ? LIP.button : 0);
  const drop = down ? lip : 0;
  const padV = size === 'lg' ? 16 : 12;

  return (
    <Pressable
      onPress={disabled ? undefined : () => { touch(); onPress(); }}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      disabled={disabled}
      accessibilityRole="button"
      style={[{ opacity: disabled ? 0.4 : 1 }, style]}
    >
      {/* The lip: a solid slab the face rests on. It is not a shadow — a shadow
          would blur, and this has to read as a physical edge. */}
      <View style={{ borderRadius: RADIUS.button, backgroundColor: f.lip ?? 'transparent' }}>
        <MotiView
          animate={{ translateY: drop, marginBottom: lip - drop }}
          transition={{ type: 'timing', duration: 90, easing: Easing.out(Easing.quad) }}
          style={[
            styles.face,
            {
              backgroundColor: f.bg,
              borderRadius: RADIUS.button,
              paddingVertical: padV,
              borderWidth: f.border ? 2 : 0,
              borderColor: f.border ?? 'transparent',
            },
          ]}
        >
          {icon ? <SketchIcon name={icon} size={18} color={f.fg} /> : null}
          <Text style={[styles.label, { color: f.fg, fontSize: size === 'lg' ? 16 : 14 }]}>
            {label}
          </Text>
        </MotiView>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: TYPE.label.family, letterSpacing: 0.3, textAlign: 'center',
  },
});
