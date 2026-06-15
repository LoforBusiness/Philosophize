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
import lesson21 from './lessons/necessary-and-sufficient-conditions';
import lesson22 from './lessons/categorical-logic-all-some-none';
import lesson23 from './lessons/truth-tables-and-connectives';
import lesson24 from './lessons/deduction-induction-abduction';
import lesson25 from './lessons/base-rates-and-probability';
import lesson26 from './lessons/reductio-ad-absurdum';
import lesson27 from './lessons/the-liar-paradox';
import lesson28 from './lessons/arguing-by-analogy';
import lesson29 from './lessons/burden-of-proof';
import lesson30 from './lessons/building-a-strong-argument';

const argumentsPath: Path = {
  id: 'logic-arguments',
  slug: 'arguments',
  name: 'What Is an Argument?',
  description: 'Learn the anatomy of every philosophical argument ever made.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8, lesson9, lesson10, lesson11, lesson12, lesson13, lesson14, lesson15, lesson16, lesson17, lesson18, lesson19, lesson20, lesson21, lesson22, lesson23, lesson24, lesson25, lesson26, lesson27, lesson28, lesson29, lesson30],
};

export default argumentsPath;
