// THE SUBJECTS — one list, and what every screen that reads it relies on.
//
//   node --import ./scripts/lib/register.mjs scripts/check-subjects.mjs   (npm run check:subjects)
//
// Ashmere teaches seven subjects (2026-09-29): philosophy, which is live, and six that
// are coming soon. `data/subjects.ts` is the ONE place they are declared, and Home's
// carousel, the Learn grid and the subject pages all read it — so the rules for the
// list are held here rather than in any one screen.
//
//   §1  the seven, in the owner's order; only philosophy is live
//   §2  every subject is complete, and a coming-soon subject lists no course
//   §3  the colours: tame, clear of the green verdict wedge, and told apart
//   §4  philosophy's courses are the six real branches, and a branch knows its subject
let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};
const head = (t) => console.log(`\n${t}\n${'─'.repeat(t.length)}`);

const S = await import('@/data/subjects');
const D = await import('@/constants/design');
const T = await import('@/components/lesson/cinematic/stageTones');

head('§1 · the seven subjects');
const WANT = ['philosophy', 'psychology', 'personal-growth', 'business', 'economics', 'science', 'history'];
ok(JSON.stringify(S.SUBJECTS.map((s) => s.slug)) === JSON.stringify(WANT),
  "the subjects are the seven, in the owner's order", S.SUBJECTS.map((s) => s.slug).join(' · '));
ok(S.SUBJECTS.filter((s) => s.status === 'live').map((s) => s.slug).join() === 'philosophy', 'only philosophy is live');

