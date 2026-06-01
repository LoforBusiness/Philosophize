import React from 'react';
import Svg, { Path, Circle, Line, Polyline, Polygon } from 'react-native-svg';

export type PortraitName =
  | 'overthinker' | 'daydreamer' | 'grump' | 'procrastinator' | 'skeptic'
  | 'know-it-all' | 'napper' | 'worrier' | 'philosopher-king' | 'absent-mind'
  | 'contrarian' | 'bookworm' | 'dramatic' | 'mumbler' | 'pensive'
  | 'enthusiast' | 'stoic-student' | 'night-owl' | 'mime' | 'wandering-monk'
  | 'mad-scribbler' | 'cynic' | 'eccentric' | 'ancient' | 'illuminated';

export const PORTRAITS: { id: PortraitName; name: string }[] = [
  { id: 'overthinker', name: 'Overthinker' },
  { id: 'daydreamer', name: 'Daydreamer' },
  { id: 'grump', name: 'Grump' },
  { id: 'procrastinator', name: 'Procrastinator' },
  { id: 'skeptic', name: 'Skeptic' },
  { id: 'know-it-all', name: 'Know-It-All' },
  { id: 'napper', name: 'Napper' },
  { id: 'worrier', name: 'Worrier' },
  { id: 'philosopher-king', name: 'Philosopher King' },
  { id: 'absent-mind', name: 'Absent Mind' },
  { id: 'contrarian', name: 'Contrarian' },
  { id: 'bookworm', name: 'Bookworm' },
  { id: 'dramatic', name: 'Dramatic' },
  { id: 'mumbler', name: 'Mumbler' },
  { id: 'pensive', name: 'Pensive' },
  { id: 'enthusiast', name: 'Enthusiast' },
  { id: 'stoic-student', name: 'Stoic Student' },
  { id: 'night-owl', name: 'Night Owl' },
  { id: 'mime', name: 'Mime' },
  { id: 'wandering-monk', name: 'Wandering Monk' },
  { id: 'mad-scribbler', name: 'Mad Scribbler' },
  { id: 'cynic', name: 'Cynic' },
  { id: 'eccentric', name: 'Eccentric' },
  { id: 'ancient', name: 'Ancient' },
  { id: 'illuminated', name: 'Illuminated' },
];

