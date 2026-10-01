import type { Path } from '@/data/types';
import first from './lessons/what-is-a-business';
import second from './lessons/who-is-your-customer';

const units: Path[] = [
  {
    id: "business-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What a business is, what profit is, and what a leader does.",
    lessons: [first, second],
  },
];

export default units;
