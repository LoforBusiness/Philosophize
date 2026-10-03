import type { Path } from '@/data/types';
import first from './lessons/what-is-science';
import second from './lessons/what-makes-a-fair-test';
import third from './lessons/correlation-isnt-causation';
import fourth from './lessons/why-measure-more-than-once';

const units: Path[] = [
  {
    id: "science-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What science is: a guess, and a test that can prove it wrong.",
    lessons: [first, second, third, fourth],
  },
];

export default units;
