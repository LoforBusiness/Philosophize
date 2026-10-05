import type { Path } from '@/data/types';
import first from './lessons/what-is-science';
import second from './lessons/what-makes-a-fair-test';
import third from './lessons/correlation-isnt-causation';
import fourth from './lessons/why-measure-more-than-once';
import fifth from './lessons/could-it-be-wrong';
import sixth from './lessons/did-the-cure-work';

const units: Path[] = [
  {
    id: "science-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What science is: a guess, and a test that can prove it wrong.",
    lessons: [first, second, third, fourth, fifth, sixth],
  },
];

export default units;
