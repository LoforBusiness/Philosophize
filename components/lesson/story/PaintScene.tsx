import { useMemo } from 'react';
import { View, Image } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import Svg, {
  Path, Ellipse, Rect, Defs, G,
  Filter, FeTurbulence, FeDisplacementMap, FeColorMatrix,
  LinearGradient, RadialGradient, Stop,
} from 'react-native-svg';
import {
  SW, SH, HZN, FOOT_Y, M1_X, M2_X,
  PAPER, PAPER_HI, PAPER_MID, SNOW_BLUE, HAZE_BLUE, SAGE,
  OCHRE, OCHRE_DEEP, TERRA, TAUPE, INK, INK_SEPIA, FLAKE, DUSK,
  absoluteFill, rand, clamp, roughPath, boilVariants,
} from './sceneKit';
import { SCROLL_LAYERS, PROPS, CHARACTERS, type ScrollLayer } from './sceneAssets';

type Speaker = 'narrator' | 'man1' | 'man2';

/* -------------------------------------------------------------------------- *
 *  PaintScene — the visual engine. Renders the snowy walk as stacked parallax
 *  planes (painted PNG when wired in sceneAssets.ts, else a hand-drawn ink-&-
 *  wash placeholder), with continuous scene beats (crows, a trotting fox, a
 *  passing lamppost, a foreground tree sweeping close), multi-depth snow that
 *  thickens over time, and a day→dusk light grade. The whole scene lives
 *  continuously — nothing remounts as the dialogue advances.
 * -------------------------------------------------------------------------- */

export default function PaintScene({ progress, snow, boil, speaking }: {
  progress: number; snow: number; boil: number; speaking: Speaker | null;
}) {
  return (
    <View style={absoluteFill} pointerEvents="none">
      {/* —— back-to-front parallax planes —— */}
      <ScrollLayerView def={layer('sky')} progress={progress} snow={snow} boil={boil} />
      <ScrollLayerView def={layer('mountains')} progress={progress} snow={snow} boil={boil} />
      <Crows />
      <ScrollLayerView def={layer('treelineFar')} progress={progress} snow={snow} boil={boil} />
      <Fox />
      <ScrollLayerView def={layer('treesMid')} progress={progress} snow={snow} boil={boil} />
      <Lamp />

      {/* far snow drifts behind the walkers */}
      <SnowTier count={14} seed={11} sizeMin={1.2} sizeMax={2.6} opMin={0.1} opMax={0.26} durMin={11000} durMax={16000} slant={-22} color={HAZE_BLUE} level={snow} />
      <SnowTier count={12} seed={37} sizeMin={2.2} sizeMax={4} opMin={0.28} opMax={0.5} durMin={7500} durMax={10500} slant={-40} color={FLAKE} level={snow} />

      <ScrollLayerView def={layer('ground')} progress={progress} snow={snow} boil={boil} />
      <CharacterRig speaking={speaking} boil={boil} />
      <ScrollLayerView def={layer('foreground')} progress={progress} snow={snow} boil={boil} />
      <ForegroundTree />

      {/* near snow in front of everything */}
      <SnowTier count={8} seed={73} sizeMin={4.5} sizeMax={8} opMin={0.5} opMax={0.8} durMin={4200} durMax={6400} slant={-66} color={PAPER_HI} level={snow} elongate />
      <SnowTier count={3} seed={91} sizeMin={13} sizeMax={22} opMin={0.08} opMax={0.16} durMin={9000} durMax={13000} slant={-50} color={PAPER_HI} level={snow} />

      <LightGrade progress={progress} />
      <Vignette />
      <PaperGrain />
    </View>
  );
}

const layer = (k: ScrollLayer['key']) => SCROLL_LAYERS.find((l) => l.key === k)!;
const propSource = (k: string) => PROPS.find((p) => p.key === k)?.source ?? null;
const charDef = (k: 'man1' | 'man2') => CHARACTERS.find((c) => c.key === k)!;

