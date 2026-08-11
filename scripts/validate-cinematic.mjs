// Structural check for CINEMATIC lessons — the group-H rules in docs/LESSON_RULES.md.
// Sibling of validate-lessons.mjs, which does the same job for the card decks.
//
// These are the rules that are arithmetic, and the rule book's own policy is that
// arithmetic belongs in a check rather than in a sentence somebody has to remember:
//
//   H52  7–11 beats · exactly 1 quote · exactly 1 summary and it is last ·
//        the quote is not the hook, not a question beat, not last
//   H53  exactly two GRADED questions (mc + interact); extra interaction is a `tap`
//   H59  a band is declared, its bottom is the ground line + a little, and its
//        height has not quietly grown past the point where it costs on-screen size
//   H60  no scene declares a colour of its own
//   H63  no XP figure is typed into a string
//
// Run: node scripts/validate-cinematic.mjs
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'components', 'lesson', 'cinematic');

// The two lessons that predate the shared player carry their own copy of it, so they
// are exempt from the beat-shape rules (they are 26 and 14 beats of hand-built acts).
const LEGACY = new Set(['argument', 'builder']);

const problems = [];
const warnings = [];
const bands = [];
const cameras = [];
/** How many of each camera verb the 96 followMoves lessons actually deal. */
const verbs = {};

// checkShots comes out of the SAME module the player uses, transpiled rather than
// reimplemented here. camera.ts is deliberately import-free so stripping the types
// is enough to run it — and a checker carrying its own copy of the rule would drift
// from the rule the moment either changed, which is worse than no checker.
const tsc = (await import('typescript')).default;
const camExports = {};
new Function(
  'exports',
  tsc.transpileModule(
    fs.readFileSync(path.join(DIR, 'camera.ts'), 'utf8'),
    { compilerOptions: { module: tsc.ModuleKind.CommonJS, target: tsc.ScriptTarget.ES2020 } }
  ).outputText
)(camExports);
const { checkShots, resolveMoves, followMoves, kindOf, seedOf } = camExports;
// I70: scenes whose answer targets are not marked as tappable. CLOSED — every
// one of the 102 is wrapped in <Target> or carries a <TargetRing>, so this is a
// hard zero rather than a budget, and a new lesson that forgets fails the build.
const UNRINGED_BUDGET = 0;
const unringed = [];
let ok = 0;

/** Split a BEATS array into its top-level beat objects. Crude but stable: every
 *  script in the directory is formatted with each beat opening on `  {`. */
function beatsOf(src) {
  return src.split('\n  {\n').slice(1).map((chunk) => chunk.split('\n  }')[0]);
}

// ── scripts ───────────────────────────────────────────────────────────────────
for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('Script.ts')).sort()) {
  const name = f.replace('Script.ts', '');
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const beats = beatsOf(src);
  const errs = [];
  const warns = [];

  const has = (b, key) => new RegExp(`^\\s{4}${key}:\\s*\\{`, 'm').test(b);
  const idxOf = (key) => beats.map((b, i) => (has(b, key) ? i : -1)).filter((i) => i >= 0);

  const graded = beats
    .map((b, i) => (has(b, 'mc') || has(b, 'interact') ? i : -1))
    .filter((i) => i >= 0);
  const quotes = idxOf('quote');
  const summaries = idxOf('summary');
  const n = beats.length;

  if (!LEGACY.has(name)) {
    if (n < 7 || n > 11) errs.push(`${n} beats (H52 wants 7–11, 8 is the house length)`);
    if (quotes.length !== 1) errs.push(`${quotes.length} quote beats, want exactly 1 (H52)`);
    if (quotes.length === 1) {
      const q = quotes[0];
      if (q === 0) errs.push('the quote is on the hook beat (H52)');
      if (q === n - 1) errs.push('the quote is the last beat (H52)');
      if (graded.includes(q)) errs.push(`the quote shares beat ${q} with a graded question (H52, D27)`);
    }
  }

  if (summaries.length !== 1) errs.push(`${summaries.length} summary beats, want exactly 1 (H52)`);
  else if (summaries[0] !== n - 1) errs.push(`the summary is beat ${summaries[0]} of ${n - 1}, must be last (H52)`);

  if (graded.length !== 2) {
    errs.push(
      `${graded.length} graded questions, want exactly 2 — a lesson pays ` +
        `${25 + graded.length * 10 + 15} XP instead of 60 (H53). An extra interaction is a \`tap\`.`,
    );
  }

  // Every beat must carry `dur`, because BaseBeat requires it — but flag nothing about
  // its VALUE: nothing reads it (H55).
  const durless = beats.filter((b) => !/^\s{4}dur:/m.test(b)).length;
  if (durless) errs.push(`${durless} beat(s) with no \`dur\` (the type requires one; H55)`);

  // D27 — THE DECK IS overflow:hidden AND FIXED. The answered state (prompt + pick +
  // explanation) is the tallest it ever gets, and an explanation past the bottom is
  // simply not readable. 290 is not a taste call: it is the longest explanation among
  // the 48 lessons that have been seen on a real phone, so anything at or under it is
  // safe by precedent. Six new lessons came in at a median of 327 and a max of 403 —
  // nine of twelve longer than ANY existing one — which is exactly the sort of drift
  // nobody notices while writing.
  for (const m of src.matchAll(/^\s*explain:\s*$\n\s*'(.*)',$/gm)) {
    if (m[1].length > 290) errs.push(`an explanation is ${m[1].length} chars; the deck holds ~290 (D27)`);
  }
  for (const m of src.matchAll(/^\s*explain: '(.*)',$/gm)) {
    if (m[1].length > 290) errs.push(`an explanation is ${m[1].length} chars; the deck holds ~290 (D27)`);
  }

  if (errs.length) problems.push([f, errs]);
  else ok++;
  if (warns.length) warnings.push([f, warns]);
}

