// A short, witty "who you're becoming" bio assembled from the user's own
// activity — the lessons they take, the quotes they save, and the thinkers they
// linger on. It is ACCURATE (every clause is built from real counts and the
// user's actual top thinker / area) but deliberately VARIED: openers, phrasings,
// ordering, flourishes and closers are combined from large pools, so there are
// thousands of possible bios in the same playful voice.
//
// Variation is driven by a `seed` the caller bumps on each lesson and each app
// launch (see userDataStore.bioSeed). Given the same seed + data it is fully
// deterministic, so it never flickers mid-session — it just refreshes next time.

export interface BioInput {
  lessonsDone: number;
  streak: number;
  quotesSaved: number;
  distinctViewed: number;
  topPhilosopher: string | null; // display name, e.g. "Marcus Aurelius"
  topInterestName: string | null; // branch display name, e.g. "Ethics"
  topInterestSlug: string | null; // branch slug, e.g. "ethics"
  /** The subject the reader reads most, e.g. "psychology" — it decides the opener. */
  topSubjectSlug?: string | null;
  topSubjectName?: string | null; // e.g. "Psychology"
  /** How many subjects the reader has finished a lesson in. */
  subjectsRead?: number;
}

// Opening identity tags, keyed to the user's strongest area of interest.
const ARCHETYPE: Record<string, string[]> = {
  logic: [
    'A card-carrying hair-splitter',
    'Allergic to a sloppy argument',
    'Part bloodhound for bad logic',
    'Quietly fact-checking the universe',
    'A connoisseur of the well-formed argument',
    'Forever asking “but does that follow?”',
    'On a personal crusade against the non-sequitur',
    'Reads the terms and conditions for the reasoning',
    'Keeps a mental red pen for loose premises',
    'The friend who says “that is not what that means”',
    'A quiet menace at the end of an argument',
    'Structurally unable to let a bad inference past',
    'Happiest when a chain of reasoning holds',
    'Has started noticing when the adverts cheat',
  ],
  ethics: [
    'A part-time moral compass',
    'Quietly auditing everyone\'s choices',
    'Losing sleep over the right thing to do',
    'A reluctant referee of right and wrong',
    'Taking the hard questions personally',
    'Weighing every “should” twice',
    'On first-name terms with the guilty conscience',
    'Turning small decisions into large questions',
    'A conscience with a reading habit',
    'Suspicious of any easy answer about the right thing',
    'Keeping a running tally of what we owe each other',
    'Reads the trolley problem as a personal challenge',
    'Never once let a “well, it depends” go unexamined',
    'Building a moral spine, one lesson at a time',
  ],
  epistemology: [
    'Professionally unsure of everything',
    'Won’t take “because I said so” for an answer',
    'Suspicious of anything labelled “obvious”',
    'Still deciding what counts as knowing',
    'A devoted doubter',
    'Forever asking how we could possibly know',
    'Holding every certainty up to the light',
    'On excellent terms with the word “probably”',
    'Auditing the difference between believing and knowing',
    'Keeps asking how anybody could be sure of that',
    'Fond of a good reason, wary of a good feeling',
    'Not convinced, and enjoying it',
    'Treats “everyone knows” as a red flag',
    'A careful sceptic with a soft spot for evidence',
  ],
  metaphysics: [
    'Comfortable asking what “real” even means',
    'Happiest just past the edge of the map',
    'Out chasing the questions with no floor',
    'On speaking terms with the void',
    'Endlessly poking at what exists',
    'Happily lost in first questions',
    'Always one “why” deeper than strictly necessary',
    'Keeps wandering off the edge of the obvious',
    'Has strong feelings about whether time is real',
    'Asks what a thing is before asking what it does',
    'Comfortable with questions that have no floor',
    'A tourist in the deepest part of the map',
    'Quietly wondering whether any of this is here',
    'Collects impossible questions the way others collect stamps',
  ],
  aesthetics: [
    'Has opinions about beauty and isn\'t sorry',
    'Out here taking taste seriously',
    'A self-appointed curator of the sublime',
    'Forever asking why that moves us',
    'Keeps catching beauty in the act',
    'Treats a good sunset as a research problem',
    'Fluent in the language of the beautiful',
    'Argues about taste, and enjoys it enormously',
    'Takes a good painting personally',
    'Wants to know why that chord did that',
    'A serious student of the merely lovely',
    'Refuses to let “I just like it” be the end of it',
    'Chasing the reason a thing moves us',
    'On the trail of what makes something good',
  ],
  'political-philosophy': [
    'Redesigning society before breakfast',
    'Arguing the social contract, unprompted',
    'Quietly rewriting the rules of the just city',
    'Has opinions about who should rule, and why',
    'Forever litigating the common good',
    'A constitution-drafter at heart',
    'Takes “what do we owe each other?” personally',
    'Auditing the social contract in their spare time',
    'Has views on power, and they are getting sharper',
    'Asking who decides, and by what right',
    'Rebuilding the just city from the foundations',
    'Taking the question of fairness carefully apart',
    'A quiet radical with footnotes',
    'Reads the news as a philosophy problem',
  ],
};
const ARCHETYPE_GENERIC = [
  'A card-carrying overthinker',
  'A dangerously curious mind',
  'An aspiring troublemaker of ideas',
  'A connoisseur of the awkward question',
  'Equal parts skeptic and dreamer',
  'A devout questioner of everything',
  'A restless, well-read sort',
  'A collector of beautiful problems',
  'A restless mind with a reading habit',
  'Chronically unable to leave a question alone',
  'A quiet accumulator of dangerous ideas',
  'Halfway to insufferable, in the best way',
  'A serious person about unserious hours',
  'Building an argument out of spare evenings',
];

