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
// A solid slab of the lip colour sits BEHIND the face, offset down by the
// lip's own height. At rest the face covers all of the slab except a
// `lip`-px sliver at the bottom — the visible ledge. Pressing slides the face
// down by exactly that many pixels, which covers the slab completely; the
// band that opens up at the TOP is the transparent container showing whatever
// is behind the button, not a second colour. That is what makes it read as
// dropping into a socket rather than a colour swapping edges.
//
// An earlier version put the colour on the CONTAINER itself and animated a
// margin to "collapse" it. That does not collapse anything: the container's
// background is still there at the top the instant the face uncovers it, so
// pressing moved the coloured band from the bottom edge to the top edge
// instead of removing it — visibly on `secondary` and `destructive`, whose
// faces are paper, not ink. It also made Yoga re-measure the container on
// every press, since the margin was the animated property, which shifted
// whatever sat below the button in a list. Neither is true of the version
// below: the container's height is fixed at content + lip via a constant,
// never-animated `paddingBottom`, the slab is absolutely positioned so it
// never touches layout, and `translateY` — paint-only, so Yoga never
// re-measures for it — is the only thing that animates.
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
      {/* Transparent container, height fixed at content + lip (constant,
          never animated). */}
      <View style={{ paddingBottom: lip }}>
        {/* The lip slab: spans [lip, height], behind the face. At rest the
            face covers all but its bottom `lip` px — the ledge. Pressed, the
            face translates down by `lip` and covers the slab entirely, and
            the gap that opens at the TOP is this container's own
            transparency, not a colour. */}
        {lip > 0 && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', top: lip, left: 0, right: 0, bottom: 0,
              backgroundColor: f.lip, borderRadius: RADIUS.button,
            }}
          />
        )}
        <MotiView
          animate={{ translateY: drop }}
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