/* ----------------------------- watercolour defs --------------------------- */
function WashDefs() {
  return (
    <Defs>
      <Filter id="wash" x="-40%" y="-40%" width="180%" height="180%">
        <FeTurbulence type="fractalNoise" baseFrequency="0.013 0.02" numOctaves={2} seed={7} result="n" />
        <FeDisplacementMap in="SourceGraphic" in2="n" scale={11} xChannelSelector="R" yChannelSelector="G" />
      </Filter>
    </Defs>
  );
}

// parallax duration from depth: far planes crawl, near planes rush
const durFor = (depth: number) => (depth <= 0.001 ? 0 : Math.round(9000 / depth));

/* --------------------------- one parallax plane --------------------------- */
function ScrollLayerView({ def, progress, snow, boil }: {
  def: ScrollLayer; progress: number; snow: number; boil: number;
}) {
  const dur = durFor(def.depth);
  const h = Math.round(SH * def.heightFrac);
  const top = Math.round(SH * def.yBottomFrac - h);

  // painted PNG path ---------------------------------------------------------
  if (def.source) {
    if (!dur) {
      return (
        <Image source={def.source} resizeMode="stretch"
          style={{ position: 'absolute', left: 0, top, width: SW, height: h, opacity: def.opacity ?? 1 }} />
      );
    }
    return (
      <View style={[absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
        <MotiView
          style={{ position: 'absolute', flexDirection: 'row', top, left: 0, height: h }}
          from={{ translateX: 0 }} animate={{ translateX: -SW }}
          transition={{ loop: true, repeatReverse: false, type: 'timing', duration: dur, easing: Easing.linear }}>
          <Image source={def.source} resizeMode="stretch" style={{ width: SW, height: h, opacity: def.opacity ?? 1 }} />
          <Image source={def.source} resizeMode="stretch" style={{ width: SW, height: h, opacity: def.opacity ?? 1 }} />
        </MotiView>
      </View>
    );
  }

  // procedural placeholder ---------------------------------------------------
  switch (def.key) {
    case 'sky':       return <PaperBaseProc snow={snow} boil={boil} />;
    case 'ground':    return <GroundProc progress={progress} boil={boil} />;
    case 'mountains': return <FullScroller dur={dur}><MountainHaze /></FullScroller>;
    case 'treelineFar': return <FullScroller dur={dur}><FarTreeline boil={boil} /></FullScroller>;
    case 'treesMid':  return <FullScroller dur={dur}><MidTrees boil={boil} /></FullScroller>;
    case 'foreground':return <FullScroller dur={dur}><ForegroundTufts boil={boil} /></FullScroller>;
    default:          return null;
  }
}

// tiles a full-screen child twice and scrolls it left forever
function FullScroller({ dur, children }: { dur: number; children: React.ReactNode }) {
  if (!dur) return <View style={absoluteFill} pointerEvents="none">{children}</View>;
  return (
    <View style={[absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <MotiView
        style={{ position: 'absolute', flexDirection: 'row', top: 0, left: 0, bottom: 0 }}
        from={{ translateX: 0 }} animate={{ translateX: -SW }}
        transition={{ loop: true, repeatReverse: false, type: 'timing', duration: dur, easing: Easing.linear }}>
        <View style={{ width: SW }}>{children}</View>
        <View style={{ width: SW }}>{children}</View>
      </MotiView>
    </View>
  );
}

/* --------------------------- procedural placeholders ---------------------- */

function PaperBaseProc({ snow, boil }: { snow: number; boil: number }) {
  const horizon = useMemo(() => boilVariants([[-10, HZN], [SW * 0.3, HZN - 4], [SW * 0.62, HZN + 3], [SW + 10, HZN - 2]], 301, 2), []);
  return (
    <View style={absoluteFill} pointerEvents="none">
      <Svg width={SW} height={SH}>
        <WashDefs />
        <Rect x={0} y={0} width={SW} height={SH} fill={PAPER} />
        <Ellipse cx={SW * 0.3} cy={SH * 0.22} rx={SW * 0.7} ry={SH * 0.4} fill={PAPER_MID} opacity={0.18} filter="url(#wash)" />
        <Ellipse cx={SW * 0.5} cy={SH * 0.92} rx={SW * 0.8} ry={SH * 0.2} fill={SNOW_BLUE} opacity={0.1 + snow * 0.14} filter="url(#wash)" />
        <Path d={horizon[boil % 3]} stroke={TAUPE} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.6} />
      </Svg>
    </View>
  );
}

function MountainHaze() {
  const ridge = useMemo(() => boilVariants([[-10, HZN + 4], [SW * 0.22, HZN - 26], [SW * 0.44, HZN - 10], [SW * 0.7, HZN - 30], [SW + 10, HZN - 6]], 211, 3), []);
  return (
    <Svg width={SW} height={SH}>
      <WashDefs />
      <Path d={`M-10 ${HZN + 4} L ${SW * 0.22} ${HZN - 26} L ${SW * 0.44} ${HZN - 10} L ${SW * 0.7} ${HZN - 30} L ${SW + 10} ${HZN - 6} L ${SW + 10} ${HZN + 30} L -10 ${HZN + 30} Z`} fill={HAZE_BLUE} opacity={0.16} filter="url(#wash)" />
      <Path d={ridge[0]} stroke={HAZE_BLUE} strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.4} />
    </Svg>
  );
}

function FarTreeline({ boil }: { boil: number }) {
  const trees = useMemo(() => [0.12, 0.27, 0.4, 0.58, 0.74, 0.9].map((f, i) => {
    const x = SW * f; const h = 26 + rand(i + 70) * 22; const top = HZN - h + 6;
    return { trunk: boilVariants([[x, HZN + 6], [x, top]], i * 13 + 5, 1.2), x, top, h };
  }), []);
  return (
    <Svg width={SW} height={SH}>
      {trees.map((t, i) => (
        <G key={i}>
          <Ellipse cx={t.x} cy={t.top + t.h * 0.4} rx={9} ry={t.h * 0.4} fill={SAGE} opacity={0.14} />
          <Path d={t.trunk[boil % 3]} stroke={INK_SEPIA} strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.55} />
        </G>
      ))}
    </Svg>
  );
}

function MidTrees({ boil }: { boil: number }) {
  const trees = useMemo(() => [0.1, 0.83].map((f, i) => {
    const x = SW * f; const h = 70 + rand(i + 3) * 50; const top = FOOT_Y - h;
    const trunk = boilVariants([[x, FOOT_Y], [x + 3, FOOT_Y - h * 0.5], [x - 2, top]], i * 9 + 60, 2.2);
    const branches = [0.3, 0.5, 0.68].map((tt, j) =>
      boilVariants([[x, top + h * tt], [x + (j % 2 === 0 ? -1 : 1) * (16 + j * 4), top + h * tt - 10]], i * 50 + j * 11 + 3, 1.8));
    return { x, h, top, trunk, branches };
  }), []);
  return (
    <Svg width={SW} height={SH}>
      <WashDefs />
      {trees.map((t, i) => (
        <G key={i}>
          <Ellipse cx={t.x} cy={t.top + t.h * 0.4} rx={26} ry={t.h * 0.4} fill={SAGE} opacity={0.18} filter="url(#wash)" />
          <Path d={t.trunk[boil % 3]} stroke={INK_SEPIA} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.8} />
          {t.branches.map((b, j) => (
            <Path key={j} d={b[(boil + j) % 3]} stroke={TAUPE} strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.7} />
          ))}
        </G>
      ))}
    </Svg>
  );
}

