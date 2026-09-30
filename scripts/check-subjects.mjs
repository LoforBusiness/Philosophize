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
// ALL SEVEN SINCE 2026-09-30: each subject opened with its first lesson on one road.
ok(S.SUBJECTS.every((s) => s.status === 'live'), 'every subject is live (a subject goes live on purpose, here)',
  S.SUBJECTS.filter((s) => s.status !== 'live').map((s) => s.slug).join(' '));

head('§2 · every subject is complete');
for (const s of S.SUBJECTS) {
  ok(!!(s.name && s.short && s.blurb), `${s.slug} has a name, a short name and a blurb`);
  ok(s.short.length <= s.name.length, `${s.slug}'s short name is not longer than its name`);
  ok(/^#[0-9A-F]{6}$/i.test(s.hue), `${s.slug}'s hue is a hex`, s.hue);
  if (s.status === 'soon') ok(s.courses.length === 0, `${s.slug} is coming soon and lists no course`);
  // ONE ROAD PER SUBJECT (the owner, 2026-09-30): "I only want one road for each
  // subject, not a bunch of different ones."
  else ok(s.courses.length === 1, `${s.slug} is live and has exactly one road`, s.courses.join(' '));
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
{
  const DATA4 = await import('@/data');
  const live = DATA4.ALL_BRANCHES.map((b) => b.slug);
  ok(JSON.stringify(live) === JSON.stringify(S.SUBJECTS.map((x) => x.courses[0])),
    "the roads a reader can walk are the subjects' roads, in the subjects' order", live.join(' · '));
  ok(DATA4.LEGACY_BRANCHES.length === 6 && DATA4.LEGACY_BRANCHES.every((b) => !live.includes(b.slug)),
    "philosophy's six old branches are retired: kept, and on no road");
  ok(DATA4.getLessonById('ethics-ethics-1') === null, 'a retired lesson cannot be opened by id');
  const oneEach = Object.fromEntries(DATA4.LEGACY_BRANCHES.flatMap((b) => b.paths.map((p) => [p.id, 1])));
  const kept = Object.values(DATA4.branchCountsFromUnits(oneEach)).reduce((a, b) => a + b, 0);
  ok(kept === 28, 'progress in the retired units is still counted, so nothing a reader finished is dropped',
    `${kept} of 28 units' lessons`);
  for (const b of DATA4.ALL_BRANCHES) ok(b.more === true, `${b.slug}'s road ends at a MORE COMING SOON sign`);
}
ok(S.getSubject('no-such-subject') === undefined, 'an unknown slug is undefined, not a throw');
ok(S.subjectOfBranch('philosophy')?.slug === 'philosophy' && S.subjectOfBranch('personal-growth')?.slug === 'personal-growth', 'a road knows its subject');
ok(S.subjectOfBranch('ethics') === undefined, 'a retired branch belongs to no subject');
ok(S.subjectOfBranch('no-such-branch') === undefined, 'an unknown branch has no subject');

head('§5 · the posters');
// Every subject and every branch has a poster (posters.ts); each is ONE svg in its own
// hue carrying the ember spark; and the viewBox grows to any box so every object in
// the 200×150 frame (CORE sideways) is inside it — never cropped, never stretched
// (a slice crop took the bust's head off in the first mockup).
const P = await import('@/components/subjects/posters');
const TONE = await import('@/components/shared/tone');
for (const s of S.SUBJECTS) ok(P.POSTER_KEYS.includes(s.slug), `${s.slug} has a poster`);
for (const b of Object.keys(D.BRANCH)) ok(P.POSTER_KEYS.includes(b), `branch ${b} has a poster`);
const hueFor = (k) => S.getSubject(k)?.hue ?? D.BRANCH[k];
for (const k of P.POSTER_KEYS) {
  const xml = P.posterXml(k, hueFor(k), 169, 118);
  ok((xml.match(/<svg/g) ?? []).length === 1 && xml.trim().endsWith('</svg>'), `${k} is one svg document`);
  ok(xml.includes(`fill="${hueFor(k)}"`), `${k} is struck in its own hue`);
  ok(xml.includes(TONE.EMBER), `${k} carries the ember spark`);
  ok(!/NaN|undefined/.test(xml), `${k} has no NaN or undefined in it`);
}
{
  const L5 = await import('@/components/subjects/tileLayout');
  const boxes = [];
  for (const W of [320, 360, 390, 430]) {
    const card = L5.cardWidth(W); const tile = L5.tileSize(W); const page = W - 2 * L5.PAGE_PAD;
    boxes.push([card - 4, L5.cardArtHeight(card)], [tile - 4, L5.tileArtHeight(tile)], [page - 4, L5.heroArtHeight(page)],
      [page - 4, L5.MAST_ART_H], [L5.branchArt(W), L5.BRANCH_CARD_H - 4]);
  }
  for (const [w, h] of boxes) {
    const [x, y, vw, vh] = P.posterViewBox(w, h);
    // Sideways it must hold CORE (the band every object stays in); up and down, all of it.
    const holds = x <= P.CORE.x0 + 0.01 && y <= 0.01 && x + vw >= P.CORE.x1 - 0.01 && y + vh >= P.FRAME.h - 0.01;
    const same = Math.abs(vw / vh - w / h) < 1e-6;
    const floorKept = Math.abs(y + vh - P.FRAME.h) < 0.01 || Math.abs(y) < 0.01;
    ok(holds && same && floorKept, `a ${w}×${h} box holds the whole frame at the box's own shape`, `viewBox ${[x, y, vw, vh].map((n) => n.toFixed(1)).join(' ')}`);
  }
}

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
  // Every card face has a 2px border inside its width (Card), so the words measure from inside it.
  const inner = tile - 4 - 2 * L.TILE_PAD;
  const card = L.cardWidth(W) - 4 - 2 * L.CARD_PAD;
  const wideText = W - 2 * L.PAGE_PAD - 4 - 2 * (L.TILE_PAD + 2);
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
  // The branch CARDS went with the subject page (2026-09-30): a subject opens its road
  // directly. What is left of them is the line under the road's name on its masthead.
  const DATA = await import('@/data');
  for (const b of DATA.ALL_BRANCHES) ok(!!S.COURSE_LINE[b.slug], `the ${b.slug} road has a line for its masthead`);
  // Only the LEAD subject is drawn full width (the Learn grid: one across, six below).
  for (const s of [S.SUBJECTS[0]]) {
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

head('§8 · quotes are not a feature outside lessons any more (2026-09-29)');
// The owner: "having a thinkers profile or thinkers tab, and also quotes will not be
// necessary." Phase 1 takes quotes off Profile, Settings and the lesson's save button;
// the lessons still SHOW their quotation (Phase 2 decides that), and the store keeps
// the data so nothing a reader saved is destroyed by a screen going away.
{
  const fs = await import('node:fs');
  const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  for (const rel of ['app/(app)/profile/index.tsx', 'app/(app)/settings.tsx', 'app/(app)/index.tsx']) {
    const src = strip(fs.readFileSync(rel, 'utf8'));
    const hits = src.match(/savedQuotes|openSavedQuotes|clearSavedQuotes|profileQuote|DailyQuoteWidget/g) ?? [];
    ok(hits.length === 0, `${rel} shows no saved quotes`, [...new Set(hits)].join(' '));
  }
  const store = strip(fs.readFileSync('stores/userDataStore.ts', 'utf8'));
  const defaults = /const DEFAULT_SETTINGS[\s\S]*?\n\};/.exec(store)?.[0] ?? '';
  ok(defaults.length > 0, 'DEFAULT_SETTINGS was found');
  ok(!/widgetEnabled|widgetPlacement/.test(defaults),
    'the in-app quote card\'s settings are gone from DEFAULT_SETTINGS, so sanitizeSettings prunes them from old installs (§22)');
  const kit = strip(fs.readFileSync('components/lesson/cinematic/cinematicKit.tsx', 'utf8'));
  ok(!/onToggleSave=/.test(kit), 'a lesson\'s quote card offers no save button');
  // THE THINKER CARD TOO — found by the final review. The widget's link opens it over
  // Home, and it still said "Bookmark to save · star to feature it on your profile"
  // over two buttons whose results no screen shows any more.
  const sheet = strip(fs.readFileSync('components/shared/PhilosopherSheet.tsx', 'utf8'));
  ok(!/onToggleSave=|onToggleFeature=|Bookmark to save/.test(sheet),
    'the thinker card offers no save or feature on its quotes');
  // XP took the Quotes count's cell in Settings › Profile, and XP runs to five digits:
  // at 320dp a cell is about 45pt and "12450" in Playfair Bold 22 is 55.8 (final
  // review). The value must stay on one line and shrink to fit rather than break.
  const settingsSrc = strip(fs.readFileSync('app/(app)/settings.tsx', 'utf8'));
  const mini = /function MiniStat[\s\S]*?\n\}/.exec(settingsSrc)?.[0] ?? '';
  ok(/<Text style=\{styles\.miniValue\}[^>]*numberOfLines=\{1\}[^>]*adjustsFontSizeToFit/.test(mini),
    'a Settings stat value keeps to one line and shrinks to fit (XP runs to five digits)');
  const pass = strip(fs.readFileSync('lib/utils/passValue.ts', 'utf8'));
  ok(!/id: 'thinkers'|id: 'quotations'|id: 'quizzes'/.test(pass), 'the Pass chart\'s free tiles no longer name thinkers, quotations or quizzes');
}

head('§9 · the branch badges count philosophy\'s branches only (2026-09-29 review)');
{
  // "One Branch Complete", "The Whole Tree", "Every Unit" and their siblings were
  // written for philosophy's six branches of 41 lessons. Economics opened with ONE
  // lesson, so counting it would make finishing that lesson "100% of a branch" — and a
  // badge, once earned, is kept and cloud-synced for ever. progressStats reads its
  // branch and unit figures through lib/utils/branchMastery.ts, and this holds it.
  const fs = await import('node:fs');
  const M = await import('@/lib/utils/branchMastery');
  const econDone = M.branchMastery({ economics: 1 }, {});
  ok(!('economics' in econDone.mastery), 'a course of another subject is not a branch the badges count',
    Object.keys(econDone.mastery).join(' '));
  ok(Object.keys(econDone.mastery).length === 6, "the badges count philosophy's six branches");
  ok(econDone.unitsComplete === 0, 'finishing the economics unit completes no badge unit',
    `${M.branchMastery({}, { 'economics-foundations': 1 }).unitsComplete} unit(s)`);
  const ethicsAll = M.branchMastery({ ethics: 41 }, {});
  ok(ethicsAll.mastery.ethics === 100, 'a finished philosophy branch still counts', `ethics ${ethicsAll.mastery.ethics}%`);
  const src = fs.readFileSync('stores/userDataStore.ts', 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  ok(/branchMastery\(/.test(src) && !/for \(const b of ALL_BRANCHES\)/.test(src),
    'progressStats takes its branch figures from branchMastery, not from every branch');
}

head('§10 · the Home shelf: pre-drawn posters, one card a swipe, flush pictures (2026-09-30)');
{
  // "they look like they're a little bit too far to the right, so they go off" and
  // "each swipe … will only go one … I want that lag … fixed". Three rules, each a
  // cause that was found rather than guessed.
  const fs = await import('node:fs');
  const crypto = await import('node:crypto');
  const noComments = (p) => fs.readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');

  // (a) Every Home card's picture is the PNG make:posters drew — and drawn from the
  // poster as it is NOW. A poster edited in posters.ts and not redrawn would put an
  // old picture on Home beside the new one on Learn, and nothing else would notice.
  const table = fs.readFileSync('components/subjects/posterArt.ts', 'utf8');
  const box = /CARD_POSTER_BOX = \{ w: (\d+), h: (\d+) \}/.exec(table);
  const stamps = Object.fromEntries([...table.matchAll(/'([a-z-]+)': \{ source: require\('@\/assets\/images\/posters\/card-\1\.png'\), stamp: '([0-9a-f]+)' \}/g)].map((m) => [m[1], m[2]]));
  ok(!!box, 'posterArt.ts states the box its pictures were drawn for');
  if (box) {
    const [W, H] = [Number(box[1]), Number(box[2])];
    ok(W === L.cardWidth(390) - 4 && H === L.cardArtHeight(L.cardWidth(390)),
      "the pictures were drawn for today's Home card box", `${W}x${H}`);
    for (const s of S.SUBJECTS) {
      const want = crypto.createHash('sha1').update(P.posterXml(s.slug, s.hue, W, H)).digest('hex').slice(0, 12);
      ok(stamps[s.slug] === want, `${s.slug}'s Home picture is drawn from its poster as it is now`,
        stamps[s.slug] === want ? '' : stamps[s.slug] ? 'stale — run npm run make:posters' : 'missing — run npm run make:posters');
      ok(fs.existsSync(`assets/images/posters/card-${s.slug}.png`), `${s.slug}'s Home picture is on disk`);
    }
  }
  const card = noComments('components/subjects/SubjectCard.tsx');
  ok(/image=\{CARD_POSTER\[subject\.slug\]\?\.source\}/.test(card), 'a Home card paints its pre-drawn picture, not live SVG');

  // (b) One card per swipe, and nothing built while the reader swipes.
  const shelf = noComments('components/home/SubjectCarousel.tsx');
  ok(/snapToInterval=/.test(shelf) && /disableIntervalMomentum/.test(shelf),
    'the shelf stops at the NEXT card however hard it is flicked (snapToInterval + disableIntervalMomentum)');
  ok(!/FlatList|snapToOffsets|windowSize/.test(shelf),
    'the shelf is a plain row mounted once, not a windowed list that mounts cards mid-swipe');

  // (c) Card's pad={0} means NO padding. It meant SPACE[0] (4), so a poster sized to
  // the face less its border ran 4px across the card's right-hand rim.
  const cardSrc = noComments('components/ui/Card.tsx');
  ok(/padding: pad === 0 \? 0 : SPACE\[pad\]/.test(cardSrc), "Card's pad={0} lays a picture flush against its border");
}

console.log(`\n${bad === 0 ? 'check:subjects — clean' : `check:subjects — ${bad} failure(s)`}`);
process.exit(bad === 0 ? 0 : 1);
