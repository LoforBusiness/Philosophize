import type { Path } from '@/data/types';
import lesson1 from './lessons/what-does-it-mean-to-know';
import lesson2 from './lessons/knowing-vs-guessing';
import lesson3 from './lessons/can-you-be-wrong-and-think-you-know';
import lesson4 from './lessons/where-does-knowledge-come-from';
import lesson5 from './lessons/why-humans-seek-knowledge';
import lesson6 from './lessons/can-we-know-anything-at-all';
import lesson7 from './lessons/why-trust-the-future';
import lesson8 from './lessons/what-makes-a-belief-justified';
import lesson9 from './lessons/what-is-truth';
import lesson10 from './lessons/living-without-certainty';
import lesson11 from './lessons/the-gettier-problem';
import lesson12 from './lessons/sources-of-knowledge';
import lesson13 from './lessons/descartes-method-of-doubt';
import lesson14 from './lessons/the-external-world';
import lesson15 from './lessons/a-priori-and-a-posteriori';
import lesson16 from './lessons/science-and-falsification';
import lesson17 from './lessons/paradigm-shifts';
import lesson18 from './lessons/updating-beliefs-with-evidence';
import lesson19 from './lessons/whom-to-trust';
import lesson20 from './lessons/social-epistemology';
import lesson21 from './lessons/the-regress-problem';
import lesson22 from './lessons/reliabilism-and-the-value-of-knowledge';
import lesson23 from './lessons/virtue-epistemology';
import lesson24 from './lessons/answering-the-skeptic';
import lesson25 from './lessons/the-problem-of-the-criterion';
import lesson26 from './lessons/peer-disagreement';
import lesson27 from './lessons/epistemic-injustice';
import lesson28 from './lessons/motivated-reasoning';
import lesson29 from './lessons/knowledge-versus-understanding';
import lesson30 from './lessons/becoming-a-wise-knower';

const whatIsKnowledgePath: Path = {
  id: 'epistemology-knowledge',
  slug: 'what-is-knowledge',
  name: 'What Is Knowledge?',
  description: 'Discover what separates genuine knowledge from lucky guesses.',
  lessons: [
    lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8, lesson9, lesson10,
    lesson11, lesson12, lesson13, lesson14, lesson15, lesson16, lesson17, lesson18, lesson19, lesson20,
    lesson21, lesson22, lesson23, lesson24, lesson25, lesson26, lesson27, lesson28, lesson29, lesson30,
  ],
};

export default whatIsKnowledgePath;
