import type { Path } from '@/data/types';
import lesson1 from './lessons/why-humans-care-about-right-and-wrong';
import lesson2 from './lessons/everyday-moral-choices';
import lesson3 from './lessons/what-makes-an-action-good';
import lesson4 from './lessons/morality-across-cultures';
import lesson5 from './lessons/beginning-of-ethical-thinking';

const whatIsEthicsPath: Path = {
  id: 'ethics-ethics',
  slug: 'what-is-ethics',
  name: 'What Is Ethics?',
  description: 'Explore why humans care about right and wrong — and how ethics began.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5],
};

export default whatIsEthicsPath;
