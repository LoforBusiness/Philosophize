import Svg, { Path, Ellipse, G } from 'react-native-svg';

// The brand's laurel — two mirrored branches of five leaves. It used to be a
// private component inside AuthPanel; the launch screen's title-page redesign
// wants the same mark, and two hand-kept copies of one emblem is how the
// wordmark drifted for a whole rename (§19's letter-spaced-masthead story), so
// it lives here now and both surfaces import it.
//
// Ink line-art with mid-paper leaf fills — no colour, so it sits on any paper
// surface in the app without a contrast question.

const INK = '#1A1A1A';
const LEAF = '#E2E0D8';

// Six leaves per branch, thinner than they are long, angled a little PAST the
// stem's own tangent so each reads as growing off it rather than threaded on
// it. The first cut had five fat leaves crowding the bottom of a narrow deep
// curve, and at mark size the whole thing read as a V of shells — a wreath is
// wide and open, so the stem swings out to the side before it climbs.
const LEAVES = [
  { x: 33, y: 53, r: -52 }, { x: 26, y: 45, r: -44 }, { x: 20, y: 36, r: -32 },
  { x: 16, y: 26, r: -20 }, { x: 15, y: 16, r: -6 }, { x: 18, y: 7, r: 10 },
];

function Branch({ ink, leaf }: { ink: string; leaf: string }) {
  return (
    <>
      <Path d="M 42 60 C 24 55 11 38 15 8" stroke={ink} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      {LEAVES.map((l, i) => (
        <Ellipse key={i} cx={l.x} cy={l.y} rx={5.6} ry={2.6} fill={leaf} stroke={ink} strokeWidth={1}
          transform={`rotate(${l.r} ${l.x} ${l.y})`} />
      ))}
    </>
  );
}

export default function LaurelMark({
  width = 72,
  ink = INK,
  leaf = LEAF,
}: { width?: number; ink?: string; leaf?: string }) {
  return (
    <Svg width={width} height={width * (64 / 84)} viewBox="0 0 84 64">
      <Branch ink={ink} leaf={leaf} />
      <G transform="translate(84,0) scale(-1,1)"><Branch ink={ink} leaf={leaf} /></G>
    </Svg>
  );
}
