import { useState, type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle, type GestureResponderEvent } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

interface Props {
  onPress?: (e: GestureResponderEvent) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
}

// A pressable that gives a quick, springy scale-down while held — the subtle
// tactile feedback that makes tapping feel responsive instead of dead.
export default function PressableScale({ onPress, children, style, scaleTo = 0.96, disabled }: Props) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
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
