// PHILOSOPHY'S SIX RETIRED BRANCHES, read out of data/index.ts rather than retyped.
//
// Since 2026-09-30 every subject is one road, and philosophy's old branches — 246
// narrated lessons in 28 units — are out of the app until they are rebuilt as dialogue
// lessons (data/index.ts LEGACY_BRANCHES). The rules written for them still hold them:
// every branch level at 41, every lesson cinematic, every unit reviewed. Those rules
// are about THESE six and must not reach the new one-lesson roads, so the checks that
// carry them read the set from here.
import fs from 'node:fs';
import path from 'node:path';

const src = fs.readFileSync(path.join(process.cwd(), 'data', 'index.ts'), 'utf8');

/** `import xBranch from './branches/<dir>'` → { xBranch: '<dir>' } */
const dirOf = Object.fromEntries(
  [...src.matchAll(/import (\w+) from '\.\/branches\/([a-z-]+)';/g)].map((m) => [m[1], m[2]]),
);
const listOf = (name) => {
  const body = src.match(new RegExp('export const ' + name + ': Branch\\[\\] = \\[([^\\]]*)\\]'))?.[1] ?? '';
  return [...body.matchAll(/(\w+),/g)].map((m) => dirOf[m[1]]).filter(Boolean);
};

/** The six retired philosophy branches, as directory names under data/branches. */
export const LEGACY = new Set(listOf('LEGACY_BRANCHES'));
/** The roads a reader can walk: one per subject. */
export const LIVE = new Set(listOf('ALL_BRANCHES'));

if (LEGACY.size !== 6) {
  throw new Error(`data/index.ts: expected philosophy's six retired branches in LEGACY_BRANCHES, read ${[...LEGACY].join(', ') || 'none'}`);
}
if (LIVE.size < 1 || [...LIVE].some((b) => LEGACY.has(b))) {
  throw new Error(`data/index.ts: ALL_BRANCHES must list the live roads and none of the retired six, read ${[...LIVE].join(', ') || 'none'}`);
}
