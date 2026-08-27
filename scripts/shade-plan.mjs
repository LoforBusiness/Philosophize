// WHICH VIEW IN A FLAT SCENE SHOULD TAKE THE TONE.
//
//   node scripts/shade-plan.mjs                 every flat scene, with a proposal
//   node scripts/shade-plan.mjs aesthetics11    one scene, in full
//
// ── WHY THIS IS A PLANNER AND NOT A CODEMOD ─────────────────────────────────
//
// The tonal pass has already been tried automatically once, and the note it left
// behind is the reason this file exists: "Pick by rendering, not by size. An
// automatic 'tone the largest bordered box' pass picked answer cards (removing
// the white the tone needs to contrast with) and, in aesthetics10, a panel that
// spends most of the lesson hidden behind a shutter."
//
// Both failures are the same mistake — treating AREA as a proxy for STRUCTURE.
// So this ranks by what a box IS, using three things the source actually knows:
//
//  · ITS NAME. These scenes are written with semantic style keys — `slab`,
//    `plinth`, `wall`, `board`, `tower`, `frame` are the thing the lesson is
//    about; `card`, `chip`, `tab`, `label`, `pill`, `option` are the furniture
//    a reader answers with, and toning those removes the white that the tone
//    needs to contrast against.
//  · WHETHER IT IS AN ANSWER. A style used inside a `<Target>` is a control. It
//    never takes the tone, whatever it is called.
//  · WHETHER IT IS EVER HIDDEN. A style whose opacity is driven by a channel
//    spends part of the lesson invisible, which is the aesthetics10 trap.
//
// The recipe it proposes is T2 from docs/LESSON_RULES.md: the structural mass
// takes STONE, a secondary surface takes RULE, and whatever carries the MESSAGE
// stays PAPER. It is emphatically not "everything darker".
import fs from 'node:fs';
import path from 'node:path';

const CIN = path.join(process.cwd(), 'components', 'lesson', 'cinematic');
const ONLY = process.argv[2] || null;

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

// ── the vocabulary ──────────────────────────────────────────────────────────
//
// Read off the corpus rather than invented: these are the words these scenes
// actually use for each kind of thing.
const STRUCTURAL = /^(slab|plinth|wall|board|panel|tower|block|frame|table|desk|stage|floor|plate|screen|door|gate|box|case|shelf|column|pillar|base|body|hull|ship|cart|crate|bench|stone|tablet|rock|hill|mound|bank|room|house|roof|arch|bridge|track|road|rail|beam|post|fence|pen|field|vat|tank|jar|urn|pot|barrel|chest|cabinet|drawer|book|tome|ledger|scroll|charter|canvas|easel|curtain|shutter|lid|cover|sheet|page|paper|card)/i;
const FURNITURE = /(card|chip|tab|label|option|choice|pill|button|badge|caption|legend|key|tick|dot|mark|arrow|leader|rule|hair|line|axis|grid|scale|meter|bar$|track$)/i;

function stylesOf(src) {
  const out = new Map();
  const block = src.slice(src.indexOf('StyleSheet.create'));
  const re = /\n {2}(\w+):\s*\{([\s\S]*?)\n {2}\},/g;
  let m;
  while ((m = re.exec(block))) out.set(m[1], m[2]);
  // one-liners too
  const re2 = /\n {2}(\w+):\s*\{([^\n]*?)\},/g;
  while ((m = re2.exec(block))) if (!out.has(m[1])) out.set(m[1], m[2]);
  return out;
}

const num = (body, key) => {
  const m = new RegExp(`${key}:\\s*(-?[\\d.]+)`).exec(body);
  return m ? parseFloat(m[1]) : NaN;
};