// ── THE SUBJECTS (2026-09-29) ─────────────────────────────────────────────────
// Ashmere teaches seven subjects now, and the owner asked for this sentence to be
// about "whatever the user tends to learn". So the opener is chosen by the reader's
// top SUBJECT. A philosophy reader still draws from the sharper branch pools above
// half the time — "allergic to a sloppy argument" is truer of a logic reader than
// anything a subject-level line can say.
const SUBJECT_ARCHETYPE: Record<string, string[]> = {
  philosophy: [
    'Asking the questions that keep philosophers up',
    'Arguing with the ancients, and holding their own',
    'Treats every “why” as an invitation',
    'A student of the oldest questions',
    'Taking big ideas for a long walk',
    'Keeps a philosopher’s notebook, and uses it',
    'Thinking slowly, on purpose',
    'Following arguments wherever they go',
    'A quiet examiner of the examined life',
    'Turns small talk into big questions',
    'Picking fights with famous ideas, politely',
    'Reads the great books as a conversation',
  ],
  psychology: [
    'Quietly working out everyone at the dinner table',
    'Reads body language for fun',
    'Wants to know why people do that',
    'A student of the human operating system',
    'Has started noticing their own biases, awkwardly',
    'Asks “but why did I do that?” a lot',
    'Fascinated by the part of the mind that fibs',
    'An amateur detective of motives',
    'Keeps a field guide to the human mind',
    'Now suspicious of every first impression',
    'Treats a bad mood as data',
    'Collecting cognitive biases like trading cards',
    'Knows why the other queue always feels faster',
  ],
  'personal-growth': [
    'Upgrading themselves one habit at a time',
    'Quietly building a better Tuesday',
    'Treats every morning as a rough draft',
    'A work in progress with a plan',
    'Stacking small wins on purpose',
    'Getting one percent better, deliberately',
    'Has a system for the systems',
    'Turning good intentions into routines',
    'Keeps promises to themselves, mostly',
    'Learning how to learn, which is the long game',
    'Pruning old habits with a steady hand',
    'Planting habits and waiting for the harvest',
    'On speaking terms with discipline',
  ],
  business: [
    'Thinking like a founder, reading like a student',
    'Sizing up every shop they walk into',
    'Has opinions on pricing now',
    'A strategist in training',
    'Mentally reorganising every queue they stand in',
    'Learning to lead before being asked to',
    'Reads a company like a story',
    'Knows a good pitch when they hear one',
    'Keeps a notebook of ideas worth building',
    'Asks who the customer really is',
    'Building a boardroom vocabulary',
    'Turning hunches into business cases',
  ],
  economics: [
    'Now sees the invisible hand everywhere',
    'Asks what it really costs, every time',
    'Has thoughts about the price of coffee',
    'Fluent in trade-offs',
    'Reading the markets like weather',
    'Thinks at the margin now',
    'Knows where the money goes',
    'Suspicious of anything labelled free',
    'Counting opportunity costs for fun',
    'Following the incentives home',
    'Can explain inflation at a party, and will',
    'Spotting supply and demand in the wild',
  ],
  science: [
    'Runs small experiments on everyday life',
    'Asking how it works, then how it really works',
    'Takes nothing on trust without the evidence',
    'A lab coat in spirit',
    'Taking the universe apart, gently',
    'Knows why the sky is that colour',
    'Treats curiosity as a method',
    'Collecting mechanisms, cog by cog',
    'Fond of a good hypothesis',
    'Reading the manual of the universe',
    'Suspiciously excited about orbits',
    'Half engineer, half explorer',
  ],
  history: [
    'Always asking what happened before that',
    'Reads the present as a sequel',
    'On first-name terms with several empires',
    'A time traveller on a budget',
    'Keeps connecting the past to the news',
    'Collecting turning points',
    'Sees old patterns in new headlines',
    'Unafraid of a long timeline',
    'Hunting for causes, not just dates',
    'Treats every ruin as a clue',
    'A quiet chronicler of how we got here',
    'Remembers what everyone else forgot',
  ],
};

