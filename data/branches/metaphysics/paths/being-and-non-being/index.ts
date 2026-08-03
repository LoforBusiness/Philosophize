import type { Path } from '@/data/types';
import whyDoesAnythingExist from './lessons/why-does-anything-exist';
import somethingVsNothing from './lessons/something-vs-nothing';
import whatCountsAsReal from './lessons/what-counts-as-real';
import canNothingTrulyExist from './lessons/can-nothing-truly-exist';
import mysteryOfExistence from './lessons/mystery-of-existence';
import identityAndChange from './lessons/identity-and-change';
import thePuzzleOfTime from './lessons/the-puzzle-of-time';
import freeWillVsDeterminism from './lessons/free-will-vs-determinism';
import mindAndBody from './lessons/mind-and-body';
import universalsAndParticulars from './lessons/universals-and-particulars';
import personalIdentityOverTime from './lessons/personal-identity-over-time';
import soulBundleNoSelf from './lessons/soul-bundle-no-self';
import teleporterFissionParfit from './lessons/teleporter-fission-parfit';
import possibilityAndNecessity from './lessons/possibility-and-necessity';
import causationHumesChallenge from './lessons/causation-humes-challenge';
import compatibilismRevisited from './lessons/compatibilism-revisited';
import hardProblemConsciousnessQualia from './lessons/hard-problem-consciousness-qualia';
import abstractObjectsPlatonism from './lessons/abstract-objects-platonism';
import substanceAndProperties from './lessons/substance-and-properties';
import simulationArgumentWhatIsReal from './lessons/simulation-argument-what-is-real';
import presentismVsEternalism from './lessons/presentism-vs-eternalism';
import libertarianFreeWill from './lessons/libertarian-free-will';
import persistenceAndComposition from './lessons/persistence-and-composition';
import vaguenessAndTheSorites from './lessons/vagueness-and-the-sorites';
import possibleWorlds from './lessons/possible-worlds';
import emergenceAndReduction from './lessons/emergence-and-reduction';
import lawsOfNature from './lessons/laws-of-nature';
import panpsychism from './lessons/panpsychism';
import realismVsAntiRealism from './lessons/realism-vs-anti-realism';
import doesMetaphysicsMakeProgress from './lessons/does-metaphysics-make-progress';
import doHolesExist from './lessons/do-holes-exist';
import couldTwoThingsBeExactlyAlike from './lessons/could-two-things-be-exactly-alike';

// 5 units — split from the original single "Being and Non-Being" path.
// Units are contiguous slices of the original lesson order, so progression is preserved.
const units: Path[] = [
  {
    id: "metaphysics-being-and-non-being",
    slug: "being-and-non-being",
    name: "Being & Non-Being",
    description: "Begin at metaphysics' deepest question — why is there something rather than nothing at all?",
    lessons: [whyDoesAnythingExist, somethingVsNothing, whatCountsAsReal, canNothingTrulyExist, mysteryOfExistence],
  },
  {
    id: "metaphysics-change-identity-and-the-self",
    slug: "change-identity-and-the-self",
    name: "Change, Identity & the Self",
    description: "Ask what lets a thing survive change — and what, if anything, keeps you the same person across a whole lifetime.",
    lessons: [identityAndChange, thePuzzleOfTime, freeWillVsDeterminism, mindAndBody, universalsAndParticulars, personalIdentityOverTime, soulBundleNoSelf, teleporterFissionParfit],
  },
  {
    id: "metaphysics-the-fabric-of-reality",
    slug: "the-fabric-of-reality",
    name: "The Fabric of Reality",
    description: "Meet the hidden machinery of the world — possibility, cause, mind, numbers, and the stuff things are ultimately made of.",
    // Appended, never inserted: `lessonsByUnit` counts completions BY POSITION, so
    // slotting a lesson mid-unit would silently re-point every later slot for anyone
    // part-way through (CLAUDE.md §11).
    lessons: [possibilityAndNecessity, causationHumesChallenge, compatibilismRevisited, hardProblemConsciousnessQualia, abstractObjectsPlatonism, substanceAndProperties, doHolesExist],
  },
  {
    id: "metaphysics-puzzles-at-the-edge-of-the-real",
    slug: "puzzles-at-the-edge-of-the-real",
    name: "Puzzles at the Edge of the Real",
    description: "Stress-test reality with the thought experiments and paradoxes that make it wobble — from simulations to a vanishing heap of sand.",
    lessons: [simulationArgumentWhatIsReal, presentismVsEternalism, libertarianFreeWill, persistenceAndComposition, vaguenessAndTheSorites, possibleWorlds],
  },
  {
    id: "metaphysics-frontiers-of-reality",
    slug: "frontiers-of-reality",
    name: "Frontiers of Reality",
    description: "Zoom out to the big picture — how reality layers, whether its laws truly compel, and if the world needs a mind at all.",
    lessons: [emergenceAndReduction, lawsOfNature, panpsychism, realismVsAntiRealism, doesMetaphysicsMakeProgress, couldTwoThingsBeExactlyAlike],
  },
];

export default units;
