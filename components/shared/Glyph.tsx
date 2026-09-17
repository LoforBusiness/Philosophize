import { memo } from 'react';
import React from 'react';
import Svg, { Path, Circle, Line, Polyline, Polygon, Rect } from 'react-native-svg';

export type GlyphName =
  | 'candle'
  | 'book'
  | 'quill'
  | 'scroll'
  | 'cap'
  | 'eye'
  | 'question'
  | 'scales'
  | 'magnifier'
  | 'bust'
  | 'cycle'
  | 'infinity'
  | 'heart'
  | 'pyramid'
  | 'target'
  | 'column'
  | 'mountain'
  | 'torch'
  | 'signpost'
  | 'crown'
  | 'tree'
  | 'sunface'
  | 'ring'
  | 'lotus'
  | 'bookrays'
  | 'starcompass'
  | 'star'
  | 'arch'
  | 'dottarget'
  | 'shieldcross'
  | 'grid'
  | 'flag'
  | 'lamp'
  | 'crescent'
  | 'sun'
  | 'wheel'
  | 'xcross'
  | 'page'
  | 'gem'
  | 'hexagram'
  | 'hourglass'
  | 'willow'
  | 'ripple'
  | 'drop'
  | 'amphora'
  | 'gate'
  | 'dome'
  // Added for the badge set: five marks that had no stand-in worth reaching for.
  // Every badge carries a DISTINCT glyph, so a near-miss ('mountain' for a ladder,
  // 'ring' for a chain) would have been the one place two badges looked alike.
  | 'ladder'
  | 'ship'
  | 'chain'
  | 'owl'
  | 'flower'
  | 'anvil'
  | 'key'
  | 'bridge'
  | 'spiral'
  | 'maze'
  | 'obelisk'
  | 'fountain'
  | 'beacon'
  | 'feather'
  | 'knot'
  | 'prism'
  | 'seed'
  | 'wave'
  | 'tower'
  | 'bell'
  | 'sundial'
  | 'ascend'
  | 'cube'
  | 'orbit'
  | 'vault'
  | 'mask'
  | 'harp';

