import React, { useId } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { GHOST, LIGHT, FACE, LOCKED_FACE, SHADOW, type Stops } from '@/components/shared/tone';
import { C } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// A THINKER IS A STRUCK TILE WITH THEIR INITIAL ON IT.
//
// It was their `symbol` — one emoji each — and that was wrong for a reason worth
// writing down rather than just reverting. Emoji are FULL COLOUR and they are
// somebody else's drawings: 🏛️ beside 🪷 beside ⚛️ is three unrelated
// illustration styles at three saturations, dropped into an app that is
// otherwise entirely hand-drawn black ink on warm paper. Three hundred and
// twenty-two of them read exactly as what they are — a set nobody designed.
//
// ── THE SAME OBJECT LANGUAGE AS THE RANK PINS (§19) ─────────────────────────
//
// Everything here comes from `tone.ts`: one light from the top left, a lit face,
// a shaded side, a small drop shadow. No new hue enters the app through this
// file — the only colour is the ERA, which already had to earn its place, and it
// appears on the rim and the letter rather than as a flooded fill.
//
// That is deliberately the same construction as `RankSeal`, because these two
// are doing the same job: a repeated frame with a changing mark inside, which is
// what makes a set feel collectible rather than decorative. A thinker tile and a
// rank pin should look like they came out of the same press.
//
// ── LOCKED IS FLAT AND COOL, AND THAT IS THE WHOLE REWARD ───────────────────
//
// An unmet thinker gets `LOCKED_FACE` — no gradient, no shadow, a slate off the
// warm ramp — and a met one gets the lit face and their era's colour. "The same
// tile, dimmer" is indistinguishable from a rendering fault; unlit against lit
// is what makes meeting somebody visibly worth something. Straight out of the
// rank-pin note in §19, for the same reason.
//
// THE LETTER IS A REAL TEXT NODE, not an SVG <Text>: react-native-svg's text
// metrics differ between web and native, and a monogram that is centred on one
// and a pixel low on the other is the sort of thing nobody notices until every
// card on the screen looks subtly askew. A <Text> in an absolutely-positioned
// overlay centres identically on both.
// ─────────────────────────────────────────────────────────────────────────────

const grad = (id: string, stops: Stops) => (
  <LinearGradient id={id} x1={LIGHT.x1} y1={LIGHT.y1} x2={LIGHT.x2} y2={LIGHT.y2}>
    {stops.map(([o, c, op], k) => (
      <Stop key={k} offset={o} stopColor={c} stopOpacity={op} />
    ))}
  </LinearGradient>
);

export default function ThinkerSeal({
  initial, tint, met, size = 42,
}: {
  /** One character. The thinker's own initial — the only per-person mark here. */
  initial: string;
  /** Their era's colour, used on the rim and the letter. Ignored when unmet. */
  tint: string;
  met: boolean;
  size?: number;
}) {
  // Two pins on one screen sharing a gradient id would have one of them render
  // with the other's fill — the same trap RankSeal documents.
  const uid = useId().replace(/:/g, '');
  const R = 22; // corner radius in the 100-box, matching the card's own radius
  const edge = met ? tint : GHOST;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {grad(`face${uid}`, met ? FACE : LOCKED_FACE)}
        </Defs>
        {/* The shadow, down and right because the light is up and left. Only on
            a struck tile — a locked one is flat, so it casts nothing. */}
        {met && (
          <Rect
            x={6 + SHADOW.dx} y={6 + SHADOW.dy} width={88} height={88} rx={R}
            fill={C.ink} opacity={SHADOW.opacity}
          />
        )}
        <Rect x={6} y={6} width={88} height={88} rx={R} fill={`url(#face${uid})`} />
        {/* The rim carries the era. A stroke rather than a fill, so the colour is
            an edge on paper rather than a block of it — the same rule the accent
            follows everywhere else in this app. */}
        <Rect
          x={6} y={6} width={88} height={88} rx={R}
          fill="none" stroke={edge} strokeWidth={met ? 5 : 4}
        />
      </Svg>
      <View style={styles.letterWrap} pointerEvents="none">
        <Text
          style={[styles.letter, { color: edge, fontSize: size * 0.46 }]}
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
  letterWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  /** Playfair, because it is the app's display face and a monogram is display
   *  type. Caveat was the card's old initial and is a handwriting face — right
   *  for a scribbled note, wrong for something struck out of metal. */
  letter: { fontFamily: 'PlayfairDisplay_700Bold', includeFontPadding: false, textAlign: 'center' },
});