const MICRO = [
  'No notes.',
  'Dangerous.',
  'Keeps the librarians on their toes.',
  'The questions don’t stand a chance.',
  'Honestly, a little intimidating.',
  'Going places, several subjects at once.',
  'Frankly, showing off.',
  'Genuinely alarming.',
  'Somebody stop them.',
  'A menace at dinner parties.',
  'Nobody is safe.',
  'The good kind of trouble.',
  'Formidable, quietly.',
  'A work in progress, and progressing.',
];

const BLANK_SLATE = [
  'A blank notebook and a dangerous amount of curiosity. The big questions haven’t started yet — but they’re coming.',
  'Freshly arrived and suspiciously curious. The examined life starts right about now.',
  'No lessons yet, but the eyebrow is already raised. Watch this space.',
  'A clean slate and an itch to ask why. The good trouble begins shortly.',
  'Nothing on the record yet. The first question is always the hardest one to ask.',
  'An empty shelf and every intention of filling it. Start with something impossible.',
  'Day zero. Seven subjects waiting, and none of them opened yet.',
  'Unwritten — which is, honestly, the most interesting state to be in.',
  'No lessons yet. Just the itch. That is where every expert started.',
];

// ── THE REST OF THE SENTENCE FOLLOWS THE SUBJECT TOO (2026-10-01) ─────────────
// The owner: "update the who you're becoming to say things related to the
// different subjects that [the user is] learning, instead of just the philosophy
// ones … I want a bunch of different phrases for this part." So the middle (a
// receipt in the list), the flourish and the closer each have a pool per subject.
//
// THE KEYS ARE UNQUOTED on purpose: the lookup drops the hyphen, so
// 'personal-growth' is `personalgrowth` here. check:quips reads every quoted
// string in this file as a phrase and fails on a duplicate, and a quoted key
// repeated in four tables would be four duplicates of a word nobody reads.
//
// None of these carries a count. A receipt says something true of the SUBJECT the
// reader leads with — it never claims all their lessons were in it, because the
// lesson total runs across every subject (and the retired philosophy library).

/** The subject as a word in a sentence: "at home in personal growth". */
const SUBJECT_NOUN: Record<string, string> = {
  philosophy: 'philosophy',
  psychology: 'psychology',
  personalgrowth: 'personal growth',
  business: 'business',
  economics: 'economics',
  science: 'science',
  history: 'history',
};

