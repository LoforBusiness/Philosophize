import type { Path } from '@/data/types';
import first from './lessons/what-is-science';

const units: Path[] = [
  {
    id: "science-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What science is: a guess, and a test that can prove it wrong.",
    lessons: [first],
  },
];

export default units;
