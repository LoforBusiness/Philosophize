import type { Path } from '@/data/types';
import lesson1 from './lessons/what-is-an-argument';
import lesson2 from './lessons/premises-and-conclusions';
import lesson3 from './lessons/valid-vs-sound';
import lesson4 from './lessons/strong-vs-weak-arguments';
import lesson5 from './lessons/thinking-step-by-step';
import lesson6 from './lessons/if-then-statements';
import lesson7 from './lessons/two-valid-moves';
import lesson8 from './lessons/two-tempting-traps';
import lesson9 from './lessons/attacking-the-person';
import lesson10 from './lessons/the-hidden-premise';

const argumentsPath: Path = {
  id: 'logic-arguments',
  slug: 'arguments',
  name: 'What Is an Argument?',
  description: 'Learn the anatomy of every philosophical argument ever made.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8, lesson9, lesson10],
};

export default argumentsPath;
