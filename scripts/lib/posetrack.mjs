// ─────────────────────────────────────────────────────────────────────────────
// WHICH BEAT FIELD IS THE FIGURE'S POSE?
//
// It is not `p`. 190 scenes read `b.p ?? 0` and the rest use their own name — `g`
// in 32, then `a`, `r`, `d`, `b`, `v`, `e`, `sub`, `q`, `soc`, `str`, `c`, `one`.
// Fourteen names across 237 scenes, every one of them defaulting to 0.
//
// So anything that reasons about the pose has to FOLLOW THE CODE rather than trust
// the name: the pose track is whichever array a scene hands to `emoteHold`,
// `emoteLive`, `emoteAny`, `lookPose` or `reactPose`. Assuming `p` silently skips
// 47 lessons, and silence is the failure mode this repo keeps paying for.
//
// A scene that poses TWO figures has two such tracks, and which one is the lead
// cannot be read off the call order — CLAUDE.md's wardrobe note records mount order
// being paint order and a citizen being mistaken for the sovereign. Those scenes
// report `null` here rather than a guess.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const POSERS = /(?:emoteHold|emoteLive|emoteAny|emoteAnyLive|lookPose|reactPose)\s*\(\s*([A-Za-z_$][\w$]*)\s*\[/g;
const TRACK = /const\s+([A-Za-z_$][\w$]*)\s*=\s*BEATS\.map\(\(b\)\s*=>\s*b\.([A-Za-z_$][\w$]*)\s*\?\?\s*(-?[\d.]+)\)/g;

/**
 * `{ field, dflt }` for a scene's single pose track, or `null` when it has none or
 * more than one.
 *
 * @param dir    components/lesson/cinematic
 * @param stem   the scene's file stem, e.g. `logic7` for logic7Scene.tsx
 */
export function poseTrack(dir, stem) {
  const p = path.join(dir, `${stem}Scene.tsx`);
  if (!fs.existsSync(p)) return null;
  const src = fs.readFileSync(p, 'utf8');
  const tracks = new Map();
  for (const m of src.matchAll(TRACK)) tracks.set(m[1], { field: m[2], dflt: Number(m[3]) });
  const used = [...new Set([...src.matchAll(POSERS)].map((m) => m[1]))]
    .map((n) => tracks.get(n)).filter(Boolean);
  const uniq = [...new Map(used.map((u) => [`${u.field}:${u.dflt}`, u])).values()];
  return uniq.length === 1 ? uniq[0] : null;
}
