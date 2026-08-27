// GIVE EVERY LESSON QUOTE THE THINKER IT CAME FROM.
//
//   node --import ./scripts/lib/register.mjs scripts/link-quote-thinkers.mjs --dry
//   node --import ./scripts/lib/register.mjs scripts/link-quote-thinkers.mjs
//
// The lesson deck used to draw its own bordered rectangle for a quotation while
// every other surface in the app used QuotePlate — the struck plate whose metal
// is the ERA the thinker wrote in. §19 recorded the deck as "the one surface not
// yet converted … a drop-in when that settles."
//
// It is a drop-in EXCEPT for one thing: QuotePlate takes its colour from
// `philosopherId` (via eraGroupOfId), and only 69 of 186 scripts carried one. The
// rest would fall back to the structural accent — a quote from Socrates in a
// lesson would NOT look like the same quote in his profile, which is the whole
// point of the change.
//
// So this matches each quote's `author` to a thinker and writes the id into the
// script. Explicit and checkable, rather than a runtime name lookup: a name is
// spelled several ways ("Laozi" / "Lao Tzu") and a lookup that silently misses
// gives a grey plate with nothing to tell anyone it failed.
import fs from 'node:fs';
import path from 'node:path';
import { ALL_PHILOSOPHERS } from '../data/philosophers.ts';

const DIR = 'components/lesson/cinematic';
const dry = process.argv.includes('--dry');

const norm = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();

/** name -> id, plus surname -> id where the surname is unambiguous. */
const byName = new Map();
const surCount = new Map();
for (const p of ALL_PHILOSOPHERS) {
  byName.set(norm(p.name), p.id);
  const parts = norm(p.name).split(' ');
  const sur = parts[parts.length - 1];
  surCount.set(sur, (surCount.get(sur) ?? 0) + 1);
}
const bySurname = new Map();
for (const p of ALL_PHILOSOPHERS) {
  const parts = norm(p.name).split(' ');
  const sur = parts[parts.length - 1];
  if (surCount.get(sur) === 1) bySurname.set(sur, p.id);
}

function resolve(author) {
  const n = norm(author);
  if (byName.has(n)) return byName.get(n);
  const parts = n.split(' ');
  const sur = parts[parts.length - 1];
  if (bySurname.has(sur)) return bySurname.get(sur);
  return null;
}

let added = 0, already = 0;
const unmatched = new Map();

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Script.ts'))) {
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf8');
  const before = src;

  // walk each `quote: {` block
  for (;;) {
    let moved = false;
    const re = /quote:\s*\{/g; let m;
    while ((m = re.exec(src))) {
      const open = src.indexOf('{', m.index);
      let d = 0, j = open;
      for (; j < src.length; j++) {
        if (src[j] === '{') d++;
        else if (src[j] === '}') { d--; if (d === 0) break; }
      }
      const block = src.slice(open, j + 1);
      if (/philosopherId\s*:/.test(block)) { already++; continue; }
      const auth = /author:\s*'((?:[^'\\]|\\.)*)'/.exec(block);
      if (!auth) continue;
      const name = auth[1].replace(/\\'/g, "'");
      const id = resolve(name);
      if (!id) {
        unmatched.set(name, (unmatched.get(name) ?? 0) + 1);
        continue;
      }
      // insert right after the author line, so the block still reads in order
      const at = open + auth.index + auth[0].length;
      const indent = /\n([ \t]*)author:/.exec(block)?.[1] ?? '      ';
      // THE COMMA GOES AFTER THE ID, NOT BEFORE IT. The first run put it before and
      // also consumed the author line's own comma, which left
      //     author: 'Nelson Goodman',
      //     philosopherId: 'nelson-goodman'
      //     work: 'Languages of Art',
      // in seventy-two files — a syntax error in every one, and one that reads as
      // perfectly ordinary until tsc says otherwise.
      src = src.slice(0, at) + ',\n' + indent + `philosopherId: '${id}',` + src.slice(at + 1);
      added++; moved = true;
      break;
    }
    if (!moved) break;
  }

  if (src !== before && !dry) fs.writeFileSync(p, src);
}

console.log('\nLINKING LESSON QUOTES TO THEIR THINKERS\n');
console.log('  ' + added + ' quote(s) given a philosopherId' + (dry ? ' (dry run)' : ''));
console.log('  ' + already + ' already had one');
if (unmatched.size) {
  console.log('\n  no thinker on record for these authors — they will take the');
  console.log('  structural accent, which is the one case where the colour says nothing:');
  for (const [n, c] of [...unmatched].sort((a, b) => b[1] - a[1])) console.log('      ' + String(c).padStart(2) + '  ' + n);
}
console.log('');
