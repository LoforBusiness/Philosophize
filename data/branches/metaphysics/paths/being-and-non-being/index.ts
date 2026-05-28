import type { Path } from '@/data/types';
import lesson1 from './lessons/why-does-anything-exist';
import lesson2 from './lessons/something-vs-nothing';
import lesson3 from './lessons/what-counts-as-real';
import lesson4 from './lessons/can-nothing-truly-exist';
import lesson5 from './lessons/mystery-of-existence';

const beingAndNonBeingPath: Path = {
  id: 'metaphysics-being',
  slug: 'being-and-non-being',
  name: 'Being and Non-Being',
  description: 'Explore the deepest question: why does anything exist at all?',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5],
};

export default beingAndNonBeingPath;
