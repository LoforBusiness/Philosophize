// A short, witty "who you're becoming" bio assembled from the user's own
// activity — the lessons they take, the quotes they save, and the thinkers they
// linger on. Deterministic (no randomness) so it stays stable between renders,
// but reseeded by the activity counts so it evolves as the user learns.

export interface BioInput {
  lessonsDone: number;
  streak: number;
  quotesSaved: number;
  distinctViewed: number;
  topPhilosopher: string | null; // display name, e.g. "Marcus Aurelius"
  topInterestName: string | null; // branch display name, e.g. "Ethics"
  topInterestSlug: string | null; // branch slug, e.g. "ethics"
}

// Opening archetype keyed to the user's strongest area of interest.
const ARCHETYPE: Record<string, string[]> = {
  logic: ['A card-carrying hair-splitter', 'Allergic to a sloppy argument'],
  ethics: ['A part-time moral compass', "Quietly auditing everyone's choices"],
  epistemology: ['Professionally unsure of everything', "Won't take “because” for an answer"],
  metaphysics: ['Comfortable asking what “real” even means', 'Happiest just past the edge of the map'],
  aesthetics: ["Has opinions about beauty and isn't sorry", 'Out here taking taste seriously'],
  'political-philosophy': ['Redesigning society before breakfast', 'Arguing the social contract, unprompted'],
};
const ARCHETYPE_GENERIC = [
  'A card-carrying overthinker',
  'A dangerously curious mind',
  'An aspiring troublemaker of ideas',
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// "a", "a and b", "a, b and c"
function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function generateUserBio(input: BioInput): string {
  const { lessonsDone, streak, quotesSaved, distinctViewed, topPhilosopher, topInterestName, topInterestSlug } =
    input;

  // Nothing logged yet — a playful blank-slate line.
  if (lessonsDone === 0 && quotesSaved === 0 && distinctViewed === 0) {
    return 'A blank notebook and a dangerous amount of curiosity. The big questions haven’t started yet — but they’re coming.';
  }

  // Stable seed that shifts as the user makes progress.
  const seed = lessonsDone * 7 + quotesSaved * 3 + distinctViewed * 5 + streak;
  const pick = <T,>(arr: T[]): T => arr[seed % arr.length];

  const archetypes = (topInterestSlug && ARCHETYPE[topInterestSlug]) || ARCHETYPE_GENERIC;
  const opener = pick(archetypes);

  // Middle: the receipts.
  const deeds: string[] = [];
  if (lessonsDone > 0) deeds.push(`${lessonsDone} lesson${lessonsDone === 1 ? '' : 's'} deep`);
  if (streak >= 2) deeds.push(`${streak} days unbroken`);
  if (quotesSaved >= 1) deeds.push(`${quotesSaved} quote${quotesSaved === 1 ? '' : 's'} in the pocket`);
  const deedsSentence = deeds.length ? `${capitalize(joinList(deeds))}.` : '';

  // Closing flourish about the thinker (or breadth) they keep returning to.
  let flourish = '';
  if (topPhilosopher) {
    flourish =
      quotesSaved >= 4
        ? pick([
            `Has quietly bookmarked more ${topPhilosopher} than is strictly healthy.`,
            `Suspiciously well-read on ${topPhilosopher}.`,
          ])
        : pick([`Keeps circling back to ${topPhilosopher}.`, `Soft spot for ${topPhilosopher}.`]);
  } else if (distinctViewed >= 3) {
    flourish = `Already on a first-name basis with ${distinctViewed} thinkers.`;
  } else if (topInterestName) {
    flourish = `Increasingly at home in ${topInterestName.toLowerCase()}.`;
  }

  return [`${opener}.`, deedsSentence, flourish].filter(Boolean).join(' ');
}
