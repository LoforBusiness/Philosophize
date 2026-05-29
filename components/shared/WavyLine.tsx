import Svg, { Path } from 'react-native-svg';

interface Props {
  height: number;
  color?: string;
  amplitude?: number;
  strokeWidth?: number;
}

// Draws a wavy vertical line of given height using quadratic bezier curves
export default function WavyLine({ height, color = '#1A1A1A', amplitude = 10, strokeWidth = 1.5 }: Props) {
  const wavelength = 36;
  const numWaves = Math.max(2, Math.ceil(height / wavelength));
  const adjustedWavelength = height / numWaves;

  let d = 'M 0 0';
  for (let i = 0; i < numWaves; i++) {
    const direction = i % 2 === 0 ? amplitude : -amplitude;
    const yMid = i * adjustedWavelength + adjustedWavelength / 2;
    const yEnd = (i + 1) * adjustedWavelength;
    d += ` Q ${direction} ${yMid} 0 ${yEnd}`;
  }

  const svgWidth = amplitude * 2 + 4;

  return (
    <Svg
      width={svgWidth}
      height={height}
      style={{ overflow: 'visible' }}
    >
      <Path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`translate(${amplitude + 2}, 0)`}
      />
    </Svg>
  );
}
