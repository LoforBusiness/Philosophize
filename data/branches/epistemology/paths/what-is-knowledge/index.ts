import type { Path } from '@/data/types';
import whatDoesItMeanToKnow from './lessons/what-does-it-mean-to-know';
import canYouBeWrongAndThinkYouKnow from './lessons/can-you-be-wrong-and-think-you-know';
import whereDoesKnowledgeComeFrom from './lessons/where-does-knowledge-come-from';
import whyHumansSeekKnowledge from './lessons/why-humans-seek-knowledge';
import canWeKnowAnythingAtAll from './lessons/can-we-know-anything-at-all';
import whyTrustTheFuture from './lessons/why-trust-the-future';
import whatMakesABeliefJustified from './lessons/what-makes-a-belief-justified';
import whatIsTruth from './lessons/what-is-truth';
import livingWithoutCertainty from './lessons/living-without-certainty';
import theGettierProblem from './lessons/the-gettier-problem';
import sourcesOfKnowledge from './lessons/sources-of-knowledge';
import theExternalWorld from './lessons/the-external-world';
import aPrioriAndAPosteriori from './lessons/a-priori-and-a-posteriori';
import scienceAndFalsification from './lessons/science-and-falsification';
import paradigmShifts from './lessons/paradigm-shifts';
import updatingBeliefsWithEvidence from './lessons/updating-beliefs-with-evidence';
import whomToTrust from './lessons/whom-to-trust';
import socialEpistemology from './lessons/social-epistemology';
import reliabilismAndTheValueOfKnowledge from './lessons/reliabilism-and-the-value-of-knowledge';
import virtueEpistemology from './lessons/virtue-epistemology';
import answeringTheSkeptic from './lessons/answering-the-skeptic';
import theProblemOfTheCriterion from './lessons/the-problem-of-the-criterion';
import peerDisagreement from './lessons/peer-disagreement';
import epistemicInjustice from './lessons/epistemic-injustice';
import motivatedReasoning from './lessons/motivated-reasoning';
import knowledgeVersusUnderstanding from './lessons/knowledge-versus-understanding';
import becomingAWiseKnower from './lessons/becoming-a-wise-knower';

// 5 units — split from the original single "What Is Knowledge?" path.
// Units are contiguous slices of the original lesson order, so progression is preserved.
const units: Path[] = [
  {
    id: "epistemology-what-is-knowledge",
    slug: "what-is-knowledge",
    name: "What Is Knowledge?",
    description: "Discover what separates genuine knowledge from lucky guesses — and the first doubts that put it to the test.",
    lessons: [whatDoesItMeanToKnow, canYouBeWrongAndThinkYouKnow, whereDoesKnowledgeComeFrom, whyHumansSeekKnowledge, canWeKnowAnythingAtAll, whyTrustTheFuture, whatMakesABeliefJustified, whatIsTruth, livingWithoutCertainty],
  },
  {
    id: "epistemology-the-classic-puzzles",
    slug: "the-classic-puzzles",
    name: "The Classic Puzzles",
    description: "Wrestle with the famous puzzles — Gettier, radical doubt, the outside world — that forced philosophers to rethink knowing itself.",
    lessons: [theGettierProblem, sourcesOfKnowledge, theExternalWorld, aPrioriAndAPosteriori],
  },
  {
    id: "epistemology-evidence-science-and-the-crowd",
    slug: "evidence-science-and-the-crowd",
    name: "Evidence, Science & the Crowd",
    description: "See how real knowledge gets built and tested — in the lab, in the data, and in the noisy crowd.",
    lessons: [scienceAndFalsification, paradigmShifts, updatingBeliefsWithEvidence, whomToTrust, socialEpistemology],
  },
  {
    id: "epistemology-what-holds-belief-up",
    slug: "what-holds-belief-up",
    name: "What Holds Belief Up",
    description: "If every reason needs a reason, find what finally makes a belief stand — and whether the skeptic can be answered.",
    lessons: [reliabilismAndTheValueOfKnowledge, virtueEpistemology, answeringTheSkeptic, theProblemOfTheCriterion],
  },
  {
    id: "epistemology-the-wise-knower",
    slug: "the-wise-knower",
    name: "The Wise Knower",
    description: "The humility, ethics, and hard-won wisdom of knowing well among other people.",
    lessons: [peerDisagreement, epistemicInjustice, motivatedReasoning, knowledgeVersusUnderstanding, becomingAWiseKnower],
  },
];

export default units;
