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

const whatIsKnowledgePath: Path = {
  id: 'epistemology-knowledge',
  slug: 'what-is-knowledge',
  name: 'What Is Knowledge?',
  description: 'Discover what separates genuine knowledge from lucky guesses.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8, lesson9, lesson10],
};

export default whatIsKnowledgePath;