interface GlyphProps {
  name: GlyphName;
  size?: number;
  color?: string;
  /**
   * The stroke, in the glyph's own 32-unit box. 2 wherever a mark sits beside
   * type; the struck insignia draw it heavier, because an emblem is about half a
   * badge's width and a hairline there reads as a stock icon set.
   */
  weight?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMOISED, AND THIS IS A MEASURED FIX RATHER THAN A HABIT.
//
// A screen that re-renders re-renders every icon on it, and an icon is an <Svg>
// — the most expensive kind of leaf this app has. Measured on Profile at 6x CPU
// throttle: one `setState` mid-scroll (the rank chart's in-view latch) blocked
// for 671-2050ms, because the commit walked all 807 nodes and 44 SVGs. Removing
// the state change entirely took the worst frame to 37ms, which is the size of
// the prize.
//
// The props are three primitives, so `memo` is exact — there is no object to
// compare and no call site that can accidentally defeat it by passing a fresh
// one (the trap `app/(app)/philosophers/index.tsx` records for ThinkerCard).
//
// It also skips the long `name === '...'` chain in the body, which builds the
// whole element tree for a branch on every render.
// ─────────────────────────────────────────────────────────────────────────────
export default memo(function Glyph({ name, size = 28, color = '#1A1A1A', weight = 2 }: GlyphProps) {
  const s = {
    stroke: color,
    strokeWidth: weight,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  const render = () => {
    switch (name) {
      case 'candle':
        return (
          <>
            <Rect {...s} x={13} y={11} width={6} height={15} />
            <Line {...s} x1={16} y1={11} x2={16} y2={8} />
            <Path {...s} d="M16 8 C13.5 7 13.5 3.5 16 2 C18.5 3.5 18.5 7 16 8 Z" />
          </>
        );
      case 'book':
        return (
          <>
            <Path {...s} d="M16 8 C12 5 8 5 4 7 L4 24 C8 22 12 22 16 25" />
            <Path {...s} d="M16 8 C20 5 24 5 28 7 L28 24 C24 22 20 22 16 25" />
            <Line {...s} x1={16} y1={8} x2={16} y2={25} />
          </>
        );
      case 'quill':
        return (
          <>
            <Path {...s} d="M26 5 C18 7 11 13 7 22 L11 26 C20 22 26 15 28 7" />
            <Line {...s} x1={11} y1={26} x2={7} y2={22} />
            <Line {...s} x1={20} y1={9} x2={15} y2={12} />
            <Line {...s} x1={22} y1={13} x2={17} y2={16} />
          </>
        );
      case 'scroll':
        return (
          <>
            {/* A document with a roll at each end and two lines of writing: at badge weight
                the old body-plus-two-lobes closed up into a solid pill. */}
            <Rect {...s} x={4.5} y={6.5} width={5} height={19} rx={2.5} />
            <Rect {...s} x={22.5} y={6.5} width={5} height={19} rx={2.5} />
            <Path {...s} d="M9.5 9 H22.5 M9.5 23 H22.5" />
            <Path {...s} d="M13 13.5 H19 M13 18 H18" />
          </>
        );
      case 'cap':
        return (
          <>
            <Polygon {...s} points="16,5 28,11 16,17 4,11" />
            <Path {...s} d="M10 13 L10 20 C10 23 22 23 22 20 L22 13" />
            <Line {...s} x1={25} y1={11} x2={25} y2={20} />
            <Circle {...s} cx={25} cy={21} r={1.2} fill={color} />
          </>
        );
      case 'eye':
        return (
          <>
            <Path {...s} d="M4 16 C9 9 23 9 28 16 C23 23 9 23 4 16 Z" />
            <Circle {...s} cx={16} cy={16} r={3.5} fill={color} />
          </>
        );
      case 'question':
        return (
          <>
            <Path {...s} d="M5 11 A12 12 0 0 1 11 5" />
            <Path {...s} d="M21 5 A12 12 0 0 1 27 11" />
            <Path {...s} d="M27 21 A12 12 0 0 1 21 27" />
            <Path {...s} d="M11 27 A12 12 0 0 1 5 21" />
            <Path {...s} d="M12.5 13 C12.5 9 19.5 9 19.5 13 C19.5 16 16 16 16 19" />
            <Circle {...s} cx={16} cy={23} r={1} fill={color} />
          </>
        );
      case 'scales':
        return (
          <>
            <Line {...s} x1={16} y1={5} x2={16} y2={25} />
            <Line {...s} x1={7} y1={9} x2={25} y2={9} />
            <Line {...s} x1={11} y1={25} x2={21} y2={25} />
            <Path {...s} d="M4 12 C4 16 10 16 10 12" />
            <Line {...s} x1={7} y1={9} x2={4} y2={12} />
            <Line {...s} x1={7} y1={9} x2={10} y2={12} />
            <Path {...s} d="M22 12 C22 16 28 16 28 12" />
            <Line {...s} x1={25} y1={9} x2={22} y2={12} />
            <Line {...s} x1={25} y1={9} x2={28} y2={12} />
          </>
        );
      case 'magnifier':
        return (
          <>
            <Circle {...s} cx={13} cy={13} r={8} />
            <Line {...s} x1={19} y1={19} x2={27} y2={27} />
            <Line {...s} x1={13} y1={10} x2={13} y2={16} />
            <Line {...s} x1={10} y1={13} x2={16} y2={13} />
          </>
        );
      case 'bust':
        return (
          <>
            <Circle {...s} cx={16} cy={11} r={6} />
            <Path {...s} d="M5 27 C5 19 11 17 16 17 C21 17 27 19 27 27" />
          </>
        );
      case 'cycle':
        return (
          <>
            <Path {...s} d="M24 11 A11 11 0 0 0 7 11" />
            <Polyline {...s} points="7,6 7,11 12,11" />
            <Path {...s} d="M8 21 A11 11 0 0 0 25 21" />
            <Polyline {...s} points="25,26 25,21 20,21" />
          </>
        );
      case 'infinity':
        return (
          <>
            <Path
              {...s}
              d="M16 16 C13 11 6 11 6 16 C6 21 13 21 16 16 C19 11 26 11 26 16 C26 21 19 21 16 16 Z"
            />
          </>
        );
      case 'heart':
        return (
          <Path
            {...s}
            d="M16 26 C8 20 4 15 4 11 C4 7 7 5 10 5 C13 5 15 7 16 9 C17 7 19 5 22 5 C25 5 28 7 28 11 C28 15 24 20 16 26 Z"
          />
        );
      case 'pyramid':
        return (
          <>
            {/* Two faces and the edge between them, so it stands on the ground. A single
                triangle with a line down the middle read as a warning sign. */}
            <Polygon {...s} points="15,5 4,25 19,28 28,21" />
            <Line {...s} x1={15} y1={5} x2={19} y2={28} />
          </>
        );
      case 'target':
        return (
          <>
            <Circle {...s} cx={16} cy={16} r={11} />
            <Circle {...s} cx={16} cy={16} r={6.5} />
            <Circle {...s} cx={16} cy={16} r={2} fill={color} />
          </>
        );
      case 'column':
        return (
          <>
            <Rect {...s} x={6} y={5} width={20} height={4} />
            <Rect {...s} x={6} y={23} width={20} height={4} />
            <Line {...s} x1={13} y1={9} x2={13} y2={23} />
            <Line {...s} x1={19} y1={9} x2={19} y2={23} />
          </>
        );
      case 'mountain':
        return (
          <>
            <Polygon {...s} points="16,5 28,26 4,26" />
            <Polyline {...s} points="12,17 16,13 20,17" />
          </>
        );
      case 'torch':
        return (
          <>
            {/* A torch: a flame in a cup on a handle. The old one had four rays round a
                bare flame on a stick, which read as a palm tree. */}
            <Path {...s} d="M16 3.5 C19.5 7 20.8 9.5 19.8 12 C19.1 13.6 17.6 14.2 16 14.2 C14.4 14.2 12.9 13.6 12.2 12 C11.2 9.5 12.5 7 16 3.5 Z" />
            <Path {...s} d="M10.5 15 H21.5 L19.5 19 H12.5 Z" />
            <Line {...s} x1={16} y1={19} x2={16} y2={28.5} />
          </>
        );
      case 'signpost':
        return (
          <>
            <Line {...s} x1={12} y1={4} x2={12} y2={28} />
            <Polygon {...s} points="12,8 24,8 27,11 24,14 12,14" />
            <Polyline {...s} points="12,18 20,18 17,21 20,24 12,24" />
          </>
        );
      case 'crown':
        return (
          <>
            <Path {...s} d="M5 10 L9 20 L23 20 L27 10 L20 15 L16 7 L12 15 Z" />
            <Line {...s} x1={9} y1={24} x2={23} y2={24} />
          </>
        );
      case 'tree':
        return (
          <>
            <Circle {...s} cx={16} cy={12} r={8} />
            <Line {...s} x1={16} y1={20} x2={16} y2={28} />
          </>
        );
      case 'sunface':
        return (
          <>
            <Circle {...s} cx={16} cy={16} r={8} />
            <Line {...s} x1={16} y1={4} x2={16} y2={1} />
            <Line {...s} x1={16} y1={28} x2={16} y2={31} />
            <Line {...s} x1={4} y1={16} x2={1} y2={16} />
            <Line {...s} x1={28} y1={16} x2={31} y2={16} />
            <Line {...s} x1={7.5} y1={7.5} x2={5.5} y2={5.5} />
            <Line {...s} x1={24.5} y1={7.5} x2={26.5} y2={5.5} />
            <Line {...s} x1={7.5} y1={24.5} x2={5.5} y2={26.5} />
            <Line {...s} x1={24.5} y1={24.5} x2={26.5} y2={26.5} />
            <Circle {...s} cx={13} cy={14} r={0.9} fill={color} />
            <Circle {...s} cx={19} cy={14} r={0.9} fill={color} />
            <Path {...s} d="M12.5 18 C14 20.5 18 20.5 19.5 18" />
          </>
        );
      case 'ring':
        return <Circle {...s} cx={16} cy={16} r={11} />;
      case 'lotus':
        return (
          <>
            <Path {...s} d="M16 26 C13 20 13 11 16 5 C19 11 19 20 16 26 Z" />
            <Path {...s} d="M16 26 C10 23 6 17 6 11 C12 12 16 18 16 26 Z" />
            <Path {...s} d="M16 26 C22 23 26 17 26 11 C20 12 16 18 16 26 Z" />
          </>
        );
      case 'bookrays':
        return (
          <>
            <Path {...s} d="M16 14 C12 11 8 11 4 13 L4 27 C8 25 12 25 16 28" />
            <Path {...s} d="M16 14 C20 11 24 11 28 13 L28 27 C24 25 20 25 16 28" />
            <Line {...s} x1={16} y1={14} x2={16} y2={28} />
            <Line {...s} x1={16} y1={10} x2={16} y2={5} />
            <Line {...s} x1={11} y1={11} x2={9} y2={6} />
            <Line {...s} x1={21} y1={11} x2={23} y2={6} />
          </>
        );
      case 'starcompass':
        return (
          <>
            <Circle {...s} cx={16} cy={16} r={11} />
            <Polygon {...s} points="16,5 18,14 27,16 18,18 16,27 14,18 5,16 14,14" />
            <Polygon {...s} points="9,9 15,15 9,23 16,17 23,23 17,15 23,9 17,16" />
          </>
        );
      case 'star':
        return (
          <Polygon {...s} points="16,3 20,12 30,13 22,19 25,29 16,23 7,29 10,19 2,13 12,12" />
        );
      case 'arch':
        return <Path {...s} d="M6 27 L6 16 A10 10 0 0 1 26 16 L26 27" />;
      case 'dottarget':
        return (
          <>
            <Circle {...s} cx={16} cy={16} r={11} />
            <Circle {...s} cx={16} cy={16} r={3} fill={color} />
          </>
        );
      case 'shieldcross':
        return (
          <>
            <Path {...s} d="M16 4 L26 8 L26 16 C26 22 21 26 16 28 C11 26 6 22 6 16 L6 8 Z" />
            <Line {...s} x1={16} y1={11} x2={16} y2={19} />
            <Line {...s} x1={12} y1={15} x2={20} y2={15} />
          </>
        );
      case 'grid':
        return (
          <>
            <Rect {...s} x={5} y={5} width={22} height={22} />
            <Line {...s} x1={12.33} y1={5} x2={12.33} y2={27} />
            <Line {...s} x1={19.66} y1={5} x2={19.66} y2={27} />
            <Line {...s} x1={5} y1={12.33} x2={27} y2={12.33} />
            <Line {...s} x1={5} y1={19.66} x2={27} y2={19.66} />
          </>
        );
      case 'flag':
        return (
          <>
            <Line {...s} x1={8} y1={4} x2={8} y2={28} />
            <Polygon {...s} points="8,5 24,11 8,17" />
          </>
        );
      case 'lamp':
        return (
          <>
            {/* An oil lamp, the lamp of learning, with its flame at the spout. The old
                one was a dome under a dot and read as a person. */}
            <Path {...s} d="M5 18 C5 15.2 10 14.2 16 14.2 C20.5 14.2 22.8 15.6 27 13 C26 17 23 20.8 17.5 20.8 H11 C7.4 20.8 5 20.2 5 18 Z" />
            <Path {...s} d="M11.5 14.4 C11.5 12 13.4 10.6 16 10.6 C18.6 10.6 20.5 12 20.5 14.4" />
            <Path {...s} d="M12.5 20.8 L11.5 25 H20.5 L19.5 20.8" />
            <Path {...s} d="M27.6 10.8 C26.2 9.4 26.3 7.6 27.6 5.4 C28.9 7.6 29 9.4 27.6 10.8 Z" />
          </>
        );
      case 'crescent':
        return (
          <>
            <Path {...s} d="M21 6 A12 12 0 1 0 21 26 A9 9 0 1 1 21 6 Z" />
            <Polygon {...s} points="25,9 26,13 30,13 27,15.5 28,19.5 25,17 22,19.5 23,15.5 20,13 24,13" />
          </>
        );
      case 'sun':
        return (
          <>
            <Circle {...s} cx={16} cy={16} r={7} />
            <Line {...s} x1={16} y1={4} x2={16} y2={1} />
            <Line {...s} x1={16} y1={28} x2={16} y2={31} />
            <Line {...s} x1={4} y1={16} x2={1} y2={16} />
            <Line {...s} x1={28} y1={16} x2={31} y2={16} />
            <Line {...s} x1={7.5} y1={7.5} x2={5.5} y2={5.5} />
            <Line {...s} x1={24.5} y1={7.5} x2={26.5} y2={5.5} />
            <Line {...s} x1={7.5} y1={24.5} x2={5.5} y2={26.5} />
            <Line {...s} x1={24.5} y1={24.5} x2={26.5} y2={26.5} />
          </>
        );
      case 'wheel':
        return (
          <>
            <Circle {...s} cx={16} cy={16} r={11} />
            <Line {...s} x1={16} y1={5} x2={16} y2={27} />
            <Line {...s} x1={5} y1={16} x2={27} y2={16} />
            <Line {...s} x1={8.2} y1={8.2} x2={23.8} y2={23.8} />
            <Line {...s} x1={23.8} y1={8.2} x2={8.2} y2={23.8} />
          </>
        );
      case 'xcross':
        return (
          <>
            <Line {...s} x1={7} y1={7} x2={25} y2={25} />
            <Line {...s} x1={25} y1={7} x2={7} y2={25} />
          </>
        );
      case 'page':
        return (
          <>
            <Path {...s} d="M7 4 L20 4 L25 9 L25 28 L7 28 Z" />
            <Polyline {...s} points="20,4 20,9 25,9" />
            <Line {...s} x1={11} y1={15} x2={21} y2={15} />
            <Line {...s} x1={11} y1={20} x2={21} y2={20} />
          </>
        );
      case 'gem':
        return (
          <>
            <Polygon {...s} points="16,4 27,13 16,28 5,13" />
            <Line {...s} x1={5} y1={13} x2={27} y2={13} />
            <Line {...s} x1={11} y1={13} x2={16} y2={28} />
            <Line {...s} x1={21} y1={13} x2={16} y2={28} />
            <Line {...s} x1={11} y1={13} x2={16} y2={4} />
            <Line {...s} x1={21} y1={13} x2={16} y2={4} />
          </>
        );
      case 'hexagram':
        return (
          <>
            <Polygon {...s} points="16,3 26,21 6,21" />
            <Polygon {...s} points="16,29 6,11 26,11" />
          </>
        );
      case 'hourglass':
        return (
          <>
            <Line {...s} x1={7} y1={5} x2={25} y2={5} />
            <Line {...s} x1={7} y1={27} x2={25} y2={27} />
            <Path {...s} d="M8 5 L24 5 L16 16 Z" />
            <Path {...s} d="M8 27 L24 27 L16 16 Z" />
          </>
        );
      case 'willow':
        return (
          <>
            <Path {...s} d="M7 9 C12 5 20 5 25 9" />
            <Path {...s} d="M9 9 C8 16 8 22 7 27" />
            <Path {...s} d="M14 8 C13 16 13 22 12 27" />
            <Path {...s} d="M18 8 C19 16 19 22 20 27" />
            <Path {...s} d="M23 9 C24 16 24 22 25 27" />
          </>
        );
      case 'ripple':
        return (
          <>
            {/* A drop, and the rings it leaves. Three bare arcs read as a moustache. */}
            <Path {...s} d="M16 4 C18.3 7 19.6 9.2 19.6 11 C19.6 13 18 14.4 16 14.4 C14 14.4 12.4 13 12.4 11 C12.4 9.2 13.7 7 16 4 Z" />
            <Path {...s} d="M4.5 22.5 A11.5 4.6 0 1 0 27.5 22.5 A11.5 4.6 0 1 0 4.5 22.5 Z" />
            <Path {...s} d="M11 22.5 A5 1.8 0 1 0 21 22.5 A5 1.8 0 1 0 11 22.5 Z" />
          </>
        );
      case 'drop':
        return (
          <Path {...s} d="M16 4 C16 4 7 15 7 21 A9 9 0 0 0 25 21 C25 15 16 4 16 4 Z" />
        );
      case 'amphora':
        return (
          <>
            {/* Narrower body and handles set on the shoulder, so neither closes into the
                other at badge weight. */}
            <Path {...s} d="M11.5 5.5 H20.5 M13.2 5.5 V10.5 C9.5 13 9.5 21.5 13.5 26 H18.5 C22.5 21.5 22.5 13 18.8 10.5 V5.5" />
            <Path {...s} d="M13.2 8 C8.6 8 7.8 13.5 10.6 14.8" />
            <Path {...s} d="M18.8 8 C23.4 8 24.2 13.5 21.4 14.8" />
            <Line {...s} x1={14} y1={28.5} x2={18} y2={28.5} />
          </>
        );
      case 'gate':
        return (
          <>
            <Line {...s} x1={4} y1={9} x2={28} y2={9} />
            <Line {...s} x1={6} y1={5} x2={26} y2={5} />
            <Line {...s} x1={9} y1={9} x2={9} y2={28} />
            <Line {...s} x1={23} y1={9} x2={23} y2={28} />
          </>
        );
      case 'dome':
        return (
          <>
            <Path {...s} d="M5 22 A11 11 0 0 1 27 22" />
            <Line {...s} x1={4} y1={22} x2={28} y2={22} />
          </>
        );
      case 'ladder':
        return (
          <>
            <Line {...s} x1={10} y1={4} x2={10} y2={28} />
            <Line {...s} x1={22} y1={4} x2={22} y2={28} />
            <Line {...s} x1={10} y1={9} x2={22} y2={9} />
            <Line {...s} x1={10} y1={16} x2={22} y2={16} />
            <Line {...s} x1={10} y1={23} x2={22} y2={23} />
          </>
        );
      case 'ship':
        return (
          <>
            <Path {...s} d="M4 19 L28 19 L24 26 L8 26 Z" />
            <Line {...s} x1={16} y1={19} x2={16} y2={4} />
            <Path {...s} d="M16 6 L25 17 L16 17 Z" />
            <Path {...s} d="M16 9 L9 17 L16 17 Z" />
          </>
        );
      case 'chain':
        // Two links, descending — the great chain reads better on the diagonal
        // than as two rings side by side, which just looks like a Venn diagram.
        return (
          <>
            <Rect {...s} x={6} y={3} width={11} height={16} rx={5.5} />
            <Rect {...s} x={15} y={13} width={11} height={16} rx={5.5} />
          </>
        );
      case 'owl':
        return (
          <>
            {/* Redrawn for the struck insignia: the old ear tufts were two lines standing
                OUT of the head, and at badge weight they read as horns on a mask. The tufts
                are part of the head's own outline now, and the face is eyes and a beak. */}
            <Path {...s} d="M8 13 C8 8.5 9.5 6 11 6 L13.5 8.5 C15 8 17 8 18.5 8.5 L21 6 C22.5 6 24 8.5 24 13 C24 22 21 27 16 27 C11 27 8 22 8 13 Z" />
            <Circle {...s} cx={12.6} cy={14} r={3} />
            <Circle {...s} cx={19.4} cy={14} r={3} />
            <Path {...s} d="M14.8 18.2 L16 20.4 L17.2 18.2" />
            <Path {...s} d="M12 23 C14.5 24.2 17.5 24.2 20 23" />
          </>
        );
      case 'flower':
        return (
          <>
            <Circle {...s} cx={16} cy={7.7} r={4.2} />
            <Circle {...s} cx={22.5} cy={12.4} r={4.2} />
            <Circle {...s} cx={20} cy={20} r={4.2} />
            <Circle {...s} cx={12} cy={20} r={4.2} />
            <Circle {...s} cx={9.5} cy={12.4} r={4.2} />
            <Circle {...s} cx={16} cy={14.5} r={2.4} fill={color} />
            <Line {...s} x1={16} y1={24.6} x2={16} y2={29} />
          </>
        );
      // ── TWENTY-TWO MARKS ADDED FOR THE REBALANCED BADGE CASE ──────────────
      //
      // validate-badges requires that no two badges share a mark, on the
      // reasoning that fifty medals drawn from fifty different pictures is a
      // set and fifty drawn from twenty is wallpaper. The case went from fifty
      // badges to seventy-four and this file held fifty-two marks, so the
      // constraint was not "should there be more glyphs" but "how many".
      //
      // Same hand as the rest: one 32x32 box, 2px round-capped strokes, no
      // fills except where a mark needs a solid pip to read at 20px.
      case 'anvil':
        return (
          <>
            <Path {...s} d="M6 13 H26 L22 17 H10 Z" />
            <Path {...s} d="M13 17 V23 H19 V17" />
            <Line {...s} x1={9} y1={26} x2={23} y2={26} />
          </>
        );
      case 'key':
        return (
          <>
            <Circle {...s} cx={11} cy={12} r={5} />
            <Line {...s} x1={14.5} y1={15.5} x2={25} y2={26} />
            <Line {...s} x1={21} y1={22} x2={18} y2={25} />
            <Line {...s} x1={24} y1={25} x2={21} y2={28} />
          </>
        );
      case 'bridge':
        return (
          <>
            {/* An arch over the deck, hangers down to it, and two piers into the
                water. With the arch under the deck it read as a table. */}
            <Line {...s} x1={3} y1={19} x2={29} y2={19} />
            <Path {...s} d="M5.5 19 C8.5 6.5 23.5 6.5 26.5 19" />
            <Line {...s} x1={10.8} y1={12.6} x2={10.8} y2={19} />
            <Line {...s} x1={16} y1={10.4} x2={16} y2={19} />
            <Line {...s} x1={21.2} y1={12.6} x2={21.2} y2={19} />
            <Line {...s} x1={7.5} y1={19} x2={7.5} y2={26.5} />
            <Line {...s} x1={24.5} y1={19} x2={24.5} y2={26.5} />
          </>
        );
      case 'spiral':
        return (
          <>
            {/* Two turns, sampled from an Archimedean spiral so the arms stay evenly
                spaced: the old hand-drawn curve bunched up and filled in at badge weight. */}
            <Polyline {...s} points="16.0,14.8 16.4,14.6 16.8,14.6 17.4,14.7 17.9,15.0 18.3,15.5 18.6,16.1 18.7,16.8 18.5,17.7 18.2,18.4 17.5,19.1 16.7,19.7 15.7,19.9 14.6,19.9 13.5,19.6 12.4,18.9 11.6,18.0 11.0,16.8 10.7,15.4 10.9,13.9 11.4,12.5 12.4,11.2 13.7,10.2 15.3,9.6 17.0,9.4 18.9,9.7 20.6,10.5 22.1,11.8 23.2,13.5 23.8,15.4 23.9,17.6 23.4,19.7 22.3,21.7 20.7,23.4 18.7,24.6 16.3,25.2 13.8,25.2 11.3,24.5 9.1,23.1 7.3,21.1 6.0,18.7 5.4,15.9 5.6,13.1 6.5,10.3 8.2,7.8 10.6,5.8 13.4,4.5 16.5,4.0 19.8,4.4" />
          </>
        );
      case 'maze':
        return (
          <>
            <Rect {...s} x={5} y={5} width={22} height={22} rx={1.5} />
            <Path {...s} d="M10 10 H22 V22 H14 V15 H18" />
          </>
        );
      case 'obelisk':
        return (
          <>
            <Path {...s} d="M13 26 L14 9 L16 5 L18 9 L19 26 Z" />
            <Line {...s} x1={10} y1={26} x2={22} y2={26} />
          </>
        );
      case 'fountain':
        return (
          <>
            <Path {...s} d="M8 26 H24" />
            <Path {...s} d="M11 26 C11 20 21 20 21 26" />
            <Line {...s} x1={16} y1={20} x2={16} y2={12} />
            <Path {...s} d="M16 12 C13 12 12 9 12.6 7" />
            <Path {...s} d="M16 12 C19 12 20 9 19.4 7" />
          </>
        );
      case 'beacon':
        return (
          <>
            <Path {...s} d="M12 26 L13.5 13 H18.5 L20 26 Z" />
            <Rect {...s} x={12.6} y={8} width={6.8} height={5} rx={1} />
            <Line {...s} x1={5} y1={8} x2={9} y2={10} />
            <Line {...s} x1={27} y1={8} x2={23} y2={10} />
          </>
        );
      case 'feather':
        return (
          <>
            <Path {...s} d="M23 7 C12 9 8 17 8 25 C16 25 24 20 25 9 Z" />
            <Line {...s} x1={8} y1={25} x2={22} y2={11} />
          </>
        );
      case 'knot':
        return (
          <>
            <Path {...s} d="M11 11 C21 11 21 21 11 21 C6 21 6 11 11 11 Z" />
            <Path {...s} d="M21 21 C11 21 11 11 21 11 C26 11 26 21 21 21 Z" />
          </>
        );
      case 'prism':
        return (
          <>
            <Path {...s} d="M16 5 L27 25 H5 Z" />
            <Line {...s} x1={16} y1={5} x2={16} y2={25} />
          </>
        );
      case 'seed':
        return (
          <>
            <Path {...s} d="M16 27 C9 22 9 12 16 6 C23 12 23 22 16 27 Z" />
            <Line {...s} x1={16} y1={11} x2={16} y2={23} />
          </>
        );
      case 'wave':
        return (
          <>
            <Path {...s} d="M4 13 C8 8 12 18 16 13 C20 8 24 18 28 13" />
            <Path {...s} d="M4 22 C8 17 12 27 16 22 C20 17 24 27 28 22" />
          </>
        );
      case 'tower':
        return (
          <>
            <Path {...s} d="M11 27 V12 H21 V27" />
            <Path {...s} d="M10 12 V8 H12.5 V10 H15 V8 H17.5 V10 H20 V8 H22 V12" />
            <Rect {...s} x={14.4} y={19} width={3.4} height={8} />
          </>
        );
      case 'bell':
        return (
          <>
            <Path {...s} d="M9 22 C9 14 11 10 16 10 C21 10 23 14 23 22 Z" />
            <Line {...s} x1={7} y1={22} x2={25} y2={22} />
            <Line {...s} x1={16} y1={7} x2={16} y2={10} />
            <Circle {...s} cx={16} cy={25} r={1.8} />
          </>
        );
      case 'sundial':
        return (
          <>
            {/* A dial seen from above the horizon, with its fin standing on it. */}
            <Path {...s} d="M4 21.5 A12 5.5 0 1 0 28 21.5 A12 5.5 0 1 0 4 21.5 Z" />
            <Path {...s} d="M16 21.5 V6 L23 19.6" />
            <Path {...s} d="M8 22.2 L10 21.9 M22.5 24.4 L24 23.4" />
          </>
        );
      case 'ascend':
        return (
          <>
            <Path {...s} d="M6 26 H12 V20 H18 V14 H24 V8" />
            <Path {...s} d="M21 11 L24 8 L27 11" />
          </>
        );
      case 'cube':
        return (
          <>
            <Path {...s} d="M16 5 L27 11 V21 L16 27 L5 21 V11 Z" />
            <Path {...s} d="M5 11 L16 17 L27 11" />
            <Line {...s} x1={16} y1={17} x2={16} y2={27} />
          </>
        );
      case 'orbit':
        return (
          <>
            <Circle {...s} cx={16} cy={16} r={4.5} />
            <Path {...s} d="M16 6.5 C24 6.5 29 11 29 16 C29 21 24 25.5 16 25.5 C8 25.5 3 21 3 16 C3 11 8 6.5 16 6.5 Z" transform="rotate(-28 16 16)" />
            <Circle {...s} cx={26} cy={11} r={1.8} fill={color} />
          </>
        );
      case 'vault':
        return (
          <>
            <Path {...s} d="M7 27 V14 C7 8 25 8 25 14 V27" />
            <Line {...s} x1={5} y1={27} x2={27} y2={27} />
            <Circle {...s} cx={16} cy={17} r={3.6} />
          </>
        );
      case 'mask':
        return (
          <>
            <Path {...s} d="M6 10 C6 22 11 27 16 27 C21 27 26 22 26 10 C22 12 10 12 6 10 Z" />
            <Line {...s} x1={11.5} y1={16} x2={14} y2={16} />
            <Line {...s} x1={18} y1={16} x2={20.5} y2={16} />
          </>
        );
      case 'harp':
        return (
          <>
            {/* Pillar, neck and soundbox, with the strings running between the last two.
                The old frame had no pillar and read as a leaf. */}
            <Path {...s} d="M8 27 V9.5 C12 4.5 16.5 10 24.5 5.5 L9.5 27 Z" />
            <Line {...s} x1={12.5} y1={8.4} x2={12.5} y2={21.5} />
            <Line {...s} x1={16.5} y1={9} x2={16.5} y2={15.8} />
            <Line {...s} x1={20.5} y1={7.6} x2={20.5} y2={10.8} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {render()}
    </Svg>
  );
});
