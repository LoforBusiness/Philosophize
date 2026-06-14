import type { Path } from '@/data/types';
import lesson1 from './lessons/why-humans-care-about-right-and-wrong';
import lesson2 from './lessons/everyday-moral-choices';
import lesson3 from './lessons/what-makes-an-action-good';
import lesson4 from './lessons/morality-across-cultures';
import lesson5 from './lessons/beginning-of-ethical-thinking';
import lesson6 from './lessons/trolley-problem-family';
import lesson7 from './lessons/moral-luck';
import lesson8 from './lessons/ethics-of-care';
import lesson9 from './lessons/justice-and-fairness';
import lesson10 from './lessons/ethics-in-practice';
import lesson11 from './lessons/utilitarianism-in-depth';
import lesson12 from './lessons/kants-categorical-imperative';
import lesson13 from './lessons/virtue-ethics-and-eudaimonia';
import lesson14 from './lessons/the-social-contract';
import lesson15 from './lessons/is-morality-real';
import lesson16 from './lessons/free-will-and-moral-responsibility';
import lesson17 from './lessons/lying-and-promises';
import lesson18 from './lessons/animal-ethics';
import lesson19 from './lessons/life-and-death';
import lesson20 from './lessons/future-generations-and-the-environment';

const whatIsEthicsPath: Path = {
  id: 'ethics-ethics',
  slug: 'what-is-ethics',
  name: 'What Is Ethics?',
  description: 'Explore why humans care about right and wrong — and how ethics began.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8, lesson9, lesson10, lesson11, lesson12, lesson13, lesson14, lesson15, lesson16, lesson17, lesson18, lesson19, lesson20],
};

export default whatIsEthicsPath;
