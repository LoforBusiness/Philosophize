// WHO IS SPEAKING — the face beside a dialogue lesson's words (LESSON_RULES group AP).
//
// A dialogue lesson has three stickmen talking and one line of words under the stage,
// so the reader needs to know whose line it is before they have read it. The tag is
// that speaker's own head — the rig's head disc wearing the costume's head pieces,
// taken from wardrobe.ts rather than redrawn — on a small white disc, so the top hat,
// the newsboy cap and the bare mascot are told apart at a glance and always match the
// figure on the stage.
//
// Views, not SVG (§19's GPU rule): a tag is a handful of rectangles.
import type React from 'react';
import { View } from 'react-native';
import { C } from '@/constants/design';
import { FLAT_FACE } from '@/components/shared/tone';
import { BY_ID, type Piece } from './wardrobe';
import { CAST, type Speaker } from './cast';

/** The tag's outer size, in dp. */
export const TAG = 34;
/** Rig units to dp inside the tag: the head (radius 20) comes out about 7dp. */
const S = 0.34;
const BORDER = 2;
/** Absolute children sit inside the border, so the head is placed in the inner box. */
const INNER = TAG - 2 * BORDER;
/** Where the head's centre sits in the disc: low, so a top hat has room above it. */
const HX = INNER / 2;
const HY = INNER * 0.62;
const HEAD_R = 20;

function PieceView({ p }: { p: Piece }) {
  const w = p.w * S;
  const h = p.h * S;
  return (
    <View
      style={{
        position: 'absolute',
        left: HX + p.x * S - w / 2,
        top: HY + p.y * S - h / 2,
        width: w,
        height: h,
        borderRadius: (p.r ?? 0) * S,
        transform: p.rot ? [{ rotate: `${p.rot}deg` }] : undefined,
        ...(p.ring
          ? { borderWidth: Math.max(1, p.ring * S), borderColor: C.ink }
          : { backgroundColor: p.paper ? C.paper : C.ink }),
      }}
    />
  );
}

export default function SpeakerTag({ who }: { who: Speaker }) {
  const pieces = (BY_ID[CAST[who].costume]?.pieces ?? []).filter((p) => p.at === 'head');
  const r = HEAD_R * S;
  return (
    <View
      accessible
      accessibilityLabel={`${CAST[who].label} says`}
      nativeID="speaker-tag"
      style={{
        width: TAG,
        height: TAG,
        borderRadius: TAG / 2,
        backgroundColor: FLAT_FACE,
        borderWidth: BORDER,
        borderColor: C.edge,
        boxShadow: `0px 2px 0px ${C.edge}`,
        overflow: 'hidden',
      }}
    >
      <View style={{ position: 'absolute', left: HX - r, top: HY - r, width: r * 2, height: r * 2, borderRadius: r, backgroundColor: C.ink }} />
      {pieces.filter((p) => !p.paper).map((p, k) => <PieceView key={`i${k}`} p={p} />)}
      {pieces.filter((p) => p.paper).map((p, k) => <PieceView key={`p${k}`} p={p} />)}
    </View>
  );
}

/**
 * The words of a beat, with its speaker's face beside them when it has one. With no
 * speaker it returns the words and nothing else — no wrapper node — so every narrated
 * lesson's deck is exactly the tree it was before dialogue lessons existed.
 */
export function SpokenBy({ who, children }: { who?: Speaker; children: React.ReactNode }) {
  if (!who) return <>{children}</>;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
      <View style={{ marginTop: 1 }}><SpeakerTag who={who} /></View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
