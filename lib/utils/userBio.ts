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

const MICRO = [
  'No notes.',
  'Dangerous.',
  'Keeps the librarians on their toes.',
  'The questions don’t stand a chance.',
  'Honestly, a little intimidating.',
  'Going places — probably ancient Greece.',
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
  'Day zero. Twenty-four centuries of argument waiting, and none of it read yet.',
  'Unwritten — which is, philosophically, the most interesting state to be in.',
  'No lessons, no quotes, no thinkers. Just the itch. That is where every one of them started.',
];

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

  const archetypes = (topInterestSlug && ARCHETYPE[topInterestSlug]) || ARCHETYPE_GENERIC;
  const opener = pick(archetypes);

  // The receipts — each phrased a few different ways, a varying subset shown.
  const receipts: string[] = [];
  if (lessonsDone > 0) {
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
        : pick([
            `${lessonsDone} lessons deep`,
            `${lessonsDone} lessons in`,
            `${lessonsDone} lessons down`,
            `${lessonsDone} lessons behind them`,
            `${lessonsDone} lessons to their name`,
            `${lessonsDone} lessons of evidence`,
            `${lessonsDone} lessons and no sign of stopping`,
            `${lessonsDone} lessons read properly`,
            `${lessonsDone} lessons on the counter`,
            `${lessonsDone} lessons already argued through`,
          ])
    );
  }
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
  if (quotesSaved >= 1) {
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
  if (distinctViewed >= 2) {
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
  const deedsSentence = receipts.length ? `${capitalize(joinList(receipts.slice(0, take)))}.` : '';

  // The closing flourish about the thinker (or breadth / area) they keep
  // returning to — always true to their actual top thinker or interest.
  let flourish = '';
  if (topPhilosopher) {
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
  } else if (distinctViewed >= 3) {
    flourish = pick([
      `Already on a first-name basis with ${distinctViewed} thinkers.`,
      `Making the rounds — ${distinctViewed} thinkers and counting.`,
      `No favourites yet. ${distinctViewed} thinkers and still browsing.`,
      `Casting a wide net — ${distinctViewed} minds so far.`,
      `Sampling broadly. ${distinctViewed} thinkers in, no allegiances.`,
    ]);
  } else if (topInterestName) {
    const a = topInterestName.toLowerCase();
    flourish = pick([
      `Increasingly at home in ${a}.`,
      `${capitalize(a)} has its hooks in.`,
      `Drifting steadily toward ${a}.`,
      `${capitalize(a)} is winning, for now.`,
      `Keeps coming back to ${a}.`,
      `Settling in nicely to ${a}.`,
      `${capitalize(a)} seems to be the one.`,
    ]);
  }

  // Compose: the opener, the receipts and the flourish are each complete
  // sentences, so any ordering reads cleanly. Shuffle for freshness, and
  // sometimes sign off with a punchy closer.
  const parts = [`${opener}.`];
  if (deedsSentence) parts.push(deedsSentence);
  if (flourish) parts.push(flourish);
  shuffle(parts);

  let out = parts.join(' ');
  if (rng() < 0.4) out += ` ${pick(MICRO)}`;
  return out;
}
