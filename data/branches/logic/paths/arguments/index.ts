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
import lesson11 from './lessons/begging-the-question';
import lesson12 from './lessons/the-false-dilemma';
import lesson13 from './lessons/the-slippery-slope';
import lesson14 from './lessons/equivocation';
import lesson15 from './lessons/hasty-generalization';
import lesson16 from './lessons/correlation-vs-causation';
import lesson17 from './lessons/appeal-to-authority';
import lesson18 from './lessons/appeal-to-emotion-and-bandwagon';
import lesson19 from './lessons/confirmation-bias';
import lesson20 from './lessons/charity-and-steelmanning';

const argumentsPath: Path = {
  id: 'logic-arguments',
  slug: 'arguments',
  name: 'What Is an Argument?',
  description: 'Learn the anatomy of every philosophical argument ever made.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8, lesson9, lesson10, lesson11, lesson12, lesson13, lesson14, lesson15, lesson16, lesson17, lesson18, lesson19, lesson20],
};

export default argumentsPath;