/** The middle: one subject receipt, listed beside the counts. No commas, no "and". */
const SUBJECT_RECEIPT: Record<string, string[]> = {
  philosophy: [
    'several arguments politely dismantled',
    'a notebook full of objections',
    'a steadily sharpening “but why?”',
    'a growing list of things no longer taken for granted',
    'an argument for every occasion',
    'a healthy distrust of the obvious',
    'a few ancient opinions given a new home',
    'a habit of defining terms first',
    'opinions held a little more carefully',
    'a counterexample always to hand',
    'a running quarrel with common sense',
    'a thought experiment on the go',
  ],
  psychology: [
    'a growing file on human nature',
    'a fresh suspicion of their own memory',
    'a working theory of the group chat',
    'a field guide to other people’s moods',
    'a list of biases they keep catching in themselves',
    'a new respect for the power of a nudge',
    'several first impressions quietly downgraded',
    'an eye for the brain’s little shortcuts',
    'a theory about why they always buy the snacks',
    'a habit of asking what the brain is up to',
    'one memory they no longer fully trust',
    'a running tally of the mind’s tricks',
  ],
  personalgrowth: [
    'a routine with actual structure',
    'a habit or two under construction',
    'a to-do list with a strategy',
    'small wins stacked in a tidy pile',
    'every habit traced back to its cue',
    'a sharper eye for their own excuses',
    'a goal written down where it can be seen',
    'a calendar that means business',
    'one old habit firmly on notice',
    'a growing respect for the boring middle',
    'a fresh grudge against the snooze button',
    'the beginnings of a better morning',
  ],
  business: [
    'a sharpened sense of who the customer is',
    'opinions on every menu’s pricing',
    'a notebook of business ideas worth a second look',
    'a fresh eye for a margin',
    'a working theory of why that café is always full',
    'a mental spreadsheet that never quite closes',
    'a pitch half-rehearsed in the shower',
    'several shop windows quietly critiqued',
    'a new habit of asking who pays',
    'a sharper nose for a good deal',
    'a soft spot for a clever business model',
    'a list of problems worth charging for',
  ],
  economics: [
    'a fresh grudge against hidden costs',
    'a working grasp of why umbrellas cost more in the rain',
    'a habit of asking what else that money could do',
    'opinions about the price of everything',
    'an eye for incentives in the wild',
    'a sudden interest in the price of bread',
    'a theory about why concert tickets vanish',
    'a calmer view of a price rise',
    'a new way of reading the weekly shop',
    'trade-offs spotted before breakfast',
    'a keen sense of what is really free',
    'a quiet suspicion of every “bargain”',
  ],
  science: [
    'a fresh suspicion of any test without a control',
    'a habit of changing one thing at a time',
    'several kitchen experiments to their name',
    'a sharper eye for a fair test',
    'a hypothesis for most household mysteries',
    'a new respect for the boring repeat',
    'an eye for the variable nobody controlled',
    'a growing respect for measuring twice',
    'evidence where there used to be hunches',
    'a notebook of results including the awkward ones',
    'a polite scepticism toward miracle cures',
    'a sample size question ready for every headline',
  ],
  history: [
    'a habit of asking who wrote the source',
    'a fresh suspicion of the tidy version',
    'several old letters read between the lines',
    'a longer view of the news',
    'an eye for what the record leaves out',
    'a working timeline in their head',
    'a new respect for a dusty archive',
    'a habit of checking the date on everything',
    'a growing pile of turning points',
    'a sharper ear for the slant in a source',
    'a soft spot for primary sources',
    'questions for every museum label',
  ],
};