function plan(name) {
  const raw = fs.readFileSync(path.join(CIN, `${name}Scene.tsx`), 'utf8');
  const src = strip(raw);
  const styles = stylesOf(src);

  // Which style keys sit inside a Target — those are controls, never toned.
  const inTarget = new Set();
  const tre = /<Target\b[\s\S]*?<\/Target>/g;
  let t;
  while ((t = tre.exec(src))) {
    for (const s of t[0].matchAll(/styles\.(\w+)/g)) inTarget.add(s[1]);
  }

  // Which style keys are driven by an animated opacity — the shutter trap.
  const faded = new Set();
  for (const s of src.matchAll(/styles\.(\w+),\s*(\w*[Ss]tyle)\]/g)) faded.add(s[1]);
  for (const s of src.matchAll(/\[styles\.(\w+),[^\]]*opacity/g)) faded.add(s[1]);

  const rows = [];
  for (const [key, body] of styles) {
    if (!/borderWidth:/.test(body)) continue;
    const w = num(body, 'width'), h = num(body, 'height');
    const area = Number.isNaN(w) || Number.isNaN(h) ? NaN : w * h;
    const bg = (/backgroundColor:\s*(\w+)/.exec(body) || [])[1] || '—';
    rows.push({
      key, area, bg,
      target: inTarget.has(key),
      faded: faded.has(key),
      structural: STRUCTURAL.test(key),
      furniture: FURNITURE.test(key),
    });
  }
  rows.sort((a, b) => (b.area || 0) - (a.area || 0));

  // THE PROPOSAL. A box earns the tone by being structural, not an answer, not
  // hidden, and currently PAPER — toning something already toned is a no-op, and
  // toning a control is the mistake the last pass made.
  const pick = rows.find((r) =>
    r.structural && !r.furniture && !r.target && !r.faded && (r.bg === 'PAPER' || r.bg === '—') && (r.area || 0) > 2000);
  const second = rows.find((r) =>
    r !== pick && !r.target && !r.faded && (r.bg === 'PAPER' || r.bg === '—') && (r.area || 0) > 1200);

  return { name, rows, pick, second };
}

const flat = [];
for (const f of fs.readdirSync(CIN).filter((n) => n.endsWith('Scene.tsx')).sort()) {
  const name = f.replace('Scene.tsx', '');
  if (ONLY && name !== ONLY) continue;
  const src = strip(fs.readFileSync(path.join(CIN, f), 'utf8'));
  const fills = new Set((src.slice(src.indexOf('StyleSheet.create')).match(/backgroundColor:\s*(\w+)/g) || [])
    .map((m) => m.split(/\s+/)[1]).filter((x) => /^(PAPER|RULE|STONE|SHADE|INK|SOFT)$/.test(x)));
  if (!ONLY && fills.size >= 3) continue;
  flat.push({ ...plan(name), fills: [...fills] });
}

if (ONLY) {
  const p = flat[0];
  if (!p) { console.log(`no scene ${ONLY}`); process.exit(1); }
  console.log(`\n${p.name} — fills now: ${p.fills.join(' ') || 'none'}\n`);
  console.log('  key                  area   bg      flags');
  console.log('  ' + '─'.repeat(56));
  for (const r of p.rows) {
    const flags = [r.structural && 'structural', r.furniture && 'furniture',
      r.target && 'ANSWER', r.faded && 'fades'].filter(Boolean).join(' ');
    console.log(`  ${r.key.padEnd(20)} ${String(Math.round(r.area) || '?').padStart(6)}  ${r.bg.padEnd(6)}  ${flags}`);
  }
  console.log(`\n  proposal: STONE → ${p.pick ? p.pick.key : '(nothing safe)'}` +
    (p.second ? ` · RULE → ${p.second.key}` : ''));
  console.log();
  process.exit(0);
}

console.log(`\n${flat.length} FLAT SCENES, AND WHAT EACH ONE'S STRUCTURE IS\n`);
let haveBoth = 0, havePick = 0, none = 0;
for (const p of flat) {
  const s = p.pick ? p.pick.key : null;
  const r2 = p.second ? p.second.key : null;
  if (s && r2) haveBoth++; else if (s) havePick++; else none++;
  console.log(`  ${p.name.padEnd(16)} ${String(p.fills.length)} fill  ` +
    `STONE → ${(s || '—').padEnd(14)} ${r2 ? 'RULE → ' + r2 : ''}`);
}
console.log(`\n  ${haveBoth} have both a mass and a second surface · ${havePick} have one · ${none} need a look\n`);
