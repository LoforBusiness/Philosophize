import type { Path } from '@/data/types';
import first from './lessons/what-is-a-business';

const units: Path[] = [
  {
    id: "business-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What a business is, what profit is, and what a leader does.",
    lessons: [first],
  },
];

export default units;