/** The flourish: a whole sentence about what the subject is doing to them. */
const SUBJECT_FLOURISH: Record<string, string[]> = {
  philosophy: [
    'The examined life is going well, thank you.',
    'Socrates would have asked a follow-up question. They already have.',
    'Gets more out of a “why” than most people get out of an answer.',
    'Treats every certainty as a starting point.',
    'Still hasn’t met an argument they couldn’t poke.',
    'Comfortable living inside an open question.',
    'Has started defining their terms at parties.',
    'Quietly building a worldview, one premise at a time.',
    'Happiest two steps into a thought experiment.',
    'The big questions have a regular visitor.',
    'Knows the difference between a reason and an excuse now.',
    'Tastes a weak argument the way a chef tastes burnt toast.',
  ],
  psychology: [
    'Has started catching their own brain in the act.',
    'Now knows exactly why that advert worked on them.',
    'Remembers things differently now, and knows why.',
    'The human mind has an attentive new student.',
    'Asks “why did they do that?” and actually waits for the answer.',
    'Quietly fascinated by the stories memory tells.',
    'Spots a cognitive bias at fifty paces.',
    'Reading people, and occasionally themselves.',
    'Taking the mind’s small print seriously.',
    'Knows a habit loop when they see one.',
    'Slightly unnerved by how much the brain fills in.',
    'Watching how people think, kindly.',
  ],
  personalgrowth: [
    'Turning up is becoming a habit, which is rather the point.',
    'A better routine is quietly taking shape.',
    'Progress, measured in small and stubborn steps.',
    'Building the kind of habits that build back.',
    'Getting better at getting better.',
    'Change is underway, mostly on schedule.',
    'Has started treating Mondays as an opportunity. Worrying.',
    'Knows a cue from a craving now.',
    'Swapping big resolutions for small systems.',
    'Their future self is going to be very grateful.',
    'Trimming the habits that were never invited.',
    'Patience is now officially part of the plan.',
  ],
  business: [
    'Can no longer walk past a shop without pricing it.',
    'Now thinks about the customer before the product.',
    'Has a business idea for most of the high street.',
    'Reading every market stall as a case study.',
    'Quietly running the numbers on lunch.',
    'Knows a good margin when they see one.',
    'A future founder, collecting the right questions.',
    'Pays attention to who buys what, and why.',
    'Notices when a shop gets the little things right.',
    'Spots the business model behind every free app.',
    'Has opinions on the lemonade stand down the road.',
    'Strategy is starting to feel like common sense.',
  ],
  economics: [
    'Sees supply and demand in the rain now.',
    'Can no longer hear “it’s free” without asking who pays.',
    'Thinks about every choice as a trade-off, cheerfully.',
    'Reads a price tag like a short story.',
    'Now explains surge pricing before anyone asks.',
    'Follows the incentive, then follows it again.',
    'Knows exactly why the umbrella seller raised the price.',
    'Has started weighing what they give up, not just what they get.',
    'The weekly shop has become a seminar.',
    'Spots the hidden cost in most good deals.',
    'Prices make a lot more sense than they used to.',
    'Markets are starting to look like crowds with a plan.',
  ],
  science: [
    'Has started controlling for variables at the breakfast table.',
    'Wants to see the evidence, and the method behind it.',
    'Prefers a fair test to a good story.',
    'Changes one thing at a time, on principle.',
    'Running the experiment rather than guessing the answer.',
    'The kitchen is now, technically, a laboratory.',
    'Asks for a control group in casual conversation.',
    'A hypothesis is never far away.',
    'Happy to change their mind when the results say so.',
    'Repeats the test before believing the result.',
    'Measuring things nobody asked to be measured.',
    'Curious first, certain only after the data.',
  ],
  history: [
    'Reads every headline with a long memory.',
    'Asks who was writing before believing what was written.',
    'Treats the past as evidence, not decoration.',
    'Has started checking the date on every story.',
    'The archives have a regular visitor.',
    'Connects today’s news to something old, every time.',
    'Knows the official version is only one version.',
    'Hunting causes the way others hunt bargains.',
    'Keeps a very long timeline close to hand.',
    'Prefers a primary source to a confident guess.',
    'Hears an echo of the past in most arguments.',
    'Learning how we know what happened, not just what did.',
  ],
};

