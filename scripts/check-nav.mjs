// A NESTED STACK THAT CAN BE ENTERED DEEP MUST SAY WHAT SITS UNDERNEATH.
//
//   "when I try click the back arrow, it goes back to the home page. And then if
//    I go back to the learn tab, it's still on the branch I was on. I cannot go
//    back to all the listed branches."
//
// One fault, both halves. Expo Router builds a nested stack from the href you
// enter it by, so a tab entered from OUTSIDE itself gets a stack exactly one
// screen deep with no list beneath it. `branches` is entered from outside three
// ways — Quick Start pushes straight to a lesson from Home, the thinker sheet
// does the same, and `LessonReward` finishes by REPLACING the route with the
// branch. After any of them `router.back()` has nothing to pop, hands the press
// up to the tab navigator, and the default `backBehavior` takes the reader to
// the first tab. The stack still holds the branch, which is why returning to the
// tab shows it again with no way out.
//
// `unstable_settings = { anchor: 'index' }` is what puts the list underneath.
// Measured in the real app before and after: entering `/branches/logic` by URL
// and pressing the screen's own back arrow left the URL at `/branches/logic`
// before, and moves it to `/branches` after.
//
//   npm run check:nav
//
// WHY THE ROOT STACK IS EXEMPT, and it is not an oversight. `app/_layout.tsx`
// also has a deep route (`thinker/[id]`, the widget's deep-link target), but its
// `index` is the UNAUTHENTICATED landing screen. Anchoring there would put a
// sign-in page under a signed-in reader's deep link, which is worse than the
// thing being fixed. The rule is about the tab shell, where an index is always
// the right thing to have underneath.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'app/(app)';

function layouts(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) layouts(p, out);
    else if (e.name === '_layout.tsx') out.push(p);
  }
  return out;
}

/** Every route file under `dir`, relative, excluding the layout itself. */
function routes(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) routes(p, base, out);
    else if (e.name.endsWith('.tsx') && e.name !== '_layout.tsx') {
      out.push(path.relative(base, p).replace(/\\/g, '/').replace(/\.tsx$/, ''));
    }
  }
  return out;
}

/**
 * Comments out, before anything is decided from the text.
 *
 * L8's lesson, arriving here within an hour of the rule being written: the tabs
 * layout is a <Tabs>, and this check called it a Stack because a COMMENT in it
 * quotes BranchWorld's note about "a plain <Stack>". A detector that reads prose
 * as code will eventually read the right prose and be confidently wrong.
 */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const bad = [];
const seen = [];
for (const lay of layouts(ROOT)) {
  const src = strip(fs.readFileSync(lay, 'utf8'));
  const dir = path.dirname(lay);
  // Only a STACK can be entered at a depth. A Tabs layout has no history to pop.
  if (!/<Stack[\s>]/.test(src)) continue;

  const list = routes(dir);
  const hasIndex = list.includes('index');
  // "Deep" means a route below this layout's own top level — a nested folder or
  // a dynamic segment. Those are the ones a push from another tab can land on.
  const deep = list.filter((r) => r !== 'index' && r.includes('/'));
  if (!hasIndex || !deep.length) { seen.push({ lay, deep: deep.length, need: false }); continue; }

  const anchored = /unstable_settings\s*=\s*\{[^}]*\b(anchor|initialRouteName)\s*:\s*'index'/.test(src);
  seen.push({ lay, deep: deep.length, need: true, anchored });
  if (!anchored) bad.push({ lay, deep });
}

console.log('\nNESTED STACKS AND WHAT SITS UNDER THEM\n');
for (const s of seen) {
  const where = s.lay.replace(/\\/g, '/');
  if (!s.need) console.log(`  --    ${where.padEnd(46)} no route below its index — nothing to anchor`);
  else console.log(`  ${s.anchored ? 'ok  ' : 'FAIL'}  ${where.padEnd(46)} ${s.deep} deep route(s), anchor ${s.anchored ? 'declared' : 'MISSING'}`);
}

if (bad.length) {
  console.log('');
  for (const b of bad) {
    console.log(`  ${b.lay.replace(/\\/g, '/')} can be entered at ${b.deep.slice(0, 3).join(', ')}${b.deep.length > 3 ? ', …' : ''}`);
  }
  console.log("\n  add `export const unstable_settings = { anchor: 'index' };` to the layout.");
  console.log('  without it, back from a deep entry leaves the tab entirely and the stack');
  console.log('  keeps the deep screen, so the reader cannot get back to the list.');
}
console.log(bad.length ? '' : '\nevery nested stack that can be entered deep declares its anchor.\n');
process.exit(bad.length ? 1 : 0);