// ── scenes ────────────────────────────────────────────────────────────────────
for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('Scene.tsx')).sort()) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const errs = [];
  const warns = [];

  // H60 — the only colours are the four in cinematicKit.
  const hexes = [...new Set(src.match(/#[0-9A-Fa-f]{3,8}\b/g) ?? [])];
  if (hexes.length) errs.push(`declares its own colour(s) ${hexes.join(', ')} — use INK/PAPER/SOFT/RULE (H60)`);

  // H63 — no XP figure typed into a string.
  const xp = src.match(/\+\s?\d+\s?XP/g);
  if (xp) errs.push(`hard-coded XP text ${[...new Set(xp)].join(', ')} — derive it from constants/xp (H63)`);

  // I70 — AN ANSWER TARGET MUST BE A <Target>, so it is visibly a button.
  //
  // 82 of the 102 lessons answer their question by having the reader tap the
  // picture, and the targets used to be drawn exactly like the scenery: measured
  // across all of them, 69 prompts said "tap" and only 13 named something you
  // could see. The reader knew a tap was wanted and could not tell what was
  // tappable. Target.tsx puts a breathing ink ring on every one and counts itself
  // so the panel can say how many there are — but only for scenes that USE it, so
  // this is the half that cannot be left to memory.
  //
  // This landed as a debt ratchet with six scenes outstanding — the ones holding
  // their targets in something other than a plain Pressable, which the codemod
  // could not convert. All six are done, so UNRINGED_BUDGET is 0 and this is a
  // hard rule again. Do not reopen it: a scene that answers by tapping and has no
  // ring is a scene where the reader cannot tell what to press.
  if (/onPick\(/.test(src) && !/from '\.\/Target'/.test(src)) unringed.push(f);

  // H59 — the band. A scene with a CAMERA is exempt from the bottom rule, because
  // D25 requires its band be measured after the transform — ethicsScene's ground line
  // legitimately lands at screen y 322 under a 1.14 zoom. Anything else with a bottom
  // away from the ground line has simply mis-measured.
  const hasCamera = /transform:\s*\[[^\]]*\{\s*scale:/.test(src);
  const band = src.match(/band=\{\[(\d+),\s*(\d+)\]\}/);
  if (!band) {
    errs.push('no band declared — the lesson renders letterboxed at 1.15× (H59, D25)');
  } else {
    const [t, b] = [+band[1], +band[2]];
    bands.push({ f, h: b - t });
    if (b < 500 || b > 525) {
      if (hasCamera) {
        warns.push(`band bottom ${b} is off the ground line, which is right IF it was measured after the camera — say so in the header (D25, A5)`);
      } else {
        errs.push(`band bottom ${b} — the ground line is 500 and this scene has no camera, so it belongs in 508–518 (H59)`);
      }
    }
  }

  // THE CAMERA, CHECKED RATHER THAN TRUSTED.
  //
  // checkShots has existed since the first lesson got a camera and nothing ever
  // ran it — it was a function you were meant to remember to call from a scratch
  // script. On the one lesson that has a shot list, four of the first eleven shots
  // were illegal, so "remember to call it" is not a control.
  //
  // Hand-written lists stay legal; resolveMoves just makes them unnecessary. Either
  // way, the numbers that actually reach the player are checked here.
  const shotBlock = src.match(/const SHOTS: Shot\[\] = \[([\s\S]*?)\n\];/);
  if (shotBlock && band) {
    const shots = [...shotBlock[1].matchAll(
      /\{\s*cx:\s*(-?[\d.]+),\s*cy:\s*(-?[\d.]+),\s*s:\s*(-?[\d.]+)(?:,\s*tr:\s*(-?[\d.]+))?/g
    )].map((m) => ({ cx: +m[1], cy: +m[2], s: +m[3], ...(m[4] !== undefined ? { tr: +m[4] } : {}) }));
    if (!shots.length) {
      warns.push('a SHOTS list is declared but none of it parsed — the camera check did not run');
    } else {
      const groundM = src.match(/ground(?:Line)?\s*[=:]\s*(\d+)/);
      for (const p of checkShots(shots, [+band[1], +band[2]], groundM ? +groundM[1] : undefined)) {
        errs.push(`camera: ${p}`);
      }
      cameras.push({ f, n: shots.length });
    }
  }

  // …AND THE ONES WRITTEN AS VERBS, which is nearly all of them.
  //
  // A lesson using `followMoves` has no numbers in it to read — that is the whole
  // point — so the checker has to do what the player does: resolve the moves
  // against this lesson's band and check the result. Without this the summary line
  // said "1 of 100 lessons move it" while 44 did, and every one of those 44 was
  // unchecked. A camera check that silently covers 2% of the cameras is worse than
  // none, because it reads like coverage.
  if (/camera=\{CAM\}/.test(src) && band) {
    const scriptPath = path.join(DIR, `${f.replace('Scene.tsx', '')}Script.ts`);
    // The default is usually a literal but three scenes name it (VIEW_X, FIG_NEAR,
    // FIG_B), so follow the constant rather than declining to check those lessons.
    // "It did not parse" must never be a quiet way of meaning "it passed".
    const xRaw = src.match(/const X = BEATS\.map\(\(b\) => b\.x \?\? ([A-Za-z_$][\w$]*|-?[\d.]+)\)/)?.[1];
    let xDef = Number(xRaw);
    if (xRaw && Number.isNaN(xDef)) {
      const named = src.match(new RegExp(`const ${xRaw}\\s*=\\s*(-?[\\d.]+)`));
      if (named) xDef = +named[1];
    }
    if (!fs.existsSync(scriptPath) || Number.isNaN(xDef)) {
      warns.push('uses camera={CAM} but its x track or script could not be read — the camera went unchecked');
    } else {
      const chunks = beatsOf(fs.readFileSync(scriptPath, 'utf8'));
      // `x:` IS NOT THE FIRST KEY ON ITS LINE, AND NEVER WAS.
      //
      // This read /^\s{4}x:/m — x as the opening key of a beat. Every script in the
      // repo writes its staging keys on one line, `p: 25, x: 200,`, so the pattern
      // matched nothing in any of 96 lessons and every beat silently fell back to
      // xDef. The camera was therefore resolved against a figure who never moved:
      // 44 lessons have a track that varies, 42 of them got different shots than
      // the ones checked here, and 149 individual shots were never checked as they
      // actually are. The `to`, `drift` and `whip` verbs — 113 moves, every one of
      // them a camera CHASING something — could not be reached at all, so the half
      // of followMoves that exists to follow a walk was tested by nothing.
      //
      // The same shape as the validate-worklets blind spot (§17 rule 2): a matcher
      // that reads a narrower thing than the one it names, passing green forever.
      // Hence the parse guard below — silence must not be able to mean "still".
      const xKey = /(?:^\s{4}|[,{]\s*)x:\s*(-?[\d.]+)/m;
      const unread = [];
      const xs = chunks.map((c, bi) => {
        const m = c.match(xKey);
        if (m) return +m[1];
        // The beat carries an x this pattern could not read. That is a broken
        // checker, not a stationary figure, and it must say so.
        if (/(?:^|[^\w$])x:/m.test(c)) unread.push(bi);
        return xDef;
      });
      if (unread.length) {
        errs.push(`camera: beat(s) ${unread.join(', ')} carry an x: the checker could not read — the shot list was resolved against the wrong figure`);
      }
      const kinds = chunks.map((c) => kindOf({
        summary: /^\s{4}summary:/m.test(c) || undefined,
        quote: /^\s{4}quote:/m.test(c) || undefined,
        mc: /^\s{4}mc:/m.test(c) || undefined,
        interact: /^\s{4}interact:/m.test(c) || undefined,
      }));
      const seedM = src.match(/seedOf\('([^']+)'\)/);
      // THE GROUND THE PLAYER WILL USE, not a number that resembles it.
      //
      // This passed a literal 500 while CinematicPlayer passed its `ground` prop,
      // which no scene sets — so the player resolved with `undefined` and skipped
      // fit()'s ground clamp entirely, and the checker resolved WITH it. The
      // checker was therefore validating a safer camera than the one that ships:
      // ethicsScene had three beats whose frame ended up to 37 units above the
      // ground line, the figure standing on nothing, and this file called it clean.
      // The player now defaults to GROUND for the same reason this line reads it.
      const groundProp = src.match(/ground=\{(\d+)\}/);
      const g = groundProp ? +groundProp[1] : 500;
      const moves = followMoves(xs, kinds, seedOf(seedM ? seedM[1] : ''), g);
      const resolved = resolveMoves(moves, [+band[1], +band[2]], g);
      for (const m of moves) verbs[m.k] = (verbs[m.k] ?? 0) + 1;
      for (const p of checkShots(resolved, [+band[1], +band[2]], g)) errs.push(`camera: ${p}`);
      // A tap must not have to survive a camera offset to land on what it aimed at.
      kinds.forEach((k, bi) => {
        if (k === 'question' && resolved[bi] && resolved[bi].s > 1.001) {
          errs.push(`camera: graded beat ${bi} sits at scale ${resolved[bi].s.toFixed(2)} — answer targets are Pressables and must be at 1`);
        }
      });

      // ── AND THE FIGURE HAS TO BE IN IT ────────────────────────────────────
      //
      // The other half of H60b's rule: what the reader must SEE has to be inside
      // the shot. Questions are covered above (forced to scale 1) and a quote's
      // words are safe by construction — the deck sits OUTSIDE camStyle, so no
      // push can crop them. What a close push can lose is the thing every one of
      // these lessons is actually about: the man.
      //
      // `followMoves` pushes to 'close' on quotes and on one still beat in three,
      // and those shots were only ever checked for being legal against the band —
      // which says nothing about whether the figure survived them. He stands at
      // the x track, ~103 tall at K_FIG 1 with his feet on the ground line, and he
      // has to be inside the visible window on every beat, head included.
      const FIG_TOP = g - 103, FIG_BOT = g;
      resolved.forEach((sh, bi) => {
        if (!sh) return;
        const hw = (400 / 2) / sh.s, hh = (560 / 2) / sh.s;
        const fx = xs[bi];
        const off = [];
        if (fx < sh.cx - hw || fx > sh.cx + hw) off.push(`x ${fx} outside ${(sh.cx - hw).toFixed(0)}…${(sh.cx + hw).toFixed(0)}`);
        if (FIG_TOP < sh.cy - hh) off.push(`head above the window by ${(sh.cy - hh - FIG_TOP).toFixed(0)}`);
        if (FIG_BOT > sh.cy + hh) off.push(`feet below the window by ${(FIG_BOT - sh.cy - hh).toFixed(0)}`);
        if (off.length) {
          errs.push(`camera: beat ${bi} at scale ${sh.s.toFixed(2)} cuts the figure — ${off.join(' · ')}`);
        }
      });
      cameras.push({ f, n: resolved.length });
    }
  }

  if (errs.length) problems.push([f, errs]);
  else ok++;
  if (warns.length) warnings.push([f, warns]);
}

// ── the balance, and the one-way ratchet ──────────────────────────────────────
// THE DIRECTION IS ONE-WAY. Cinematic lessons are replacing the card decks, not
// sitting beside them — so no new card-only lesson is ever written, and existing
// ones get converted branch by branch until there are none left. That is a policy
// nobody can be expected to remember three months from now, so it is counted here:
//
//   · every branch carries the SAME lesson count and the SAME cinematic count
//     (§5). Level, or it shows on the Learn cards.
//   · CARD_BUDGET is a high-water mark that may only ever go DOWN. Converting a
//     lesson lowers it; adding a card-only lesson raises it and fails here. When
//     it reaches 0 the takeover is done and this whole block can go.
//   · SOLID_FLOOR is the second ratchet, and the one that enforces READING ORDER:
//     the combined length of the unbroken cinematic run at the FRONT of each
//     branch. It may only go UP. Converting a lesson from behind the frontier
//     lowers CARD_BUDGET without moving this, and the check says so.
const CARD_BUDGET = 90;
const SOLID_FLOOR = 79;

const ROUTE = path.join(
  process.cwd(), 'app', '(app)', 'branches', '[branchSlug]', '[pathSlug]', 'lesson', '[lessonId].tsx',
);
const routeSrc = fs.readFileSync(ROUTE, 'utf8');
const mapBody = routeSrc.split('const CINEMATIC')[1]?.split('\n};')[0] ?? '';
const wired = new Set([...mapBody.matchAll(/'([a-z-]+-[a-z]+-\d+)':/g)].map((m) => m[1]));

const BRANCHES = path.join(process.cwd(), 'data', 'branches');
const tally = [];
for (const branch of fs.readdirSync(BRANCHES).sort()) {
  const paths = path.join(BRANCHES, branch, 'paths');
  if (!fs.existsSync(paths)) continue;
  // READING ORDER comes out of the unit index, not the directory listing — the
  // filesystem is alphabetical and the reader is not.
  const unitDir = fs.readdirSync(paths)[0];
  const idx = fs.readFileSync(path.join(paths, unitDir, 'index.ts'), 'utf8');
  const imports = {};
  for (const m of idx.matchAll(/^import (\w+) from '\.\/lessons\/([^']+)';/gm)) imports[m[1]] = m[2];
  const order = [...idx.matchAll(/lessons: \[([^\]]*)\]/g)]
    .flatMap((m) => m[1].split(',').map((s) => s.trim()).filter(Boolean));

  let lessons = 0, cine = 0, solid = 0, frontier = null;
  for (const name of order) {
    const file = path.join(paths, unitDir, 'lessons', `${imports[name]}.ts`);
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    const id = src.match(/^ {2}id: '([^']+)',/m)?.[1];
    if (!id) continue;
    lessons++;
    if (wired.has(id)) {
      cine++;
      if (frontier === null) solid++;
    } else if (frontier === null) {
      // The title comes out of SOURCE, so its escapes arrive as two characters.
      const title = (src.match(/^ {2}title: '(.*)',/m)?.[1] ?? '').replace(/\\'/g, "'");
      frontier = `${id}  ${title}`;
    }
  }
  tally.push({ branch, lessons, cine, solid, frontier });
}

if (tally.length) {
  const errs = [];
  const nL = [...new Set(tally.map((t) => t.lessons))];
  const nC = [...new Set(tally.map((t) => t.cine))];
  const show = (key) => tally.map((t) => `${t.branch} ${t[key]}`).join(' · ');
  if (nL.length !== 1) errs.push(`branches hold different lesson counts — ${show('lessons')} (§5)`);
  if (nC.length !== 1) errs.push(`branches hold different cinematic counts — ${show('cine')} (§5)`);

  const cards = tally.reduce((a, t) => a + t.lessons - t.cine, 0);
  if (cards > CARD_BUDGET) {
    errs.push(
      `${cards} card-only lessons, up from ${CARD_BUDGET}. The direction is one-way: ` +
        'a NEW lesson is always cinematic, and this number only ever falls (§5, §17).',
    );
  } else if (cards < CARD_BUDGET) {
    errs.push(
      `${cards} card-only lessons left, down from ${CARD_BUDGET} — good. ` +
        'Lower CARD_BUDGET in this file to lock the gain in.',
    );
  }

  // READING ORDER (§5): the converted region must be a contiguous run from the
  // front of each branch, so a reader never steps from a scene back into cards.
  const solid = tally.reduce((a, t) => a + t.solid, 0);
  if (solid < SOLID_FLOOR) {
    errs.push(
      `the solid front is ${solid}, down from ${SOLID_FLOOR} — a lesson was un-wired ` +
        'from inside the converted run (§5)',
    );
  } else if (solid > SOLID_FLOOR) {
    errs.push(`the solid front is ${solid}, up from ${SOLID_FLOOR} — good. Raise SOLID_FLOOR to lock it in.`);
  } else if (cards < CARD_BUDGET) {
    errs.push(
      'lessons were converted but the solid front did not move: they were taken from ' +
        'BEHIND the frontier. Convert in reading order (§5) — the next one in each ' +
        'branch is listed above.',
    );
  }

  const total = tally.reduce((a, t) => a + t.lessons, 0);
  const cine = tally.reduce((a, t) => a + t.cine, 0);
  console.log(
    `\ntakeover: ${cine}/${total} cinematic (${Math.round((cine / total) * 100)}%) · ` +
      `${cards} card decks left · solid front ${solid} · ` +
      `${tally.length} branches at ${tally[0].lessons}/${tally[0].cine}`,
  );
  console.log('next to convert, in reading order:');
  for (const t of tally) {
    console.log(`  ${t.branch.padEnd(22)}${t.frontier ?? '— branch fully converted —'}`);
  }
  if (errs.length) problems.push(['the branch balance', errs]);
}

// ── report ────────────────────────────────────────────────────────────────────
for (const [f, warns] of warnings) {
  console.log(`~ ${f}`);
  for (const w of warns) console.log(`    ${w}`);
}

// I70 — the unringed debt, reported and ratcheted.
const shortNames = unringed.map((f) => f.replace('Scene.tsx', '')).join(', ');
if (unringed.length > UNRINGED_BUDGET) {
  console.log(
    `\nI70: ${unringed.length} scenes answer by tapping the picture with no <Target> ` +
      `marking their targets, and the budget is ${UNRINGED_BUDGET}:\n  ${shortNames}\n` +
      'Wrap each answer Pressable in Target, or use TargetRing where it owns a gesture ' +
      'it cannot give up.',
  );
  problems.push(['I70 target budget', [`${unringed.length} unringed, budget ${UNRINGED_BUDGET}`]]);
} else if (unringed.length) {
  console.log(
    `\nI70 debt: ${unringed.length}/${UNRINGED_BUDGET} scenes still have unmarked answer ` +
      `targets — ${shortNames}\n  Convert one and lower UNRINGED_BUDGET. It may never go up.`,
  );
} else if (UNRINGED_BUDGET > 0) {
  console.log('\nI70: every answer target is marked. Set UNRINGED_BUDGET to 0.');
}

// The band budget, stated rather than nagged about. Every one of these is a
// deliberate call; the point is to show a new lesson where it sits against the pack
// before it settles on a band it did not have to pay for (H59).
if (bands.length) {
  const fit = (h) => Math.min(923 / 400, 647 / h);
  const hs = bands.map((b) => b.h).sort((a, b) => a - b);
  const worst = bands.reduce((a, b) => (b.h > a.h ? b : a));
  const free = bands.filter((b) => b.h <= 280).length;
  console.log(
    `\nband budget: median ${hs[hs.length >> 1]} → ${fit(hs[hs.length >> 1]).toFixed(2)}× · ` +
      `${free}/${bands.length} at the free 2.31× (h ≤ 280) · ` +
      `tallest ${worst.h} in ${worst.f} → ${fit(worst.h).toFixed(2)}×`,
  );
}

// SAID OUT LOUD, so a check that silently stopped running is visible. A camera
// checker that matches nothing looks exactly like a camera checker that passes.
//
// The COUNT was already printed here and it was not enough: it said "97 of 100
// lessons move it" throughout the whole period the x parser was reading nothing,
// because the lessons did have cameras — it was the SUBJECT that had gone missing,
// not the camera. So print the verb mix as well. `to`, `drift` and `whip` are the
// three verbs followMoves can only choose when the figure actually moved between
// two beats; if all three are zero across 96 lessons, the track being read is flat
// and the checker is looking at a lesson nobody wrote.
const shotTotal = cameras.reduce((n, c) => n + c.n, 0);
const mix = Object.entries(verbs).sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `${k} ${v}`).join(' · ');
console.log(
  `\ncamera: ${cameras.length} of ${bands.length} lessons move it, ${shotTotal} shots, ` +
    `each checked against its own band and ground\n  verbs dealt: ${mix}`,
);
const chase = (verbs.to ?? 0) + (verbs.drift ?? 0) + (verbs.whip ?? 0);
if (cameras.length > 20 && chase === 0) {
  console.log(
    '\n✗ camera: not one `to`, `drift` or `whip` in any lesson. Those are the only\n' +
      '  verbs followMoves picks when the figure MOVED, so a flat sweep of them means\n' +
      '  the x track is not being read — see the parse note above `xKey`.',
  );
  process.exit(1);
}
if (problems.length) {
  console.log('');
  for (const [f, errs] of problems) {
    console.log(`✗ ${f}`);
    for (const e of errs) console.log(`    ${e}`);
  }
  console.log(`\n${ok} clean, ${problems.length} with problems.`);
  process.exit(1);
}
console.log(`\n${ok} cinematic files clean${warnings.length ? `, ${warnings.length} with warnings` : ''}.`);