function ForegroundTufts({ boil }: { boil: number }) {
  const tufts = useMemo(() => [0.2, 0.46, 0.72, 0.94].map((f, i) => {
    const x = SW * f; const y = SH * 0.93 + rand(i + 9) * 10;
    return { x, y, blades: [-7, -2, 3, 8].map((dx, j) => boilVariants([[x + dx, y], [x + dx * 1.6, y - 10 - rand(i * 4 + j) * 8]], i * 17 + j, 1.4)) };
  }), []);
  return (
    <Svg width={SW} height={SH}>
      {tufts.map((t, i) => (
        <G key={i}>
          {t.blades.map((b, j) => (
            <Path key={j} d={b[(boil + j) % 3]} stroke={INK_SEPIA} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.6} />
          ))}
        </G>
      ))}
    </Svg>
  );
}

function GroundProc({ progress, boil }: { progress: number; boil: number }) {
  const contour = useMemo(() => boilVariants([[-10, FOOT_Y + 18], [SW * 0.3, FOOT_Y + 10], [SW * 0.66, FOOT_Y + 20], [SW + 10, FOOT_Y + 14]], 700, 2.4), []);
  const prints = useMemo(() => {
    const arr: { x: number; y: number; s: number }[] = [];
    const vanishX = SW * 0.5; const MAX = 11; const count = Math.round(progress * MAX);
    for (let i = 0; i < count; i++) {
      const t = i / MAX;
      const y = FOOT_Y + 14 - t * (FOOT_Y + 14 - (HZN + 8));
      const x = vanishX + (M1_X - vanishX) * t + (i % 2 === 0 ? -1 : 1) * 8 * (1 - t);
      arr.push({ x, y, s: 1 - t * 0.8 });
    }
    return arr;
  }, [progress]);
  return (
    <View style={absoluteFill} pointerEvents="none">
      <Svg width={SW} height={SH}>
        <WashDefs />
        <Ellipse cx={SW * 0.2} cy={FOOT_Y + 40} rx={SW * 0.5} ry={26} fill={SNOW_BLUE} opacity={0.22} filter="url(#wash)" />
        <Ellipse cx={SW * 0.78} cy={FOOT_Y + 60} rx={SW * 0.45} ry={24} fill={SNOW_BLUE} opacity={0.18} filter="url(#wash)" />
        <Path d={contour[boil % 3]} stroke={TAUPE} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.5} />
        {prints.map((p, i) => (
          <Ellipse key={i} cx={p.x} cy={p.y} rx={4.5 * p.s} ry={2.2 * p.s} fill={SNOW_BLUE} opacity={0.45} filter="url(#wash)" />
        ))}
      </Svg>
    </View>
  );
}

