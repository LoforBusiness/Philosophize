import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  INK, PAPER_LIT, FLAT_FACE, LOCK_FACE, LOCK_EDGE, LOCK_MARK, SAGE, mix,
} from '@/components/shared/tone';
import { ERA, type EraKey } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// A THINKER IS A MARBLE BUST ON A PLINTH IN THEIR ERA'S COLOUR (2026-09-26).
//
// It was a tile with their initial on it, and before that their emoji. The emoji
// were somebody else's drawings in full colour; the letters were a typeface.
// Neither was a THING, and everything else a reader meets the thinkers beside —
// the seated welcome's parlour has Socrates' bust on its shelf, the lessons draw
// real objects — is drawn in the one construction: a flat fill, one ink outline,
// a hard ledge under it. So each thinker is now what a thinker is in a room: a
// bust, the way the parlour draws Socrates, standing on a plinth that carries
// their initial.
//
// ── WHAT MAKES 341 OF THEM NOT ONE DRAWING ──────────────────────────────────
//
//   · THE ERA puts something on the bust, and it is carved, never worn by a
//     person: a laurel for the ancients, a hood for the medieval, a topknot for
//     the eastern schools, a cravat for the moderns, round spectacles for the
//     contemporaries. None of these reads as a gender, which is deliberate — the
//     roster carries no such field and a beard on Simone de Beauvoir is the kind
//     of mistake a drawing makes loudly.
//   · THE NAME picks the carved hair — a cap, a fringe, curls or none — by a hash,
//     so neighbours in a grid differ without anybody authoring 341 portraits.
//   · THE PLINTH carries the era's colour. The initial the tile used to carry is
//     gone: every place a bust is drawn prints the name beside it, and a letter
//     small enough to fit a plinth at 34px is one nobody can read.
//
// ── MET IS STRUCK; UNMET IS LOCKED ──────────────────────────────────────────
//
// A locked thing keeps its shape and loses its colour (Duolingo's path nodes, and
// the rank and badge crests here): the same bust in the grey lock tones, never
// faded, because a faded bust reads as a rendering fault.
//
// Plain Views, no SVG: 341 of these scroll past on one screen, and §19 records
// what a box-sized SVG bitmap per item costs a tab that stays built. Every piece
// is placed as a fraction of `size`, so the 34px contemporaries row and the 44px
// grid are one drawing.
// ─────────────────────────────────────────────────────────────────────────────

const LEDGE = 3;
const MARBLE = FLAT_FACE;
const MARBLE_SHADE = mix(FLAT_FACE, INK, 0.13);
const CARVED = mix(FLAT_FACE, INK, 0.3);

/** Which era a tint is, when a caller passes only the colour. */
function eraOfTint(tint: string): EraKey | null {
  const k = (Object.keys(ERA) as EraKey[]).find((e) => ERA[e].toLowerCase() === tint.toLowerCase());
  return k ?? null;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) % 997;
}

