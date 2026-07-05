import type { Path } from '@/data/types';
import whySocietiesNeedRules from './lessons/why-societies-need-rules';
import powerAndPeople from './lessons/power-and-people';
import whatMakesGovernmentLegitimate from './lessons/what-makes-government-legitimate';
import freedomVsControl from './lessons/freedom-vs-control';
import bigQuestionsOfSociety from './lessons/big-questions-of-society';
import justiceAsFairness from './lessons/justice-as-fairness';
import whereRightsComeFrom from './lessons/where-rights-come-from';
import thePuzzleOfEquality from './lessons/the-puzzle-of-equality';
import democracyAndItsCritics from './lessons/democracy-and-its-critics';
import propertyAndDistribution from './lessons/property-and-distribution';
import theStateOfNature from './lessons/the-state-of-nature';
import twoConceptsOfLiberty from './lessons/two-concepts-of-liberty';
import millsHarmPrinciple from './lessons/mills-harm-principle';
import rawlsVsNozick from './lessons/rawls-vs-nozick';
import civilDisobedience from './lessons/civil-disobedience';
import marxAlienation from './lessons/marx-alienation';
import whyObeyTheState from './lessons/why-obey-the-state';
import equalityOfWhat from './lessons/equality-of-what';
import globalJustice from './lessons/global-justice';
import tolerationAndPluralism from './lessons/toleration-and-pluralism';
import philosophicalAnarchism from './lessons/philosophical-anarchism';
import republicanLiberty from './lessons/republican-liberty';
import communitarianismVsLiberalism from './lessons/communitarianism-vs-liberalism';
import recognitionAndMulticulturalism from './lessons/recognition-and-multiculturalism';
import feministPoliticalPhilosophy from './lessons/feminist-political-philosophy';
import deliberativeDemocracy from './lessons/deliberative-democracy';
import justWarTheory from './lessons/just-war-theory';
import punishmentAndPrisons from './lessons/punishment-and-prisons';
import bordersAndImmigration from './lessons/borders-and-immigration';
import idealVsNonIdealTheory from './lessons/ideal-vs-non-ideal-theory';

// 5 units — split from the original single "What Is Political Philosophy?" path.
// Units are contiguous slices of the original lesson order, so progression is preserved.
const units: Path[] = [
  {
    id: "political-philosophy-order-and-the-right-to-rule",
    slug: "order-and-the-right-to-rule",
    name: "Order & the Right to Rule",
    description: "Why we trade wild freedom for rules, and what turns raw power into a government worth obeying.",
    lessons: [whySocietiesNeedRules, powerAndPeople, whatMakesGovernmentLegitimate, freedomVsControl, bigQuestionsOfSociety],
  },
  {
    id: "political-philosophy-the-goods-we-argue-over",
    slug: "the-goods-we-argue-over",
    name: "The Goods We Argue Over",
    description: "Justice, rights, equality, democracy, property — the great values a society has to weigh, defend, and divide.",
    lessons: [justiceAsFairness, whereRightsComeFrom, thePuzzleOfEquality, democracyAndItsCritics, propertyAndDistribution],
  },
  {
    id: "political-philosophy-liberty-justice-and-dissent",
    slug: "liberty-justice-and-dissent",
    name: "Liberty, Justice & Dissent",
    description: "Go deep with the thinkers themselves — the two liberties, Mill's harm principle, the Rawls-Nozick clash, and when breaking the law is right.",
    lessons: [theStateOfNature, twoConceptsOfLiberty, millsHarmPrinciple, rawlsVsNozick, civilDisobedience],
  },
  {
    id: "political-philosophy-cracks-in-the-consensus",
    slug: "cracks-in-the-consensus",
    name: "Cracks in the Consensus",
    description: "The critics and revisionists — Marx, Sen, Pogge, the anarchist, the republican — who stretch justice, liberty, and obligation past their classic limits.",
    lessons: [marxAlienation, whyObeyTheState, equalityOfWhat, globalJustice, tolerationAndPluralism, philosophicalAnarchism, republicanLiberty],
  },
  {
    id: "political-philosophy-identity-and-the-hard-cases",
    slug: "identity-and-the-hard-cases",
    name: "Identity & the Hard Cases",
    description: "The communal self, recognition, and feminism, then politics' toughest real-world tests — war, prisons, borders — down to how we should even theorize.",
    lessons: [communitarianismVsLiberalism, recognitionAndMulticulturalism, feministPoliticalPhilosophy, deliberativeDemocracy, justWarTheory, punishmentAndPrisons, bordersAndImmigration, idealVsNonIdealTheory],
  },
];

export default units;
