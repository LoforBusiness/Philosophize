import type { Path } from '@/data/types';
import whatIsAnArgument from './lessons/what-is-an-argument';
import premisesAndConclusions from './lessons/premises-and-conclusions';
import validVsSound from './lessons/valid-vs-sound';
import strongVsWeakArguments from './lessons/strong-vs-weak-arguments';
import thinkingStepByStep from './lessons/thinking-step-by-step';
import ifThenStatements from './lessons/if-then-statements';
import twoValidMoves from './lessons/two-valid-moves';
import twoTemptingTraps from './lessons/two-tempting-traps';
import attackingThePerson from './lessons/attacking-the-person';
import theHiddenPremise from './lessons/the-hidden-premise';
import beggingTheQuestion from './lessons/begging-the-question';
import theFalseDilemma from './lessons/the-false-dilemma';
import theSlipperySlope from './lessons/the-slippery-slope';
import equivocation from './lessons/equivocation';
import hastyGeneralization from './lessons/hasty-generalization';
import correlationVsCausation from './lessons/correlation-vs-causation';
import appealToAuthority from './lessons/appeal-to-authority';
import appealToEmotionAndBandwagon from './lessons/appeal-to-emotion-and-bandwagon';
import confirmationBias from './lessons/confirmation-bias';
import charityAndSteelmanning from './lessons/charity-and-steelmanning';
import necessaryAndSufficientConditions from './lessons/necessary-and-sufficient-conditions';
import categoricalLogicAllSomeNone from './lessons/categorical-logic-all-some-none';
import truthTablesAndConnectives from './lessons/truth-tables-and-connectives';
import deductionInductionAbduction from './lessons/deduction-induction-abduction';
import baseRatesAndProbability from './lessons/base-rates-and-probability';
import reductioAdAbsurdum from './lessons/reductio-ad-absurdum';
import theLiarParadox from './lessons/the-liar-paradox';
import arguingByAnalogy from './lessons/arguing-by-analogy';
import burdenOfProof from './lessons/burden-of-proof';
import buildingAStrongArgument from './lessons/building-a-strong-argument';

// 5 units — split from the original single "What Is an Argument?" path.
// Units are contiguous slices of the original lesson order, so progression is preserved.
const units: Path[] = [
  {
    id: "logic-the-anatomy-of-an-argument",
    slug: "the-anatomy-of-an-argument",
    name: "The Anatomy of an Argument",
    description: "Learn the anatomy of every argument — premises, conclusions, validity, soundness, and the conditional moves that always work.",
    lessons: [whatIsAnArgument, premisesAndConclusions, validVsSound, strongVsWeakArguments, thinkingStepByStep, ifThenStatements, twoValidMoves, twoTemptingTraps],
  },
  {
    id: "logic-where-arguments-cheat",
    slug: "where-arguments-cheat",
    name: "Where Arguments Cheat",
    description: "Meet the classic fallacies — the sleights of hand that make a bad argument feel airtight.",
    lessons: [attackingThePerson, theHiddenPremise, beggingTheQuestion, theFalseDilemma, theSlipperySlope, equivocation],
  },
  {
    id: "logic-evidence-bias-and-the-fair-fight",
    slug: "evidence-bias-and-the-fair-fight",
    name: "Evidence, Bias & the Fair Fight",
    description: "How evidence gets misused, how our own bias fools us, and the discipline of arguing in good faith.",
    lessons: [hastyGeneralization, correlationVsCausation, appealToAuthority, appealToEmotionAndBandwagon, confirmationBias, charityAndSteelmanning],
  },
  {
    id: "logic-the-logician-s-toolkit",
    slug: "the-logician-s-toolkit",
    name: "The Logician's Toolkit",
    description: "The formal machinery of logic: conditions, quantifiers, truth tables, the kinds of inference, and reasoning about probability.",
    lessons: [necessaryAndSufficientConditions, categoricalLogicAllSomeNone, truthTablesAndConnectives, deductionInductionAbduction, baseRatesAndProbability],
  },
  {
    id: "logic-advanced-moves-and-mastery",
    slug: "advanced-moves-and-mastery",
    name: "Advanced Moves & Mastery",
    description: "Logic's sharpest moves — proof by contradiction, paradox, and analogy — then build and stress-test an argument of your own.",
    lessons: [reductioAdAbsurdum, theLiarParadox, arguingByAnalogy, burdenOfProof, buildingAStrongArgument],
  },
];

export default units;
