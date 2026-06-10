import type { Path } from '@/data/types';
import lesson1 from './lessons/why-societies-need-rules';
import lesson2 from './lessons/power-and-people';
import lesson3 from './lessons/what-makes-government-legitimate';
import lesson4 from './lessons/freedom-vs-control';
import lesson5 from './lessons/big-questions-of-society';
import lesson6 from './lessons/justice-as-fairness';
import lesson7 from './lessons/where-rights-come-from';
import lesson8 from './lessons/the-puzzle-of-equality';
import lesson9 from './lessons/democracy-and-its-critics';
import lesson10 from './lessons/property-and-distribution';

const whatIsPoliticalPhilosophyPath: Path = {
  id: 'political-political',
  slug: 'what-is-political-philosophy',
  name: 'What Is Political Philosophy?',
  description: 'Explore the big questions about power, justice, and how societies should be organized.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8, lesson9, lesson10],
};

export default whatIsPoliticalPhilosophyPath;