export default memo(function ThinkerSeal({
  initial, tint, met, size = 42, era, name,
}: {
  /** The thinker's initial — the hair's fallback seed when no name is given. */
  initial: string;
  /** Their era's colour, used on the plinth. Ignored when unmet. */
  tint: string;
  met: boolean;
  size?: number;
  /** Their era — decides what is carved on the bust. Read off `tint` when absent. */
  era?: EraKey | null;
  /** Their name — decides the carved hair. The initial when absent. */
  name?: string;
}) {
  const S = size;
  const line = Math.max(1.2, S / 24);
  const kind = era ?? eraOfTint(tint);
  const hair = hash(name ?? initial) % 4;

  const outline = met ? INK : LOCK_MARK;
  const face = met ? MARBLE : LOCK_FACE;
  const shade = met ? MARBLE_SHADE : LOCK_EDGE;
  const carved = met ? CARVED : LOCK_EDGE;
  const plinth = met ? tint : LOCK_FACE;
  const plinthLedge = met ? mix(tint, INK, 0.45) : LOCK_EDGE;
  const accent = met ? (kind ? ERA[kind] : tint) : LOCK_EDGE;

  // The head, and everything placed against it.
  const hd = S * 0.4;
  const hx = S * 0.5 - hd / 2;
  const hy = S * 0.05;
  const cx = S * 0.5;
  const cy = hy + hd / 2;

  const box = (l: number, t: number, w: number, h: number) =>
    ({ position: 'absolute' as const, left: l, top: t, width: w, height: h });

  return (
    <View style={{ width: S, height: S }} pointerEvents="none">
      {/* a hood sits BEHIND the head and falls onto the shoulders */}
      {kind === 'MEDIEVAL' ? (
        <View
          style={[
            box(S * 0.23, S * 0.0, S * 0.54, S * 0.52),
            {
              borderTopLeftRadius: S * 0.25, borderTopRightRadius: S * 0.25,
              borderBottomLeftRadius: S * 0.06, borderBottomRightRadius: S * 0.06,
              backgroundColor: met ? mix(accent, PAPER_LIT, 0.5) : LOCK_EDGE,
              borderWidth: line, borderColor: outline,
            },
          ]}
        />
      ) : null}

      {/* the shoulders: a dome of marble, shaded on the far side */}
      <View
        style={[
          box(S * 0.12, S * 0.44, S * 0.76, S * 0.31),
          {
            borderTopLeftRadius: S * 0.2, borderTopRightRadius: S * 0.2,
            borderBottomLeftRadius: S * 0.36, borderBottomRightRadius: S * 0.36,
            backgroundColor: shade, borderWidth: line, borderColor: outline, overflow: 'hidden',
          },
        ]}
      >
        <View
          style={{
            position: 'absolute', left: -S * 0.04, top: -S * 0.02, width: S * 0.54, height: S * 0.36,
            borderTopLeftRadius: S * 0.2, borderBottomRightRadius: S * 0.3, backgroundColor: face,
          }}
        />
        {kind === 'MODERN' ? (
          <>
            {/* a coat's lapels meeting at the cravat */}
            <View style={[styles.lapel, { left: S * 0.16, top: S * 0.02, width: line, height: S * 0.22, backgroundColor: outline, transform: [{ rotate: '-28deg' }] }]} />
            <View style={[styles.lapel, { left: S * 0.47, top: S * 0.02, width: line, height: S * 0.22, backgroundColor: outline, transform: [{ rotate: '28deg' }] }]} />
          </>
        ) : null}
      </View>

      {/* the neck */}
      <View
        style={[
          box(S * 0.42, S * 0.4, S * 0.16, S * 0.08),
          { backgroundColor: face, borderLeftWidth: line, borderRightWidth: line, borderColor: outline },
        ]}
      />
      {kind === 'MODERN' ? (
        <View
          style={[
            box(S * 0.41, S * 0.45, S * 0.18, S * 0.08),
            { borderRadius: S * 0.03, backgroundColor: met ? PAPER_LIT : LOCK_FACE, borderWidth: line * 0.9, borderColor: outline },
          ]}
        />
      ) : null}

      {/* the head: shaded, with the light on its upper left, and carved hair */}
      <View
        style={[
          box(hx, hy, hd, hd),
          { borderRadius: hd / 2, backgroundColor: shade, borderWidth: line, borderColor: outline, overflow: 'hidden' },
        ]}
      >
        <View
          style={{
            position: 'absolute', left: -hd * 0.2, top: -hd * 0.14, width: hd, height: hd,
            borderRadius: hd / 2, backgroundColor: face,
          }}
        />
        {kind !== 'MEDIEVAL' ? <Hair v={hair} d={hd} color={carved} /> : null}
      </View>

      {/* what the era carves on it */}
      {kind === 'ANCIENT' ? <Laurel cx={cx} cy={cy} r={hd / 2} S={S} met={met} line={line} outline={outline} /> : null}
      {kind === 'EASTERN' ? (
        <>
          <View
            style={[
              box(cx - S * 0.075, hy - S * 0.07, S * 0.15, S * 0.12),
              { borderRadius: S * 0.07, backgroundColor: carved, borderWidth: line, borderColor: outline },
            ]}
          />
          <View style={[box(cx - S * 0.07, hy + S * 0.02, S * 0.14, line * 1.4), { backgroundColor: accent, borderRadius: line }]} />
        </>
      ) : null}
      {kind === 'CONTEMPORARY' ? (
        <>
          {[-1, 1].map((sgn) => (
            <View
              key={sgn}
              style={[
                box(cx + sgn * S * 0.075 - S * 0.055, cy - S * 0.04, S * 0.11, S * 0.11),
                { borderRadius: S * 0.055, borderWidth: line * 0.9, borderColor: outline },
              ]}
            />
          ))}
          <View style={[box(cx - S * 0.03, cy + S * 0.005, S * 0.06, line * 0.9), { backgroundColor: outline }]} />
        </>
      ) : null}

      {/* the socle the bust is cut down to, and the plinth in the era's colour */}
      <View
        style={[
          box(S * 0.4, S * 0.72, S * 0.2, S * 0.06),
          { backgroundColor: shade, borderLeftWidth: line, borderRightWidth: line, borderColor: outline },
        ]}
      />
      <View
        style={[
          box(S * 0.18, S * 0.77, S * 0.64, S - S * 0.77 - LEDGE),
          {
            borderRadius: S * 0.06, backgroundColor: plinth, borderWidth: line, borderColor: outline,
            boxShadow: `0px ${LEDGE}px 0px ${plinthLedge}`,
          },
        ]}
      />
    </View>
  );
});

