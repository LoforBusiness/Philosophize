import type { Path } from '@/data/types';
import lesson1 from './lessons/what-is-an-argument';
import lesson2 from './lessons/premises-and-conclusions';
import lesson3 from './lessons/valid-vs-sound';
import lesson4 from './lessons/strong-vs-weak-arguments';
import lesson5 from './lessons/thinking-step-by-step';

const argumentsPath: Path = {
  id: 'logic-arguments',
  slug: 'arguments',
  name: 'What Is an Argument?',
  description: 'Learn the anatomy of every philosophical argument ever made.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5],
};

export default argumentsPath;
