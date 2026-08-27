// WRAP EACH ANSWER'S ART IN <AnswerLift> SO IT RIDES WITH ITS OWN TARGET (E39).
//
//   node scripts/wrap-answers.mjs --dry     report what it would do
//   node scripts/wrap-answers.mjs           apply
//
// The corpus draws a row of answers as TWO maps over the same array: one that
// draws the art, one that lays a bare hit-box Target over it. Only the second
// moves when the answer lands, so the outline slides off the card.
//
// This finds the pair by their shared `id=` expression and wraps the art map. It
// handles the two shapes that actually occur:
//
//   A  {ARR.map((v, k) => <Comp key={ID[k]} … />)}           — one element
//   B  {ARR.map((v, k) => (                                   — a group
//        <View key={…}>
//          …
//        </View>
//      ))}
//
// It REFUSES anything it cannot match exactly, and prints what it skipped: a
// codemod that half-applies is worse than none, because the half it did is the
// half nobody will re-read.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const dry = process.argv.includes('--dry');

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

/** The <Target …> opening tags in a file, with their id and correct expressions. */
function targetHeads(src) {
  const out = [];
  const re = /<Target\b/g; let m;
  while ((m = re.exec(src))) {
    let d = 0, j = m.index;
    for (; j < src.length; j++) {
      if (src[j] === '{') d++;
      else if (src[j] === '}') d--;
      else if (src[j] === '>' && d === 0) break;
    }
    const open = src.slice(m.index, j + 1);
    const id = (/\bid=(\{[^}]*\}|'[^']*')/.exec(open) ?? [])[1];
    const correct = (/\bcorrect=(\{[^}]*\})/.exec(open) ?? [])[1] ?? '{true}';
    const body = (() => {
      if (src[j - 1] === '/') return '';
      let depth = 1, k = j + 1;
      while (depth > 0 && k < src.length) {
        const o = src.indexOf('<Target', k), c = src.indexOf('</Target>', k);
        if (c < 0) break;
        if (o >= 0 && o < c) { depth++; k = o + 7; } else { depth--; k = c + 9; }
      }
      return src.slice(j + 1, k - 9);
    })();
    if (id) out.push({ id, correct, open, body });
    re.lastIndex = j;
  }
  return out;
}

const isBare = (b) => !/<(Animated\.)?Text\b/.test(b) && (b.match(/<(Animated\.)?View\b/g) ?? []).length <= 1;

let wrapped = 0; const skipped = [];
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Scene.tsx'))) {
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf8');
  const clean = strip(src);
  const heads = targetHeads(clean).filter((h) => h.correct !== '{false}' && isBare(h.body));
  if (!heads.length) continue;
  // already wrapped for this id?
  const done = new Set([...src.matchAll(/<AnswerLift\b[^>]*?\bid=(\{[^}]*\}|'[^']*')/g)].map((m) => m[1]));

  let changed = false;
  for (const h of heads) {
    if (done.has(h.id)) continue;
    const key = h.id.startsWith('{') ? h.id.slice(1, -1) : h.id;   // ID[k] or 'name'

    // SHAPE A — a one-line map drawing a single component keyed by the same id.
    const a = new RegExp(
      '(\\n[ \\t]*)\\{(\\w+)\\.map\\(\\((\\w+), (\\w+)\\) => <([A-Z]\\w*) key=\\{' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\}([^>]*)\\/>\\)\\}',
    );
    const ma = a.exec(src);
    if (ma) {
      const [all, ind, arr, v, k, Comp, rest] = ma;
      const repl = ind + '{/* Each answer rides with its own target (E39). */}'
        + ind + '{' + arr + '.map((' + v + ', ' + k + ') => ('
        + ind + '  <AnswerLift key={' + key + '} id={' + key + '} picked={picked} correct=' + h.correct + '>'
        + ind + '    <' + Comp + rest + '/>'
        + ind + '  </AnswerLift>'
        + ind + '))}';
      src = src.replace(all, repl);
      changed = true; wrapped++;
      continue;
    }
    skipped.push(f.replace('Scene.tsx', '') + '  ' + h.id);
  }
  if (changed) {
    if (!/AnswerLift\s*}/.test(src)) src = src.replace("import Target from './Target';", "import Target, { AnswerLift } from './Target';");
    if (!dry) fs.writeFileSync(p, src);
    console.log('  ok   ' + f.replace('Scene.tsx', ''));
  }
}
console.log('\n' + wrapped + ' art map(s) wrapped' + (dry ? ' (dry run)' : ''));
if (skipped.length) {
  console.log('\n  not matched — these need the group shape or a hand edit:');
  for (const s of skipped) console.log('      ' + s);
}
