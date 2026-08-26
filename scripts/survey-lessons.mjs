// WHICH LESSONS ARE HARD TO READ, AND WHICH ONES DRAW BOXES INSTEAD OF THINGS.
//
//   node scripts/survey-lessons.mjs            the whole corpus, worst first
//   node scripts/survey-lessons.mjs metaphysics31   one lesson, in full
//
// ── WHY THIS IS A SURVEY AND NOT A CHECK ────────────────────────────────────
//
// A reader said two things at once: "a lot of it is very cryptic and very
// difficult to understand", and — of the cheese in metaphysics31 — "nothing
// looks like cheese ... if it is supposed to look like cheese, it needs to
// actually look like cheese".
//
// Neither is a rule that can be ratcheted. `check-words` already holds sentence
// length, beat length and reading density, and it PASSES on the very lesson the
// complaint was about: "Drag to how well just say perforated actually works" is
// nine words with no long ones. Nothing counted can tell you that sentence is
// broken English, and nothing counted can tell you a rounded rectangle with five
// horizontal rules is not cheese.
//
// So this ranks rather than judges. It finds the cells worth looking at, the way
// the rank and badge contact sheets do, and a person decides. Every number below
// is a PROXY and is labelled as one.
//
// ── THE TWO SCORES ──────────────────────────────────────────────────────────
//
// TEXT. Flesch reading ease per piece, plus three structural things that reading
// ease cannot see: a term the lesson uses without ever introducing it, a prompt
// that does not parse as an instruction, and a demonstrative with nothing to
// point at.
//
// PICTURE. What the scene is BUILT OUT OF. A scene assembled entirely from
// bordered rectangles and circles is the cheese defect in general form: the
// shapes carry no information, so every object in the lesson looks like every
// other object in every other lesson. Drawn paths, distinct tones and per-object
// silhouettes are what political7 has and the flat ones do not.
import fs from 'node:fs';
import path from 'node:path';

const REPO = process.cwd();
const CIN = path.join(REPO, 'components', 'lesson', 'cinematic');
const ONLY = process.argv[2] || null;

// ── pulling the reader-facing strings out of a script ───────────────────────
//
// The same extraction check-words uses: scripts are data, so the source is read
// rather than imported. Comments go first, for the reason §17's L8 gives — a
// comment quoting the line it explains is indistinguishable from the line.
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

