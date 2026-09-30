# One road per subject + six intro dialogue lessons — build plan (2026-09-30)

**Owner's ask:** every subject is ONE road; philosophy's six branches are no longer
separate; each subject gets its first lesson, an introduction, built like
`economics-foundations-1` (LESSON_RULES group AP). Economics already has its own.

**Owner's answers (asked 2026-09-30):**
- Philosophy's road holds ONLY the new intro lesson and ends at MORE COMING SOON. The
  246 narrated lessons are hidden until redone; saved progress is kept, not shown.
- Tapping a subject opens its road directly. The subject page goes.
- Build all six, send renders at the end.
- The professor's intro is turned OFF (it says "six branches"); code stays.

**Never publish or push without being asked. Stage explicit paths. No app/preview* commits.**

## Phase A — structure (me)

- `constants/design.ts`: BranchKey + BRANCH gain `philosophy #36515D`, `psychology #5A5A7E`,
  `personal-growth #636C3C`, `business #785A30`, `science #306F72`, `history #905748`
  (scratchpad/roadhues2.mjs; pairwise floors among the LIVE seven).
- `data/branches/<slug>/` for the six: index.ts (`more: true`), paths/foundations,
  one lesson data file with a card fallback. Ids `<slug>-foundations-1`, unit id
  `<slug>-foundations`, unit slug `foundations`.
- `data/index.ts`: `ALL_BRANCHES` = the seven live roads; `LEGACY_BRANCHES` = the six
  old philosophy branches (unreachable in the app, still read by checks).
- `data/subjects.ts`: every subject `live`, `courses: [<its one branch>]`.
- Nav: Learn grid and `openSubject` push the road; road back → grid (or Home when
  `from=home`); delete `subject/[subjectSlug].tsx`; update `check-nav`.
- Road screen: masthead from the subject (poster), kicker without "COURSE/BRANCH".
- Professor intro off: one constant, read by Quick Start and the lesson route.
- Rescope checks (cinematic level rule, review, subjects, ui pairwise, pass, echo,
  mentions, bible) — legacy stays held to what it was held to.

## Phase B — scripts and voices (me)

Six `*Script.ts` (stems `phil1 psych1 growth1 biz1 sci1 hist1`), prose checks, then
`render-narration` → `install-narration` → `encode-narration` → `make-narration`.
Report the ledger.

## Phase C — scenes (agents, three at a time)

One `*Scene.tsx` each, objects from fetched references. Paced from measured lines.

## Phase D — measure, tables, checks, renders (me)

`measure-must` (SPLICE, keep reach records), `make:tours`, `make:gaze`, full
`npm run check`, `sheet:beats` for each, send to the owner. Docs + memory.

## The six lessons

Cast: tophat teaches in all; cap in philosophy/business/science/history; plain in
philosophy/psychology/growth/science; bun in psychology/growth/business/history.

| stem | id | title | place | cast | three ideas | Q1 (stage tap) | Q2 (stage tap) | quote |
|---|---|---|---|---|---|---|---|---|
| phil1 | philosophy-foundations-1 | What Is Philosophy? | a bicycle repair stand | cap mends, plain owns it, tophat | a question the facts cannot settle · answered with reasons · it matters because you live by answers you never examined | which card on the workshop board is a philosophy question | what settles one: a reason (not a vote, not the loudest) | Socrates, Apology: "The unexamined life is not worth living." |
| psych1 | psychology-foundations-1 | What Is Psychology? | a café counter, a taste test | plain tastes, bun pours, tophat | the study of mind and behaviour · we are poor witnesses of our own minds · so psychologists test | tap where BOTH cups came from (the one pot) | why he preferred cup B: the label | William James 1890: "Psychology is the Science of Mental Life…" |
| growth1 | personal-growth-foundations-1 | How Do People Change? | a garden, two pots | bun floods, plain waters daily, tophat | small and repeated beats big and once · make it easy (the can by the door) · it compounds | which pot will grow | where the can should live | Will Durant 1926: "We are what we repeatedly do…" |
| biz1 | business-foundations-1 | What Is a Business? | a lemonade stand | cap makes, bun gives it away, tophat | solve a problem someone will pay for · profit = money in − cost · a leader gives each person one job | tap the profit pile | who does what (one squeezes, one serves) | Drucker 1954: "…to create a customer." |
| sci1 | science-foundations-1 | What Is Science? | a yard, a ladder, two balls | plain is sure, cap drops, tophat | a guess is tested against the world · the test beats the argument · technology is tested knowledge put to work | which lands first (predict before the drop) | how to settle it (drop them and look) | Feynman 1965: "If it disagrees with experiment, it's wrong." |
| hist1 | history-foundations-1 | What Is History? | a street, a broken shop window | cap owns the window, bun owns the ball, tophat | the past is known from evidence · a source has a point of view · politics is how a group decides who decides | tap the best evidence (the ball inside) | which is the POLITICAL question (who decides who pays) | E. H. Carr 1961: "…an unending dialogue between the present and the past." |
