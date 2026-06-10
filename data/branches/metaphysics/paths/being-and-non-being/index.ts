import type { Path } from '@/data/types';
import lesson1 from './lessons/why-does-anything-exist';
import lesson2 from './lessons/something-vs-nothing';
import lesson3 from './lessons/what-counts-as-real';
import lesson4 from './lessons/can-nothing-truly-exist';
import lesson5 from './lessons/mystery-of-existence';
import lesson6 from './lessons/identity-and-change';
import lesson7 from './lessons/the-puzzle-of-time';
import lesson8 from './lessons/free-will-vs-determinism';
import lesson9 from './lessons/mind-and-body';
import lesson10 from './lessons/universals-and-particulars';

const beingAndNonBeingPath: Path = {
  id: 'metaphysics-being',
  slug: 'being-and-non-being',
  name: 'Being and Non-Being',
  description: 'Explore the deepest question: why does anything exist at all?',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8, lesson9, lesson10],
};

export default beingAndNonBeingPath;