function beatsOf(src) {
  const body = strip(src);
  // THE ARRAY'S OPENING BRACKET, NOT THE TYPE'S. Every script declares
  // `export const BEATS: Meta31Beat[] = [`, so the first `[` after the word
  // BEATS belongs to `Beat[]` — and the `]` a character later ended the walk at
  // depth 0 before a single beat had been read. It reported zero findings across
  // the whole corpus and looked exactly like a clean sweep, which is the failure
  // §21 records four separate harnesses making.
  const m = /BEATS[^=]*=\s*\[/.exec(body);
  if (!m) return [];
  const out = [];
  let depth = 0, start = -1;
  for (let k = m.index + m[0].length - 1; k < body.length; k++) {
    const c = body[k];
    if (c === '{') { if (depth === 0) start = k; depth++; }
    else if (c === '}') { depth--; if (depth === 0 && start >= 0) { out.push(body.slice(start, k + 1)); start = -1; } }
    else if (c === ']' && depth === 0) break;
  }
  return out;
}

/** Every `key: 'value'` string in a block, as [key, text] pairs. */
function fields(block) {
  const out = [];
  const re = /(\w+):\s*(['"`])((?:\\.|(?!\2)[^\\])*)\2/g;
  let m;
  while ((m = re.exec(block))) {
    const v = m[3].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, ' ');
    if (v.length > 1) out.push([m[1], v]);
  }
  return out;
}

// Only what the reader actually reads. `id`, `cite` and the like are furniture.
const READ_KEYS = new Set(['text', 'prompt', 'explain', 'reads', 'lo', 'hi', 'closing', 'title']);

// ── reading ease ────────────────────────────────────────────────────────────
const SYL = (w) => {
  const s = w.toLowerCase().replace(/[^a-z]/g, '');
  if (!s) return 0;
  if (s.length <= 3) return 1;
  const v = s.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g);
  return v ? v.length : 1;
};
const words = (t) => t.replace(/[—–]/g, ' ').split(/\s+/).filter((w) => /[a-z]/i.test(w));
const sentences = (t) => t.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

/** Flesch reading ease. Under 50 is heavy going; J10 asks for 55. */
function ease(t) {
  const w = words(t), s = sentences(t);
  if (!w.length || !s.length) return 100;
  const syl = w.reduce((a, x) => a + SYL(x), 0);
  return 206.835 - 1.015 * (w.length / s.length) - 84.6 * (syl / w.length);
}

// ── C1 · a term the lesson never introduces ─────────────────────────────────
//
// "perforated" first appears inside a drag zone in metaphysics31 and is never
// said before it. The reader meets a word doing load-bearing work in a question
// they have to answer, having never been shown what it means.
//
// Only uncommon words count, and only when they turn up FIRST in something the
// reader is being asked to act on rather than in the narration that teaches.
// A CURATED LIST, NOT A HEURISTIC. The first draft flagged any uncommon word of
// eight letters or more and reported six to eight "untaught" terms per lesson --
// "observation", "open-minded", "judgement", "tolerate". Those are ordinary
// English, and the noise buried the real hits completely. What actually costs a
// reader is a TECHNICAL term doing load-bearing work in a question, having never
// been said in the narration that was supposed to teach it.
const TERMS = `a-priori a-posteriori akrasia analytic antinomy apriori categorical
compatibilism consequentialism contingent cosmological deontology determinism dialectic
dualism empiricism epistemic epistemology eudaimonia existentialism fallibilist falsifiable
hedonism idealism immaterial induction inductive instrumental intuitionism materialism
metaphysical naturalism nihilism noumenal ontological paradigm perforated phenomenal
phenomenology pluralism positivism pragmatism proposition qualia quantify rationalist
reductionism relativism scepticism skepticism solipsism supervene supervenience syllogism
teleological transcendental utilitarian utilitarianism veridical`.split(/\s+/);

const isJargon = (w) => {
  const t = w.toLowerCase().replace(/[^a-z-]/g, '');
  return t.length >= 6 && TERMS.some((k) => t === k || t === k + 's' || t.startsWith(k));
};

// ── C2 · a prompt that does not parse as an instruction ─────────────────────
//
// Derived from the corpus rather than invented. Every control's prompt is an
// instruction, and the house shapes are "Drag to X" / "Set X" / "Tap X" /
// "Which X" / "Put X". What "Drag to how well just say perforated actually
// works" does is bolt an embedded question straight onto a preposition, which no
// other prompt in the corpus does and which no reader can parse in one pass.
const BROKEN_PROMPT = [
  // A NAMED MOVE USED AS A NOUN, WITH NO QUOTATION MARKS AROUND IT. This is the
  // one real hit in the corpus, and the specificity is the point: 35 of the 36
  // "Drag to ..." prompts read perfectly, so "Drag to how" is house style rather
  // than a defect. What breaks is "Drag to how well just say perforated actually
  // works" -- the phrase `just say perforated` is a MOVE somebody makes, quoted
  // in speech and unquoted on the page, so the sentence arrives carrying two
  // finite verbs and no way to tell which one is the main one.
  /(?:just|simply|merely)\s+(?:say|call|treat|count|deny)/i,
];

// ── C3 · a demonstrative with nothing to point at ───────────────────────────
//
// An explanation opening on "This is why" or "That is the trap" after the reader
// has just tapped one of several things names nothing — the same defect J9
// records for a stale option letter, one part of speech along.
const DANGLING = /^(?:This|That|These|Those|It)\b(?!\s+(?:is|was)\s+(?:the\s+)?(?:rim|gap|cheese))/;

// ── the picture ─────────────────────────────────────────────────────────────
//
// WHAT IS THE SCENE MADE OF. A `borderRadius` on a View is a rounded box; an
// `<Svg><Path>` is a drawing. political7 draws; the flat ones stack boxes.
function pictureOf(src) {
  const body = strip(src);
  const styleBlock = body.slice(body.indexOf('StyleSheet.create'));
  return {
    // Real drawing: path data with actual curves in it.
    paths: (body.match(/<Path\b/g) || []).length,
    curves: (body.match(/[dD]="[^"]*[CQAScqas][^"]*"/g) || []).length,
    // Boxes and discs — the generic vocabulary.
    boxes: (styleBlock.match(/borderWidth:/g) || []).length,
    radii: (styleBlock.match(/borderRadius:/g) || []).length,
    // Tonal masses, the axis the other half of this work is already on.
    tones: new Set((styleBlock.match(/backgroundColor:\s*(\w+)/g) || []).map((m) => m.split(/\s+/)[1]))
      .size,
    // How many separately-named things the scene draws at all.
    parts: new Set((styleBlock.match(/^\s{2}(\w+):\s*\{/gm) || []).map((m) => m.trim())).size,
  };
}

// ── run ─────────────────────────────────────────────────────────────────────
const rows = [];
for (const f of fs.readdirSync(CIN).filter((n) => n.endsWith('Script.ts')).sort()) {
  const name = f.replace('Script.ts', '');
  if (ONLY && name !== ONLY) continue;
  const src = fs.readFileSync(path.join(CIN, f), 'utf8');
  const scenePath = path.join(CIN, `${name}Scene.tsx`);
  const scene = fs.existsSync(scenePath) ? fs.readFileSync(scenePath, 'utf8') : '';

  const pieces = [];
  const narration = [];
  for (const b of beatsOf(src)) {
    const isQuote = /^\s*quote:\s*\{/m.test(b);
    for (const [k, v] of fields(b)) {
      if (!READ_KEYS.has(k)) continue;
      if (isQuote && k === 'text') continue;      // a quotation is exempt (J-note)
      pieces.push({ kind: k, text: v });
      if (k === 'text') narration.push(v);
    }
  }
  if (!pieces.length) continue;

  const taught = narration.join(' ').toLowerCase();
  const findings = [];

  for (const p of pieces) {
    const e = ease(p.text);
    if (e < 45 && words(p.text).length >= 8) {
      findings.push({ why: 'HEAVY', n: Math.round(e), kind: p.kind, text: p.text });
    }
    if (p.kind === 'prompt' && BROKEN_PROMPT.some((r) => r.test(p.text))) {
      findings.push({ why: 'BROKEN', n: 0, kind: p.kind, text: p.text });
    }
    if (p.kind === 'explain' && DANGLING.test(p.text)) {
      findings.push({ why: 'DANGLES', n: 0, kind: p.kind, text: p.text });
    }
    // A jargon word introduced inside something the reader must ACT on.
    if (p.kind !== 'text') {
      for (const w of words(p.text)) {
        if (!isJargon(w)) continue;
        const bare = w.toLowerCase().replace(/[^a-z-]/g, '');
        if (taught.includes(bare.slice(0, Math.max(6, bare.length - 3)))) continue;
        findings.push({ why: 'UNTAUGHT', n: 0, kind: p.kind, text: `“${bare}” — ${p.text}` });
        break;
      }
    }
  }

  const eases = pieces.map((p) => ease(p.text));
  const pic = pictureOf(scene);
  // A blunt proxy, and it is meant to be blunt: how much of the drawing is boxes.
  const boxy = pic.paths === 0 ? pic.boxes + pic.radii : 0;

  rows.push({
    name,
    medianEase: Math.round(eases.slice().sort((a, b) => a - b)[Math.floor(eases.length / 2)]),
    worstEase: Math.round(Math.min(...eases)),
    findings,
    pic,
    boxy,
  });
}

if (ONLY) {
  const r = rows[0];
  if (!r) { console.log(`no script for ${ONLY}`); process.exit(1); }
  console.log(`\n${r.name} — median ease ${r.medianEase}, worst ${r.worstEase}`);
  console.log(`  drawing: ${r.pic.paths} paths (${r.pic.curves} curved) · ${r.pic.boxes} bordered boxes · ` +
    `${r.pic.radii} rounded · ${r.pic.tones} tones · ${r.pic.parts} named parts\n`);
  for (const f of r.findings) {
    console.log(`  ${f.why.padEnd(9)}${f.kind.padEnd(9)}${f.n ? 'ease ' + f.n + '  ' : ''}${f.text}`);
  }
  console.log();
  process.exit(0);
}

console.log('\nWHAT A READER MEETS, WORST FIRST\n');

// ── the text ────────────────────────────────────────────────────────────────
const byText = rows.slice().sort((a, b) => b.findings.length - a.findings.length || a.medianEase - b.medianEase);
const totalFindings = rows.reduce((a, r) => a + r.findings.length, 0);
console.log(`  ${rows.length} lessons · ${totalFindings} pieces of text worth re-reading\n`);
// EVERY FINDING IN FULL, when asked for it. The ranking says which lessons to
// look at; only the text itself says what is wrong with them, and 37 pieces is
// small enough to read end to end.
if (process.env.SURVEY_ALL) {
  for (const r of byText) {
    if (!r.findings.length) continue;
    console.log(`\n  ${r.name}`);
    for (const f of r.findings) {
      console.log(`    ${f.why.padEnd(9)}${f.kind.padEnd(8)}${f.n ? 'ease ' + f.n : ''}`);
      console.log(`      ${f.text}`);
    }
  }
  console.log();
  process.exit(0);
}

console.log('  the twenty hardest to read\n');
for (const r of byText.slice(0, 20)) {
  const kinds = {};
  for (const f of r.findings) kinds[f.why] = (kinds[f.why] || 0) + 1;
  const tags = Object.entries(kinds).map(([k, n]) => `${n} ${k.toLowerCase()}`).join(' · ');
  console.log(`  ${r.name.padEnd(16)} ease ${String(r.medianEase).padStart(3)} (worst ${String(r.worstEase).padStart(3)})  ${tags}`);
}

// ── the picture ─────────────────────────────────────────────────────────────
const flat = rows.filter((r) => r.pic.paths === 0).sort((a, b) => b.boxy - a.boxy);
console.log(`\n  ${flat.length} of ${rows.length} scenes draw NO path at all — every object is a box or a disc\n`);
console.log('  the twenty most box-built\n');
for (const r of flat.slice(0, 20)) {
  console.log(`  ${r.name.padEnd(16)} ${String(r.pic.boxes).padStart(3)} bordered · ${String(r.pic.radii).padStart(3)} rounded · ` +
    `${r.pic.tones} tones · ${r.pic.parts} parts`);
}

const drawn = rows.filter((r) => r.pic.paths > 0).sort((a, b) => b.pic.curves - a.pic.curves);
console.log('\n  and the ones that actually draw (the standard to match)\n');
for (const r of drawn.slice(0, 10)) {
  console.log(`  ${r.name.padEnd(16)} ${String(r.pic.paths).padStart(3)} paths · ${String(r.pic.curves).padStart(3)} curved · ` +
    `${r.pic.tones} tones · ${r.pic.parts} parts`);
}
console.log();