export default function Portrait({
  name,
  size = 64,
  color = '#1A1A1A',
}: {
  name: PortraitName;
  size?: number;
  color?: string;
}) {
  const s = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  // --- Shared base fragments (composed per character) ---
  const head = <Circle cx="32" cy="26" r="14" {...s} />;
  const eyes = (
    <>
      <Circle cx="26.5" cy="24" r="1.6" fill={color} />
      <Circle cx="37.5" cy="24" r="1.6" fill={color} />
    </>
  );
  const mouthNeutral = <Path d="M28 32 Q32 34 36 32" {...s} />;
  const mouthFlat = <Line x1="28" y1="32.5" x2="36" y2="32.5" {...s} />;
  const mouthSmile = <Path d="M27 31 Q32 36 37 31" {...s} />;
  const mouthFrown = <Path d="M28 34 Q32 30 36 34" {...s} />;
  const bust = (
    <Path d="M16 60 C17 50 24 45 32 45 C40 45 47 50 48 60" {...s} />
  );

  function renderFace() {
    switch (name) {
      // 1. OVERTHINKER — wind-up coil/spring out of the top of the head
      case 'overthinker':
        return (
          <>
            {head}
            {eyes}
            <Path d="M29.5 33 Q32 31.5 34.5 33" {...s} />
            {bust}
            {/* stem rising from the top of the head */}
            <Line x1="32" y1="12" x2="32" y2="6" {...s} />
            {/* coiled spring on top */}
            <Path
              d="M32 6 c-3 0 -3 -3 0 -3 c3 0 3 3.4 0 3.4 c-3.6 0 -3.6 -4 0 -4"
              {...s}
            />
          </>
        );

      // 2. DAYDREAMER — eyes up, thought bubble cloud with trailing dots
      case 'daydreamer':
        return (
          <>
            {head}
            {/* eyes looking up */}
            <Circle cx="26.5" cy="22.5" r="1.6" fill={color} />
            <Circle cx="37.5" cy="22.5" r="1.6" fill={color} />
            {mouthNeutral}
            {bust}
            {/* trailing bubbles */}
            <Circle cx="44" cy="14" r="1.6" {...s} />
            <Circle cx="48" cy="10" r="2.4" {...s} />
            {/* cloud thought bubble */}
            <Path
              d="M50 7 q-1.5 -4 3 -4 q1.5 -4 5 -1 q4 -2 4.5 2.5 q3 0.5 1.5 4 q1.5 3 -3 3 q-1.5 2.5 -5 0.5 q-3 2 -5 -1 q-4 0.5 -4 -3 q-2 -0.5 -2 -1.5 z"
              {...s}
            />
          </>
        );

      // 3. GRUMP — angry eyebrows + frown
      case 'grump':
        return (
          <>
            {head}
            {eyes}
            {/* inward-slanting brows */}
            <Line x1="23" y1="18.5" x2="29" y2="21" {...s} />
            <Line x1="41" y1="18.5" x2="35" y2="21" {...s} />
            {/* strong frown */}
            <Path d="M27 35 Q32 30 37 35" {...s} />
            {bust}
          </>
        );

      // 4. PROCRASTINATOR — half-lidded eyes + tiny clock
      case 'procrastinator':
        return (
          <>
            {head}
            {/* half-lidded eyes as dashes */}
            <Line x1="24.5" y1="24" x2="28.5" y2="24" {...s} />
            <Line x1="35.5" y1="24" x2="39.5" y2="24" {...s} />
            {mouthFlat}
            {bust}
            {/* clock floating beside head */}
            <Circle cx="52" cy="18" r="6" {...s} />
            <Line x1="52" y1="18" x2="52" y2="14" {...s} />
            <Line x1="52" y1="18" x2="55" y2="19.5" {...s} />
          </>
        );

      // 5. SKEPTIC — one raised brow, flat off-center mouth
      case 'skeptic':
        return (
          <>
            {head}
            {eyes}
            {/* raised arched brow over left eye */}
            <Path d="M23 19 Q26.5 16.5 30 19" {...s} />
            {/* flat brow over right eye */}
            <Line x1="35" y1="20" x2="40" y2="20" {...s} />
            {/* skeptical off-center mouth */}
            <Line x1="29" y1="33" x2="35" y2="32" {...s} />
            {bust}
          </>
        );

      // 6. KNOW-IT-ALL — round glasses + raised pointing finger
      case 'know-it-all':
        return (
          <>
            {head}
            {/* glasses */}
            <Circle cx="26.5" cy="24" r="3.5" {...s} />
            <Circle cx="37.5" cy="24" r="3.5" {...s} />
            <Line x1="30" y1="24" x2="34" y2="24" {...s} />
            <Circle cx="26.5" cy="24" r="1" fill={color} />
            <Circle cx="37.5" cy="24" r="1" fill={color} />
            {mouthFlat}
            {bust}
            {/* raised finger beside head */}
            <Line x1="50" y1="40" x2="50" y2="22" {...s} />
            <Path d="M50 22 q1.5 2 0 4" {...s} />
          </>
        );

      // 7. NAPPER — closed eyes + Z z
      case 'napper':
        return (
          <>
            {head}
            {/* closed eyes as arcs */}
            <Path d="M24 24 Q26.5 26.5 29 24" {...s} />
            <Path d="M35 24 Q37.5 26.5 40 24" {...s} />
            {mouthNeutral}
            {bust}
            {/* small Z */}
            <Polyline points="44,18 48,18 44,22 48,22" {...s} />
            {/* big Z */}
            <Polyline points="49,8 55,8 49,15 55,15" {...s} />
          </>
        );

      // 8. WORRIER — worried brows, sweat drop, small frown
      case 'worrier':
        return (
          <>
            {head}
            {eyes}
            {/* up-slanted worried brows */}
            <Line x1="23" y1="20" x2="29" y2="18.5" {...s} />
            <Line x1="41" y1="20" x2="35" y2="18.5" {...s} />
            {/* small frown */}
            <Path d="M29 34 Q32 31 35 34" {...s} />
            {bust}
            {/* sweat droplet near temple */}
            <Path d="M44 20 q-2 3 0 4 q2 -1 0 -4 z" {...s} fill={color} />
          </>
        );

      // 9. PHILOSOPHER KING — simple crown on head
      case 'philosopher-king':
        return (
          <>
            {head}
            {eyes}
            {mouthNeutral}
            {bust}
            {/* crown */}
            <Polyline points="22,16 24,8 28,13 32,6 36,13 40,8 42,16" {...s} />
            <Circle cx="24" cy="7.5" r="1" fill={color} />
            <Circle cx="32" cy="5.5" r="1" fill={color} />
            <Circle cx="40" cy="7.5" r="1" fill={color} />
          </>
        );

      // 10. ABSENT-MIND — question mark + scribbles, blank eyes
      case 'absent-mind':
        return (
          <>
            {head}
            {/* eyes looking different directions */}
            <Circle cx="26" cy="24.5" r="1.6" fill={color} />
            <Circle cx="38.5" cy="23" r="1.6" fill={color} />
            <Path d="M28 32 L36 32" {...s} />
            {bust}
            {/* question mark above */}
            <Path d="M46 8 q0 -4 4 -4 q4 0 4 4 q0 3 -4 4 v2" {...s} />
            <Circle cx="50" cy="20.5" r="1" fill={color} />
            {/* scribble squiggles */}
            <Path d="M40 10 q2 -2 4 0 q2 2 4 0" {...s} />
          </>
        );

      // 11. CONTRARIAN — arms crossed, turned-away mouth
      case 'contrarian':
        return (
          <>
            {head}
            {eyes}
            {/* flat turned-away mouth */}
            <Line x1="28" y1="32.5" x2="35" y2="33.5" {...s} />
            {bust}
            {/* crossed forearms */}
            <Line x1="20" y1="50" x2="44" y2="58" {...s} />
            <Line x1="44" y1="50" x2="20" y2="58" {...s} />
          </>
        );

      // 12. BOOKWORM — big thick round glasses
      case 'bookworm':
        return (
          <>
            {head}
            {/* big glasses */}
            <Circle cx="26" cy="24" r="5" {...s} strokeWidth={2.6} />
            <Circle cx="38" cy="24" r="5" {...s} strokeWidth={2.6} />
            <Line x1="31" y1="24" x2="33" y2="24" {...s} strokeWidth={2.6} />
            <Circle cx="26" cy="24" r="1.2" fill={color} />
            <Circle cx="38" cy="24" r="1.2" fill={color} />
            <Path d="M29.5 33 L34.5 33" {...s} />
            {bust}
          </>
        );

      // 13. DRAMATIC — hand to forehead, mouth open "O"
      case 'dramatic':
        return (
          <>
            {head}
            {eyes}
            {/* open "O" mouth */}
            <Circle cx="32" cy="33" r="2.2" {...s} />
            {bust}
            {/* arm raised back-of-hand to brow */}
            <Path d="M12 56 Q10 44 22 38" {...s} />
            <Path d="M22 38 q3 -2 5 1 q-1 3 -4 2" {...s} />
          </>
        );

      // 14. MUMBLER — hand covering mouth
      case 'mumbler':
        return (
          <>
            {head}
            {eyes}
            {/* tiny hidden mouth */}
            <Line x1="30" y1="33" x2="34" y2="33" {...s} />
            {bust}
            {/* hand covering lower face */}
            <Path d="M24 50 Q26 36 33 35 Q40 34 40 40" {...s} />
            <Path d="M33 35 q3 -1 4 2" {...s} />
            <Path d="M30 35 q2 -1.5 3 1" {...s} />
          </>
        );

      // 15. PENSIVE — hand under chin, eyes to side, thoughtful mouth
      case 'pensive':
        return (
          <>
            {head}
            {/* eyes glancing to side */}
            <Circle cx="28" cy="24" r="1.6" fill={color} />
            <Circle cx="39" cy="24" r="1.6" fill={color} />
            <Path d="M29 33 Q32 32 35 33.5" {...s} />
            {bust}
            {/* hand resting under chin */}
            <Path d="M22 52 Q28 46 33 40" {...s} />
            <Path d="M33 40 q2 0.5 1.5 3" {...s} />
            <Path d="M31 41 q1.5 1 0.5 3" {...s} />
            <Path d="M29 42 q1.5 1 0.5 3" {...s} />
          </>
        );

      // 16. ENTHUSIAST — both arms up "Y", big smile
      case 'enthusiast':
        return (
          <>
            {head}
            {eyes}
            {mouthSmile}
            {bust}
            {/* raised arms */}
            <Line x1="20" y1="52" x2="10" y2="40" {...s} />
            <Line x1="44" y1="52" x2="54" y2="40" {...s} />
            {/* motion ticks */}
            <Line x1="8" y1="36" x2="9.5" y2="38" {...s} />
            <Line x1="56" y1="36" x2="54.5" y2="38" {...s} />
          </>
        );

      // 17. STOIC STUDENT — plain neutral, flat mouth
      case 'stoic-student':
        return (
          <>
            {head}
            {eyes}
            {mouthFlat}
            {bust}
          </>
        );

      // 18. NIGHT-OWL — crescent moon + stars, wide awake eyes
      case 'night-owl':
        return (
          <>
            {head}
            {/* wide-awake outlined eyes */}
            <Circle cx="26.5" cy="24" r="2.4" {...s} />
            <Circle cx="37.5" cy="24" r="2.4" {...s} />
            <Circle cx="26.5" cy="24" r="0.9" fill={color} />
            <Circle cx="37.5" cy="24" r="0.9" fill={color} />
            {mouthFlat}
            {bust}
            {/* crescent moon */}
            <Path d="M50 6 a6 6 0 1 0 5 9 a5 5 0 1 1 -5 -9 z" {...s} />
            {/* star dots */}
            <Circle cx="44" cy="14" r="1" fill={color} />
            <Circle cx="58" cy="18" r="1" fill={color} />
          </>
        );

      // 19. MIME — striped shirt, plain face
      case 'mime':
        return (
          <>
            {head}
            {eyes}
            {mouthFlat}
            {bust}
            {/* horizontal stripes on bust */}
            <Path d="M19.5 50 Q32 46 44.5 50" {...s} />
            <Path d="M17.5 54 Q32 50 46.5 54" {...s} />
            <Path d="M16.5 58 Q32 54.5 47.5 58" {...s} />
          </>
        );

      // 20. WANDERING MONK — hood/cowl framing face
      case 'wandering-monk':
        return (
          <>
            {/* outer hood */}
            <Path
              d="M12 58 C10 32 18 14 32 14 C46 14 54 32 52 58"
              {...s}
            />
            {head}
            {eyes}
            {mouthNeutral}
            {bust}
          </>
        );

      // 21. MAD-SCRIBBLER — wild spiky hair, wide eyes, open mouth
      case 'mad-scribbler':
        return (
          <>
            {head}
            {/* wide eyes */}
            <Circle cx="26.5" cy="24" r="2.6" {...s} />
            <Circle cx="37.5" cy="24" r="2.6" {...s} />
            <Circle cx="26.5" cy="24" r="1" fill={color} />
            <Circle cx="37.5" cy="24" r="1" fill={color} />
            {/* excited open mouth */}
            <Path d="M28 32 Q32 38 36 32 Q32 34 28 32 z" {...s} />
            {bust}
            {/* spiky hair radiating */}
            <Polyline
              points="20,18 17,11 24,15 23,7 29,13 32,5 35,13 41,7 40,15 47,11 44,18"
              {...s}
            />
          </>
        );

      // 22. CYNIC — heavy half-lids, downturned flat mouth
      case 'cynic':
        return (
          <>
            {head}
            {/* heavy upper lids over dot eyes */}
            <Line x1="23.5" y1="22.5" x2="29.5" y2="22.5" {...s} />
            <Line x1="34.5" y1="22.5" x2="40.5" y2="22.5" {...s} />
            <Circle cx="26.5" cy="24.5" r="1.4" fill={color} />
            <Circle cx="37.5" cy="24.5" r="1.4" fill={color} />
            {/* unimpressed downturned-flat mouth */}
            <Path d="M28 33 Q32 31.5 36 33" {...s} />
            {bust}
          </>
        );

      // 23. ECCENTRIC — dark sunglasses bar + smirk
      case 'eccentric':
        return (
          <>
            {head}
            {/* solid sunglasses bar */}
            <Path
              d="M22 22 h20 a1.5 1.5 0 0 1 1.5 1.5 v3 a1.5 1.5 0 0 1 -1.5 1.5 h-20 a1.5 1.5 0 0 1 -1.5 -1.5 v-3 a1.5 1.5 0 0 1 1.5 -1.5 z"
              {...s}
              fill={color}
            />
            {/* temple arms to ears */}
            <Line x1="20.5" y1="23.5" x2="18" y2="23" {...s} />
            <Line x1="43.5" y1="23.5" x2="46" y2="23" {...s} />
            {/* smirk */}
            <Path d="M28 33 Q32 35 36 32.5" {...s} />
            {bust}
          </>
        );

      // 24. ANCIENT — long flowing beard, bushy brows, wise eyes
      case 'ancient':
        return (
          <>
            {head}
            {eyes}
            {/* bushy brows */}
            <Path d="M23 20 Q26.5 18 30 20" {...s} />
            <Path d="M35 20 Q38.5 18 42 20" {...s} />
            {/* small mouth above beard */}
            <Line x1="29" y1="31" x2="35" y2="31" {...s} />
            {/* long flowing beard */}
            <Path
              d="M22 30 C20 44 24 58 32 60 C40 58 44 44 42 30"
              {...s}
            />
            {/* beard texture lines */}
            <Path d="M28 36 Q29 46 31 54" {...s} />
            <Path d="M36 36 Q35 46 33 54" {...s} />
          </>
        );

      // 25. ILLUMINATED — halo with rays, serene face
      case 'illuminated':
        return (
          <>
            {head}
            {/* serene closed-ish eyes */}
            <Path d="M24 24 Q26.5 26 29 24" {...s} />
            <Path d="M35 24 Q37.5 26 40 24" {...s} />
            {/* gentle smile */}
            <Path d="M28 31 Q32 35 36 31" {...s} />
            {bust}
            {/* halo ring above head */}
            <Path d="M22 11 Q32 5 42 11" {...s} />
            {/* radiating rays */}
            <Line x1="32" y1="9" x2="32" y2="3" {...s} />
            <Line x1="24" y1="11" x2="21" y2="6" {...s} />
            <Line x1="40" y1="11" x2="43" y2="6" {...s} />
            <Line x1="18" y1="14" x2="13" y2="11" {...s} />
            <Line x1="46" y1="14" x2="51" y2="11" {...s} />
          </>
        );

      // DEFAULT — base face
      default:
        return (
          <>
            {head}
            {eyes}
            {mouthNeutral}
            {bust}
          </>
        );
    }
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {renderFace()}
    </Svg>
  );
}
