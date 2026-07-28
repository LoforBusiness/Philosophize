import { View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Fill color behind the screen, so a dark/light screen never shows the wrong
   *  colour at the edge while a navigator is mid-transition. Match the screen's top. */
  bg?: string;
}

// Screens no longer animate themselves on focus. They used to: this wrapper
// faded and rose each screen whenever it gained focus, which was the only motion
// in the app because the tab navigator was set to `animation: 'none'` and cut
// between screens instantly. The result was a blink — the old screen gone, the
// background bare, the new one fading up from nothing.
//
// The navigators now own the motion instead (a cross-dissolve between tabs in
// app/(app)/_layout.tsx, a rise-and-fade on push in the stack layouts), which is
// the only place it can be done as a real handover with both screens on screen
// at once. Keeping a second fade here on top of that just made every arrival
// arrive twice, so this is now only the background fill it always also was.
export default function ScreenTransition({ children, bg = 'transparent' }: Props) {
  const style: ViewStyle = { flex: 1, backgroundColor: bg };
  return <View style={style}>{children}</View>;
}
