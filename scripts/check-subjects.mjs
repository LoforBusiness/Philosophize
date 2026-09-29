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

console.log(`\n${bad === 0 ? 'check:subjects — clean' : `check:subjects — ${bad} failure(s)`}`);
process.exit(bad === 0 ? 0 : 1);
