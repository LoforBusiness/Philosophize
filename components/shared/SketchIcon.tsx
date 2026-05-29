import Svg, { Path, Circle } from 'react-native-svg';

export type SketchIconName = 'home' | 'cloud' | 'mic' | 'frame' | 'person';

interface Props {
  name: SketchIconName;
  color?: string;
  size?: number;
}

// Hand-drawn line icons for the bottom tab bar (house, thought-bubble, mic,
// framed picture, person) — matching the sketch aesthetic.
export default function SketchIcon({ name, color = '#1A1A1A', size = 28 }: Props) {
  const sw = 2;
  const stroke = {
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {name === 'home' && (
        <>
          <Path d="M4 15 L16 5 L28 15" {...stroke} />
          <Path d="M7 13 L7 27 L25 27 L25 13" {...stroke} />
          <Path d="M13 27 L13 20 L19 20 L19 27" {...stroke} />
        </>
      )}

      {name === 'cloud' && (
        <>
          <Path
            d="M10 21 C6 21 5 18 6.5 16 C5.5 13 8 11.5 10 12.5 C11 9.5 16 9.5 17.5 12 C21 11 23.5 13.5 22.5 16 C25 16.5 25 20.5 21 21 Z"
            {...stroke}
          />
          <Path d="M14.5 14.8 C14.5 13 18 13 18 15 C18 16.4 16 16.5 16 18" {...stroke} />
          <Circle cx="16" cy="20" r="0.6" fill={color} />
          <Circle cx="8" cy="24.5" r="1.3" {...stroke} />
          <Circle cx="5" cy="27.5" r="0.9" {...stroke} />
        </>
      )}

      {name === 'mic' && (
        <>
          <Path
            d="M16 4 C12.7 4 12 6.5 12 8 L12 14 C12 15.5 12.7 18 16 18 C19.3 18 20 15.5 20 14 L20 8 C20 6.5 19.3 4 16 4 Z"
            {...stroke}
          />
          <Path d="M9 13 C9 20 12 21.5 16 21.5 C20 21.5 23 20 23 13" {...stroke} />
          <Path d="M16 21.5 L16 27" {...stroke} />
          <Path d="M11.5 27.5 L20.5 27.5" {...stroke} />
        </>
      )}

      {name === 'frame' && (
        <>
          <Path d="M5 7 L27 7 L27 25 L5 25 Z" {...stroke} />
          <Path d="M8 20 L13 13.5 L17 17.5 L24 10.5" {...stroke} />
          <Circle cx="20.5" cy="11.5" r="1.4" {...stroke} />
        </>
      )}

      {name === 'person' && (
        <>
          <Circle cx="16" cy="11" r="4.2" {...stroke} />
          <Path d="M7.5 27 C7.5 19.5 12 18 16 18 C20 18 24.5 19.5 24.5 27" {...stroke} />
        </>
      )}
    </Svg>
  );
}