/* ------------------------------ scene beats ------------------------------- */
// All beats drift continuously on their own loop → the scene is always changing,
// not just two figures walking. Painted PNGs swap in via sceneAssets PROPS.

function DriftAcross({ dur, delay, top, height, reverse, children }: {
  dur: number; delay?: number; top: number; height: number; reverse?: boolean; children: React.ReactNode;
}) {
  const from = reverse ? SW + 60 : -120;
  const to = reverse ? -120 : SW + 60;
  return (
    <View style={[absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <MotiView
        style={{ position: 'absolute', top, height }}
        from={{ translateX: from }} animate={{ translateX: to }}
        transition={{ loop: true, repeatReverse: false, type: 'timing', duration: dur, delay, easing: Easing.linear }}>
        {children}
      </MotiView>
    </View>
  );
}

function Crows() {
  const src = propSource('crows');
  return (
    <DriftAcross dur={42000} top={SH * 0.14} height={40}>
      {src ? (
        <Image source={src} resizeMode="contain" style={{ width: 120, height: 40 }} />
      ) : (
        <View style={{ flexDirection: 'row', width: 120 }}>
          {[0, 1, 2].map((i) => <Bird key={i} delay={i * 140} dx={i * 22} dy={(i % 2) * 8} />)}
        </View>
      )}
    </DriftAcross>
  );
}

function Bird({ delay, dx, dy }: { delay: number; dx: number; dy: number }) {
  return (
    <MotiView
      style={{ position: 'absolute', left: dx, top: dy }}
      from={{ scaleY: 1 }} animate={{ scaleY: 0.55 }}
      transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 360, delay, easing: Easing.inOut(Easing.quad) }}>
      <Svg width={16} height={10}>
        <Path d="M1 8 Q5 1 8 6 Q11 1 15 8" stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      </Svg>
    </MotiView>
  );
}