/** The closer: a short sign-off in the subject's own key. */
const SUBJECT_CLOSER: Record<string, string[]> = {
  philosophy: [
    'Socrates would be proud.',
    'The agora awaits.',
    'Plato is taking notes.',
    'Somewhere, a premise is nervous.',
    'The cave has a new escapee.',
    'Kant is cautiously impressed.',
    'Ask them a simple question. Go on.',
    'Diogenes would approve, probably.',
    'Argue at your own risk.',
    'A Stoic in the making.',
    'Hume would like a word.',
    'The owl of Minerva is circling.',
  ],
  psychology: [
    'Freud would have questions.',
    'Poker faces everywhere are worried.',
    'The brain has been rumbled.',
    'Watch what you say around them.',
    'Every bias is on notice.',
    'Pavlov would ring a bell.',
    'Memory, consider yourself checked.',
    'The group chat is under observation.',
    'Nobody’s motives are safe.',
    'Mind the mind.',
    'The unconscious has company.',
    'Expect to be understood.',
  ],
  personalgrowth: [
    'Their future self says thanks.',
    'Momentum is building.',
    'One small step at a time.',
    'The snooze button is worried.',
    'Consistency suits them.',
    'Tomorrow is already planned.',
    'Small steps, big plans.',
    'Watch this habit grow.',
    'Discipline, but make it friendly.',
    'Excuses are running low.',
    'The routine approves.',
    'Onwards, steadily.',
  ],
  business: [
    'Investors, take note.',
    'The boardroom awaits.',
    'Margins everywhere are nervous.',
    'A pitch deck is surely coming.',
    'Customers, beware: they understand you now.',
    'Open for business.',
    'The market has a new reader.',
    'Expect a business card soon.',
    'Somewhere, a startup is waiting.',
    'The numbers look good.',
    'Profit, eventually.',
    'Strategy session at noon.',
  ],
  economics: [
    'Adam Smith nods approvingly.',
    'There is no such thing as a free lunch.',
    'The invisible hand waves hello.',
    'Keynes is checking the long run.',
    'Demand for them is rising.',
    'Priced in.',
    'Supply is limited.',
    'Trade-offs, accepted.',
    'The market is watching.',
    'Worth every opportunity cost.',
    'Inflation-proof curiosity.',
    'Equilibrium, nearly.',
  ],
  science: [
    'Results pending.',
    'Peer review approves.',
    'Hypothesis: they will be back tomorrow.',
    'Newton would check the maths.',
    'The data does not lie.',
    'Reproducible, too.',
    'Curie would approve.',
    'Experiment ongoing.',
    'Control group: everyone else.',
    'Statistically significant.',
    'Safety goggles optional.',
    'Eureka, any minute now.',
  ],
  history: [
    'History will remember this.',
    'Herodotus would take notes.',
    'For the record.',
    'The archives approve.',
    'Footnotes to follow.',
    'Future historians, take note.',
    'A chapter still being written.',
    'Mark the date.',
    'Primary source: themselves.',
    'Dated and signed.',
    'The past is in good hands.',
    'Recorded for posterity.',
  ],
};

