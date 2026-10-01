import type { Path } from '@/data/types';
import whatIsEconomics from './lessons/what-is-economics';
import second from './lessons/supply-and-demand';
import third from './lessons/what-does-it-really-cost';

const units: Path[] = [
  {
    id: "economics-foundations",
    slug: "foundations",
    name: "Foundations",
    description: "What economics is, and the choice at the heart of it.",
    lessons: [whatIsEconomics, second, third],
  },
];

export default units;
