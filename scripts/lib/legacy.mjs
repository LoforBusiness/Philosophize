// PHILOSOPHY'S SIX RETIRED BRANCHES, and the live roads, read out of the data rather
// than retyped.
//
// Since 2026-09-30 every subject is one road. Philosophy's six old branches were retired
// then, and on 2026-10-02 their 246 narrated lessons were deleted (the owner: "I will no
// longer have any use of the old philosophy lessons"). What is left of them is each
// branch's slug, name and units, kept in data/retiredBranches.ts so a reader's progress
// keeps counting — and their six colours, which a thinker's card and the badges earned
// in them still draw. So the checks that hold those colours read the six from here.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const index = fs.readFileSync(path.join(root, 'data', 'index.ts'), 'utf8');
const retired = fs.readFileSync(path.join(root, 'data', 'retiredBranches.ts'), 'utf8');

/** `import xBranch from './branches/<dir>'` → { xBranch: '<dir>' } */
const dirOf = Object.fromEntries(
  [...index.matchAll(/import (\w+) from '\.\/branches\/([a-z-]+)';/g)].map((m) => [m[1], m[2]]),
);
const body = index.match(/export const ALL_BRANCHES: Branch\[\] = \[([^\]]*)\]/)?.[1] ?? '';

/** The six retired philosophy branches, by slug — progress and colour only, no lessons. */
export const LEGACY = new Set([...retired.matchAll(/slug: '([a-z-]+)'/g)].map((m) => m[1]));
/** The roads a reader can walk: one per subject. */
export const LIVE = new Set([...body.matchAll(/(\w+),/g)].map((m) => dirOf[m[1]]).filter(Boolean));

if (LEGACY.size !== 6) {
  throw new Error(`data/retiredBranches.ts: expected philosophy's six retired branches, read ${[...LEGACY].join(', ') || 'none'}`);
}
if (LIVE.size < 1 || [...LIVE].some((b) => LEGACY.has(b))) {
  throw new Error(`data/index.ts: ALL_BRANCHES must list the live roads and none of the retired six, read ${[...LIVE].join(', ') || 'none'}`);
}