head('§2 · every subject is complete');
for (const s of S.SUBJECTS) {
  ok(!!(s.name && s.short && s.blurb), `${s.slug} has a name, a short name and a blurb`);
  ok(s.short.length <= s.name.length, `${s.slug}'s short name is not longer than its name`);
  ok(/^#[0-9A-F]{6}$/i.test(s.hue), `${s.slug}'s hue is a hex`, s.hue);
  if (s.status === 'soon') ok(s.courses.length === 0, `${s.slug} is coming soon and lists no course`);
  else ok(s.courses.length > 0, `${s.slug} is live and lists its courses`);
}

head('§3 · the colours');
// The verdict wedge is where `correct` lives (design.ts); a subject hue there would
// make a right answer on its page unreadable as a right answer. The chroma ceiling is
// the owner's own register — "the more tame colors" — with the branch hues' headroom.
for (const s of S.SUBJECTS) {
  const [L, a, b] = T.lab(s.hue);
  const C = Math.hypot(a, b);
  const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  ok(!(h >= 130 && h <= 175), `${s.slug} is clear of the verdict wedge`, `h ${h.toFixed(0)}`);
  ok(C <= 38, `${s.slug} is tame`, `C* ${C.toFixed(1)}`);
  ok(L >= 22 && L <= 50, `${s.slug} is dark enough to carry cream type and light enough to read as a colour`, `L* ${L.toFixed(1)}`);
}
// ΔE 11.4 is the floor design.ts holds the six branch hues to, for the same reason:
// the family is one family, and the tiles sit side by side in the Learn grid.
for (let i = 0; i < S.SUBJECTS.length; i++) {
  for (let j = i + 1; j < S.SUBJECTS.length; j++) {
    const d = T.deltaE(S.SUBJECTS[i].hue, S.SUBJECTS[j].hue);
    ok(d >= 11.4, `${S.SUBJECTS[i].slug} and ${S.SUBJECTS[j].slug} are told apart`, `ΔE ${d.toFixed(1)}`);
  }
}

head('§4 · courses');
for (const s of S.SUBJECTS) for (const c of s.courses) ok(c in D.BRANCH, `${s.slug} course ${c} is a real branch`);
ok(S.getSubject('philosophy')?.courses.length === 6, 'philosophy lists the six branches');
ok(S.getSubject('no-such-subject') === undefined, 'an unknown slug is undefined, not a throw');
ok(S.subjectOfBranch('ethics')?.slug === 'philosophy', 'a branch knows its subject');
ok(S.subjectOfBranch('no-such-branch') === undefined, 'an unknown branch has no subject');

head('§5 · the drawings');
// Every subject and every branch has a scene; every part of every scene stays inside
// the 100-box it is authored in (a part outside it is cropped by the tile silently);
// and every scene is a still life of at least two objects, with its spark.
const A = await import('@/components/subjects/subjectScenes');
for (const s of S.SUBJECTS) ok(!!A.ART[s.slug], `${s.slug} has a drawing`);
for (const b of Object.keys(D.BRANCH)) ok(!!A.ART[b], `branch ${b} has a drawing`);
// A shape's real reach: a bar by its caps, anything else by its rotated half-extents
// (a box turned θ reaches |w cos θ|/2 + |h sin θ|/2 across) — not by its longest side,
// which reported a wide briefcase as 28 units below its own tile.
const extent = (p) => {
  if (p.k === 'bar') {
    return [Math.min(p.x1, p.x2) - p.t / 2, Math.min(p.y1, p.y2) - p.t / 2, Math.max(p.x1, p.x2) + p.t / 2, Math.max(p.y1, p.y2) + p.t / 2];
  }
  const r = ((p.rot || 0) * Math.PI) / 180;
  const hx = Math.abs((p.w / 2) * Math.cos(r)) + Math.abs((p.h / 2) * Math.sin(r));
  const hy = Math.abs((p.w / 2) * Math.sin(r)) + Math.abs((p.h / 2) * Math.cos(r));
  return [p.x - hx, p.y - hy, p.x + hx, p.y + hy];
};
for (const [key, sc] of Object.entries(A.ART)) {
  const laid = A.artIn(key, 0, 0, 100, 100);
  let worst = 0;
  for (const layer of laid.layers) for (const p of layer) {
    const [x0, y0, x1, y1] = extent(p);
    worst = Math.max(worst, -x0, -y0, x1 - 100, y1 - 100);
  }
  ok(worst <= 0.5, `${key} stays inside its box`, worst > 0.5 ? `${worst.toFixed(1)} units out` : '');
  ok(sc.layers.length >= 2, `${key} is a still life of at least two objects`, `${sc.layers.length} layer(s)`);
  ok(sc.spark && sc.spark.s > 0, `${key} carries its spark`);
}
const wide = A.artIn('logic', 0, 0, 200, 100);
ok(Math.abs(wide.spark.s - A.ART.logic.spark.s) < 1e-6 && Math.abs(wide.spark.x - (50 + A.ART.logic.spark.x)) < 1e-6,
  'a wide box lays a drawing into its largest SQUARE, centred, never stretched');

head('§6 · every name fits its box, on the narrow phone too');
// Measured against the real .ttf (scripts/lib/ttfwidth.mjs), because a character
// count is not a width: "Personal Growth & Self-Help" is the long one, and §14 records
// a product name clipping on a 320dp phone twice after passing at 390.
const { loadFont, wrap } = await import('./lib/ttfwidth.mjs');
const L = await import('@/components/subjects/tileLayout');
const PF = loadFont('node_modules/@expo-google-fonts/playfair-display/700Bold/PlayfairDisplay_700Bold.ttf');
const fitsIn = (text, px, maxW, maxLines) => {
  const lines = wrap(text, px, maxW, PF);
  const widest = Math.max(...lines.map((l) => PF.width(l, px)));
  return { ok: lines.length <= maxLines && widest <= maxW, why: `${lines.length} line(s), widest ${widest.toFixed(0)} of ${maxW.toFixed(0)}` };
};
for (const W of [320, 360, 390, 430]) {
  const tile = L.tileSize(W);
  const inner = tile - 2 * L.TILE_PAD;
  const card = L.cardWidth(W) - 2 * L.CARD_PAD;
  const wideText = W - 2 * L.PAGE_PAD - 2 * L.TILE_PAD - L.WIDE_ART - L.TILE_PAD;
  for (const s of S.SUBJECTS) {
    const t = fitsIn(L.tileTitle(s, tile), L.TILE_TITLE.fontSize, inner, 2);
    ok(t.ok, `${W}dp · ${s.slug}'s grid tile name`, t.why);
    const c = fitsIn(s.name, L.CARD_TITLE.fontSize, card, 2);
    ok(c.ok, `${W}dp · ${s.slug}'s carousel card name`, c.why);
    const m = fitsIn(s.name, L.MAST_TITLE.fontSize, W - 2 * L.PAGE_PAD, 2);
    ok(m.ok, `${W}dp · ${s.slug}'s masthead name`, m.why);
  }
  // THE PILLS AND THE BRANCH CARDS — both found cut on the 320dp render, not here.
  const INTER_B = loadFont('node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf');
  const pill = (text, px, spacing, padX) => INTER_B.width(text, px) + spacing * text.length + 2 * padX + 3;
  const soonW = pill('COMING SOON', L.PILL.fontSize, L.PILL.letterSpacing, L.PILL.padX);
  ok(soonW <= inner, `${W}dp · the COMING SOON pill fits one line in a grid tile`, `${soonW.toFixed(0)} of ${inner}`);
  const bText = L.branchTextWidth(W);
  const DATA = await import('@/data');
  for (const b of DATA.ALL_BRANCHES) {
    const n = fitsIn(b.name, L.BRANCH_TITLE.fontSize, bText, L.BRANCH_NAME_LINES);
    ok(n.ok, `${W}dp · the ${b.slug} card's name`, n.why);
    const line = S.COURSE_LINE[b.slug];
    const PFI = loadFont('node_modules/@expo-google-fonts/playfair-display/400Regular_Italic/PlayfairDisplay_400Regular_Italic.ttf');
    const dl = wrap(line ?? '', 12.5, bText, PFI);
    ok(!!line && dl.length <= 2 && Math.max(...dl.map((x) => PFI.width(x, 12.5))) <= bText,
      `${W}dp · the ${b.slug} card's line fits its two lines`, `${dl.length} line(s)`);
    const units = `${b.paths.length} UNITS`;
    const row = pill(units, 10, 1.4, 0) + 8 + pill('88 DONE', 10, 1, 8) + 14;
    ok(row <= bText, `${W}dp · the ${b.slug} card's units and done count share one row`, `${row.toFixed(0)} of ${bText.toFixed(0)}`);
  }
  const live = S.SUBJECTS.filter((s) => s.status === 'live');
  for (const s of live) {
    const w = fitsIn(s.name, L.CARD_TITLE.fontSize, wideText, 1);
    ok(w.ok, `${W}dp · ${s.slug}'s wide tile name`, w.why);
  }
}

head('§7 · no colour is typed into a subject component');
// The welcome screen kept a palette the app had replaced twice because its colours
// were literals (§19). A subject's colour lives in data/subjects.ts and nowhere else.
{
  const fs = await import('node:fs');
  const dir = 'components/subjects';
  for (const f of fs.readdirSync(dir)) {
    const src = fs.readFileSync(`${dir}/${f}`, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const hits = src.match(/['"]#[0-9A-Fa-f]{3,8}['"]/g) ?? [];
    ok(hits.length === 0, `${dir}/${f} types no hex colour`, hits.join(' '));
  }
}

console.log(`\n${bad === 0 ? 'check:subjects — clean' : `check:subjects — ${bad} failure(s)`}`);
process.exit(bad === 0 ? 0 : 1);
