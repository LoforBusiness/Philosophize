import type { Path } from '@/data/types';
import first from './lessons/what-is-science';
import second from './lessons/what-makes-a-fair-test';
import third from './lessons/correlation-isnt-causation';

const units: Path[] = [
  {
    id: "science-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What science is: a guess, and a test that can prove it wrong.",
    lessons: [first, second, third],
  },
];

export default units;
