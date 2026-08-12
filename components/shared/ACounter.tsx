import { TextInput } from 'react-native';
import Animated from 'react-native-reanimated';

// ─────────────────────────────────────────────────────────────────────────────
// A NUMBER THAT COUNTS WITHOUT RE-RENDERING ANYTHING.
//
// This was born in RankClimbChart and it is the whole performance fix there. The
// "+N XP" callout was a <Text> fed by React state from a `setInterval` running
// every 16ms — sixty state updates a second for the 1.6s the line takes to grow,
// each one re-rendering the component and with it the entire <Svg>: two paths,
// four gridlines, the node circles and every label. A re-render storm inside a
// ScrollView, which is exactly when the reader is scrolling, and it is why the
// profile went sticky at the graph.
//
// Reanimated can only write a NATIVE PROP from the UI thread, and `text` on a
// TextInput is one; a Text's children are not. So the number is a read-only,
// unfocusable TextInput whose `text` is written straight from the shared value
// that drives the rest of the animation. Zero React renders for the whole count,
// and the digits run on the identical clock as whatever they are annotating
// rather than on a second timer that agrees only approximately.
//
// IT LIVES HERE, NOT IN A CHART, because there are now two callers — the rank
// climb and the Insights ghost — and a second copy would drift from the first.
// `scripts/check-poll.mjs` points at this pattern by name in its failure
// message, so it needs one address.
//
// Use it with `animatedProps={useAnimatedProps(() => ({ text: … }))}` and give it
// `counterStyle` alongside your own text style, or the platform's default
// TextInput padding will shift the digits off whatever they are labelling.
// ─────────────────────────────────────────────────────────────────────────────

const ACounter = Animated.createAnimatedComponent(TextInput);

/** Strips the padding/height a TextInput brings that a Text does not. */
export const counterStyle = {
  padding: 0,
  margin: 0,
  height: undefined,
  minHeight: 0,
  includeFontPadding: false,
  textAlignVertical: 'center',
} as const;

export default ACounter;
