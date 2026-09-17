import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PAPER_LIT, LOCK_FACE, LOCK_EDGE, LOCK_MARK } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// A THINKER IS A COLLECTIBLE TILE WITH THEIR INITIAL ON IT.
//
// It was their `symbol` — one emoji each — and that was wrong for a reason worth
// writing down rather than just reverting. Emoji are FULL COLOUR and they are
// somebody else's drawings: 🏛️ beside 🪷 beside ⚛️ is three unrelated
// illustration styles at three saturations, dropped into an app that is
// otherwise entirely hand-drawn black ink on warm paper. Three hundred and
// twenty-two of them read exactly as what they are — a set nobody designed.
//
// ── MET IS STRUCK IN THE ERA; UNMET IS LOCKED (2026-09-16) ──────────────────
//
// It was an SVG face lit along the one light with a soft drop shadow. The owner
// asked for the screens outside the lessons to read as a game, and a collection
// reads as a game when the pieces you have are unmistakably different objects
// from the pieces you do not — which is how Duolingo draws a path node, and how
// the rank and badge crests here now work:
//
//   · MET: a white tile with a 2px edge in the thinker's ERA colour, standing on
//     a 3px ledge of the same colour, the initial in it too. The colour is on
//     the edges and the mark, never flooded across the face — the era set is
//     dark and warm, and five filled tiles in it read as five brown blocks.
//   · UNMET: the SAME shape and the same ledge, in a neutral grey, with a grey
//     letter. A locked thing keeps its shape and loses its colour; it never
//     fades, because a faded tile reads as a rendering fault.
//
// Plain Views, no SVG: 322 of these scroll past on one screen, and §19 records
// what a box-sized SVG bitmap per item costs a tab that stays built.
//
// THE LETTER IS A REAL TEXT NODE, and is nudged UP by half the ledge so it sits
// in the middle of the face rather than the middle of face-plus-ledge.
// ─────────────────────────────────────────────────────────────────────────────

const LEDGE = 3;

export default function ThinkerSeal({
  initial, tint, met, size = 42,
}: {
  /** One character. The thinker's own initial — the only per-person mark here. */
  initial: string;
  /** Their era's colour, used on the edge, the ledge and the letter. Ignored when unmet. */
  tint: string;
  met: boolean;
  size?: number;
}) {
  const edge = met ? tint : LOCK_EDGE;
  const face = size - LEDGE;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.ledge,
          { top: LEDGE, height: face, borderRadius: size * 0.26, backgroundColor: edge },
        ]}
      />
      <View
        style={[
          styles.face,
          {
            height: face,
            borderRadius: size * 0.26,
            borderColor: edge,
            backgroundColor: met ? PAPER_LIT : LOCK_FACE,
          },
        ]}
      >
        <Text
          style={[styles.letter, { color: met ? tint : LOCK_MARK, fontSize: size * 0.44 }]}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {initial}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ledge: { position: 'absolute', left: 0, right: 0 },
  face: {
    position: 'absolute', top: 0, left: 0, right: 0,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  /** Playfair, because it is the app's display face and a monogram is display
   *  type. Caveat was the card's old initial and is a handwriting face — right
   *  for a scribbled note, wrong for something struck out of metal. */
  letter: { fontFamily: 'PlayfairDisplay_700Bold', includeFontPadding: false, textAlign: 'center' },
});
