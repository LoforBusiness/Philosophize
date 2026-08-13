import type { Path } from '@/data/types';
import whyHumansCareAboutRightAndWrong from './lessons/why-humans-care-about-right-and-wrong';
import everydayMoralChoices from './lessons/everyday-moral-choices';
import whatMakesAnActionGood from './lessons/what-makes-an-action-good';
import moralityAcrossCultures from './lessons/morality-across-cultures';
import beginningOfEthicalThinking from './lessons/beginning-of-ethical-thinking';
import trolleyProblemFamily from './lessons/trolley-problem-family';
import moralLuck from './lessons/moral-luck';
import ethicsOfCare from './lessons/ethics-of-care';
import ethicsInPractice from './lessons/ethics-in-practice';
import whenBothChoicesAreWrong from './lessons/when-both-choices-are-wrong';
import oughtImpliesCan from './lessons/ought-implies-can';
import borrowingAVerdict from './lessons/borrowing-a-verdict';
import utilitarianismInDepth from './lessons/utilitarianism-in-depth';
import kantsCategoricalImperative from './lessons/kants-categorical-imperative';
import virtueEthicsAndEudaimonia from './lessons/virtue-ethics-and-eudaimonia';
import theSocialContract from './lessons/the-social-contract';
import isMoralityReal from './lessons/is-morality-real';
import freeWillAndMoralResponsibility from './lessons/free-will-and-moral-responsibility';
import lyingAndPromises from './lessons/lying-and-promises';
import animalEthics from './lessons/animal-ethics';
import lifeAndDeath from './lessons/life-and-death';
import futureGenerationsAndTheEnvironment from './lessons/future-generations-and-the-environment';
import theDoctrineOfDoubleEffect from './lessons/the-doctrine-of-double-effect';
import theExperienceMachine from './lessons/the-experience-machine';
import effectiveAltruismAndTheDrowningChild from './lessons/effective-altruism-and-the-drowning-child';
import theEthicsOfPunishment from './lessons/the-ethics-of-punishment';
import autonomyAndPaternalism from './lessons/autonomy-and-paternalism';
import moralStatusAndPersonhood from './lessons/moral-status-and-personhood';
import metaethicsWhereMoralsLive from './lessons/metaethics-where-morals-live';
import reflectiveEquilibrium from './lessons/reflective-equilibrium';
import supererogationBeyondDuty from './lessons/supererogation-beyond-duty';
import howToLiveAnEthicalLife from './lessons/how-to-live-an-ethical-life';
import howMuchIsRequired from './lessons/how-much-is-required';
import morePeopleWorseLives from './lessons/more-people-worse-lives';

// 5 units — split from the original single "What Is Ethics?" path.
// Units are contiguous slices of the original lesson order, so progression is preserved.
const units: Path[] = [
  {
    id: "ethics-what-is-ethics",
    slug: "what-is-ethics",
    name: "What Is Ethics?",
    description: "Explore why humans care about right and wrong — and where ethical thinking first began.",
    lessons: [whyHumansCareAboutRightAndWrong, everydayMoralChoices, whatMakesAnActionGood, moralityAcrossCultures, beginningOfEthicalThinking],
  },
  {
    id: "ethics-when-intuitions-collide",
    slug: "when-intuitions-collide",
    name: "When Intuitions Collide",
    description: "Trolleys, luck, care, and fairness — vivid dilemmas that expose how conflicted our moral gut can be.",
    // Appended, never inserted: `lessonsByUnit` counts completions BY POSITION, so
    // slotting a lesson mid-unit would silently re-point every later slot for
    // everyone who is part-way through (see CLAUDE.md §11).
    lessons: [trolleyProblemFamily, moralLuck, ethicsOfCare, ethicsInPractice, whenBothChoicesAreWrong],
  },
  {
    id: "ethics-the-great-theories",
    slug: "the-great-theories",
    name: "The Great Theories",
    description: "Meet the big frameworks — outcomes, duty, character, contract — then ask whether morality is even real, and whether we're free to be blamed.",
    lessons: [utilitarianismInDepth, kantsCategoricalImperative, virtueEthicsAndEudaimonia, theSocialContract, isMoralityReal, freeWillAndMoralResponsibility],
  },
  {
    id: "ethics-ethics-in-the-wild",
    slug: "ethics-in-the-wild",
    name: "Ethics in the Wild",
    description: "Take the theories into hard real terrain — lying, animals, life and death, the planet, punishment, and the question of who counts.",
    lessons: [lyingAndPromises, animalEthics, lifeAndDeath, futureGenerationsAndTheEnvironment, theDoctrineOfDoubleEffect, theExperienceMachine, effectiveAltruismAndTheDrowningChild, theEthicsOfPunishment, autonomyAndPaternalism, moralStatusAndPersonhood],
  },
  {
    id: "ethics-stepping-back",
    slug: "stepping-back",
    name: "Stepping Back",
    description: "Zoom out one last time: where morals actually live, how to settle a clash of principle and gut, what lies beyond duty — and how to live.",
    lessons: [metaethicsWhereMoralsLive, reflectiveEquilibrium, supererogationBeyondDuty, howToLiveAnEthicalLife, oughtImpliesCan, borrowingAVerdict, howMuchIsRequired, morePeopleWorseLives],
  },
];

export default units;
