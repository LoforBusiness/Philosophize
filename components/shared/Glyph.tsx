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
  | 'flower';

interface GlyphProps {
  name: GlyphName;
  size?: number;
  color?: string;
}

export default function Glyph({ name, size = 28, color = '#1A1A1A' }: GlyphProps) {
  const s = {
    stroke: color,
    strokeWidth: 2,
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
            {/* Body widened from 14×10: at a 54px seal the 2px stroke closed the
                interior up and the scroll read as a solid pill. */}
            <Rect {...s} x={9} y={9} width={14} height={14} />
            <Path {...s} d="M9 9 C5 9 5 23 9 23 C7 23 7 9 9 9 Z" />
            <Path {...s} d="M23 9 C27 9 27 23 23 23 C25 23 25 9 23 9 Z" />
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
            <Polygon {...s} points="16,5 28,26 4,26" />
            <Line {...s} x1={16} y1={5} x2={16} y2={26} strokeDasharray="2,3" />
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
            <Line {...s} x1={16} y1={16} x2={16} y2={28} />
            <Path {...s} d="M16 16 C12 14 12 9 16 6 C20 9 20 14 16 16 Z" />
            <Line {...s} x1={9} y1={7} x2={12} y2={9} />
            <Line {...s} x1={7} y1={12} x2={11} y2={12} />
            <Line {...s} x1={23} y1={7} x2={20} y2={9} />
            <Line {...s} x1={25} y1={12} x2={21} y2={12} />
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
            <Circle {...s} cx={16} cy={5} r={2} />
            <Line {...s} x1={16} y1={7} x2={16} y2={9} />
            <Path {...s} d="M9 24 C9 14 23 14 23 24 Z" />
            <Line {...s} x1={9} y1={24} x2={23} y2={24} />
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
            <Path {...s} d="M7 20 A11 11 0 0 1 25 20" />
            <Path {...s} d="M11 20 A7 7 0 0 1 21 20" />
            <Path {...s} d="M14 20 A3 3 0 0 1 18 20" />
          </>
        );
      case 'drop':
        return (
          <Path {...s} d="M16 4 C16 4 7 15 7 21 A9 9 0 0 0 25 21 C25 15 16 4 16 4 Z" />
        );
      case 'amphora':
        return (
          <>
            <Path {...s} d="M12 6 L20 6 L19 11 C24 13 24 23 16 25 C8 23 8 13 13 11 Z" />
            <Line {...s} x1={13} y1={25} x2={19} y2={25} />
            <Path {...s} d="M12.5 8 C8 8 8 14 11 15" />
            <Path {...s} d="M19.5 8 C24 8 24 14 21 15" />
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
            <Path {...s} d="M6 14 C6 6 26 6 26 14 C26 24 21 28.5 16 28.5 C11 28.5 6 24 6 14 Z" />
            <Line {...s} x1={8} y1={10} x2={5.5} y2={5} />
            <Line {...s} x1={24} y1={10} x2={26.5} y2={5} />
            <Circle {...s} cx={12} cy={14} r={3.6} />
            <Circle {...s} cx={20} cy={14} r={3.6} />
            <Circle {...s} cx={12} cy={14} r={1.2} fill={color} />
            <Circle {...s} cx={20} cy={14} r={1.2} fill={color} />
            <Path {...s} d="M16 17.5 L14 20.5 L18 20.5 Z" />
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
      default:
        return null;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {render()}
    </Svg>
  );
}
