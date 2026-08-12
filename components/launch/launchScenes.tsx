import * as React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { STAGE_W, STAGE_H } from '@/components/lesson/cinematic/rig';
import {
  SCENE_KEYS, PALETTES, skyStops, discFor, planesFor, skyBandsFor, crestFor, crestY,
  figureX, figureK,
  type SceneKey, type Crest,
} from './launchArt';

// ─────────────────────────────────────────────────────────────────────────────
// The six outdoor scenes behind the launch screen, rendered from launchArt.
//
// STATIC BY DESIGN. Every stroke here is drawn ONCE and never animates; the
// figure lives in a View layer above (LaunchFigure). react-native-svg
// re-rasterizes a whole surface whenever any child animates, so an animated
// <Svg> on the boot path costs ~10fps — measured.
//
// NO COLOUR IS CHOSEN HERE. Every fill comes from the scene's palette, and
// scripts/check-launch.mjs fails the build on a hex literal in this file. The
// old version declared five of its own and fixed the dark zone to the top third
// so the quote could be ink on paper; that is what forced 40% of every frame to
// be a blank sheet. The scrim in LaunchScreen carries the quote now.
// ─────────────────────────────────────────────────────────────────────────────

export type Activity = SceneKey;

export interface LaunchScene {
  key: SceneKey;
  activity: Activity;
  x: number;
  groundY: number;
  /** Stage units per rig unit. PER SCENE — see FIGURE_K in launchArt. */
  k: number;
  dir: 1 | -1;
  /**
   * The crest contour as PLAIN NUMBERS. Deliberately not a function: the pose is
   * solved inside a Reanimated worklet, and a plain JS closure captured by a
   * worklet is not callable there — it throws "Object is not a function" and
   * takes the app down.
   */
  crest: Crest;
  /** Walk only: the span the figure loops across, off-screen at both ends. */
  walkSpan?: { from: number; to: number };
}

export const LAUNCH_SCENES: LaunchScene[] = SCENE_KEYS.map((key) => {
  const crest = crestFor(key);
  const x = figureX(key);
  return {
    key,
    activity: key,
    x,
    groundY: crestY(crest, x),
    k: figureK(key),
    dir: 1 as const,
    crest,
    ...(key === 'walk' ? { walkSpan: { from: -60, to: 460 } } : {}),
  };
});

/** The whole static backdrop for one scene, in stage coordinates. */
export function SceneArt({ scene }: { scene: LaunchScene }) {
  const { key } = scene;
  const p = PALETTES[key];
  const stops = skyStops(key);
  const disc = discFor(key);
  const bands = skyBandsFor(key);
  const planes = planesFor(key);
  return (
    <Svg width={STAGE_W} height={STAGE_H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}>
      <Defs>
        <LinearGradient id={`launch-sky-${key}`} x1="0" y1="0" x2="0" y2="1">
          {stops.map((s) => (
            <Stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </LinearGradient>
      </Defs>
      {/* PAINT ORDER IS LOAD-BEARING — see the note above this component. */}
      <Rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill={p.steps[p.sky[1]]} />
      <Rect x={0} y={0} width={STAGE_W} height={crestFor(key).base - 150} fill={`url(#launch-sky-${key})`} />
      <Path d={disc.d} fill={disc.fill} />
      {bands.map((b, i) => (
        <Path key={`b${i}`} d={b.d} fill={b.fill} fillOpacity={b.opacity} />
      ))}
      {planes.map((pl, i) => (
        <Path key={i} d={pl.d} fill={pl.fill} />
      ))}
    </Svg>
  );
}
