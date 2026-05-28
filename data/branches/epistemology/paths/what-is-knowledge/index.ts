import type { Path } from '@/data/types';
import lesson1 from './lessons/what-does-it-mean-to-know';
import lesson2 from './lessons/knowing-vs-guessing';
import lesson3 from './lessons/can-you-be-wrong-and-think-you-know';
import lesson4 from './lessons/where-does-knowledge-come-from';
import lesson5 from './lessons/why-humans-seek-knowledge';

const whatIsKnowledgePath: Path = {
  id: 'epistemology-knowledge',
  slug: 'what-is-knowledge',
  name: 'What Is Knowledge?',
  description: 'Discover what separates genuine knowledge from lucky guesses.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5],
};

export default whatIsKnowledgePath;
