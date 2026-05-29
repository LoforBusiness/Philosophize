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
  | 'flame';

interface Props {
  name: SketchIconName;
  color?: string;
  size?: number;
}

// Hand-drawn black-and-white line icons used throughout the app.
export default function SketchIcon({ name, color = '#1A1A1A', size = 28 }: Props) {
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
    </Svg>
  );
}
