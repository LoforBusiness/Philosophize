import { useState, type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle, type GestureResponderEvent } from 'react-native';
import { MotiView } from 'moti';
import { cue } from '@/lib/feedback';
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
  /**
   * WHICH FINGERTIP. Three tap sounds were chosen in the lab, and they are three
   * MATERIALS, so cycling them would sound like the surface changed at random.
   * They map to how weighty the control is instead:
   *
   *   'solid'  a card or a primary button — wood, the default
   *   'glass'  a switch or a small precise mechanism
   *   'light'  a list row or a secondary control — barely a ring
   */
  weight?: 'solid' | 'glass' | 'light';
}

/** The index of each material in the sound layer's ladder (lib/sound/real.ts). */
const WEIGHT = { solid: 0, glass: 1, light: 2 } as const;

// A pressable that gives a quick, springy scale-down while held — the subtle
// tactile feedback that makes tapping feel responsive instead of dead.
export default function PressableScale({ onPress, children, style, containerStyle, scaleTo = 0.96, disabled, weight = 'solid' }: Props) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      // ── THE SOUND FIRES ON `onPress`, AND IT MUST NOT MOVE BACK TO `onPressIn`.
      //
      // It was on press-in, with the reasoning that "the sound is confirming the
      // touch, and a click that arrives after the finger lifts reads as lag". That
      // is true in isolation and useless in a scrolling list, which is where most
      // of these live.
      //
      // `onPressIn` fires the instant a finger lands, BEFORE the gesture has been
      // disambiguated. Drag it and the touch becomes a scroll: `onPress` never
      // fires, the responder is handed to the ScrollView — and the sound has
      // already played. So flicking down the branch list or past the Home actions
      // machine-gunned a tap off every card the thumb crossed, without a single
      // button being pressed.
      //
      // `onPress` only fires for a movement the system has decided IS a tap. The
      // cost is the few tens of milliseconds between touch and lift, which is
      // nothing next to an app that clicks at you while you scroll.
      //
      // The VISUAL scale-down stays on press-in, and correctly: the ScrollView
      // cancels the responder when a scroll begins, so `onPressOut` runs and the
      // card springs back. A cheap animation that resolves itself is fine. A sound
      // cannot be un-played.
      //
      // Nothing sounds if there is nothing to do: a PressableScale with no handler
      // is decoration, and decoration that clicks is the same mistake as the figure
      // who used to clop across the home screen.
      onPress={onPress && ((e) => { if (!disabled) cue('tap', WEIGHT[weight]); onPress(e); })}
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
