import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

// Home assembles instead of appearing.
//
// Each block rises a few dp and fades, one after another, so landing on the
// screen reads as a page being laid down rather than a screenshot arriving. The
// whole sequence is over in about half a second — this is a first impression,
// not a performance, and anything slower makes the reader wait to tap.
//
// Moti, not Reanimated, because §4 draws the line exactly here: Reanimated for
// gesture-driven work, Moti for declarative enter/exit. The stagger is `delay`
// on a timing transition, which costs nothing once it has run.
//
// A tab screen stays mounted, so this plays once per app open rather than on
// every visit to Home — which is the right frequency. Re-running it each time
// the reader tabs back would turn a nice arrival into a stutter they cannot
// dismiss.

const STEP = 60;      // ms between blocks
const RISE = 10;      // dp travelled

export default function Arrive({
  index = 0,
  children,
  style,
}: {
  /** Position in the stagger, top to bottom. */
  index?: number;
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: RISE }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 360, delay: index * STEP }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
