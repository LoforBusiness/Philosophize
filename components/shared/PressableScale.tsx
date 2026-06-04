import { useState, type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle, type GestureResponderEvent } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

interface Props {
  onPress?: (e: GestureResponderEvent) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  // Layout style for the OUTER Pressable (the actual flex child). Needed when
  // the pressable must stretch — e.g. `flex: 1` inside a row — since the visual
  // `style` lives on the inner animated view.
  containerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
}

// A pressable that gives a quick, springy scale-down while held — the subtle
// tactile feedback that makes tapping feel responsive instead of dead.
export default function PressableScale({ onPress, children, style, containerStyle, scaleTo = 0.96, disabled }: Props) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={containerStyle}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <MotiView
        animate={{ scale: pressed ? scaleTo : 1, opacity: pressed ? 0.92 : 1 }}
        transition={{ type: 'timing', duration: 140, easing: Easing.out(Easing.quad) }}
        style={style}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}