function Fox() {
  const src = propSource('fox');
  const y = HZN + 18;
  return (
    <DriftAcross dur={27000} delay={6000} top={y} height={26}>
      {src ? (
        <Image source={src} resizeMode="contain" style={{ width: 46, height: 26 }} />
      ) : (
        <MotiView
          from={{ translateY: 0 }} animate={{ translateY: -1.6 }}
          transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 140, easing: Easing.inOut(Easing.quad) }}>
          <Svg width={46} height={26}>
            <Ellipse cx={22} cy={13} rx={13} ry={5} fill={OCHRE} opacity={0.85} />
            <Path d="M9 13 L4 8 L8 14" fill={OCHRE_DEEP} />
            <Path d="M35 12 Q44 8 43 16" stroke={OCHRE_DEEP} strokeWidth={3} fill="none" strokeLinecap="round" />
            <Path d="M15 17 L14 23 M21 18 L21 24 M27 17 L28 23 M32 16 L33 22" stroke={INK_SEPIA} strokeWidth={1.6} strokeLinecap="round" />
          </Svg>
        </MotiView>
      )}
    </DriftAcross>
  );
}

function Lamp() {
  const src = propSource('lamp');
  const h = 96; const top = FOOT_Y - h;
  return (
    <DriftAcross dur={17000} delay={3000} top={top} height={h + 8} reverse>
      {src ? (
        <Image source={src} resizeMode="contain" style={{ width: 40, height: h + 8 }} />
      ) : (
        <Svg width={40} height={h + 8}>
          <MotiRectGlow />
          <Path d={`M20 ${h} L20 14`} stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <Path d="M14 14 Q20 6 26 14 L24 22 L16 22 Z" stroke={INK} strokeWidth={1.8} fill={PAPER_HI} />
          <Path d={`M12 ${h} q8 4 16 0`} stroke={TAUPE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </Svg>
      )}
    </DriftAcross>
  );
}

// warm flicker inside the lamp head
function MotiRectGlow() {
  return (
    <>
      <Ellipse cx={20} cy={18} rx={9} ry={9} fill={OCHRE} opacity={0.4} />
      <Ellipse cx={20} cy={18} rx={4} ry={5} fill={OCHRE_DEEP} opacity={0.85} />
    </>
  );
}

function ForegroundTree() {
  const src = propSource('treeFg');
  const h = SH * 0.5;
  return (
    <DriftAcross dur={12000} delay={8000} top={FOOT_Y + 30 - h} height={h} reverse>
      {src ? (
        <Image source={src} resizeMode="contain" style={{ width: 150, height: h }} />
      ) : (
        <Svg width={150} height={h}>
          <Path d={`M40 ${h} C 44 ${h * 0.6} 30 ${h * 0.4} 46 8`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          <Path d={`M44 ${h * 0.5} q -26 -14 -34 -34`} stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
          <Path d={`M44 ${h * 0.36} q 28 -12 40 -30`} stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
          <Path d={`M45 ${h * 0.24} q -18 -16 -22 -30`} stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <Path d={`M46 ${h * 0.2} q 20 -10 30 -24`} stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </Svg>
      )}
    </DriftAcross>
  );
}

/* ------------------------------- characters ------------------------------- */

function CharacterRig({ speaking, boil }: { speaking: Speaker | null; boil: number }) {
  return (
    <View style={absoluteFill} pointerEvents="none">
      <Walker who="man2" x={M2_X} foot={FOOT_Y - 6} scale={0.86} period={1060} phaseDelay={330} wash={SAGE} variant="scarf" active={speaking === 'man2'} boil={boil} />
      <Walker who="man1" x={M1_X} foot={FOOT_Y + 8} scale={1.0} period={1000} phaseDelay={0} wash={TAUPE} variant="long" active={speaking === 'man1'} boil={boil} />
    </View>
  );
}

function Walker(props: {
  who: 'man1' | 'man2'; x: number; foot: number; scale: number; period: number; phaseDelay: number;
  wash: string; variant: 'long' | 'scarf'; active: boolean; boil: number;
}) {
  const cd = charDef(props.who);
  // painted character: bob + sway + (optional) 2-frame walk swap
  if (cd.frameA) {
    const H = 150 * props.scale; const W = H * 0.62;
    const frame = cd.frameB && props.boil % 2 === 1 ? cd.frameB : cd.frameA;
    return (
      <View style={{ position: 'absolute', left: props.x - W / 2, top: props.foot - H, width: W, height: H + 14 }}>
        <Svg width={W} height={20} style={{ position: 'absolute', left: 0, top: H - 6 }}>
          <Ellipse cx={W / 2} cy={8} rx={W * 0.28} ry={4} fill={SNOW_BLUE} opacity={0.4} />
        </Svg>
        <MotiView
          style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}
          from={{ translateY: 0, rotate: '-1deg' }} animate={{ translateY: -3 * props.scale, rotate: '1deg' }}
          transition={{ loop: true, repeatReverse: true, type: 'timing', duration: props.period / 2, delay: props.phaseDelay, easing: Easing.inOut(Easing.sin) }}>
          <Image source={frame} resizeMode="contain" style={{ width: W, height: H }} />
        </MotiView>
      </View>
    );
  }
  // procedural ink figure
  return <Figure {...props} />;
}

function Figure({ x, foot, scale, period, phaseDelay, wash, variant, active, boil }: {
  x: number; foot: number; scale: number; period: number; phaseDelay: number; wash: string; variant: 'long' | 'scarf'; active: boolean; boil: number;
}) {
  const H = 126 * scale;
  const thigh = 28 * scale; const shin = 24 * scale;
  const half = period / 2; const hipY = H * 0.6;
  const legGap = 6 * scale; const boxW = 52 * scale;
  const left = x - boxW / 2; const top = foot - H;

  const legLoop = { loop: true, repeatReverse: true, type: 'timing' as const, duration: half, delay: phaseDelay, easing: Easing.inOut(Easing.sin) };
  const shinLoop = { loop: true, repeatReverse: true, type: 'timing' as const, duration: half, delay: phaseDelay + half * 0.5, easing: Easing.inOut(Easing.quad) };
  const bobLoop = { loop: true, repeatReverse: true, type: 'timing' as const, duration: half / 2, delay: phaseDelay, easing: Easing.inOut(Easing.quad) };

  const coat = useMemo(() => {
    const hem = variant === 'long' ? hipY + 24 * scale : hipY + 14 * scale;
    return boilVariants([
      [boxW / 2 - 14 * scale, hem], [boxW / 2 - 11 * scale, H * 0.3], [boxW / 2, H * 0.24],
      [boxW / 2 + 11 * scale, H * 0.3], [boxW / 2 + 14 * scale, hem],
    ], Math.round(x) + 5, 2);
  }, [x, scale, variant, hipY, H, boxW]);
  const headPts: [number, number][] = useMemo(() => {
    const cx = boxW / 2; const cy = H * 0.22; const r = 9 * scale;
    return [0, 1, 2, 3, 4, 5].map((k): [number, number] => [cx + Math.cos((k / 5) * Math.PI * 2) * r, cy + Math.sin((k / 5) * Math.PI * 2) * r]);
  }, [scale, boxW, H]);
  const head = useMemo(() => boilVariants(headPts, Math.round(x) + 80, 1.4), [headPts, x]);

  return (
    <View style={{ position: 'absolute', left, top, width: boxW, height: H + 16 }}>
      <Svg width={boxW} height={H + 16} style={{ position: 'absolute', left: 0, top: 0 }}>
        <WashDefs />
        <Ellipse cx={boxW / 2} cy={H + 6} rx={16 * scale} ry={4} fill={SNOW_BLUE} opacity={0.35} filter="url(#wash)" />
        <Ellipse cx={boxW / 2} cy={H * 0.46} rx={15 * scale} ry={H * 0.26} fill={wash} opacity={0.2} filter="url(#wash)" />
        {active ? <Ellipse cx={boxW / 2} cy={H * 0.2} rx={16 * scale} ry={16 * scale} fill={PAPER_HI} opacity={0.5} filter="url(#wash)" /> : null}
      </Svg>

      <View style={{ position: 'absolute', left: 0, top: 0, width: boxW, height: H, transform: [{ rotate: '4deg' }] }}>
        <MotiView style={{ position: 'absolute', left: 0, top: 0, width: boxW, height: H }} from={{ translateY: 0 }} animate={{ translateY: -3 * scale }} transition={bobLoop}>
          <Leg pivotX={boxW / 2 - legGap} pivotY={hipY} thigh={thigh} shin={shin} scale={scale} x={x} legLoop={legLoop} shinLoop={shinLoop} fromDeg="16deg" toDeg="-16deg" />
          <Leg pivotX={boxW / 2 + legGap} pivotY={hipY} thigh={thigh} shin={shin} scale={scale} x={x + 1} legLoop={legLoop} shinLoop={shinLoop} fromDeg="-16deg" toDeg="16deg" />

          <Svg width={boxW} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
            <Path d={coat[boil % 3]} stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.9} />
            <Path d={coat[boil % 3]} stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.55} />
            {variant === 'scarf' ? <Path d={`M ${boxW / 2 - 9 * scale} ${H * 0.32} q ${9 * scale} ${5 * scale} ${18 * scale} 0`} stroke={TERRA} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} /> : null}
          </Svg>

          <MotiView style={{ position: 'absolute', left: 0, top: 0, width: boxW, height: H }} from={{ rotate: active ? '-2.5deg' : '0deg' }} animate={{ rotate: active ? '2.5deg' : '0deg' }} transition={active ? { loop: true, repeatReverse: true, type: 'timing', duration: 280, easing: Easing.inOut(Easing.quad) } : { type: 'timing', duration: 200 }}>
            <Svg width={boxW} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
              <Path d={head[boil % 3]} stroke={INK} strokeWidth={2.2} fill={PAPER} strokeLinecap="round" />
              <Path d={`M ${boxW / 2 - 11 * scale} ${H * 0.18} q ${11 * scale} ${-7 * scale} ${22 * scale} 0`} stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            </Svg>
          </MotiView>
        </MotiView>
      </View>
    </View>
  );
}

