import { memo } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export type SketchIconName =
  | 'home'
  | 'cloud'
  | 'mic'
  | 'frame'
  | 'person'
  | 'hat'
  | 'back'
  | 'close'
  | 'settings'
  | 'bookmark'
  | 'bookmark-filled'
  | 'volume-on'
  | 'volume-off'
  | 'reload'
  | 'flame'
  | 'spark'
  | 'star'
  | 'star-filled'
  | 'spiral'
  | 'eye'
  | 'scales'
  | 'logic'
  | 'palette'
  | 'building'
  | 'book'
  | 'chevron-down'
  | 'bell'
  | 'grad'
  | 'lock'
  | 'globe'
  | 'clock'
  | 'database'
  | 'warning'
  | 'pencil'
  | 'check';

interface Props {
  name: SketchIconName;
  color?: string;
  size?: number;
}

// Hand-drawn black-and-white line icons used throughout the app.
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
export default memo(function SketchIcon({ name, color = '#1A1A1A', size = 28 }: Props) {
  const s = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {name === 'home' && (
        <>
          <Path d="M4 15 L16 5 L28 15" {...s} />
          <Path d="M7 13 L7 27 L25 27 L25 13" {...s} />
          <Path d="M13 27 L13 20 L19 20 L19 27" {...s} />
        </>
      )}

      {name === 'cloud' && (
        <>
          <Path
            d="M10 21 C6 21 5 18 6.5 16 C5.5 13 8 11.5 10 12.5 C11 9.5 16 9.5 17.5 12 C21 11 23.5 13.5 22.5 16 C25 16.5 25 20.5 21 21 Z"
            {...s}
          />
          <Path d="M14.5 14.8 C14.5 13 18 13 18 15 C18 16.4 16 16.5 16 18" {...s} />
          <Circle cx="16" cy="20" r="0.6" fill={color} />
          <Circle cx="8" cy="24.5" r="1.3" {...s} />
          <Circle cx="5" cy="27.5" r="0.9" {...s} />
        </>
      )}

      {name === 'mic' && (
        <>
          <Path
            d="M16 4 C12.7 4 12 6.5 12 8 L12 14 C12 15.5 12.7 18 16 18 C19.3 18 20 15.5 20 14 L20 8 C20 6.5 19.3 4 16 4 Z"
            {...s}
          />
          <Path d="M9 13 C9 20 12 21.5 16 21.5 C20 21.5 23 20 23 13" {...s} />
          <Path d="M16 21.5 L16 27" {...s} />
          <Path d="M11.5 27.5 L20.5 27.5" {...s} />
        </>
      )}

      {name === 'frame' && (
        <>
          <Path d="M5 7 L27 7 L27 25 L5 25 Z" {...s} />
          <Path d="M8 20 L13 13.5 L17 17.5 L24 10.5" {...s} />
          <Circle cx="20.5" cy="11.5" r="1.4" {...s} />
        </>
      )}

      {name === 'person' && (
        <>
          <Circle cx="16" cy="11" r="4.2" {...s} />
          <Path d="M7.5 27 C7.5 19.5 12 18 16 18 C20 18 24.5 19.5 24.5 27" {...s} />
        </>
      )}

      {name === 'hat' && (
        <>
          {/* brim */}
          <Path d="M4 21 C4 18.5 28 18.5 28 21 C28 23.5 4 23.5 4 21 Z" {...s} />
          {/* crown */}
          <Path d="M8 20 C8 12.5 11 9 16 9 C21 9 24 12.5 24 20" {...s} />
          {/* hat band */}
          <Path d="M8.5 18 C12 19.6 20 19.6 23.5 18" {...s} />
          {/* feather on the side */}
          <Path d="M23 16 C26.5 13 28.5 9 27 4.5 C24.5 7.5 23 11 22 14.5" {...s} />
          <Path d="M27 4.5 L23.5 14.5" {...s} />
        </>
      )}

      {name === 'back' && <Path d="M20 5 L10 16 L20 27" {...s} />}

      {name === 'close' && (
        <>
          <Path d="M8 8 L24 24" {...s} />
          <Path d="M24 8 L8 24" {...s} />
        </>
      )}

      {name === 'settings' && (
        <>
          <Path d="M6 9 L26 9" {...s} />
          <Path d="M6 16 L26 16" {...s} />
          <Path d="M6 23 L26 23" {...s} />
          <Circle cx="12" cy="9" r="2.4" {...s} fill="#FAFAF7" />
          <Circle cx="21" cy="16" r="2.4" {...s} fill="#FAFAF7" />
          <Circle cx="14" cy="23" r="2.4" {...s} fill="#FAFAF7" />
        </>
      )}

      {name === 'bookmark' && <Path d="M9 5 L23 5 L23 27 L16 21 L9 27 Z" {...s} />}

      {name === 'bookmark-filled' && (
        <Path d="M9 5 L23 5 L23 27 L16 21 L9 27 Z" stroke={color} strokeWidth={2} strokeLinejoin="round" fill={color} />
      )}

      {name === 'volume-on' && (
        <>
          <Path d="M5 13 L10 13 L15 8 L15 24 L10 19 L5 19 Z" {...s} />
          <Path d="M19 12 C21.5 14.5 21.5 17.5 19 20" {...s} />
          <Path d="M22.5 9 C27 13 27 19 22.5 23" {...s} />
        </>
      )}

      {name === 'volume-off' && (
        <>
          <Path d="M5 13 L10 13 L15 8 L15 24 L10 19 L5 19 Z" {...s} />
          <Path d="M20 12 L27 20" {...s} />
          <Path d="M27 12 L20 20" {...s} />
        </>
      )}

      {name === 'reload' && (
        <>
          <Path d="M24 8 C21.8 5.6 18.6 4.5 15.3 5.2 C9.8 6.3 6.3 11.7 7.4 17.2 C8.5 22.7 13.9 26.2 19.4 25.1 C23.6 24.3 26.7 20.9 27 16.8" {...s} />
          <Path d="M24 4 L24.4 8.4 L20 9" {...s} />
        </>
      )}

      {name === 'flame' && (
        <Path
          d="M16 3 C13 8 14.5 11 12.5 14 C12 12.5 11 11.5 11 11.5 C8.5 15 9 22 16 28 C23 22 23.5 15 21 11.5 C21 11.5 20.5 13.5 19.5 14 C18 10.5 19 7 16 3 Z"
          {...s}
        />
      )}

      {name === 'spark' && (
        <Path
          d="M16 4 C17 12 20 15 28 16 C20 17 17 20 16 28 C15 20 12 17 4 16 C12 15 15 12 16 4 Z"
          {...s}
        />
      )}

      {name === 'star' && (
        <Path
          d="M16 3 L18.9 11.9 L28.4 12 L20.8 17.6 L23.6 26.5 L16 21 L8.4 26.5 L11.2 17.6 L3.6 12 L13.1 11.9 Z"
          {...s}
        />
      )}

      {name === 'star-filled' && (
        <Path
          d="M16 3 L18.9 11.9 L28.4 12 L20.8 17.6 L23.6 26.5 L16 21 L8.4 26.5 L11.2 17.6 L3.6 12 L13.1 11.9 Z"
          {...s}
          fill={color}
        />
      )}

      {/* Metaphysics — inward swirl / spiral */}
      {name === 'spiral' && (
        <Path
          d="M16 5 C22 5 27 10 27 16 C27 21 23 25 18 25 C14 25 11 22 11 18 C11 15 13 13 16 13 C18 13 20 15 20 17 C20 18.5 19 19.5 17.5 19.5"
          {...s}
        />
      )}

      {/* Epistemology — eye */}
      {name === 'eye' && (
        <>
          <Path d="M4 16 C9 9 23 9 28 16 C23 23 9 23 4 16 Z" {...s} />
          <Circle cx="16" cy="16" r="3.6" {...s} />
          <Circle cx="16" cy="16" r="1" fill={color} />
        </>
      )}

      {/* Ethics — balance scales */}
      {name === 'scales' && (
        <>
          <Path d="M16 6 L16 24" {...s} />
          <Circle cx="16" cy="6" r="1.4" {...s} />
          <Path d="M6 10 L26 10" {...s} />
          <Path d="M11 25 L21 25" {...s} />
          {/* left pan */}
          <Path d="M6 10 L3 16" {...s} />
          <Path d="M6 10 L9 16" {...s} />
          <Path d="M2.5 16 C2.5 19.5 9.5 19.5 9.5 16" {...s} />
          {/* right pan */}
          <Path d="M26 10 L23 16" {...s} />
          <Path d="M26 10 L29 16" {...s} />
          <Path d="M22.5 16 C22.5 19.5 29.5 19.5 29.5 16" {...s} />
        </>
      )}

      {/* Logic — inference node (premise → conclusion) */}
      {name === 'logic' && (
        <>
          <Path d="M11 11 L17 11 L21 16 L17 21 L11 21 Z" {...s} />
          <Path d="M21 16 L28 16" {...s} />
          <Path d="M25.5 13.5 L28 16 L25.5 18.5" {...s} />
          <Path d="M4 16 L11 16" {...s} />
        </>
      )}

      {/* Aesthetics — artist's palette */}
      {name === 'palette' && (
        <>
          <Path
            d="M16 6 C23 6 28 10 28 15 C28 18.5 24.5 19.5 21.5 19.5 C19.5 19.5 18.5 20.5 18.5 22 C18.5 24.5 17 26 14 26 C8 26 4 21 4 15.5 C4 10 9 6 16 6 Z"
            {...s}
          />
          <Circle cx="10" cy="13" r="1.2" fill={color} />
          <Circle cx="15" cy="10.5" r="1.2" fill={color} />
          <Circle cx="21" cy="12.5" r="1.2" fill={color} />
          <Circle cx="22" cy="22" r="1.6" {...s} />
        </>
      )}

      {/* Politics — classical institution */}
      {name === 'building' && (
        <>
          <Path d="M4 12 L16 5 L28 12 Z" {...s} />
          <Path d="M5 15 L27 15" {...s} />
          <Path d="M8 15 L8 25" {...s} />
          <Path d="M13 15 L13 25" {...s} />
          <Path d="M19 15 L19 25" {...s} />
          <Path d="M24 15 L24 25" {...s} />
          <Path d="M4 27 L28 27" {...s} />
        </>
      )}

      {/* Lessons — open book */}
      {name === 'book' && (
        <>
          <Path
            d="M16 9 C13 7 7 7 5 8 L5 24 C7 23 13 23 16 25 C19 23 25 23 27 24 L27 8 C25 7 19 7 16 9 Z"
            {...s}
          />
          <Path d="M16 9 L16 25" {...s} />
        </>
      )}

      {name === 'chevron-down' && <Path d="M8 12 L16 21 L24 12" {...s} />}

      {name === 'bell' && (
        <>
          <Path d="M16 4 L16 6" {...s} />
          <Path d="M16 6 C11.5 6 9.5 9.5 9.5 14 C9.5 20 6.5 21 6.5 23 L25.5 23 C25.5 21 22.5 20 22.5 14 C22.5 9.5 20.5 6 16 6 Z" {...s} />
          <Path d="M13 23 C13 25.5 19 25.5 19 23" {...s} />
        </>
      )}

      {name === 'grad' && (
        <>
          <Path d="M16 8 L29 13 L16 18 L3 13 Z" {...s} />
          <Path d="M9 15.2 L9 21 C9 23.2 23 23.2 23 21 L23 15.2" {...s} />
          <Path d="M27 13 L27 20.5" {...s} />
          <Circle cx="27" cy="21.5" r="1.3" {...s} fill={color} />
        </>
      )}

      {name === 'lock' && (
        <>
          <Path d="M8 14 L24 14 L24 27 L8 27 Z" {...s} />
          <Path d="M11 14 L11 11 C11 6.5 21 6.5 21 11 L21 14" {...s} />
          <Path d="M16 19 L16 22" {...s} />
        </>
      )}

      {name === 'globe' && (
        <>
          <Circle cx="16" cy="16" r="11" {...s} />
          <Path d="M16 5 C10 9 10 23 16 27" {...s} />
          <Path d="M16 5 C22 9 22 23 16 27" {...s} />
          <Path d="M5 16 L27 16" {...s} />
          <Path d="M7.5 11 L24.5 11" {...s} />
          <Path d="M7.5 21 L24.5 21" {...s} />
        </>
      )}

      {name === 'clock' && (
        <>
          <Circle cx="16" cy="16" r="11" {...s} />
          <Path d="M16 16 L16 9" {...s} />
          <Path d="M16 16 L21 18.5" {...s} />
        </>
      )}

      {name === 'database' && (
        <>
          <Path d="M6 8.5 C6 6 26 6 26 8.5 C26 11 6 11 6 8.5 Z" {...s} />
          <Path d="M6 8.5 L6 23 C6 25.5 26 25.5 26 23 L26 8.5" {...s} />
          <Path d="M6 16 C6 18.4 26 18.4 26 16" {...s} />
        </>
      )}

      {name === 'warning' && (
        <>
          <Path d="M16 5 L28 26 L4 26 Z" {...s} />
          <Path d="M16 13 L16 20" {...s} />
          <Circle cx="16" cy="23" r="1" fill={color} />
        </>
      )}

      {name === 'pencil' && (
        <>
          <Path d="M5 27 L7 20 L20 7 L25 12 L12 25 Z" {...s} />
          <Path d="M18 9 L23 14" {...s} />
          <Path d="M5 27 L7 20" {...s} />
        </>
      )}

      {name === 'check' && <Path d="M6 17 L13 24 L26 9" {...s} />}
    </Svg>
  );
});