// Small, fast, well-distributed PRNG so one integer seed drives many independent
// choices (and consecutive seeds produce very different bios).
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// "a", "a and b", "a, b and c"
function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function generateUserBio(input: BioInput, seed = 0): string {
  const { lessonsDone, streak, quotesSaved, distinctViewed, topPhilosopher, topInterestName, topInterestSlug } =
    input;
  const topSubject = input.topSubjectSlug ?? null;
  const subjectsRead = input.subjectsRead ?? 0;
  // Thinkers and branches belong to philosophy, so they only speak for a reader whose
  // top subject is philosophy (or who has no top subject yet).
  const philosophyReader = !topSubject || topSubject === 'philosophy';

  // Mix the refresh seed with the real data so two states never read identically
  // and the text is always grounded in what the user has actually done.
  const mixed =
    (Math.imul(seed >>> 0, 2654435761) +
      lessonsDone * 40503 +
      quotesSaved * 2 +
      distinctViewed * 7 +
      streak * 131) >>>
    0;
  const rng = mulberry32(mixed);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  const shuffle = <T,>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Nothing logged yet — a playful blank-slate line.
  if (lessonsDone === 0 && quotesSaved === 0 && distinctViewed === 0) {
    return pick(BLANK_SLATE);
  }

  // The opener follows the SUBJECT the reader reads most. A philosophy reader draws
  // half the time from their top branch's sharper pool instead.
  const branchPool = philosophyReader && topInterestSlug ? ARCHETYPE[topInterestSlug] : undefined;
  const subjectPool = topSubject ? SUBJECT_ARCHETYPE[topSubject] : undefined;
  const archetypes = (branchPool && (!subjectPool || rng() < 0.5) ? branchPool : subjectPool) || ARCHETYPE_GENERIC;
  const opener = pick(archetypes);

  // Every other slot speaks in the subject the reader leads with. A reader with only
  // the retired philosophy library behind them has no top subject, and is a
  // philosophy reader for this purpose.
  const key = topSubject ? topSubject.replace(/-/g, '') : 'philosophy';
  const noun = SUBJECT_NOUN[key] ?? null;
  const subjectReceipts = SUBJECT_RECEIPT[key];
  const subjectFlourishes = SUBJECT_FLOURISH[key];
  const subjectClosers = SUBJECT_CLOSER[key];

  // The receipts — each phrased a few different ways, a varying subset shown.
  const receipts: string[] = [];
  if (lessonsDone > 0) {
    const many = [
      `${lessonsDone} lessons deep`,
      `${lessonsDone} lessons in`,
      `${lessonsDone} lessons down`,
      `${lessonsDone} lessons behind them`,
      `${lessonsDone} lessons to their name`,
      `${lessonsDone} lessons of evidence`,
      `${lessonsDone} lessons and no sign of stopping`,
      `${lessonsDone} lessons read properly`,
      `${lessonsDone} lessons on the counter`,
    ];
    // "Argued through" is a philosophy verb; it stays with the philosophy reader.
    if (philosophyReader) many.push(`${lessonsDone} lessons already argued through`);
    receipts.push(
      lessonsDone === 1
        ? pick([
            '1 lesson in',
            'one lesson down',
            'fresh off lesson one',
            'one lesson old',
            'exactly one lesson wiser',
            'off the mark by one lesson',
          ])
        : pick(many)
    );
  }
  // The middle: one thing the subject has given them, said in its own terms.
  if (subjectReceipts && lessonsDone > 0 && rng() < 0.75) receipts.push(pick(subjectReceipts));
  if (streak >= 2) {
    receipts.push(
      pick([
        `${streak} days unbroken`,
        `riding a ${streak}-day streak`,
        `${streak} days running`,
        `a ${streak}-day streak and counting`,
        `${streak} days without missing`,
        `${streak} days of turning up`,
        `${streak} straight days`,
        `${streak} days into the habit`,
        `holding a ${streak}-day line`,
        `${streak} days, no gaps`,
      ])
    );
  }
  // Saved quotes and thinkers met are the retired philosophy library's — they only
  // speak for a philosophy reader, or a psychology reader's bio would count Kant.
  if (quotesSaved >= 1 && philosophyReader) {
    receipts.push(
      quotesSaved === 1
        ? pick([
            'a quote in the pocket',
            'one line worth keeping',
            'a single quote bookmarked',
            'one sentence saved from the wreck',
            'exactly one line they could not leave',
          ])
        : pick([
            `${quotesSaved} quotes in the pocket`,
            `${quotesSaved} quotes bookmarked`,
            `${quotesSaved} lines worth keeping`,
            `${quotesSaved} quotes squirrelled away`,
            `${quotesSaved} lines they refused to lose`,
            `${quotesSaved} quotes filed for later`,
            `${quotesSaved} sentences kept on purpose`,
            `a shelf of ${quotesSaved} quotes`,
            `${quotesSaved} lines stolen fair and square`,
          ])
    );
  }
  if (distinctViewed >= 2 && philosophyReader) {
    receipts.push(
      pick([
        `${distinctViewed} thinkers met`,
        `${distinctViewed} minds visited`,
        `${distinctViewed} thinkers in the rolodex`,
        `${distinctViewed} thinkers looked up`,
        `on nodding terms with ${distinctViewed} thinkers`,
        `${distinctViewed} dead philosophers consulted`,
        `${distinctViewed} names that used to mean nothing`,
        `${distinctViewed} thinkers introduced`,
      ])
    );
  }

  shuffle(receipts);
  const take = receipts.length <= 1 ? receipts.length : 1 + Math.floor(rng() * Math.min(3, receipts.length));
  // A receipt with its own "and" ("…and no sign of stopping") only stands alone,
  // or the list reads "a field guide to other people's moods and 9 lessons and no
  // sign of stopping".
  const taken = receipts.slice(0, take);
  const plain = taken.filter((r) => !r.includes(' and '));
  const listed = taken.length > 1 && plain.length ? plain : taken.slice(0, 1);
  const deedsSentence = listed.length ? `${capitalize(joinList(listed))}.` : '';

  // The flourish — a whole sentence, always true of what they actually read: their
  // breadth, their top thinker or branch (philosophy only), or their subject.
  const at = (a: string): string[] => [
    `Increasingly at home in ${a}.`,
    `${capitalize(a)} has its hooks in.`,
    `Drifting steadily toward ${a}.`,
    `${capitalize(a)} is winning, for now.`,
    `Keeps coming back to ${a}.`,
    `Settling in nicely to ${a}.`,
    `${capitalize(a)} seems to be the one.`,
  ];
  let flourish = '';
  if (subjectsRead >= 2 && rng() < 0.4) {
    // Across subjects. Every count here is the reader's own; the "others" are
    // subjectsRead less the one they lead with, so it is never zero in this branch.
    const n = subjectsRead;
    const others = n - 1 === 1 ? 'one other subject is' : `${n - 1} other subjects are`;
    const cross = [
      `Reading across ${n} subjects now.`,
      `Refuses to stick to one subject. ${n} and counting.`,
      `Spreading out: ${n} subjects on the go.`,
      `A generalist in the making, ${n} subjects deep.`,
      `Has a passport stamped by ${n} subjects.`,
      `Cross-training across ${n} subjects.`,
      `Collecting subjects: ${n} so far.`,
      `Happily distracted by ${n} different subjects.`,
      `Won’t be pinned to one shelf. ${n} subjects and climbing.`,
    ];
    if (noun) {
      cross.push(
        `Leads with ${noun}, but ${others} getting a look in.`,
        `${n} subjects open, with ${noun} out in front.`,
        `Mostly ${noun}, with detours. ${n} subjects so far.`,
        `Dipping into ${n} subjects and always coming back to ${noun}.`,
        `${capitalize(noun)} first, with the rest of the library close behind.`,
        `${n} subjects in rotation. ${capitalize(noun)} keeps winning.`,
      );
    }
    flourish = pick(cross);
  } else if (philosophyReader) {
    // A philosophy reader still gets their thinker or branch some of the time, and
    // the subject's own sentences the rest.
    const r = rng();
    if (topPhilosopher && r < 0.45) {
      const P = topPhilosopher;
      const base = [
        `Soft spot for ${P}.`,
        `Keeps circling back to ${P}.`,
        `Currently orbiting ${P}.`,
        `Quietly obsessed with ${P}.`,
        `${P} would approve.`,
        `Reads a suspicious amount of ${P}.`,
        `Lately, it’s all ${P}.`,
        `Cannot seem to get past ${P}.`,
        `${P} has become a bit of a habit.`,
        `Keeps ending up back at ${P}.`,
        `Would defend ${P} at a dinner table.`,
        `On a first-name basis with ${P} by now.`,
        `${P} gets the most of their attention.`,
        `Has clearly taken a side, and it is ${P}.`,
        `Something about ${P} keeps pulling them back.`,
      ];
      if (quotesSaved >= 4) {
        base.push(
          `Has bookmarked more ${P} than is strictly healthy.`,
          `Suspiciously well-read on ${P}.`,
          `Owns rather a lot of ${P} in quotation form.`,
          `Could probably quote ${P} unprompted. Probably will.`,
        );
      }
      flourish = pick(base);
    } else if (distinctViewed >= 3 && r < 0.6) {
      flourish = pick([
        `Already on a first-name basis with ${distinctViewed} thinkers.`,
        `Making the rounds — ${distinctViewed} thinkers and counting.`,
        `No favourites yet. ${distinctViewed} thinkers and still browsing.`,
        `Casting a wide net — ${distinctViewed} minds so far.`,
        `Sampling broadly. ${distinctViewed} thinkers in, no allegiances.`,
      ]);
    } else if (topInterestName && r < 0.75) {
      // Placed in their branch: "at home in ethics".
      flourish = pick(at(topInterestName.toLowerCase()));
    } else if (lessonsDone > 0 && subjectFlourishes) {
      flourish = pick(subjectFlourishes);
    }
  } else if (subjectFlourishes && rng() < 0.8) {
    flourish = pick(subjectFlourishes);
  } else if (noun) {
    flourish = pick(at(noun));
  }

  // Compose: the opener, the receipts and the flourish are each complete
  // sentences, so any ordering reads cleanly. Shuffle for freshness, and
  // sometimes sign off with a punchy closer — in the subject's key, mostly.
  const parts = [`${opener}.`];
  if (deedsSentence) parts.push(deedsSentence);
  if (flourish) parts.push(flourish);
  shuffle(parts);

  let out = parts.join(' ');
  if (rng() < 0.45) {
    // "Several subjects at once" is only true of a reader who has read several.
    const micro = subjectsRead >= 2 ? MICRO : MICRO.filter((l) => !l.includes('subjects'));
    const closers = subjectClosers && lessonsDone > 0 && rng() < 0.65 ? subjectClosers : micro;
    out += ` ${pick(closers)}`;
  }
  return out;
}