function Leg({ pivotX, pivotY, thigh, shin, scale, x, legLoop, shinLoop, fromDeg, toDeg }: {
  pivotX: number; pivotY: number; thigh: number; shin: number; scale: number; x: number; legLoop: object; shinLoop: object; fromDeg: string; toDeg: string;
}) {
  const w = 12;
  return (
    <View style={{ position: 'absolute', left: pivotX, top: pivotY }}>
      <MotiView style={{ position: 'absolute' }} from={{ rotate: fromDeg }} animate={{ rotate: toDeg }} transition={legLoop as never}>
        <Svg width={w} height={thigh + 3} style={{ position: 'absolute', left: -w / 2, top: 0 }}>
          <Path d={roughPath([[w / 2, 0], [w / 2, thigh]], Math.round(x) + 200, 1.2)} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        </Svg>
        <View style={{ position: 'absolute', left: 0, top: thigh }}>
          <MotiView style={{ position: 'absolute' }} from={{ rotate: '2deg' }} animate={{ rotate: '24deg' }} transition={shinLoop as never}>
            <Svg width={w + 6} height={shin + 8} style={{ position: 'absolute', left: -w / 2, top: 0 }}>
              <Path d={roughPath([[w / 2, 0], [w / 2, shin]], Math.round(x) + 300, 1.2)} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <Path d={`M ${w / 2 - 2} ${shin} q 5 1 ${6 * scale} 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
            </Svg>
          </MotiView>
        </View>
      </MotiView>
    </View>
  );
}

/* -------------------------------- snow ------------------------------------ */
function SnowTier({ count, seed, sizeMin, sizeMax, opMin, opMax, durMin, durMax, slant, color, level, elongate }: {
  count: number; seed: number; sizeMin: number; sizeMax: number; opMin: number; opMax: number; durMin: number; durMax: number; slant: number; color: string; level: number; elongate?: boolean;
}) {
  const flakes = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const r = (k: number) => rand(i * 7 + seed + k);
      const size = sizeMin + r(2) * (sizeMax - sizeMin);
      return { left: r(1) * SW, size, op: opMin + r(3) * (opMax - opMin), dur: durMin + r(4) * (durMax - durMin), delay: r(5) * (durMax - durMin), slantX: slant * (0.7 + r(6) * 0.6) };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, seed]
  );
  return (
    <MotiView pointerEvents="none" style={absoluteFill} animate={{ opacity: 0.5 + level * 0.5 }} transition={{ type: 'timing', duration: 800 }}>
      {flakes.map((f, i) => (
        <MotiView key={i} pointerEvents="none" style={{ position: 'absolute', left: f.left, top: 0 }} from={{ translateX: 0, translateY: -f.size - 6 }} animate={{ translateX: f.slantX, translateY: SH + f.size + 6 }} transition={{ loop: true, repeatReverse: false, type: 'timing', duration: f.dur, delay: f.delay, easing: Easing.linear }}>
          <View style={{ width: f.size, height: elongate ? f.size * 1.8 : f.size, borderRadius: f.size, backgroundColor: color, opacity: f.op }} />
        </MotiView>
      ))}
    </MotiView>
  );
}

/* ----------------------------- grade & paper ------------------------------ */
function LightGrade({ progress }: { progress: number }) {
  return (
    <MotiView pointerEvents="none" style={absoluteFill} animate={{ opacity: clamp(progress, 0, 1) }} transition={{ type: 'timing', duration: 1200 }}>
      <Svg width={SW} height={SH}>
        <Defs>
          <LinearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={DUSK} stopOpacity={0} />
            <Stop offset="0.5" stopColor={DUSK} stopOpacity={0.12} />
            <Stop offset="1" stopColor={DUSK} stopOpacity={0.34} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={SW} height={SH} fill="url(#dusk)" />
      </Svg>
    </MotiView>
  );
}

function Vignette() {
  return (
    <View style={absoluteFill} pointerEvents="none">
      <Svg width={SW} height={SH}>
        <Defs>
          <RadialGradient id="vig" cx="50%" cy="46%" r="75%">
            <Stop offset="0.6" stopColor={INK} stopOpacity={0} />
            <Stop offset="1" stopColor={INK} stopOpacity={0.16} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={SW} height={SH} fill="url(#vig)" />
      </Svg>
    </View>
  );
}

function PaperGrain() {
  return (
    <View style={absoluteFill} pointerEvents="none">
      <Svg width={SW} height={SH}>
        <Defs>
          <Filter id="paper" x="0%" y="0%" width="100%" height="100%">
            <FeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={11} result="t" />
            <FeColorMatrix in="t" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.22  0 0 0 0 0.19  0 0 0 0.6 0" />
          </Filter>
        </Defs>
        <Rect x={0} y={0} width={SW} height={SH} filter="url(#paper)" opacity={0.05} />
      </Svg>
    </View>
  );
}
