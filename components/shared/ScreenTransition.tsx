import { useCallback, useState, type ReactNode } from 'react';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';

interface Props {
  children: ReactNode;
  /** Fill color shown behind the screen during the brief rise, so dark/light
   *  screens never flash the wrong colour at the edge. Match the screen's top. */
  bg?: string;
}

// Wraps a screen so it fades + rises gently into place whenever it gains focus
// (tab switches, pushes, going back). Subtle and professional, not flashy.
export default function ScreenTransition({ children, bg = 'transparent' }: Props) {
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: focused ? 1 : 0, translateY: focused ? 0 : 10 }}
      transition={{ type: 'timing', duration: 330, easing: Easing.out(Easing.cubic) }}
      style={{ flex: 1, backgroundColor: bg }}
    >
      {children}
    </MotiView>
  );
}