/** Carved hair, clipped inside the head. */
function Hair({ v, d, color }: { v: number; d: number; color: string }) {
  if (v === 0) {
    // a close cap
    return <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: d * 0.3, backgroundColor: color }} />;
  }
  if (v === 1) {
    // a fringe, parted
    return (
      <>
        <View style={{ position: 'absolute', left: 0, width: d * 0.62, top: 0, height: d * 0.4, backgroundColor: color, borderBottomRightRadius: d * 0.3 }} />
        <View style={{ position: 'absolute', right: 0, width: d * 0.34, top: 0, height: d * 0.28, backgroundColor: color, borderBottomLeftRadius: d * 0.2 }} />
      </>
    );
  }
  if (v === 2) {
    // curls: a row of small discs along the crown
    return (
      <>
        {[0.08, 0.3, 0.52, 0.74].map((f) => (
          <View
            key={f}
            style={{ position: 'absolute', left: d * f - d * 0.04, top: -d * 0.06, width: d * 0.3, height: d * 0.3, borderRadius: d * 0.15, backgroundColor: color }}
          />
        ))}
      </>
    );
  }
  // none on the crown, carved at the temples
  return (
    <>
      <View style={{ position: 'absolute', left: 0, width: d * 0.16, top: d * 0.24, height: d * 0.34, backgroundColor: color }} />
      <View style={{ position: 'absolute', right: 0, width: d * 0.16, top: d * 0.24, height: d * 0.34, backgroundColor: color }} />
    </>
  );
}

/** A laurel: leaves along the head's rim on either side, meeting above the brow. */
function Laurel({ cx, cy, r, S, met, line, outline }: {
  cx: number; cy: number; r: number; S: number; met: boolean; line: number; outline: string;
}) {
  const leaf = met ? mix(SAGE, INK, 0.18) : LOCK_EDGE;
  const lw = S * 0.13;
  const lh = S * 0.075;
  const angles = [200, 228, 256, 284, 312, 340];
  return (
    <>
      {angles.map((deg) => {
        const a = (deg * Math.PI) / 180;
        const x = cx + Math.cos(a) * r * 1.02;
        const y = cy + Math.sin(a) * r * 1.02;
        return (
          <View
            key={deg}
            style={{
              position: 'absolute', left: x - lw / 2, top: y - lh / 2, width: lw, height: lh,
              borderRadius: lh / 2, backgroundColor: leaf, borderWidth: line * 0.75, borderColor: outline,
              transform: [{ rotate: `${deg + 90}deg` }],
            }}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  lapel: { position: 'absolute' },
});
