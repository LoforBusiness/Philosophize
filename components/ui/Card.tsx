import { useState, type ReactNode } from 'react';
import { Pressable, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import { C, RADIUS, LIP, SPACE } from '@/constants/design';

// A surface. With `onPress` it becomes pressable and grows a 2px lip; without
// one it is flat.
//
// THAT IS THE WHOLE RULE, AND IT IS WHY IT EXISTS: a lip means you can press
// it. Nothing in this app distinguished a tappable card from a decorative one,
// so every surface looked equally inert and the interface read as a document
// rather than something to play. One consistent edge fixes it everywhere at
// once, without a single new colour.
//
// The lip is a separate slab, pinned BEHIND the face and offset down by its
// own height — not a colour on the container itself. At rest the face covers
// all of the slab except a `lip`-px sliver at the bottom (the ledge); pressed,
// the face slides down over the whole slab, and the band that opens at the
// TOP is the transparent container, not a second colour. Painting the colour
// on the container and animating a margin to "collapse" it (an earlier draft
// of both this file and Button.tsx did exactly that) does not collapse the
// lip on press — the container's own background is still there the instant
// the face uncovers it, so the coloured band moves from the bottom edge to
// the top edge instead of disappearing. Only a slab that sits BEHIND the
// face, not a container that IS the colour, actually vanishes when covered.
//
// The parent's height is still CONSTANT (paddingBottom: lip, never animated)
// — it reserves the lip's space permanently, and the slab is absolutely
// positioned so it never touches layout. Only the face's translateY animates,
// and translateY is paint-only, so Yoga never re-measures this box and
// nothing below the card shifts when it is pressed. (An earlier draft of
// this component animated `marginBottom` alongside translateY instead — the
// same mistake Button.tsx's lip made first: marginBottom is a layout
// property, so Yoga recomputed the container height on every press and every
// sibling below it jittered. Cards live in long scrolling lists, so that
// bug would have been worse here than it was there.)

// ── WHY THERE ARE TWO STYLE PROPS ────────────────────────────────────────────
//
// `style` lands on the FACE — the painted surface — which is right for anything
// visual, and useless for anything about how this card sits among its siblings.
// The outer box was unreachable from outside, and three screens in this branch
// worked around it the same way: settings' `planCol`, profile's `glanceCol`,
// and the thinkers grid's width wrapper, each with its own comment explaining
// the same gap. Three workarounds for one missing prop is the tell.
//
// `containerStyle` is that prop, named and shaped exactly as
// components/shared/PressableScale.tsx already does it — LAYOUT for the outer
// flex child, visual on the inner. A second, differently-named convention for
// the identical idea would be the worse outcome.
//
// The face RELAYS the growth, and that half matters as much as the prop. A row
// stretches its children, and a grown outer box used to leave the paper face at
// content height inside it — a taller transparent box with a short card in it,
// which is precisely the bug the thinkers grid comment described. `flexGrow: 1`
// on the inner layers costs nothing when the outer box is content-sized (no
// free space to grow into, so Yoga ignores it) and is what makes an equal-height
// column an equal-height CARD.
interface Props {
  children: ReactNode;
  onPress?: () => void;
  /** Index into SPACE. Default 3 → 16. */
  pad?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Visual style for the face. */
  style?: StyleProp<ViewStyle>;
  /** Layout style for the OUTER box (the actual flex child). Needed when the
   *  card must stretch or grow — e.g. `flexGrow: 1` for equal-height columns —
   *  since `style` lives on the face inside it. */
  containerStyle?: StyleProp<ViewStyle>;
}

export default function Card({ children, onPress, pad = 3, style, containerStyle }: Props) {
  const [down, setDown] = useState(false);
  const lip = onPress ? LIP.card : 0;
  const drop = down ? lip : 0;

  const face = (
    <MotiView
      animate={{ translateY: drop }}
      transition={{ type: 'timing', duration: 90, easing: Easing.out(Easing.quad) }}
      style={[styles.face, { padding: SPACE[pad] }, style]}
    >
      {children}
    </MotiView>
  );

  // Static card: the flat box IS the outer flex child, so `containerStyle`
  // lands here.
  if (!onPress) return <View style={[styles.flat, containerStyle]}>{face}</View>;

  return (
    <Pressable
      onPress={() => { touch(); onPress(); }}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      accessibilityRole="button"
      // Pressable card: the Pressable is the outer flex child (same place
      // PressableScale puts it), and the box below relays the height inwards.
      style={containerStyle}
    >
      {/* Transparent container, height fixed at content + lip (constant,
          never animated). */}
      <View style={[styles.flat, styles.grow, { paddingBottom: lip }]}>
        {/* The lip slab: spans [lip, height], behind the face — see the file
            header for why the colour lives here and not on the container. */}
        {lip > 0 && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', top: lip, left: 0, right: 0, bottom: 0,
              backgroundColor: C.HUE, borderRadius: RADIUS.card,
            }}
          />
        )}
        {face}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flat: { borderRadius: RADIUS.card },
  // Inert unless the outer box was grown or stretched — see the header.
  grow: { flexGrow: 1 },
  face: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: C.hairline,
    flexGrow: 1,
  },
});
