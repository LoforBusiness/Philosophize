import React from 'react';
import { View } from 'react-native';
import { ClipPath, Defs, G, Path } from 'react-native-svg';
import Glyph, { type GlyphName } from './Glyph';
import type { Mark, Node } from './insigniaArt';

// ─────────────────────────────────────────────────────────────────────────────
// THE TWO HALVES EVERY STRUCK INSIGNIA IS DRAWN FROM.
//
// `InsigniaNodes` paints what components/shared/insigniaArt.ts builds: flat
// fills, steady lines and clipped groups, nothing else. That file has no React
// in it so the contact sheets and the checks can run it in plain Node; this is
// the only place its output meets react-native-svg, so the phone and the sheet
// cannot disagree about what a rank looks like.
//
// `StruckMark` is the emblem: the glyph twice, its shadow first and down-right,
// then the mark itself. Two Views over the <Svg> rather than paths inside it,
// because Glyph is its own <Svg> — and because that is how the mark has always
// been laid over the pin, including the zIndex that web needs (RankSeal's note).
// ─────────────────────────────────────────────────────────────────────────────

/** Paints one list of nodes. `id` must be unique per mounted insignia. */
export function InsigniaNodes({ nodes, id }: { nodes: Node[]; id: string }) {
  return <>{nodes.map((n, i) => paint(n, `${id}_${i}`))}</>;
}

function paint(n: Node, key: string): React.ReactElement {
  if (n.k === 'fill') return <Path key={key} d={n.d} fill={n.c} opacity={n.o ?? 1} />;
  if (n.k === 'line') {
    return (
      <Path
        key={key} d={n.d} fill="none" stroke={n.c} strokeWidth={n.w}
        strokeLinejoin="round" strokeLinecap="round" opacity={n.o ?? 1}
      />
    );
  }
  // useId embeds ':' and two insignia on one screen must not share a clip id —
  // the second would silently clip to the first one's outline.
  const cid = `cl${key}`;
  return (
    <G key={key}>
      <Defs>
        <ClipPath id={cid}><Path d={n.d} /></ClipPath>
      </Defs>
      <G clipPath={`url(#${cid})`}>
        {n.kids.map((k, j) => paint(k, `${key}_${j}`))}
      </G>
    </G>
  );
}

/** The emblem, placed in the insignia's 100-unit box drawn at `size` points. */
export function StruckMark({ glyph, mark, size }: { glyph: GlyphName; mark: Mark; size: number }) {
  const u = size / 100;
  const side = mark.size * u;
  const left = (mark.cx - mark.size / 2) * u;
  const top = (mark.cy - mark.size / 2) * u;
  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', left: left + mark.dx * u, top: top + mark.dy * u, zIndex: 1 }}>
        <Glyph name={glyph} size={side} color={mark.shadow} weight={mark.weight} />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', left, top, zIndex: 2 }}>
        <Glyph name={glyph} size={side} color={mark.color} weight={mark.weight} />
      </View>
    </>
  );
}
