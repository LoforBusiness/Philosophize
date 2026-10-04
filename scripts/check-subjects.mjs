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
  // Their lessons were deleted on 2026-10-02; what is left is progress (retiredBranches.ts).
  ok(DATA4.RETIRED_BRANCHES.length === 6 && DATA4.RETIRED_BRANCHES.every((b) => !live.includes(b.slug)),
    "philosophy's six old branches are retired: kept as progress, and on no road");
  ok(DATA4.getLessonById('ethics-ethics-1') === null, 'a retired lesson cannot be opened by id');
  const oneEach = Object.fromEntries(DATA4.RETIRED_BRANCHES.flatMap((b) => b.units.map((u) => [u.id, 1])));
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
// Every subject and every branch has a poster (posters.ts); each is ONE svg; a retired
// BRANCH's is struck in its own hue carrying the ember spark, while a SUBJECT's is drawn
// in the colours of the things in it (subjectScenes.ts, 2026-09-30: "use whatever color
// is fitting best with what is pictured"); and the viewBox grows to any box so every object in
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
  if (!S.getSubject(k)) {
    ok(xml.includes(`fill="${hueFor(k)}"`), `${k} is struck in its own hue`);
    ok(xml.includes(TONE.EMBER), `${k} carries the ember spark`);
  } else {
    // A subject's scene is ITS OWN drawing, not the hue-tinted one under it.
    ok(!xml.includes(TONE.EMBER) && (xml.match(/fill="#/g) ?? []).length > 30, `${k} is drawn as its own scene, in natural colours`);
  }
  ok(!/NaN|undefined/.test(xml), `${k} has no NaN or undefined in it`);
}
{
  const L5 = await import('@/components/subjects/tileLayout');
  const boxes = [];
  for (const W of [320, 360, 390, 430]) {
    const card = L5.cardWidth(W); const tile = L5.tileSize(W); const page = W - 2 * L5.PAGE_PAD;
    boxes.push([card - 4, L5.cardArtHeight(card)], [card - 4 + 2 * L5.PARALLAX, L5.cardArtHeight(card)], [tile - 4, L5.tileArtHeight(tile)],
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
}

head('§7 · no colour is typed into a subject component');
// The welcome screen kept a palette the app had replaced twice because its colours
// were literals (§19). A subject's colour lives in data/subjects.ts and nowhere else —
// except the pictures' own materials, which live in subjectScenes.ts (brick is a fact
// about brick, not about a subject), the way quickStartScenes.ts holds Quick Start's.
{
  const fs = await import('node:fs');
  const dir = 'components/subjects';
  for (const f of fs.readdirSync(dir)) {
    if (f === 'subjectScenes.ts') continue;
    const src = fs.readFileSync(`${dir}/${f}`, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const hits = src.match(/['"]#[0-9A-Fa-f]{3,8}['"]/g) ?? [];
    ok(hits.length === 0, `${dir}/${f} types no hex colour`, hits.join(' '));
  }
}

{
  // THE FOOT. A card's words sit on the deepest colour of its picture (foot.ts); the
  // name must hold 7:1 there and the blurb and kicker 4.5:1, on every subject.
  const SC = await import('@/components/subjects/subjectScenes');
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  for (const s of S.SUBJECTS) {
    const foot = SC.SCENE_FOOT[s.slug];
    ok(!!foot, `${s.slug} has a foot colour taken from its picture`);
    if (!foot) continue;
    const t = ratio(SC.FOOT_TEXT, foot);
    const soft = ratio(SC.FOOT_SOFT, foot);
    ok(t >= 7 && soft >= 4.5, `${s.slug}'s name and blurb read on its foot`, `name ${t.toFixed(2)}:1, blurb ${soft.toFixed(2)}:1`);
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
    ok(W === L.cardWidth(390) - 4 + 2 * L.PARALLAX && H === L.cardArtHeight(L.cardWidth(390)),
      "the pictures were drawn for today's Home card box, with the parallax margin", `${W}x${H}`);
    for (const s of S.SUBJECTS) {
      const want = crypto.createHash('sha1').update(P.posterXml(s.slug, s.hue, W, H)).digest('hex').slice(0, 12);
      ok(stamps[s.slug] === want, `${s.slug}'s Home picture is drawn from its poster as it is now`,
        stamps[s.slug] === want ? '' : stamps[s.slug] ? 'stale — run npm run make:posters' : 'missing — run npm run make:posters');
      ok(fs.existsSync(`assets/images/posters/card-${s.slug}.png`), `${s.slug}'s Home picture is on disk`);
    }
  }
  const card = noComments('components/subjects/SubjectCard.tsx');
  ok(/image=\{CARD_POSTER\[subject\.slug\]\?\.source\}/.test(card), 'a Home card paints its pre-drawn picture, not live SVG');

  // The Learn tiles are pre-drawn too, and every subject takes ONE tile — no subject is
  // drawn larger than another (2026-09-30).
  const tbox = /TILE_POSTER_BOX = \{ w: (\d+), h: (\d+) \}/.exec(table);
  const tstamps = Object.fromEntries([...table.matchAll(/'([a-z-]+)': \{ source: require\('@\/assets\/images\/posters\/tile-\1\.png'\), stamp: '([0-9a-f]+)' \}/g)].map((m) => [m[1], m[2]]));
  ok(!!tbox, 'posterArt.ts states the box its tile pictures were drawn for');
  if (tbox) {
    const [W, H] = [Number(tbox[1]), Number(tbox[2])];
    ok(W === L.tileSize(390) - 4 && H === L.tileArtHeight(L.tileSize(390)), "the tile pictures were drawn for today's tile box", `${W}x${H}`);
    for (const s of S.SUBJECTS) {
      const want = crypto.createHash('sha1').update(P.posterXml(s.slug, s.hue, W, H)).digest('hex').slice(0, 12);
      ok(tstamps[s.slug] === want, `${s.slug}'s Learn picture is drawn from its poster as it is now`, tstamps[s.slug] === want ? '' : 'stale — run npm run make:posters');
      ok(fs.existsSync(`assets/images/posters/tile-${s.slug}.png`), `${s.slug}'s Learn picture is on disk`);
    }
  }
  const tileSrc = noComments('components/subjects/SubjectTile.tsx');
  ok(/image=\{TILE_POSTER\[subject\.slug\]\?\.source\}/.test(tileSrc), 'a Learn tile paints its pre-drawn picture, not live SVG');
  // The road's masthead is pre-drawn too. It was live SVG: science's poster is 2,403
  // elements, parsed in JS and built as native views on the frame the road opens, and
  // that is what made tapping a subject lag (2026-10-03).
  const mbox = /MAST_POSTER_BOX = \{ w: (\d+), h: (\d+) \}/.exec(table);
  const mstamps = Object.fromEntries([...table.matchAll(/'([a-z-]+)': \{ source: require\('@\/assets\/images\/posters\/mast-\1\.png'\), stamp: '([0-9a-f]+)' \}/g)].map((m) => [m[1], m[2]]));
  ok(!!mbox, 'posterArt.ts states the box its road mastheads were drawn for');
  if (mbox) {
    const [W, H] = [Number(mbox[1]), Number(mbox[2])];
    for (const s of S.SUBJECTS) {
      const want = crypto.createHash('sha1').update(P.posterXml(s.slug, s.hue, W, H)).digest('hex').slice(0, 12);
      ok(mstamps[s.slug] === want, `${s.slug}'s road masthead is drawn from its poster as it is now`, mstamps[s.slug] === want ? '' : 'stale — run npm run make:posters');
      ok(fs.existsSync(`assets/images/posters/mast-${s.slug}.png`), `${s.slug}'s road masthead is on disk`);
    }
  }
  const road = noComments('app/(app)/branches/[branchSlug]/index.tsx');
  ok(/MAST_POSTER\[posterKey\]\.source/.test(road) && !/<Poster\b/.test(road), "the road's masthead paints its pre-drawn picture, not live SVG");
  const learn = noComments('app/(app)/branches/index.tsx');
  ok(!/\bwide\b/.test(learn) && /SUBJECTS\.length % 2/.test(learn), 'the Learn grid gives every subject one equal tile');

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

head('§11 · Quick Start never disappears');
{
  // *"the quick start pictures and quick start box is completely gone"* (2026-09-30):
  // with one lesson on each road, a reader who had read all seven met a Home with no
  // Quick Start at all. The card offers a lesson to read again instead.
  const Q = await import('@/lib/utils/quickStart');
  const { ALL_BRANCHES } = await import('@/data');
  const fresh = Q.pickQuickStart({}, 20000, null);
  ok(!!fresh && !fresh.again, 'a new reader is offered a lesson to start');
  const all = {};
  for (const b of ALL_BRANCHES) for (const u of b.paths) all[u.id] = u.lessons.length;
  const days = [20000, 20001, 20002, 20003].map((d) => Q.pickQuickStart(all, d, null));
  ok(days.every((p) => p && p.again), 'a reader who has finished every lesson is still offered one, to read again');
  const fs = await import('node:fs');
  const qsCard = fs.readFileSync('components/home/QuickStartCard.tsx', 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  ok(/pick!?\.again/.test(qsCard), 'the card says READ IT AGAIN rather than START on a lesson already read');
}

// ── 12. EVERY LESSON ON A ROAD HAS THE DAY IT WAS ADDED, AND NEW LASTS TWELVE DAYS ──
//
// The owner (2026-10-01): NEW on a new lesson's sign, gone twelve days after it was
// made. The sign reads data/lessonAdded.ts, so a live lesson missing from it would
// simply never be new — this is what makes adding the date part of adding a lesson.
console.log('\n12 · every lesson has the day it was added');
{
  const { ALL_BRANCHES } = await import('@/data');
  const A = await import('@/data/lessonAdded');
  const today = new Date();
  for (const b of ALL_BRANCHES) for (const u of b.paths) for (const l of u.lessons) {
    const d = A.LESSON_ADDED[l.id];
    const valid = typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
    ok(valid && new Date(`${d}T00:00:00`) <= today, `${l.id} has a real date it was added`,
      valid ? d : 'add it to data/lessonAdded.ts');
  }
  const at = (y, m, d) => new Date(y, m - 1, d, 12);
  A.LESSON_ADDED.__probe = '2026-03-10';
  const days = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((d) => A.isNewLesson('__probe', at(2026, 3, d)));
  delete A.LESSON_ADDED.__probe;
  ok(days.join() === 'true,true,true,true,true,true,true,true,true,true,true,true,false,false', 'NEW shows on the day it is added and the eleven after, then goes',
    days.map((v) => (v ? 'N' : '-')).join(''));
  ok(!A.isNewLesson('__probe', at(2026, 3, 9)), 'and never for a lesson with no date');
}

// ── 13. EVERY WORD ON A ROAD SIGN FITS ITS BOARD ─────────────────────────────
//
// The owner: "all the words are always visible on the signs … a lot of them get cut
// out or it's not properly aligned for the box." Every board is one width
// (components/branch/RoadSign.tsx), so every title the road can show — a lesson's,
// a review's unit name, the end-of-road board — is wrapped here against Playfair's
// own .ttf in that width LESS A MARGIN, because Android draws a bold face's ink past
// its last advance. Three lines at most, and no single word wider than the board.
console.log('\n13 · every road sign title fits its board');
{
  const fs = await import('node:fs');
  const src = fs.readFileSync('components/branch/RoadSign.tsx', 'utf8');
  const num = (name) => Number((src.match(new RegExp(`export const ${name} = ([\\d.]+)`)) || [])[1]);
  const SIGN_W = num('SIGN_W'), PAD = num('SIGN_PAD'), BORDER = num('SIGN_BORDER');
  const PX = num('TITLE_PX'), LINES = num('TITLE_LINES');
  const TEXT_W = SIGN_W - 2 * (PAD + BORDER);
  const SAFE = TEXT_W - 8;
  ok(SIGN_W > 0 && PX > 0 && LINES > 0, 'the sign states its width, its title size and its line limit', `${SIGN_W} · ${PX}px · ${LINES} lines`);
  const { ALL_BRANCHES } = await import('@/data');
  const titles = new Set(['More lessons coming soon']);
  for (const b of ALL_BRANCHES) for (const u of b.paths) {
    titles.add(u.name);
    for (const l of u.lessons) titles.add(l.title);
  }
  let worst = 0;
  for (const t of titles) {
    const lines = wrap(t, PX, SAFE, PF);
    const widest = Math.max(...lines.map((ln) => PF.width(ln, PX)));
    worst = Math.max(worst, widest);
    ok(lines.length <= LINES && widest <= SAFE, `"${t}" sets in ${lines.length} line(s)`,
      `${widest.toFixed(1)} of ${SAFE}px${lines.length > LINES ? ' — too many lines: shorten it' : ''}`);
  }
  console.log(`  widest line on any sign: ${worst.toFixed(1)}px of ${SAFE}px`);
}

console.log(`\n${bad === 0 ? 'check:subjects — clean' : `check:subjects — ${bad} failure(s)`}`);
process.exit(bad === 0 ? 0 : 1);
